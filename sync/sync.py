#!/usr/bin/env python3
"""Nightly / on-demand price sync: Israeli price-transparency files -> Supabase.

MODE=check    : run only if the app asked for a refresh (config/sync.requestedAt > lastRun)
MODE=nightly  : always run
Env (GitHub secrets): SUPABASE_URL, SUPABASE_SERVICE_KEY (service_role / sb_secret_ key)
Data: table public.docs (col, id, data jsonb) - see supabase/schema.sql
"""
import os,re,sys,json,datetime,statistics,urllib.request,urllib.parse
from pp import Client,ET,retry

SB_URL=os.environ.get('SUPABASE_URL','').strip().rstrip('/')
SB_KEY=os.environ.get('SUPABASE_SERVICE_KEY','').strip()
def sb(method,path,body=None,prefer=None,rng=None):
    h={'apikey':SB_KEY,'Content-Type':'application/json','Accept':'application/json'}
    if SB_KEY.startswith('eyJ'): h['Authorization']='Bearer '+SB_KEY   # legacy JWT keys; new sb_secret_ keys go in apikey only
    if prefer: h['Prefer']=prefer
    if rng: h['Range']=rng
    data=json.dumps(body,ensure_ascii=False).encode('utf-8') if body is not None else None
    req=urllib.request.Request(f'{SB_URL}/rest/v1/{path}',data=data,headers=h,method=method)
    def go():
        with urllib.request.urlopen(req,timeout=60) as r:
            t=r.read(); return json.loads(t) if t else None
    return retry(go,3)
q=lambda s:urllib.parse.quote(str(s),safe='')
def get_doc(col,id):
    r=sb('GET',f'docs?select=data&col=eq.{q(col)}&id=eq.{q(id)}'); return r[0]['data'] if r else None
def list_col(col):
    out={}; size=1000; start=0
    while True:
        r=sb('GET',f'docs?select=id,data&col=eq.{q(col)}&order=id',rng=f'{start}-{start+size-1}') or []
        for x in r: out[x['id']]=x['data']
        if len(r)<size: return out
        start+=size
def put_doc(col,id,data):
    sb('POST','docs?on_conflict=col,id',[{'col':col,'id':id,'data':data,'updated_at':now()}],
       prefer='resolution=merge-duplicates,return=minimal')

DEFAULT_SRC={'s1':{'user':'osherad','chain':'7290103152017','store':'032'},
             's2':{'user':'yohananof','chain':'7290803800003','store':'073'}}
# words that signal a different kind of product unless the shopper wrote them
PENALTY=['רוטב','מרוסק','מרוסקות','מרק','מנה','חטיף','טעם','ממרח','סלט','אטריות','פתיתים','שימורי','תחליב','ממולא','ממולאים','עוגיות','מגבוני','לח','קפוא','מיובשות','אבקת','בטעם','פריכונים','נודלס','ציפס','פיצה','כבושים','כבוש','חמוצים','קורנישונים','מארז','מרוכז','ממותק','סוכריות','כוסמין','חלוה','חלבה','מאסט','שוקולד','ללא','זירו','דיאט','תינוק','לתינוקות']

def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
def xml(raw):
    for enc in ('utf-8-sig','utf-16','windows-1255'):
        try: return ET.fromstring(raw.decode(enc).encode('utf-8'))
        except Exception: continue
    return ET.fromstring(raw)
def tx(e,t):
    x=e.find(t); return (x.text or '').strip() if x is not None else ''
def num(s):
    try: return float(s)
    except Exception: return 0.0
def latest(files,prefix,chain,store):
    c=[f for f in files if f.startswith(prefix+chain) and f'-{store}-' in f]
    return sorted(c)[-1] if c else None

def load_catalog(src):
    cl=Client(src['user']); files=[x['fname'] for x in cl.ls()]
    pf=latest(files,'PriceFull',src['chain'],src['store']); pr=latest(files,'PromoFull',src['chain'],src['store'])
    items={}
    if pf:
        for it in xml(cl.get(pf)).iter('Item'):
            code=tx(it,'ItemCode')
            if code: items[code]={'code':code,'name':tx(it,'ItemName'),'price':num(tx(it,'ItemPrice'))}
    promos={}; today=datetime.date.today().isoformat()
    if pr:
        for p in xml(cl.get(pr)).iter('Promotion'):
            end=tx(p,'PromotionEndDateTime')[:10]; start=tx(p,'PromotionStartDateTime')[:10]
            if end and end<today or start and start>today: continue
            m=re.match(r'\d+',tx(p,'ClubID') or '0'); club=bool(m and int(m.group(0))>0)
            desc=tx(p,'PromotionDescription')
            for pi in p.iter('PromotionItem'):
                c=tx(pi,'ItemCode')
                if not c: continue
                if tx(pi,'bIsWeighted')=='1': minq=1.0; dp=num(tx(pi,'DiscountedPricePerMida'))
                else: minq=num(tx(pi,'MinQty')) or 1.0; dp=num(tx(pi,'DiscountedPrice'))
                if dp<=0: continue
                d={'desc':desc,'minq':minq,'dp':dp,'club':club,'end':end}
                o=promos.get(c)
                if not o or (o['club'] and not club) or (o['club']==club and dp/minq<o['dp']/o['minq']): promos[c]=d
    return items,promos

def priced(cat,promos,code):
    it=cat.get(code)
    if not it: return None
    x={'price':round(it['price'],2),'sale':0,'note':'','code':code,'pname':it['name'],'src':'auto'}
    p=promos.get(code)
    if p:
        unit=p['dp']/p['minq']; label=p['desc'] or ''
        if p['minq']>1 and not re.search(r'\d\s*ב\s*-?\d',label): label=f"{label} ({p['minq']:g} ב-{p['dp']:g})".strip()
        if p['club']: x['note']=('מועדון: '+label).strip()
        elif unit<it['price']:
            x['sale']=round(unit,2); x['note']=label.strip()+(f" עד {p['end']}" if p['end'] else '')
    return x

def tokens(name): return [t for t in re.split(r'[\s"׳\'״]+',name.replace('׳','')) if len(t)>1]
def match(name,cats):
    """Pick one product per store; prefer a barcode that exists in all stores."""
    toks=tokens(name)
    if not toks: return {}
    pen=[w for w in PENALTY if w not in name]
    pools={}
    for sid,(cat,_) in cats.items():
        for k in range(len(toks),0,-1):   # drop trailing words (brand/size) a store may not carry
            pool={c:i for c,i in cat.items() if i['price']>0 and all(t in i['name'] for t in toks[:k])}
            if pool: break
        pools[sid]=pool
    def score(i): return (sum(1 for w in pen if w in i['name']), 0 if i['name'].startswith(toks[0]) else 1, len(i['name']))
    common=set.intersection(*[set(p) for p in pools.values()]) if pools else set()
    out={}
    if common:
        pool=[next(iter(pools.values()))[c] for c in common]
        med=statistics.median([i['price'] for i in pool])
        best=sorted(pool,key=lambda i:(score(i),abs(i['price']-med)))[0]
        return {sid:best['code'] for sid in pools}
    for sid,p in pools.items():
        if p:
            pool=list(p.values()); med=statistics.median([i['price'] for i in pool])
            out[sid]=sorted(pool,key=lambda i:(score(i),abs(i['price']-med)))[0]['code']
    return out

def main():
    mode=os.environ.get('MODE','nightly')
    if not SB_URL or not SB_KEY:
        print('SUPABASE_URL / SUPABASE_SERVICE_KEY not set yet - skipping (Supabase not configured)'); return
    sync=get_doc('config','sync') or {}
    if mode=='check':
        req=sync.get('requestedAt'); last=sync.get('lastRun') or ''
        if not req or req<=last: print('no request'); return
    stores=(get_doc('config','stores') or {}).get('list',[])
    srcs={s['id']:s.get('src') or DEFAULT_SRC.get(s['id']) for s in stores if s.get('auto',True)} if stores else dict(DEFAULT_SRC)
    srcs={k:v for k,v in srcs.items() if v}
    report={}; cats={}
    for sid,src in srcs.items():
        try: cats[sid]=load_catalog(src); report[sid]={'products':len(cats[sid][0]),'promos':len(cats[sid][1])}
        except Exception as e: report[sid]={'error':str(e)[:200]}
    updated=0
    if cats:
        all_prices=list_col('prices')
        for iid,it in list_col('items').items():
            it=it or {}
            pr=all_prices.get(iid) or {'name':it.get('name',''),'p':{}}
            p=dict(pr.get('p',{})); changed=False
            guess=None
            for sid,(cat,promos) in cats.items():
                cur=p.get(sid,{})
                if cur.get('src')=='manual': continue
                code=cur.get('code')
                if not code:
                    if guess is None: guess=match(it.get('name',''),cats)
                    code=guess.get(sid)
                x=priced(cat,promos,code) if code else None
                if x: p[sid]=x; changed=True
            if changed:
                put_doc('prices',iid,{'name':it.get('name',''),'p':p,'ex':False,'upd':now()}); updated+=1
    errs=[f"{k}: {v['error']}" for k,v in report.items() if 'error' in v]
    sync=get_doc('config','sync') or sync   # re-read: a refresh may have been requested meanwhile
    put_doc('config','sync',{**sync,'lastRun':now(),'status':'ok' if not errs else '; '.join(errs),'updated':updated,'stores':report})
    print('done',updated,report)

if __name__=='__main__': main()
