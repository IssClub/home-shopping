
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=new Intl.NumberFormat('he-IL',{style:'currency',currency:'ILS'});
const fmt=n=>money.format(n);
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- categories ---------- */
const IC={
 produce:'M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7',
 bakery:'M4 11a4 4 0 0 1 3-6h10a4 4 0 0 1 3 6v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z',
 dairy:'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z',
 meat:'M15 4a5 5 0 0 1 4 8c-2 3-6 3-8 1l-5 5-2-2 5-5c-2-2-2-6 1-8 2-1 3-1 5 1z',
 frozen:'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9',
 dry:'M7 3h10v3H7zM6 6h12v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM9 11h6',
 canned:'M6 6c0-1.5 2.7-2.5 6-2.5s6 1 6 2.5v12c0 1.5-2.7 2.5-6 2.5s-6-1-6-2.5zM6 6c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5M6 12c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5',
 snacks:'M6 3h12l-1 18H7zM6 8h12',
 choc:'M5 4h14v16H5zM5 10h14M5 15h14M12 4v16',
 drinks:'M6 4h12l-1.5 16h-9zM7 9h10M13 4l2-2',
 clean:'M9 3h5v4H9zM8 7h7l1 4v10H7V11zM15 4h4M15 6l3 1',
 care:'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
 other:'M3 12V4h8l10 10-8 8zM7.5 7.5h.01'
};
const icon=id=>`<span class="ico"><svg viewBox="0 0 24 24"><path d="${IC[id]||IC.other}"/></svg></span>`;
const CATS=[
 {id:'produce',name:'ירקות ופירות',c:'#2e9e55',k:'עגבני|מלפפון|גזר|בצל|שום|תפוח|תפוז|לימון|בננ|אבוקדו|חסה|פלפל|תפוחי אדמה|בטטה|קישוא|חציל|כרוב|ברוקולי|כרובית|פטרוזיליה|כוסברה|שמיר|נענע|פטריות|ענבים|אבטיח|מלון|אפרסק|נקטרינ|שזיף|תות|אגס|קלמנטינ|אשכולית|מנגו|ירקות|פירות|סלק|דלעת|עלים|בזיליקום|תרד|קולרבי|רימון|תמר'},
 {id:'bakery',name:'לחם ומאפים',c:'#c4811a',k:'לחם|פיתה|פיתות|לחמני|חלה|חלות|בגט|טורטיה|עוגה|בורקס|מאפה|מאפים|לאפה|בייגל|קרואסון'},
 {id:'dairy',name:'חלב וביצים',c:'#3d86d6',k:'חלב|גבינ|קוטג|יוגורט|שמנת|חמאה|ביצ|מעדן|לבנה|מוצרלה|שוקו|מילקי|אשל|קממבר|פטה|ריקוטה|חמאת|משקה סויה|משקה שקדים'},
 {id:'meat',name:'בשר, עוף ודגים',c:'#d04a3f',k:'עוף|חזה|שניצל|כרעיים|כנפיים|בשר|סטייק|אנטריקוט|צלי|נקניק|קבב|המבורגר|הודו|דג|דגים|סלמון|פילה|כבד|שווארמה|פסטרמה|סלאמי|אסאדו'},
 {id:'frozen',name:'קפואים',c:'#25a8c4',k:'קפוא|קפואים|גלידה|ארטיק|בצק עלים|פיצה|מקפיא'},
 {id:'dry',name:'יבשים ותבלינים',c:'#a8742d',k:'אורז|פסטה|ספגטי|קמח|סוכר|מלח|שמן|קטשופ|מיונז|חומוס|טחינה|דגני|קורנפלקס|שיבולת|קוואקר|עדשים|שעועית|קוסקוס|פתיתים|תבלין|פפריקה|כמון|אבקת אפייה|סילאן|דבש|ריבה|חומץ|רוטב|קטניות|אגוזים|שקדים|בורגול|חרדל|קינמון|מרק|גרנולה|פירורי|אינסטנט'},
 {id:'canned',name:'שימורים',c:'#8a63c9',k:'שימורי|טונה|זיתים|חמוצים|רסק|מרוסק|סרדין|תירס|אפונה|גרגירי|פטריות שימור'},
 {id:'snacks',name:'חטיפים',c:'#e08414',k:'במבה|ביסלי|חטיף|חטיפים|צ\'יפס|דוריטוס|צ\'יטוס|פופקורן|בייגלה|עוגיות|וופל|תפוצ\'יפס|קרקר|פרינגלס|אפרופו|שקדי מרק|פיצוחים|גרעינים'},
 {id:'choc',name:'שוקולדים וממתקים',c:'#a35a35',k:'שוקולד|פרה|מקופל|קליק|כיף כיף|נוטלה|ממתק|סוכריות|מסטיק|גומי|מרשמלו|קינדר|טבעות|לקקן|שוקולדים|מנטוס|טופי|חלבה'},
 {id:'drinks',name:'שתייה',c:'#2b7fd0',k:'מים|סודה|קולה|קפה|תה|מיץ|בירה|יין|וודקה|משקה|נביעות|פפסי|ספרייט|פנטה|שוופס|נסטי|אייס|נס קפה|ויסקי|עראק|מוגז|מיצים|קפסולות'},
 {id:'clean',name:'מוצרי ניקיון',c:'#1fa39a',k:'אקונומיקה|כביסה|מרכך|נוזל כלים|סבון כלים|מנקה|נייר סופג|שקיות אשפה|שקיות|ספוג|ג\'ל כלים|אבקת מדיח|טבליות|מטהר|חומר ניקוי|סנו|נייר אפייה|נייר כסף|ניילון|מגבות|מגב|מטליות|כלים חד פעמיים|פתיל'},
 {id:'care',name:'היגיינה וטיפוח',c:'#c9459a',k:'שמפו|שיער|משחת שיניים|מברשת|סבון|דאודורנט|נייר טואלט|טישו|חיתולים|תחבושות|טמפונים|קרם|סכיני|גילוי|מגבונים|גילוח|ספוגיות|מי פה|קצף'},
 {id:'other',name:'אחר',c:'#7a8b84',k:''}
];
const BYID=Object.fromEntries(CATS.map(c=>[c.id,c]));
const MATCH_ORDER=['frozen','clean','care','choc','snacks','canned','drinks','meat','dairy','bakery','produce','dry'];
const norm=s=>String(s||'').replace(/[‎‏‪-‮]/g,'').replace(/\s+/g,' ').trim();
function guess(name){
  const n=norm(name),toks=n.split(' ');
  for(const id of MATCH_ORDER){ for(const kw of BYID[id].k.split('|')){ if(kw.includes(' ')&&n.includes(kw)) return id; } }
  for(const id of MATCH_ORDER){ for(const kw of BYID[id].k.split('|')){ if(!kw||kw.includes(' ')) continue;
    if(kw.length<=2?toks.includes(kw):toks.some(t=>t.startsWith(kw)||t.startsWith('ה'+kw))) return id; } }
  return 'other';
}
function idOf(name){let h=5381;const s=norm(name);for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return 'i'+h.toString(36)}
function parseItem(raw){
  let t=norm(String(raw).replace(/^[\s\-•*·]+/,'').replace(/^\d+[.)]\s+/,'').replace(/[.;!]+$/,''));
  if(!t) return null; let qty=1,m;
  if((m=t.match(/^(\d{1,2})\s+(.+)$/))&&!/^(%|ק"?ג|קג|גרם|גר|ליטר|ל'|מ"?ל|מל|יח)/.test(m[2])){qty=+m[1];t=m[2]}
  else if((m=t.match(/^(.+?)\s*[xX×*]\s*(\d{1,2})$/))){t=m[1];qty=+m[2]}
  t=norm(t); if(!t||t.length>40) return null;
  return {name:t,qty:Math.max(1,qty)};
}
function splitText(text){
  const WA=/^[‎‏‪-‮]*\[?\d{1,2}[./]\d{1,2}[./]\d{2,4},?\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap]\.?[Mm]\.?)?\]?\s*(?:[-–]\s*)?/;
  const SKIP=/הושמט|omitted|נמחקה|deleted|מוצפנ|encrypted|צירפת|joined|הצטרף|עזב|left|שינה|created|<.*>/i;
  const out=[],seen=new Set();
  for(const line of String(text).split(/\r?\n/)){
    let body=line;
    if(WA.test(line)){ const rest=line.replace(WA,''); const i=rest.indexOf(': '); if(i<0) continue; body=rest.slice(i+2); }
    if(SKIP.test(body)) continue;
    for(const part of body.split(/[,،;\n]+/)){
      const it=parseItem(part); if(!it) continue;
      const k=idOf(it.name); if(seen.has(k)) continue; seen.add(k);
      it.words=it.name.split(' ').length; out.push(it);
    }
  }
  return out;
}

/* ---------- state + storage ---------- */
const DEFAULT_STORES=[{id:'s1',name:'אושר עד קרית אונו',auto:true,src:{user:'osherad',chain:'7290103152017',store:'032'}},{id:'s2',name:'יוחננוף חולון',auto:true,src:{user:'yohananof',chain:'7290803800003',store:'073'}},{id:'s3',name:'חצי חינם חולון',auto:false}];
const S={items:{},prices:{},stores:DEFAULT_STORES,tab:'list',shopStore:ls.get('shopStore')||'all',hideDone:ls.get('hideDone')==='1',scope:'left',loaded:false,sync:null,cat:null,back:null};
let DB=null,SAMPLE=null;
const chain={};
function write(path,data){
  const [col,id]=path.split('/');
  if(DB){ chain[path]=(chain[path]||Promise.resolve()).then(()=>(data===null?DB.doc(path).delete():DB.doc(path).set(data))).catch(()=>toast('השמירה נכשלה, נסו שוב')); return chain[path]; }
  if(col==='items'){ data===null?delete S.items[id]:S.items[id]={id,...data}; }
  else if(col==='prices'){ data===null?delete S.prices[id]:S.prices[id]={id,...data}; }
  else if(col==='config'){ S.stores=data.list; }
  localSave(); render(); return Promise.resolve();
}
function localSave(){ if(DB) return; ls.set('shopLocal',JSON.stringify({items:S.items,prices:S.prices,stores:S.stores})); }
function localLoad(){ try{const d=JSON.parse(ls.get('shopLocal')||'null'); if(d){S.items=d.items||{};S.prices=d.prices||{};if(d.stores)S.stores=d.stores}}catch(e){} }
const saveStores=list=>write('config/stores',{list});

/* ---------- data helpers ---------- */
const items=()=>Object.values(S.items);
const unit=(pr,sid)=>{const x=pr&&pr.p&&pr.p[sid]; if(!x) return null; const sale=+x.sale||0,reg=+x.price||0; const v=sale>0?sale:reg; if(!(v>0)) return null; return {v,promo:sale>0&&(!reg||sale<reg),note:x.note||'',reg,pname:x.pname||'',src:x.src||''}};
const itemDoc=(it,patch)=>({name:it.name,cat:it.cat,qty:it.qty||1,done:!!it.done,ts:it.ts||Date.now(),...patch});
function addItem(name,qty,cat){
  const id=idOf(name),ex=S.items[id];
  if(ex) return write('items/'+id,itemDoc(ex,{qty:(ex.qty||1)+qty,done:false}));
  return write('items/'+id,{name:norm(name),cat:cat||guess(name),qty,done:false,ts:Date.now()});
}
function sorted(list){return list.slice().sort((a,b)=>(a.done-b.done)||((a.ts||0)-(b.ts||0))||a.name.localeCompare(b.name,'he'))}
function groups(filter){
  const g={}; for(const it of items()){ if(filter&&!filter(it)) continue; (g[it.cat in BYID?it.cat:'other']??=[]).push(it); }
  return CATS.filter(c=>g[c.id]).map(c=>({cat:c,list:sorted(g[c.id])}));
}
function compare(scope){
  const list=items().filter(i=>scope==='all'||!i.done);
  const stores=S.stores.map(st=>{let total=0,missing=0,promos=0;
    for(const it of list){const u=unit(S.prices[it.id],st.id); if(!u){missing++;continue} total+=u.v*(it.qty||1); if(u.promo)promos++;}
    return {st,total,missing,promos}});
  stores.sort((a,b)=>a.missing-b.missing||a.total-b.total);
  const split={total:0,by:{},missing:[]};
  for(const it of list){let best=null;for(const st of S.stores){const u=unit(S.prices[it.id],st.id);if(u&&(!best||u.v<best.u.v))best={st,u}}
    if(!best){split.missing.push(it);continue} split.total+=best.u.v*(it.qty||1);(split.by[best.st.id]??=[]).push({it,u:best.u});}
  return {list,stores,split};
}
function ago(iso){ if(!iso) return ''; const m=Math.max(0,Math.round((Date.now()-new Date(iso))/60000)); if(m<2) return 'עכשיו'; if(m<60) return `לפני ${m} דקות`; const h=Math.round(m/60); if(h<24) return h===1?'לפני שעה':`לפני ${h} שעות`; const d=Math.round(h/24); return d===1?'אתמול':`לפני ${d} ימים`; }

/* ---------- views ---------- */
function updateChrome(){
  document.querySelectorAll('nav.tabs button').forEach(b=>{ if(b.dataset.tab===S.tab) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  const left=items().filter(i=>!i.done).length; const bd=$('#leftbadge'); bd.hidden=!left; bd.textContent=left;
  $('#addform').hidden=S.tab!=='list';
  $('#date').textContent=new Date().toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'});
  const chip=$('#syncchip'),busy=isBusy();
  chip.classList.toggle('busy',busy);
  $('#synctxt').textContent=busy?'מעדכן מחירים…':(S.sync&&S.sync.lastRun?'מחירים · '+ago(S.sync.lastRun):'רענון מחירים');
  chip.hidden=!DB;
}
function emptyState(){return `<div class="empty"><b>${S.loaded?'הרשימה ריקה':'טוען את הרשימה…'}</b>${S.loaded?'<span>הוסיפו מוצר בשורה למעלה, או ייבאו את הרשימה מווטסאפ.</span><button class="btn" data-act="import" style="margin-top:10px">ייבוא מווטסאפ</button>':''}</div>`}
function hero(){
  const all=items(),done=all.filter(i=>i.done).length,left=all.length-done;
  const {stores}=compare('left'); const best=stores.find(s=>s.total>0);
  return `<section class="hero"><div class="ttl">${left?`נשארו ${left} מוצרים לקנות`:(all.length?'הכול נלקח, אפשר לגשת לקופה':'מתחילים רשימה חדשה')}</div>
   <div class="kpis"><div class="kpi"><b>${left}</b><span>נשארו</span></div><div class="kpi"><b>${done}</b><span>נלקחו</span></div>
   <div class="kpi"><b class="m">${best?fmt(best.total):'—'}</b><span>${best?esc(best.st.name):'סל מוערך'}</span></div></div>
   <div class="hbar"><i style="width:${all.length?Math.round(done/all.length*100):0}%"></i></div></section>`;
}
function tile(g,mode,sid){
  const {cat,list}=g,left=list.filter(i=>!i.done).length,done=list.length-left,complete=left===0;
  const names=sorted(list).filter(i=>!i.done).slice(0,3).map(i=>i.name).join(', ');
  return `<button class="tile ${mode==='shop'&&complete?'complete':''}" style="--c:${cat.c}" data-act="opencat" data-id="${cat.id}" data-mode="${mode}">
   <div class="top">${icon(cat.id)}${mode==='shop'&&complete?'<span class="donebadge">הושלם</span>':`<span class="cnt">${list.length}</span>`}</div>
   <div class="nm">${esc(cat.name)}</div>
   <div class="big">${mode==='shop'?left:list.length}<small>${mode==='shop'?'נשארו':'מוצרים'}</small></div>
   <div class="tbar"><i style="width:${Math.round(done/list.length*100)}%"></i></div>
   <div class="prev">${esc(names||'הכול נלקח')}</div></button>`;
}
function viewList(){
  const gs=groups(); if(!gs.length) return emptyState();
  return hero()+`<div class="tiles">${gs.map(g=>tile(g,'list')).join('')}</div>`;
}
function viewShop(){
  const all=items(); if(!all.length) return emptyState();
  const sid=S.shopStore!=='all'&&S.stores.some(s=>s.id===S.shopStore)?S.shopStore:'all';
  let cost=0,miss=0; if(sid!=='all'){for(const it of all.filter(i=>!i.done)){const u=unit(S.prices[it.id],sid);u?cost+=u.v*(it.qty||1):miss++}}
  const gs=groups(i=>!(S.hideDone&&i.done)&&true).filter(g=>!(S.hideDone&&g.list.every(i=>i.done)));
  return `<div class="pills" role="group" aria-label="חנות">
    <button class="pill" aria-pressed="${sid==='all'}" data-act="shopstore" data-id="all">ללא מחירים</button>
    ${S.stores.map(s=>`<button class="pill" aria-pressed="${sid===s.id}" data-act="shopstore" data-id="${s.id}">${esc(s.name)}</button>`).join('')}</div>
  ${hero()}
  ${sid!=='all'?`<div class="panel" style="margin-top:0"><div class="stats"><b style="font:700 1.3rem var(--font-head)">${fmt(cost)}</b> <span class="note">משוער לשאר הקניות ב${esc(S.stores.find(s=>s.id===sid).name)}</span> ${miss?`<span class="tag warn">חסר מחיר ל-${miss}</span>`:''}</div></div>`:''}
  <div class="acts" style="margin-bottom:14px"><button class="btn ghost small" data-act="hidedone">${S.hideDone?'הצג מה שנלקח':'הסתר מה שנלקח'}</button>${all.some(i=>i.done)?'<button class="btn ghost small" data-act="uncheckall">אפס סימונים</button>':''}</div>
  ${gs.length?`<div class="tiles">${gs.map(g=>tile(g,'shop',sid)).join('')}</div>`:`<div class="empty"><b>הכול נלקח</b><span>אפשר לגשת לקופה.</span></div>`}`;
}
function catSheetHTML(){
  const {id,mode}=S.cat; const cat=BYID[id]; const list=sorted(items().filter(i=>(i.cat in BYID?i.cat:'other')===id));
  const sid=S.shopStore!=='all'&&S.stores.some(s=>s.id===S.shopStore)?S.shopStore:'all';
  const left=list.filter(i=>!i.done).length;
  const rows=list.filter(i=>!(mode==='shop'&&S.hideDone&&i.done)).map(i=>{
    if(mode==='shop'){const u=sid!=='all'?unit(S.prices[i.id],sid):null;
      return `<button class="row ${i.done?'done':''}" data-act="toggle" data-id="${i.id}" aria-pressed="${!!i.done}"><span class="chk"></span><span class="tx"><span class="nm">${esc(i.name)}</span>${u&&u.note&&!i.done?`<span class="sub">${esc(u.note)}</span>`:''}</span>${i.qty>1?`<span class="qty">×${i.qty}</span>`:''}${u?`<span class="pr ${u.promo?'promo':''}">${fmt(u.v)}</span>`:''}</button>`}
    return `<button class="row ${i.done?'done':''}" data-act="edit" data-id="${i.id}"><span class="tx"><span class="nm">${esc(i.name)}</span></span>${i.qty>1?`<span class="qty">×${i.qty}</span>`:''}</button>`}).join('');
  return `<div class="shead" style="--c:${cat.c}">${icon(cat.id)}<div style="flex:1;min-width:0"><h3>${esc(cat.name)}</h3><span class="note">${mode==='shop'?`${left} נשארו מתוך ${list.length}`:`${list.length} מוצרים`}</span></div><button class="btn ghost small" data-act="closesheet">סגור</button></div>
  <div class="rows">${rows||'<div class="empty" style="border:0">אין מוצרים להצגה</div>'}</div>`;
}
function viewCompare(){
  if(!items().length) return emptyState();
  const {list,stores,split}=compare(S.scope);
  const seg=`<div class="seg" role="group"><button aria-pressed="${S.scope==='left'}" data-act="scope" data-id="left">מה שנשאר</button><button aria-pressed="${S.scope==='all'}" data-act="scope" data-id="all">כל הרשימה</button></div>`;
  if(!list.length) return seg+`<div class="empty"><b>אין מה להשוות</b><span>כל המוצרים סומנו כנלקחו.</span></div>`;
  const priced=stores.filter(s=>s.total>0);
  if(!priced.length) return seg+`<div class="empty"><b>עדיין אין מחירים</b><span>לחצו על "רענון מחירים" למעלה, או על מוצר בטבלה כדי להזין מחיר.</span></div>`+table(list);
  const best=priced[0],comparable=priced.filter(s=>s.missing===best.missing),worst=comparable[comparable.length-1];
  const diff=worst.total-best.total;
  const splitSave=best.missing===0&&split.missing.length===0?best.total-split.total:0;
  return seg+`<div class="winner"><span class="k">הסל הכי משתלם</span><span class="v">${fmt(best.total)}</span>
    <span class="s">ב${esc(best.st.name)}${diff>0.005?` · חוסכים ${fmt(diff)} לעומת ${esc(worst.st.name)}`:''}${best.promos?` · ${best.promos} מוצרים במבצע`:''}${best.missing?` · חסר מחיר ל-${best.missing} מוצרים`:''}</span></div>
  <div class="tiles" style="margin-bottom:14px">${stores.map(s=>`<div class="stile ${s===best?'best':''}"><span class="nm">${esc(s.st.name)}</span><span class="t">${s.total?fmt(s.total):'—'}</span>
    <div class="tags">${s===best?'<span class="tag">הכי זול</span>':''}${s.promos?`<span class="tag promo">${s.promos} במבצע</span>`:''}${s.missing?`<span class="tag warn">חסר מחיר ל-${s.missing}</span>`:''}${s.st.auto===false&&!s.total?'<span class="tag warn">הזנה ידנית</span>':''}</div></div>`).join('')}</div>
  ${splitSave>0.5?`<div class="panel"><h3>קנייה מפוצלת בין הסופרים: ${fmt(split.total)} <span class="tag">חוסכת עוד ${fmt(splitSave)}</span></h3>
    <span class="note">שווה רק אם לא מפריע לכם לעבור בין כמה חנויות.</span>
    ${S.stores.filter(s=>split.by[s.id]).map(s=>`<div><b>${esc(s.name)}</b><ul>${split.by[s.id].map(x=>`<li>${esc(x.it.name)}${x.it.qty>1?' ×'+x.it.qty:''} · ${fmt(x.u.v)}${x.u.promo?' (מבצע)':''}</li>`).join('')}</ul></div>`).join('')}</div>`:''}
  ${table(list)}`;
}
function table(list){
  const rows=sorted(list).map(it=>{const us=S.stores.map(s=>unit(S.prices[it.id],s.id));const vals=us.filter(Boolean).map(u=>u.v);const mn=vals.length?Math.min(...vals):null;
    return `<tr data-act="edit" data-id="${it.id}"><td>${esc(it.name)}${it.qty>1?` <span class="qty">×${it.qty}</span>`:''}</td>${us.map(u=>u?`<td class="${u.v===mn&&vals.length>1?'best':''}">${u.promo?`<span class="p">${fmt(u.v)}</span>`:fmt(u.v)}</td>`:'<td style="color:var(--muted)">—</td>').join('')}</tr>`}).join('');
  return `<h2 class="sec">מחיר ליחידה לפי סופר</h2><div class="tbl-wrap"><table><thead><tr><th>מוצר</th>${S.stores.map(s=>`<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
  <p class="note">מחיר בכתום הוא מחיר מבצע, בירוק הזול ביותר בשורה. מבצעי כמות (למשל 3 ב-10) מחושבים כמחיר ליחידה כשקונים את הכמות המלאה. לחצו על שורה כדי לראות את המוצר שנבחר ולעדכן.</p>`;
}
function viewMore(){
  return `<div style="max-width:640px">
  <section class="panel" style="margin-top:0"><h2>עדכון מחירים</h2><span class="note">המחירים והמבצעים נמשכים מדי לילה מקבצי שקיפות המחירים של הרשתות, לסניפים שהגדרתם. ${S.sync&&S.sync.lastRun?'עודכן '+ago(S.sync.lastRun)+'.':''} ${S.sync&&S.sync.status&&S.sync.status!=='ok'?'<br>הודעה אחרונה: '+esc(S.sync.status):''}</span>
   <div class="acts"><button class="btn" data-act="refresh" ${DB?'':'disabled'}>רענן עכשיו</button></div></section>
  <section class="panel"><h2>ייבוא מווטסאפ</h2><span class="note">הדביקו את הרשימה מהקבוצה, או העלו קובץ ייצוא של השיחה. המערכת מסננת הודעות מערכת, מזהה כמויות ומסווגת לקטגוריות.</span><div class="acts"><button class="btn" data-act="import">פתח ייבוא</button></div></section>
  <section class="panel"><h2>הסופרים שלכם</h2><div class="stack">
    ${S.stores.map(s=>`<div class="storerow"><input data-store="${s.id}" value="${esc(s.name)}" aria-label="שם סופר">${s.auto?'<span class="tag">מחירים אוטומטיים</span>':'<span class="tag warn">ידני</span>'}<button class="btn danger small" data-act="delstore" data-id="${s.id}">מחק</button></div>`).join('')}
    <div class="storerow" style="border:0"><input id="newstore" placeholder="סופר חדש" aria-label="סופר חדש"><button class="btn small" data-act="addstore">הוסף</button></div></div></section>
  <section class="panel"><h2>ניקוי</h2><div class="acts">
    <button class="btn ghost" data-act="cleardone">הסר מוצרים שנלקחו</button>
    <button class="btn danger" data-act="clearall">מחק את כל הרשימה</button></div>
    <span class="note">מחירים שנשמרו נשארים גם אחרי מחיקת מוצר.</span></section></div>`;
}
function render(){
  updateChrome();
  const v=$('#view'); const f={list:viewList,shop:viewShop,compare:viewCompare,more:viewMore}[S.tab]||viewList;
  const keep=document.activeElement&&document.activeElement.id==='newstore'?$('#newstore').value:null;
  v.innerHTML=f(); if(keep!==null&&$('#newstore'))$('#newstore').value=keep;
  if(S.cat&&sheetOpen){const sh=$('#sheetroot .sheet');if(sh){const t=sh.scrollTop;sh.innerHTML=catSheetHTML();sh.scrollTop=t}}
}

/* ---------- sheets ---------- */
let sheetOpen=false;
function openSheet(html){ $('#sheetroot').innerHTML=`<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-modal="true">${html}</div></div>`; sheetOpen=true; }
function closeSheet(){ const b=S.back; S.back=null; S.cat=null; $('#sheetroot').innerHTML=''; sheetOpen=false; if(b){S.cat=b; openSheet(catSheetHTML());} }
function openCat(id,mode){ S.cat={id,mode}; openSheet(catSheetHTML()); }
function editSheet(id){
  const it=S.items[id]; if(!it) return; const pr=S.prices[id]||{p:{}};
  if(S.cat){S.back=S.cat;S.cat=null}
  openSheet(`<h3>${esc(it.name)}</h3>
  <div class="field"><span class="lbl">כמות</span><div class="stepper"><button type="button" data-act="qty" data-d="-1" aria-label="פחות">−</button><output id="qv">${it.qty||1}</output><button type="button" data-act="qty" data-d="1" aria-label="יותר">+</button></div></div>
  <div class="field"><label for="ecat">קטגוריה</label><select id="ecat">${CATS.map(c=>`<option value="${c.id}" ${c.id===it.cat?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>
  <div class="lbl">מחירים ומבצעים לפי סופר (ליחידה, בשקלים)</div>
  ${S.stores.map(s=>{const x=(pr.p||{})[s.id]||{};const auto=x.src==='auto'&&x.pname;return `<div class="pbox" data-sid="${s.id}"><b>${esc(s.name)}</b>
    ${auto?`<span class="note">מהאתר: ${esc(x.pname)} <span class="tag">מקוון</span></span>`:(x.src==='manual'?'<span class="note"><span class="tag warn">הוזן ידנית</span></span>':'')}
    <div class="pgrid">
    <div class="field"><label>מחיר רגיל</label><input inputmode="decimal" data-f="price" value="${x.price||''}" placeholder="0.00"></div>
    <div class="field"><label>מחיר מבצע</label><input inputmode="decimal" data-f="sale" value="${x.sale||''}" placeholder="0.00"></div>
    <div class="field full"><label>פרטי המבצע</label><input data-f="note" value="${esc(x.note||'')}" placeholder="למשל: 2 ב-10, עד 31.11"></div></div></div>`}).join('')}
  <div class="acts"><button class="btn grow" data-act="saveitem" data-id="${id}">שמור</button><button class="btn ghost" data-act="closesheet">ביטול</button><button class="btn danger" data-act="delitem" data-id="${id}">מחק</button></div>`);
}
function saveItem(id){
  const it=S.items[id]; if(!it) return;
  const qty=Math.max(1,+$('#qv').textContent||1),cat=$('#ecat').value;
  const old=(S.prices[id]&&S.prices[id].p)||{},p={};
  document.querySelectorAll('#sheetroot .pbox').forEach(b=>{const sid=b.dataset.sid,g=f=>b.querySelector(`[data-f=${f}]`).value.trim().replace(',','.');
    const price=parseFloat(g('price'))||0,sale=parseFloat(g('sale'))||0,note=g('note'),o=old[sid];
    if(!price&&!sale) return;
    if(o&&(+o.price||0)===price&&(+o.sale||0)===sale&&(o.note||'')===note) p[sid]=o; else p[sid]={price,sale,note,src:'manual'};});
  write('items/'+id,itemDoc(it,{qty,cat}));
  if(Object.keys(p).length||S.prices[id]) write('prices/'+id,{name:it.name,p,ex:false});
  closeSheet(); toast('נשמר');
}
let IMP=[];
function importSheet(){
  IMP=[]; S.cat=null;
  openSheet(`<h3>ייבוא מווטסאפ</h3>
  <div class="field"><label for="imptxt">הדביקו כאן את הרשימה או את השיחה</label><textarea id="imptxt" placeholder="[20/11/2026, 18:03] אמא: חלב, לחם&#10;2 קוטג&#10;עגבניות"></textarea></div>
  <div class="field"><label for="impfile">או העלו קובץ ייצוא (‎.txt)</label><input id="impfile" type="file" accept=".txt,text/plain"></div>
  <span class="note">בווטסאפ: פתחו את הקבוצה, תפריט, עוד, ייצוא שיחה, בלי מדיה. באייפון הקובץ מגיע בתוך zip, פתחו אותו לפני ההעלאה.</span>
  <div class="acts"><button class="btn" data-act="impparse">נתח</button>${SAMPLE?'<button class="btn ghost" data-act="impai">פענוח חכם עם Claude</button>':''}</div>
  <div id="impprev"></div>
  <div class="acts"><button class="btn grow" data-act="impadd" id="impadd" disabled>הוסף לרשימה</button><button class="btn ghost" data-act="closesheet">סגור</button></div>`);
  $('#impfile').addEventListener('change',async e=>{const f=e.target.files[0]; if(!f) return; $('#imptxt').value=await f.text(); impParse();});
}
function impRender(){
  const box=$('#impprev'); if(!box) return;
  const n=IMP.filter(r=>r.on).length;
  box.innerHTML=IMP.length?`<div class="lbl">נמצאו ${IMP.length} פריטים. בטלו סימון על מה שלא שייך.</div>`+IMP.map((r,i)=>`<div class="improw"><input type="checkbox" data-i="${i}" ${r.on?'checked':''} aria-label="${esc(r.name)}"><span class="nm">${esc(r.name)}${r.qty>1?' ×'+r.qty:''}${S.items[idOf(r.name)]?' <span class="tag warn">כבר ברשימה</span>':''}</span><select data-ci="${i}" aria-label="קטגוריה">${CATS.map(c=>`<option value="${c.id}" ${c.id===r.cat?'selected':''}>${esc(c.name)}</option>`).join('')}</select></div>`).join('')
   +(IMP.some(r=>r.cat==='other')&&SAMPLE?'<div class="acts" style="margin-top:8px"><button class="btn ghost small" data-act="impcat">סווג את הלא מזוהים עם Claude</button></div>':''):'';
  $('#impadd').disabled=!n; $('#impadd').textContent=n?`הוסף ${n} פריטים לרשימה`:'הוסף לרשימה';
}
function impParse(){ IMP=splitText($('#imptxt').value).map(r=>({...r,cat:guess(r.name),on:r.words<=4})); if(!IMP.length)toast('לא נמצאו מוצרים בטקסט'); impRender(); }
async function impAI(btn){
  const txt=$('#imptxt').value.trim().slice(0,30000); if(!txt) return toast('הדביקו טקסט קודם');
  btn.disabled=true; btn.textContent='Claude קורא את השיחה…';
  try{
    const ids=CATS.map(c=>c.id+'='+c.name).join(', ');
    const res=await SAMPLE.json(`להלן הודעות מקבוצת וואטסאפ משפחתית של רשימת קניות לבית (בעברית). חלץ רק את המוצרים שצריך לקנות, בלי שיחה, בלי שמות אנשים ובלי הודעות מערכת. אם הוזכרה כמות, החזר אותה. נרמל שמות לצורה קצרה (למשל "חלב 3%"). שייך כל מוצר לקטגוריה לפי המזהים: ${ids}.\nהחזר אך ורק מערך JSON של אובייקטים בצורה {"name":string,"qty":number,"cat":string}.\n\nההודעות:\n${txt}`,{modelTier:'quick'});
    const seen=new Set(); IMP=[]; for(const r of (Array.isArray(res)?res:[])){ const name=norm(r.name); if(!name||seen.has(idOf(name))) continue; seen.add(idOf(name)); IMP.push({name,qty:Math.max(1,Math.round(+r.qty)||1),cat:BYID[r.cat]?r.cat:guess(name),on:true,words:1}); }
    if(!IMP.length) toast('Claude לא מצא מוצרים'); impRender();
  }catch(e){ toast(e&&e.code==='not_granted'?'לא אושר שימוש ב-Claude':'הפענוח נכשל, נסו את "נתח"'); }
  btn.disabled=false; btn.textContent='פענוח חכם עם Claude';
}
async function impCat(btn){
  const un=IMP.filter(r=>r.cat==='other'); if(!un.length) return; btn.disabled=true; btn.textContent='מסווג…';
  try{
    const ids=CATS.filter(c=>c.id!=='other').map(c=>c.id+'='+c.name).join(', ');
    const res=await SAMPLE.json(`שייך כל מוצר מרשימת קניות בעברית לקטגוריה אחת. קטגוריות: ${ids}, other=אחר (רק אם באמת לא מתאים). החזר אך ורק אובייקט JSON שמפתחותיו שמות המוצרים וערכיו מזהה קטגוריה.\nמוצרים: ${JSON.stringify(un.map(r=>r.name))}`,{modelTier:'quick'});
    for(const r of un){ if(res&&BYID[res[r.name]]) r.cat=res[r.name]; } impRender();
  }catch(e){ toast('הסיווג נכשל'); btn.disabled=false; btn.textContent='סווג את הלא מזוהים עם Claude'; }
}

/* ---------- price refresh ---------- */
function isBusy(){ const s=S.sync; if(!s||!s.requestedAt) return false; if(s.lastRun&&s.lastRun>=s.requestedAt) return false; return Date.now()-new Date(s.requestedAt)<25*60000; }
async function refresh(){
  if(!DB) return toast('הרענון זמין רק כשמחוברים');
  if(isBusy()) return toast('העדכון כבר מתבצע');
  await write('config/sync',{...(S.sync||{}),requestedAt:new Date().toISOString()});
  toast('הבקשה נשלחה. העדכון יתחיל תוך כמה דקות');
}
setInterval(updateChrome,30000);

/* ---------- toast ---------- */
let tt; function toast(m){const t=$('#toast');t.innerHTML=`<span>${esc(m)}</span>`;clearTimeout(tt);tt=setTimeout(()=>t.innerHTML='',2600)}

/* ---------- events ---------- */
let armed=null;
document.addEventListener('click',e=>{
  const tb=e.target.closest('nav.tabs [data-tab]'); if(tb){setTab(tb.dataset.tab);return}
  const el=e.target.closest('[data-act]'); if(!el) return;
  const act=el.dataset.act,id=el.dataset.id;
  switch(act){
    case 'closesheet': if(!el.classList.contains('scrim')||e.target===el) closeSheet(); break;
    case 'opencat': openCat(id,el.dataset.mode); break;
    case 'edit': editSheet(id); break;
    case 'toggle':{const it=S.items[id]; if(it) write('items/'+id,itemDoc(it,{done:!it.done})); break}
    case 'shopstore': S.shopStore=id; ls.set('shopStore',id); render(); break;
    case 'hidedone': S.hideDone=!S.hideDone; ls.set('hideDone',S.hideDone?'1':'0'); render(); break;
    case 'uncheckall': for(const it of items()) if(it.done) write('items/'+it.id,itemDoc(it,{done:false})); break;
    case 'scope': S.scope=id; render(); break;
    case 'refresh': refresh(); break;
    case 'qty':{const o=$('#qv'); o.textContent=Math.max(1,(+o.textContent||1)+(+el.dataset.d)); break}
    case 'saveitem': saveItem(id); break;
    case 'delitem': write('items/'+id,null); S.back=null; closeSheet(); toast('המוצר הוסר'); break;
    case 'import': importSheet(); break;
    case 'impparse': impParse(); break;
    case 'impai': impAI(el); break;
    case 'impcat': impCat(el); break;
    case 'impadd':{const rows=IMP.filter(r=>r.on); rows.forEach(r=>addItem(r.name,r.qty,r.cat)); closeSheet(); setTab('list'); toast(`נוספו ${rows.length} פריטים`); break}
    case 'addstore':{const v=norm($('#newstore').value); if(!v) return; saveStores([...S.stores,{id:'s'+Date.now().toString(36),name:v,auto:false}]); break}
    case 'delstore': if(armed===id){armed=null; saveStores(S.stores.filter(s=>s.id!==id)); toast('הסופר הוסר')} else {armed=id; el.textContent='לחצו שוב לאישור'; setTimeout(()=>{if(armed===id){armed=null;render()}},3000)} break;
    case 'cleardone': {const d=items().filter(i=>i.done); d.forEach(i=>write('items/'+i.id,null)); toast(d.length?`הוסרו ${d.length} מוצרים`:'אין מוצרים שנלקחו'); break}
    case 'clearall': if(armed==='all'){armed=null; items().forEach(i=>write('items/'+i.id,null)); toast('הרשימה נוקתה')} else {armed='all'; el.textContent='לחצו שוב לאישור'; setTimeout(()=>{if(armed==='all'){armed=null;render()}},3000)} break;
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.store){const v=norm(t.value); if(v) saveStores(S.stores.map(s=>s.id===t.dataset.store?{...s,name:v}:s)); else render();}
  if(t.dataset&&t.dataset.i!==undefined){IMP[+t.dataset.i].on=t.checked; impRender()}
  if(t.dataset&&t.dataset.ci!==undefined){IMP[+t.dataset.ci].cat=t.value}
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&sheetOpen) closeSheet(); if(e.key==='Enter'&&e.target.id==='newstore') document.querySelector('[data-act=addstore]').click(); });
$('#addform').addEventListener('submit',e=>{e.preventDefault(); const inp=$('#addin'); const rows=splitText(inp.value.replace(/\n/g,', ')); if(!rows.length) return; rows.forEach(r=>addItem(r.name,r.qty)); inp.value=''; toast(rows.length>1?`נוספו ${rows.length} מוצרים`:'נוסף'); inp.focus()});
function setTab(t){S.tab=t; if(location.hash!=='#'+t) location.hash=t; render(); window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{const t=location.hash.slice(1); if(['list','shop','compare','more'].includes(t)&&t!==S.tab){S.tab=t;render()}});

/* ---------- boot ---------- */
(function(){const t=location.hash.slice(1); if(['list','shop','compare','more'].includes(t)) S.tab=t;})();
render();
const cfgOk=window.FIREBASE_CONFIG&&window.FIREBASE_CONFIG.apiKey&&!/YOUR_/.test(window.FIREBASE_CONFIG.apiKey);
async function bootCloud(){
  const V='10.14.1',base='https://www.gstatic.com/firebasejs/'+V+'/';
  const [{initializeApp},A,F]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  const app=initializeApp(window.FIREBASE_CONFIG);
  const auth=A.getAuth(app);
  const fdb=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})});
  DB={
    doc:p=>({set:d=>F.setDoc(F.doc(fdb,p),d),delete:()=>F.deleteDoc(F.doc(fdb,p)),
      onSnapshot:(n,e)=>F.onSnapshot(F.doc(fdb,p),s=>n({exists:s.exists(),data:()=>s.data(),id:s.id}),e)}),
    collection:c=>({onSnapshot:(n,e)=>F.onSnapshot(F.collection(fdb,c),s=>n({docs:s.docs.map(d=>({id:d.id,data:()=>d.data()}))}),e)})
  };
  const form=$('#loginform'),msg=$('#loginmsg');
  form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='מתחבר…';
    try{await A.signInWithEmailAndPassword(auth,$('#lemail').value.trim(),$('#lpass').value)}catch(err){msg.textContent='האימייל או הסיסמה שגויים'}});
  $('#logout').addEventListener('click',()=>A.signOut(auth));
  let started=false,unsubs=[];
  A.onAuthStateChanged(auth,user=>{
    $('#login').hidden=!!user; $('#logout').hidden=!user;
    if(!user){unsubs.forEach(u=>u());unsubs=[];started=false;S.items={};S.prices={};S.loaded=false;render();return}
    if(started) return; started=true;
    const to=setTimeout(()=>{ if(!S.loaded){S.loaded=true;toast('אין חיבור לשרת. מוצג המידע האחרון ששמור');render()} },10000);
    const fail=()=>{S.loaded=true;render()};
    unsubs.push(DB.collection('items').onSnapshot(s=>{S.items={};s.docs.forEach(d=>S.items[d.id]={id:d.id,...d.data()});S.loaded=true;clearTimeout(to);render()},fail));
    unsubs.push(DB.collection('prices').onSnapshot(s=>{S.prices={};s.docs.forEach(d=>S.prices[d.id]={id:d.id,...d.data()});render()},fail));
    unsubs.push(DB.doc('config/stores').onSnapshot(s=>{ if(s.exists){const d=s.data();if(d&&Array.isArray(d.list)){S.stores=d.list;render();return}} S.stores=DEFAULT_STORES; if(!S.seededStores){S.seededStores=true;write('config/stores',{list:DEFAULT_STORES})} render()},fail));
    unsubs.push(DB.doc('config/sync').onSnapshot(s=>{ S.sync=s.exists?s.data():null; render()},fail));
  });
}
if(cfgOk){ $('#login').hidden=false; bootCloud().catch(()=>{toast('שגיאה בחיבור ל-Firebase')}); }
else { $('#login').hidden=true; $('#demo').hidden=false; localLoad(); S.loaded=true; render(); }
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
