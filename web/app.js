
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
const icon=id=>{const k=(BYID[id]&&BYID[id].ic)||id;return `<span class="ico"><svg viewBox="0 0 24 24"><path d="${IC[k]||IC.other}"/></svg></span>`};
const BUILTIN=[
 {id:'produce',name:'ירקות ופירות',c:'#2e9e55',k:'עגבני|מלפפון|גזר|בצל|שום|תפוח|תפוז|לימון|בננ|אבוקדו|חסה|פלפל|תפוחי אדמה|בטטה|קישוא|חציל|כרוב|ברוקולי|כרובית|פטרוזיליה|כוסברה|שמיר|נענע|פטריות|ענבים|אבטיח|מלון|אפרסק|נקטרינ|שזיף|תות|אגס|קלמנטינ|אשכולית|מנגו|ירקות|פירות|סלק|דלעת|עלים|בזיליקום|תרד|קולרבי|רימון|תמר|גמב|ירק|צנון|צנונית|כרישה|סלרי|שומר|עירית|לפת|נבטים|רוקט|זנגביל|גינגר|דובדבנ|תאנ|קיווי|פומלה|אננס|ליים|מנדרינ|אפרסמון'},
 {id:'bakery',name:'לחם ומאפים',c:'#c4811a',k:'לחם|פיתה|פיתות|לחמני|חלה|חלות|בגט|טורטיה|עוגה|בורקס|מאפה|מאפים|לאפה|בייגל|קרואסון'},
 {id:'dairy',name:'חלב וביצים',c:'#3d86d6',k:'חלב|גבינ|קוטג|יוגורט|שמנת|חמאה|ביצ|מעדן|לבנה|מוצרלה|שוקו|מילקי|אשל|קממבר|פטה|ריקוטה|חמאת|משקה סויה|משקה שקדים'},
 {id:'meat',name:'בשר, עוף ודגים',c:'#d04a3f',k:'עוף|חזה|שניצל|כרעיים|כנפיים|בשר|סטייק|אנטריקוט|צלי|נקניק|קבב|המבורגר|הודו|דג|דגים|סלמון|פילה|כבד|שווארמה|פסטרמה|סלאמי|אסאדו'},
 {id:'frozen',name:'קפואים',c:'#25a8c4',k:'קפוא|קפואים|גלידה|ארטיק|בצק עלים|פיצה|מקפיא'},
 {id:'dry',name:'יבשים ותבלינים',c:'#a8742d',k:'אורז|פסטה|ספגטי|קמח|סוכר|מלח|שמן|קטשופ|מיונז|חומוס|טחינה|דגני|קורנפלקס|שיבולת|קוואקר|עדשים|שעועית|קוסקוס|פתיתים|תבלין|פפריקה|כמון|אבקת אפייה|סילאן|דבש|ריבה|חומץ|רוטב|קטניות|אגוזים|שקדים|בורגול|חרדל|קינמון|מרק|גרנולה|פירורי|אינסטנט|שמרים|קורנפלור|שומשום'},
 {id:'canned',name:'שימורים',c:'#8a63c9',k:'שימורי|טונה|זיתים|חמוצים|רסק|מרוסק|סרדין|תירס|אפונה|גרגירי|פטריות שימור'},
 {id:'snacks',name:'חטיפים',c:'#e08414',k:'במבה|ביסלי|חטיף|חטיפים|צ\'יפס|דוריטוס|צ\'יטוס|פופקורן|בייגלה|עוגיות|וופל|תפוצ\'יפס|קרקר|פרינגלס|אפרופו|שקדי מרק|פיצוחים|גרעינים'},
 {id:'choc',name:'שוקולדים וממתקים',c:'#a35a35',k:'שוקולד|פרה|מקופל|קליק|כיף כיף|נוטלה|ממתק|סוכריות|מסטיק|גומי|מרשמלו|קינדר|טבעות|לקקן|שוקולדים|מנטוס|טופי|חלבה'},
 {id:'drinks',name:'שתייה',c:'#2b7fd0',k:'מים|סודה|קולה|קפה|תה|מיץ|בירה|יין|וודקה|משקה|נביעות|פפסי|ספרייט|פנטה|שוופס|נסטי|אייס|נס קפה|ויסקי|עראק|מוגז|מיצים|קפסולות'},
 {id:'clean',name:'מוצרי ניקיון',c:'#1fa39a',k:'אקונומיקה|כביסה|מרכך|נוזל כלים|סבון כלים|מנקה|נייר סופג|שקיות אשפה|שקיות|ספוג|ג\'ל כלים|אבקת מדיח|טבליות|מטהר|חומר ניקוי|סנו|נייר אפייה|נייר כסף|ניילון|מגבות|מגב|מטליות|כלים חד פעמיים|פתיל|חד פעמי|חדפ|כוסות|כפיות|צלחות|מזלגות|קשיות|מפיות|מפית'},
 {id:'care',name:'היגיינה וטיפוח',c:'#c9459a',k:'שמפו|שיער|משחת שיניים|מברשת|סבון|דאודורנט|נייר טואלט|טישו|חיתולים|תחבושות|טמפונים|קרם|סכיני|גילוי|מגבונים|גילוח|ספוגיות|מי פה|קצף'},
 {id:'other',name:'אחר',c:'#7a8b84',k:''}
];
let CATS=BUILTIN.slice(),CUSTOM=[],BYID=Object.fromEntries(CATS.map(c=>[c.id,c]));
function setCustomCats(list){   // קטגוריות שהמשתמש הוסיף: נכנסות לפני "אחר"
  CUSTOM=(Array.isArray(list)?list:[]).filter(c=>c&&c.id&&c.name).map(c=>({id:c.id,name:String(c.name),c:c.c||'#7a8b84',ic:c.ic||'other',k:'',custom:true}));
  const other=BUILTIN.find(c=>c.id==='other');
  CATS=BUILTIN.filter(c=>c.id!=='other').concat(CUSTOM,[other]); BYID=Object.fromEntries(CATS.map(c=>[c.id,c]));
}
const MATCH_ORDER=['frozen','care','clean','choc','snacks','canned','drinks','meat','dairy','bakery','dry','produce'];
const norm=s=>String(s||'').replace(/[‎‏‪-‮]/g,'').replace(/\s+/g,' ').trim();
const FIN={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
const stem=x=>norm(x).replace(/[ךםןףץ]/g,c=>FIN[c]).replace(/["'׳״`]/g,'');   // אותיות סופיות וגרשיים לא משנים את ההתאמה
const KW={}; const kwList=id=>(KW[id]??=BYID[id].k.split('|').filter(Boolean).map(stem));
const PRE='הו';                                                               // תחילית: "ה" (הלחם) או "ו" (וחלב)
let CATMAP={},ALIAS={},NOMERGE={};                                                                // תיקונים שלמדנו מהמשתמש: שם מוצר > קטגוריה
function guess(name){
  const mapped=CATMAP[stem(name)]; if(mapped&&BYID[mapped]) return mapped;
  const n=stem(name),toks=n.split(' ').filter(Boolean);
  for(const id of MATCH_ORDER) for(const kw of kwList(id)) if(kw.includes(' ')&&n.includes(kw)) return id;
  const hit=(t,kw)=>{ if(t===kw) return true; if(kw.length<=2) return false; const k=(kw.length>4&&kw.endsWith('ה'))?kw.slice(0,-1):kw;   // טורטיה / טורטיות
    return t.startsWith(k)||(PRE.includes(t[0])&&t.slice(1).startsWith(k)); };
  for(const id of MATCH_ORDER) for(const kw of kwList(id)) if(!kw.includes(' ')&&toks.some(t=>hit(t,kw))) return id;
  return 'other';
}
function learnCat(name,cat){const k=stem(name); if(!k||CATMAP[k]===cat) return; CATMAP={...CATMAP,[k]:cat}; write('config/catmap',{map:CATMAP});}
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
  else if(col==='config'){ if(id==='catmap') CATMAP=data.map||{}; else if(id==='aliases') ALIAS=data.map||{}; else if(id==='nomerge') NOMERGE=data.map||{}; else if(id==='categories') setCustomCats(data.list); else S.stores=data.list; }
  localSave(); render(); return Promise.resolve();
}
function localSave(){ if(DB) return; ls.set('shopLocal',JSON.stringify({items:S.items,prices:S.prices,stores:S.stores,catmap:CATMAP,alias:ALIAS,nomerge:NOMERGE,cats:CUSTOM})); }
function localLoad(){ try{const d=JSON.parse(ls.get('shopLocal')||'null'); if(d){S.items=d.items||{};S.prices=d.prices||{};if(d.stores)S.stores=d.stores;if(d.catmap)CATMAP=d.catmap;if(d.alias)ALIAS=d.alias;if(d.nomerge)NOMERGE=d.nomerge;if(d.cats)setCustomCats(d.cats)}}catch(e){} }
const saveStores=list=>write('config/stores',{list});

/* ---------- data helpers ---------- */
const items=()=>Object.values(S.items);
const unit=(pr,sid)=>{const x=pr&&pr.p&&pr.p[sid]; if(!x) return null; const sale=+x.sale||0,reg=+x.price||0; const v=sale>0?sale:reg; if(!(v>0)) return null; return {v,promo:sale>0&&(!reg||sale<reg),note:x.note||'',reg,pname:x.pname||'',src:x.src||''}};
const itemDoc=(it,patch)=>({name:it.name,cat:it.cat,qty:it.qty||1,done:!!it.done,ts:it.ts||Date.now(),...(it.bc?{bc:it.bc,bn:it.bn||''}:{}),...(it.by?{by:it.by}:{}),...patch});
function addItem(name,qty,cat){
  let id=idOf(name),ex=S.items[id];
  const al=ALIAS[stem(name)]; if(!ex&&al&&S.items[al.id]){id=al.id;ex=S.items[id];}   // שם שכבר מוזג בעבר
  if(ex) return write('items/'+id,itemDoc(ex,{qty:(ex.qty||1)+qty,done:false}));
  return write('items/'+id,{name:norm(name),cat:cat||guess(name),qty,done:false,ts:Date.now()});
}

/* ---------- קטלוג מוצרים: בחירת מוצר מדויק לפי ברקוד ---------- */
const catSearchFn=()=>(DB&&DB.searchCatalog)||window.__catalogSearch||null;   // window.__catalogSearch: לבדיקות בלבד
const cleanName=n=>norm(String(n||'').replace(/^\*?מבצע\*?\s*/,'').replace(/\s+/g,' '));
function pricesFromRow(row,old){   // מחירי הרשתות מהקטלוג, בלי לדרוס הזנה ידנית
  const p={...(old||{})};
  for(const sid of Object.keys(p)) if(p[sid]&&p[sid].src!=='manual'&&p[sid].code!==row.code) delete p[sid];
  for(const [sid,v] of Object.entries(row.stores||{})){ if(p[sid]&&p[sid].src==='manual') continue; p[sid]={price:v.p,sale:0,note:'',code:row.code,pname:v.n,src:'auto'}; }
  return p;
}
function bindProduct(id,row){
  const it=S.items[id]; if(!it) return;
  write('items/'+id,itemDoc(it,{bc:row.code,bn:cleanName(row.name)}));
  write('prices/'+id,{name:it.name,p:pricesFromRow(row,(S.prices[id]&&S.prices[id].p)||{}),ex:false});
}
function addCatalogItem(row,qty,cat){
  const name=cleanName(row.name),id=idOf(name),ex=S.items[id];
  if(ex){ write('items/'+id,itemDoc(ex,{qty:Math.min(99,(ex.qty||1)+qty),done:false,bc:row.code,bn:name})); }
  else write('items/'+id,{name,cat:cat||guess(name),qty,done:false,ts:Date.now(),bc:row.code,bn:name});
  write('prices/'+id,{name,p:pricesFromRow(row,(S.prices[id]&&S.prices[id].p)||{}),ex:false});
}
const storeLabel=sid=>{const x=S.stores.find(t=>t.id===sid);return x?x.name:sid};
function rowHTML(r,act,extra){
  const st=Object.entries(r.stores||{}).map(([sid,v])=>`${esc(storeLabel(sid))} ${(+v.p).toFixed(2)}`).join(' · ');
  return `<button type="button" class="prodrow" data-act="${act}" data-code="${esc(r.code)}" ${extra||''}><span class="pn">${esc(cleanName(r.name))}</span><span class="pm">${st||'אין מחיר'}</span><span class="pc">ברקוד ${esc(r.code)}</span></button>`;
}
let sgSeq=0;
function attachSuggest(input,listEl,onPick){   // הצעות מהקטלוג בזמן הקלדה
  if(!input||!listEl) return;
  let tm=null,rows=[];
  const run=async()=>{
    const fn=catSearchFn(); if(!fn) return;
    const q=parseItem(input.value)?parseItem(input.value).name:''; const my=++sgSeq;
    if(norm(q).length<2){listEl.innerHTML='';rows=[];return}
    try{ const r=await fn(q,6); if(my!==sgSeq) return; rows=r;
      listEl.innerHTML=r.length?`<div class="sghead">מהקטלוג, לחצו על המוצר שאתם מתכוונים אליו</div>`+r.map((x,i)=>rowHTML(x,'sgpick',`data-i="${i}"`)).join(''):''; }
    catch(e){ listEl.innerHTML=''; }
  };
  input.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(run,260)});
  listEl.addEventListener('click',e=>{ const b=e.target.closest('[data-act=sgpick]'); if(!b) return; e.stopPropagation();
    const row=rows[+b.dataset.i]; if(!row) return; const qty=parseItem(input.value)?parseItem(input.value).qty:1;
    onPick(row,qty); input.value=''; listEl.innerHTML=''; rows=[]; input.focus(); });
}
function pickDlg(initial,onPick){
  const fn=catSearchFn(); if(!fn) return toast('הקטלוג זמין רק באפליקציה המחוברת');
  dlg(`<h3>בחירת מוצר מהקטלוג</h3><span class="note">חפשו לפי שם או מותג (למשל "מוצרלה גד"), ולחצו על המוצר המדויק.</span>
   <input id="pkq" class="slim" type="search" placeholder="חיפוש מוצר" autocomplete="off" value="${esc(initial||'')}">
   <div id="pklist" class="prodlist"></div><div class="acts"><button class="btn ghost grow" data-act="dlgclose">סגור</button></div>`);
  const inp=$('#pkq'),list=$('#pklist'); let rows=[],tm=null,seq=0;
  const run=async()=>{
    const q=norm(inp.value),my=++seq;
    if(q.length<2){list.innerHTML='<div class="note" style="padding:8px 2px">כתבו לפחות שתי אותיות</div>';return}
    list.innerHTML='<div class="note" style="padding:8px 2px">מחפש…</div>';
    try{ const r=await fn(q,20); if(my!==seq) return; rows=r;
      list.innerHTML=r.length?r.map((x,i)=>rowHTML(x,'pkpick',`data-i="${i}"`)).join(''):'<div class="note" style="padding:8px 2px">לא נמצא. נסו מילה אחרת, או שהקטלוג עוד לא נטען.</div>'; }
    catch(e){ list.innerHTML='<div class="note" style="padding:8px 2px">הקטלוג עדיין לא זמין. הריצו את העדכון הלילי פעם אחת.</div>'; }
  };
  inp.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(run,260)});
  list.addEventListener('click',e=>{ const b=e.target.closest('[data-act=pkpick]'); if(!b) return; e.stopPropagation(); const row=rows[+b.dataset.i]; if(!row) return; dlgClose(); onPick(row); });
  inp.focus(); if(norm(initial||'').length>=2) run(); else run();
}

/* ---------- מה השתנה מאז הכניסה האחרונה (הסוכן, בן בית אחר) ---------- */
const K_KNOWN='knownItems';
function readKnown(){ try{return JSON.parse(ls.get(K_KNOWN)||'null')}catch(e){return null} }
function saveKnown(){ const m={}; for(const it of items()) m[it.id]=it.qty||1; ls.set(K_KNOWN,JSON.stringify(m)); }
function checkNew(){
  if(!(DB||window.__testNew)||!S.loaded) return;
  if($('#dlgroot').innerHTML||sheetOpen||S.dragging){ setTimeout(checkNew,4000); return; }
  const known=readKnown();
  if(!known){ saveKnown(); return; }
  const added=[],bumped=[];
  for(const it of items()){
    if(!(it.id in known)) added.push(it);
    else if((it.qty||1)>known[it.id]) bumped.push({it,from:known[it.id]});
  }
  if(!added.length&&!bumped.length){ saveKnown(); return; }
  const agent=added.filter(i=>i.by==='agent'),other=added.filter(i=>i.by!=='agent');
  const chips=a=>a.map(i=>`<span class="chip2">${esc(i.name)}${(i.qty||1)>1?' ×'+i.qty:''}</span>`).join('');
  dlg(`<h3>עודכן מאז הפעם האחרונה</h3>
   ${agent.length?`<div class="lbl">הסוכן הוסיף (${agent.length})</div><div class="chips">${chips(agent)}</div>`:''}
   ${other.length?`<div class="lbl">נוספו (${other.length})</div><div class="chips">${chips(other)}</div>`:''}
   ${bumped.length?`<div class="lbl">הכמות עלתה (${bumped.length})</div><div class="chips">${bumped.map(b=>`<span class="chip2">${esc(b.it.name)} ${b.from}←${b.it.qty||1}</span>`).join('')}</div>`:''}
   <div class="acts"><button class="btn grow" data-act="newok">הבנתי</button></div>`);
}
let armTimer=null;
function armCheck(){ clearTimeout(armTimer); armTimer=setTimeout(checkNew,2500); }
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){ if(S.loaded&&!$('#dlgroot').innerHTML) saveKnown(); }
  else { S.armUntil=Date.now()+8000; armCheck(); }
});
window.addEventListener('pagehide',()=>{ if(S.loaded&&!$('#dlgroot').innerHTML) saveKnown(); });

/* ---------- כפילויות: זיהוי והצעת מיזוג ---------- */
const STOP=new Set(['של','עם','בלי','ו','או','את','ל','ב','מוצר']);
const NUMTOK=/^[\d.,x*]+$|^(גרם|גר|קג|קילו|ליטר|מל|יח|יחידות|חבילה|חבילות|מארז|פחית|בקבוק|שקית)$/;
const SYN=[
 ['נייר מטבח','מגבות נייר','מגבת נייר','נייר סופג','מגבות מטבח'],
 ['נייר טואלט','נייר שירותים'],
 ['שקיות אשפה','שקיות זבל','שקיות לאשפה'],
 ['קפה נמס','נס קפה','נסקפה'],
 ['סבון כלים','נוזל כלים','נוזל לכלים'],
 ['מרכך כביסה','מרכך בגדים'],
 ['אבקת כביסה','אבקה לכביסה'],
 ['גמבה','פלפל גמבה','פלפל צבעוני'],
 ['קורנפלקס','קורנפלייקס'],
 ['חלב סויה','משקה סויה'],['חלב שקדים','משקה שקדים'],
 ['מלח שולחן','מלח'],['תפוח אדמה','תפוחי אדמה'],['עגבנייה','עגבניה'],
 ['נייר אפייה','נייר אפיה'],['צ\'יפס','ציפס']
];
function single(t,i,arr){   // יחיד/רבים, סמיכות ("גבינת" > "גבינ"), ה' בסוף
  if(t.length>4&&(t.endsWith('ימ')||t.endsWith('ות'))) return t.slice(0,-2);   // ים נכתב כאן 'ימ' כי stem מחליף אותיות סופיות
  if(t.length>3&&t.endsWith('ה')) return t.slice(0,-1);
  if(t.length>4&&t.endsWith('ת')&&i<arr.length-1) return t.slice(0,-1);
  return t;
}
function toks(name){ return stem(name).split(' ').filter(t=>t&&!STOP.has(t)&&!NUMTOK.test(t)).map(single); }
const SYNG=SYN.map(g=>g.map(x=>toks(x).join(' ')));
function synGroup(tk){ const j=tk.join(' '); for(let g=0;g<SYNG.length;g++) if(SYNG[g].includes(j)) return g; return -1; }   // השם כולו שווה לאחת הצורות
function lev1(a,b){ if(a===b) return true; if(Math.abs(a.length-b.length)>1) return false; let i=0; while(i<a.length&&i<b.length&&a[i]===b[i]) i++;
  if(a.length===b.length) return a.slice(i+1)===b.slice(i+1); return a.length>b.length?a.slice(i+1)===b.slice(i):b.slice(i+1)===a.slice(i); }
const pairKey=(a,b)=>[a,b].sort().join('|');
function relate(a,b){
  if(NOMERGE[pairKey(a.id,b.id)]) return null;
  const ta=toks(a.name),tb=toks(b.name); if(!ta.length||!tb.length) return null;
  const sa=new Set(ta),sb=new Set(tb);
  const inB=ta.every(t=>sb.has(t)),inA=tb.every(t=>sa.has(t));
  const generic=nm=>{const r=stem(nm).split(' ').filter(t=>t&&!STOP.has(t)&&!NUMTOK.test(t));return r.length===1&&guess(r[0])!=='other';};   // "חלב", "גבינה" לבדם הם כלליים מדי
  if(inA&&inB) return {conf:3,reason:'אותו מוצר בכתיב שונה'};
  const g1=synGroup(ta),g2=synGroup(tb); if(g1>=0&&g1===g2) return {conf:3,reason:'מילים נרדפות'};
  if(inB&&!generic(a.name)&&ta.some(t=>t.length>=3)) return {conf:2,reason:`"${a.name}" מופיע בתוך "${b.name}"`};
  if(inA&&!generic(b.name)&&tb.some(t=>t.length>=3)) return {conf:2,reason:`"${b.name}" מופיע בתוך "${a.name}"`};
  const ja=ta.join(' '),jb=tb.join(' ');
  if(!/[\d%]/.test(ja+jb)&&ja.length>=5&&jb.length>=5&&lev1(ja,jb)) return {conf:1,reason:'כתיב דומה'};
  return null;
}
S.flip={};
S.edit=false;S.dragging=false;S.pendingRender=false;S.order=[];try{S.order=JSON.parse(ls.get('tileOrder')||'[]')}catch(e){}
function suggestions(){
  const all=items(),out=[];
  for(let i=0;i<all.length;i++) for(let j=i+1;j<all.length;j++){
    const a=all[i],b=all[j],r=relate(a,b); if(!r) continue;
    const key=pairKey(a.id,b.id);
    let keep=toks(a.name).length>=toks(b.name).length&&a.name.length>=b.name.length?a:b, drop=keep===a?b:a;   // נשאר השם המפורט יותר
    if(S.flip[key]) [keep,drop]=[drop,keep];
    out.push({key,keep,drop,...r});
  }
  return out.sort((x,y)=>y.conf-x.conf);
}
function mergeItems(keepId,dropId){
  const k=S.items[keepId],d=S.items[dropId]; if(!k||!d||keepId===dropId) return;
  write('items/'+keepId,itemDoc(k,{qty:Math.min(99,Math.max(k.qty||1,d.qty||1)),done:!!(k.done&&d.done)}));
  write('items/'+dropId,null);
  const pk=S.prices[keepId],pd=S.prices[dropId];
  if(pd){ write('prices/'+keepId,{name:k.name,p:{...(pd.p||{}),...((pk&&pk.p)||{})},ex:false}); write('prices/'+dropId,null); }
  ALIAS={...ALIAS,[stem(d.name)]:{id:keepId,name:k.name}}; write('config/aliases',{map:ALIAS});
}
function dismissPair(key){ NOMERGE={...NOMERGE,[key]:1}; write('config/nomerge',{map:NOMERGE}); }
function sugBanner(){ const n=suggestions().length; return n?`<button class="banner" data-act="opensug"><b>${n}</b> ${n===1?'כפילות אפשרית':'כפילויות אפשריות'}, לבדיקה</button>`:''; }
function sugSheetHTML(){
  const sg=suggestions();
  const head=`<div class="shead"><div style="flex:1;min-width:0"><h3>כפילויות אפשריות</h3><span class="note">מיזוג משאיר שם אחד, לוקח את הכמות הגדולה ומשמר מחירים</span></div><button class="btn ghost small" data-act="closesheet">סגור</button></div>`;
  if(!sg.length) return head+'<div class="empty" style="border:0">אין כפילויות חשודות</div>';
  return head+sg.map(x=>`<div class="panel" style="margin:0"><div><b>${esc(x.drop.name)}</b> ${x.drop.qty>1?`<span class="qty">×${x.drop.qty}</span>`:''} <span class="note">יתמזג לתוך</span> <b>${esc(x.keep.name)}</b> ${x.keep.qty>1?`<span class="qty">×${x.keep.qty}</span>`:''}</div>
    <div class="tags"><span class="tag ${x.conf>=3?'':'warn'}">${esc(x.reason)}</span></div>
    <div class="acts"><button class="btn small" data-act="mergesug" data-a="${x.keep.id}" data-b="${x.drop.id}">מזג</button><button class="btn ghost small" data-act="flipsug" data-key="${x.key}">החלף כיוון</button><button class="btn ghost small" data-act="nomergesug" data-key="${x.key}">אלה שונים</button></div></div>`).join('');
}
function sorted(list){return list.slice().sort((a,b)=>(a.done-b.done)||((a.ts||0)-(b.ts||0))||a.name.localeCompare(b.name,'he'))}
function groups(filter,includeEmpty){
  const g={}; for(const it of items()){ if(filter&&!filter(it)) continue; (g[it.cat in BYID?it.cat:'other']??=[]).push(it); }
  const rank=id=>{const i=S.order.indexOf(id);return i>=0?i:1000+CATS.findIndex(c=>c.id===id)};   // סדר אישי של האריחים, ברירת מחדל: הסדר הקבוע
  return CATS.filter(c=>g[c.id]||(includeEmpty&&c.custom)).sort((a,b)=>rank(a.id)-rank(b.id)).map(c=>({cat:c,list:sorted(g[c.id]||[])}));
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
  const n=mode==='shop'?left:list.length;
  return `<button class="tile ${mode==='shop'&&complete?'complete':''}" style="--c:${cat.c}" data-act="opencat" data-id="${cat.id}" data-mode="${mode}">
   <div class="top">${icon(cat.id)}${mode==='shop'&&complete?'<span class="donebadge">✓</span>':`<span class="big">${n}</span>`}</div>
   <div class="nm">${esc(cat.name)}</div>
   <div class="tbar"><i style="width:${list.length?Math.round(done/list.length*100):0}%"></i></div></button>`;
}
const editBar=()=>S.edit?'<div class="editbar"><span>גררו אריח כדי לסדר מחדש</span><button class="btn small" data-act="editdone">סיום</button></div>':'';

/* ---------- תצוגה: אריחים או רשימה אחת ---------- */
S.view=(ls.get('listView')==='list')?'list':'tiles';
const viewSeg=()=>`<div class="seg" role="group" aria-label="תצוגה"><button aria-pressed="${S.view==='tiles'}" data-act="setview" data-id="tiles">אריחים</button><button aria-pressed="${S.view==='list'}" data-act="setview" data-id="list">רשימה</button></div>`;
function flatList(gs,mode,sid){
  return `<div class="flat">${gs.map(({cat,list})=>{
    const rows=list.filter(i=>!(mode==='shop'&&S.hideDone&&i.done)).map(i=>itemRow(i,mode,sid)).join('');
    if(!rows&&!(mode==='list'&&cat.custom)) return '';
    const left=list.filter(i=>!i.done).length;
    return `<div class="fh" style="--c:${cat.c}"><span class="dot"></span><span>${esc(cat.name)}</span><span class="fn">${mode==='shop'?left+'/'+list.length:list.length}</span><button class="plusbtn" data-act="addcat" data-cat="${cat.id}" aria-label="הוסף מוצר לקטגוריה">+</button></div><div class="rows">${rows}</div>`}).join('')}</div>`;
}
function viewList(){
  const gs=groups(null,true); if(!gs.length) return emptyState();
  const addCat=`<button class="addtile" data-act="newcat"><span class="plus">+</span><span>קטגוריה חדשה</span></button>`;
  return hero()+sugBanner()+viewSeg()+(S.view==='list'?flatList(gs,'list','all')+`<div class="acts" style="margin-top:14px"><button class="btn ghost" data-act="newcat">+ קטגוריה חדשה</button></div>`:editBar()+`<div class="tiles${S.edit?' editing':''}">${gs.map(g=>tile(g,'list')).join('')}${S.edit?'':addCat}</div>`);
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
  ${viewSeg()}
  ${gs.length?(S.view==='list'?flatList(gs,'shop',sid):editBar()+`<div class="tiles${S.edit?' editing':''}">${gs.map(g=>tile(g,'shop',sid)).join('')}</div>`):`<div class="empty"><b>הכול נלקח</b><span>אפשר לגשת לקופה.</span></div>`}`;
}
const SW_L=88,SW_R=156;   // רוחב כפתור המחיקה ורוחב שלושת כפתורי הכמות
function itemRow(i,mode,sid){
  let inner;
  if(mode==='shop'){const u=sid!=='all'?unit(S.prices[i.id],sid):null;
    inner=`<button class="row ${i.done?'done':''}" data-act="toggle" data-id="${i.id}" aria-pressed="${!!i.done}"><span class="chk"></span><span class="tx"><span class="nm">${esc(i.name)}</span>${u&&u.note&&!i.done?`<span class="sub">${esc(u.note)}</span>`:''}</span>${i.qty>1?`<span class="qty">×${i.qty}</span>`:''}${u?`<span class="pr ${u.promo?'promo':''}">${fmt(u.v)}</span>`:''}</button>`;
  } else inner=`<button class="row ${i.done?'done':''}" data-act="edit" data-id="${i.id}"><span class="tx"><span class="nm">${esc(i.name)}</span></span>${i.qty>1?`<span class="qty">×${i.qty}</span>`:''}</button>`;
  const q=i.qty||1,open=S.sw&&S.sw.id===i.id?S.sw.side:'';
  const off=open==='r'?-SW_R:open==='l'?SW_L:0;
  inner=inner.replace('<button class="row',`<button style="transform:translateX(${off}px)" class="row`);
  return `<div class="sw" data-sw="${i.id}"><div class="sw-l"><button data-act="del" data-id="${i.id}" aria-label="מחק"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v7M14 10v7"/></svg></button></div><div class="sw-r"><button class="qb" data-act="qminus" data-id="${i.id}" aria-label="הפחת כמות">−</button><span class="qn">${q}</span><button class="qb" data-act="qplus" data-id="${i.id}" aria-label="הוסף כמות">+</button></div>${inner}</div>`;
}
function catSheetHTML(){
  const {id,mode}=S.cat; const cat=BYID[id]; const list=sorted(items().filter(i=>(i.cat in BYID?i.cat:'other')===id));
  const sid=S.shopStore!=='all'&&S.stores.some(s=>s.id===S.shopStore)?S.shopStore:'all';
  const left=list.filter(i=>!i.done).length;
  const rows=list.filter(i=>!(mode==='shop'&&S.hideDone&&i.done)).map(i=>itemRow(i,mode,sid)).join('');
  return `<div class="shead" style="--c:${cat.c}">${icon(cat.id)}<div style="flex:1;min-width:0"><h3>${esc(cat.name)}</h3><span class="note">${mode==='shop'?`${left} נשארו מתוך ${list.length}`:`${list.length} מוצרים`}</span></div><button class="plusbtn" data-act="addcat" data-cat="${cat.id}" aria-label="הוסף מוצר לקטגוריה">+</button><button class="btn ghost small" data-act="closesheet">סגור</button></div>
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
  <div class="tiles" style="margin-bottom:14px">${stores.map(s=>`<div class="stile ${s===best?'best':''}"><span class="nm">${esc(s.st.name)}</span><span class="t">${s.total?`<bdi>${s.total.toFixed(2)}</bdi><small>₪</small>`:'—'}</span>
    <div class="tags">${s===best?'<span class="tag">הכי זול</span>':''}${s.promos?`<span class="tag promo">${s.promos} במבצע</span>`:''}${s.missing?`<span class="tag warn">חסר מחיר ל-${s.missing}</span>`:''}${s.st.auto===false&&!s.total?'<span class="tag warn">הזנה ידנית</span>':''}</div></div>`).join('')}</div>
  ${splitSave>0.5?`<div class="panel"><h3>קנייה מפוצלת בין הסופרים: ${fmt(split.total)} <span class="tag">חוסכת עוד ${fmt(splitSave)}</span></h3>
    <span class="note">שווה רק אם לא מפריע לכם לעבור בין כמה חנויות.</span>
    ${S.stores.filter(s=>split.by[s.id]).map(s=>`<div><b>${esc(s.name)}</b><ul>${split.by[s.id].map(x=>`<li>${esc(x.it.name)}${x.it.qty>1?' ×'+x.it.qty:''} · ${fmt(x.u.v)}${x.u.promo?' (מבצע)':''}</li>`).join('')}</ul></div>`).join('')}</div>`:''}
  ${table(list)}`;
}
function table(list){
  const rows=sorted(list).map(it=>{const us=S.stores.map(s=>unit(S.prices[it.id],s.id));const vals=us.filter(Boolean).map(u=>u.v);const mn=vals.length?Math.min(...vals):null;
    return `<tr data-act="edit" data-id="${it.id}"><td>${esc(it.name)}${it.qty>1?` <span class="qty">×${it.qty}</span>`:''}</td>${us.map(u=>u?`<td class="${u.v===mn&&vals.length>1?'best':''}">${u.promo?`<span class="p">${u.v.toFixed(2)}</span>`:u.v.toFixed(2)}</td>`:'<td style="color:var(--muted)">—</td>').join('')}</tr>`}).join('');
  return `<h2 class="sec">מחיר ליחידה לפי סופר (₪)</h2><div class="tbl-wrap"><table><thead><tr><th>מוצר</th>${S.stores.map(s=>`<th>${esc(s.name)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
  <p class="note">מחיר בכתום הוא מחיר מבצע, בירוק הזול ביותר בשורה. מבצעי כמות (למשל 3 ב-10) מחושבים כמחיר ליחידה כשקונים את הכמות המלאה. לחצו על שורה כדי לראות את המוצר שנבחר ולעדכן.</p>`;
}
function viewMore(){
  return `<div style="max-width:640px">
  <section class="panel" style="margin-top:0"><h2>גרסת האפליקציה</h2><span class="note">אם משהו שהתעדכן לא מופיע אצלכם, לחצו כדי לטעון גרסה חדשה.</span><span class="note" id="appver"></span><div class="acts"><button class="btn ghost" data-act="hardreload">טען גרסה חדשה</button></div></section>
  <section class="panel"><h2>עדכון מחירים</h2><span class="note">המחירים והמבצעים נמשכים מדי לילה מקבצי שקיפות המחירים של הרשתות, לסניפים שהגדרתם. ${S.sync&&S.sync.lastRun?'עודכן '+ago(S.sync.lastRun)+'.':''} ${S.sync&&S.sync.status&&S.sync.status!=='ok'?'<br>הודעה אחרונה: '+esc(S.sync.status):''}</span>
   <div class="acts"><button class="btn" data-act="refresh" ${DB?'':'disabled'}>רענן עכשיו</button></div></section>
  <section class="panel"><h2>ייבוא מווטסאפ</h2><span class="note">הדביקו את הרשימה מהקבוצה, או העלו קובץ ייצוא של השיחה. המערכת מסננת הודעות מערכת, מזהה כמויות ומסווגת לקטגוריות.</span><div class="acts"><button class="btn" data-act="import">פתח ייבוא</button></div></section>
  <section class="panel"><h2>הקטגוריות שלי</h2>${CUSTOM.length?'<div class="stack">'+CUSTOM.map(c=>`<button class="catrow" style="--c:${c.c}" data-act="editcat" data-id="${c.id}">${icon(c.id)}<span>${esc(c.name)}</span></button>`).join('')+'</div>':'<span class="note">עוד לא הוספתם קטגוריות. הקטגוריות המובנות נשארות כמו שהן.</span>'}
   <div class="acts"><button class="btn ghost" data-act="newcat">+ קטגוריה חדשה</button></div></section>
  <section class="panel"><h2>הסופרים שלכם</h2><div class="stack">
    ${S.stores.map(s=>`<div class="storerow"><input data-store="${s.id}" value="${esc(s.name)}" aria-label="שם סופר">${s.auto?'<span class="tag">מחירים אוטומטיים</span>':'<span class="tag warn">ידני</span>'}<button class="btn danger small" data-act="delstore" data-id="${s.id}">מחק</button></div>`).join('')}
    <div class="storerow" style="border:0"><input id="newstore" placeholder="סופר חדש" aria-label="סופר חדש"><button class="btn small" data-act="addstore">הוסף</button></div></div></section>
  <section class="panel"><h2>ניקוי</h2><div class="acts">
    <button class="btn ghost" data-act="editstart">סידור הקטגוריות</button>
    <button class="btn ghost" data-act="resetorder">אפס סדר</button>
    <button class="btn ghost" data-act="recat">סווג מחדש את "אחר"</button>
    <button class="btn ghost" data-act="cleardone">הסר מוצרים שנלקחו</button>
    <button class="btn danger" data-act="clearall">מחק את כל הרשימה</button></div>
    <span class="note">מחירים שנשמרו נשארים גם אחרי מחיקת מוצר.</span></section></div>`;
}
function render(){
  if(S.dragging){S.pendingRender=true;return}
  updateChrome();
  const v=$('#view'); const f={list:viewList,shop:viewShop,compare:viewCompare,more:viewMore}[S.tab]||viewList;
  const keep=document.activeElement&&document.activeElement.id==='newstore'?$('#newstore').value:null;
  v.innerHTML=f(); if(S.tab==='more'&&window.caches){caches.keys().then(k=>{const e=$('#appver');if(e)e.textContent='גרסה: '+(k.sort().pop()||'—')}).catch(()=>{})}
  if(keep!==null&&$('#newstore'))$('#newstore').value=keep;
  if(S.cat&&sheetOpen){const sh=$('#sheetroot .sheet');if(sh){const t=sh.scrollTop;sh.innerHTML=catSheetHTML();sh.scrollTop=t}}
  if(S.sug&&sheetOpen){const sh=$('#sheetroot .sheet');if(sh){const t=sh.scrollTop;sh.innerHTML=sugSheetHTML();sh.scrollTop=t}}
}

/* ---------- sheets ---------- */
let sheetOpen=false;
function openSheet(html,cls=''){ $('#sheetroot').innerHTML=`<div class="scrim" data-act="closesheet"><div class="sheet ${cls}" role="dialog" aria-modal="true"><div class="grab" aria-hidden="true"></div>${html}</div></div>`; sheetOpen=true; }
function closeSheet(){ const b=S.back; S.back=null; S.cat=null; S.sug=false; $('#sheetroot').innerHTML=''; sheetOpen=false; if(b){S.cat=b; openSheet(catSheetHTML());} }
function openCat(id,mode){ S.cat={id,mode}; openSheet(catSheetHTML()); }
function editSheet(id){
  const it=S.items[id]; if(!it) return; const pr=S.prices[id]||{p:{}};
  if(S.cat){S.back=S.cat;S.cat=null}
  openSheet(`<div class="ehead"><h3>${esc(it.name)}</h3><div class="stepper sm"><button type="button" data-act="qty" data-d="-1" aria-label="פחות">−</button><output id="qv">${it.qty||1}</output><button type="button" data-act="qty" data-d="1" aria-label="יותר">+</button></div></div>
  ${catSearchFn()?`<div class="prodbar"><span class="note" id="prodline">${it.bc?'מוצר נבחר: '+esc(it.bn||it.bc):'התאמה אוטומטית לפי שם'}</span><button class="btn ghost small" data-act="pickprod" data-id="${id}">בחר מוצר</button><button class="btn ghost small" id="clearprod" data-act="clearprod" data-id="${id}" ${it.bc?'':'hidden'}>בטל</button></div>`:''}
  <select id="ecat" class="slim" aria-label="קטגוריה" data-prev="${it.cat}">${CATS.map(c=>`<option value="${c.id}" ${c.id===it.cat?'selected':''}>${esc(c.name)}</option>`).join('')}<option value="__new__">+ קטגוריה חדשה…</option></select>
  <div class="pcols"><span>מחירים לפי סופר, ליחידה (₪)</span><span>רגיל</span><span>מבצע</span></div>
  ${S.stores.map(s=>{const x=(pr.p||{})[s.id]||{};const auto=x.src==='auto'&&x.pname;
    return `<div class="prow ${(+x.sale>0||x.note)?'shownote':''}" data-sid="${s.id}"><b class="sn">${esc(s.name)}</b>
    <input inputmode="decimal" data-f="price" value="${x.price||''}" placeholder="0.00" aria-label="מחיר רגיל ${esc(s.name)}">
    <input inputmode="decimal" data-f="sale" value="${x.sale||''}" placeholder="0.00" aria-label="מחיר מבצע ${esc(s.name)}">
    ${auto?`<div class="psub">מהאתר: ${esc(x.pname)}</div>`:(x.src==='manual'?'<div class="psub">הוזן ידנית</div>':'')}
    <input class="pnote" data-f="note" value="${esc(x.note||'')}" placeholder="פרטי המבצע, למשל 2 ב-10" aria-label="פרטי מבצע ${esc(s.name)}"></div>`}).join('')}
  <div class="acts"><button class="btn grow" data-act="saveitem" data-id="${id}">שמור</button><button class="btn ghost" data-act="closesheet">ביטול</button><button class="btn danger" data-act="delitem" data-id="${id}">מחק</button></div>`,'edit');
}
function saveItem(id){
  const it=S.items[id]; if(!it) return;
  const qty=Math.max(1,+$('#qv').textContent||1),cat=$('#ecat').value;
  const old=(S.prices[id]&&S.prices[id].p)||{},p={};
  document.querySelectorAll('#sheetroot .prow').forEach(b=>{const sid=b.dataset.sid,g=f=>b.querySelector(`[data-f=${f}]`).value.trim().replace(',','.');
    const price=parseFloat(g('price'))||0,sale=parseFloat(g('sale'))||0,note=g('note'),o=old[sid];
    if(!price&&!sale) return;
    if(o&&(+o.price||0)===price&&(+o.sale||0)===sale&&(o.note||'')===note) p[sid]=o; else p[sid]={price,sale,note,src:'manual'};});
  write('items/'+id,itemDoc(it,{qty,cat}));
  if(cat!==it.cat) learnCat(it.name,cat);
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
let tt; function toast(m,undo){const t=$('#toast');t.innerHTML=`<span>${esc(m)}${undo?' <button class="undo">ביטול</button>':''}</span>`;
  if(undo){const b=t.querySelector('.undo');b.onclick=()=>{undo();t.innerHTML='';clearTimeout(tt)}}
  clearTimeout(tt);tt=setTimeout(()=>t.innerHTML='',undo?5000:2600)}

/* ---------- events ---------- */
let armed=null;
document.addEventListener('click',e=>{
  const tb=e.target.closest('nav.tabs [data-tab]'); if(tb){setTab(tb.dataset.tab);return}
  const el=e.target.closest('[data-act]'); if(!el) return;
  const act=el.dataset.act,id=el.dataset.id;
  switch(act){
    case 'closesheet': if(!el.classList.contains('scrim')||e.target===el) closeSheet(); break;
    case 'hardreload': (async()=>{try{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()));const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}catch(e){} location.reload()})(); break;
    case 'del': deleteItem(id); break;
    case 'qplus':{const it=S.items[id]; if(it){S.sw={id,side:'r'}; write('items/'+id,itemDoc(it,{qty:Math.min(99,(it.qty||1)+1)}))} break}
    case 'qminus':{const it=S.items[id]; if(!it) break;
      if((it.qty||1)>1){S.sw={id,side:'r'}; write('items/'+id,itemDoc(it,{qty:(it.qty||1)-1}))}
      else askConfirm(`האם ברצונך להסיר את המוצר "${it.name}" מהרשימה?`,'הסר',()=>deleteItem(id));
      break}
    case 'dlgok':{const f=S.confirmFn; S.confirmFn=null; dlgClose(); if(f) f(); break}
    case 'dlgclose': if(!el.classList.contains('scrim')||e.target===el){S.confirmFn=null;S.addCat=null;S.catForm=null;dlgClose()} break;
    case 'addcat': addDlg(el.dataset.cat); break;
    case 'newok': dlgClose(); saveKnown(); break;
    case 'pickprod': {const it=S.items[id]; if(it) pickDlg(norm(it.name).split(' ')[0],row=>{ bindProduct(id,row); const l=$('#prodline'); if(l) l.textContent='מוצר נבחר: '+cleanName(row.name); const c=$('#clearprod'); if(c) c.hidden=false; toast('המוצר נבחר, המחירים עודכנו'); }); break}
    case 'clearprod': {const it=S.items[id]; if(it){ const d=itemDoc(it,{}); delete d.bc; delete d.bn; write('items/'+id,d); const l=$('#prodline'); if(l) l.textContent='התאמה אוטומטית לפי שם'; const c=$('#clearprod'); if(c) c.hidden=true; toast('חזרנו להתאמה לפי שם')} break}
    case 'newcat': catDlg(null,nid=>{ if(S.tab==='list') addDlg(nid); }); break;
    case 'editcat': catDlg(id,null); break;
    case 'pickcolor': if(S.catForm){S.catForm.c=el.dataset.v; paintCatForm()} break;
    case 'pickicon': if(S.catForm){S.catForm.ic=el.dataset.v; paintCatForm()} break;
    case 'savecat': saveCat(); break;
    case 'delcat': delCat(); break;
    case 'setview': S.view=id; S.edit=false; ls.set('listView',id); render(); break;
    case 'opencat': if(!S.edit) openCat(id,el.dataset.mode); break;
    case 'editdone': S.edit=false; render(); break;
    case 'editstart': S.tab='list'; if(location.hash!=='#list') location.hash='list'; S.edit=true; render(); window.scrollTo(0,0); break;
    case 'resetorder': S.order=[]; ls.set('tileOrder','[]'); render(); toast('הסדר חזר לברירת המחדל'); break;
    case 'edit': editSheet(id); break;
    case 'opensug': S.sug=true; openSheet(sugSheetHTML()); break;
    case 'mergesug': mergeItems(el.dataset.a,el.dataset.b); toast('מוזג'); break;
    case 'flipsug': S.flip[el.dataset.key]=!S.flip[el.dataset.key]; render(); break;
    case 'nomergesug': dismissPair(el.dataset.key); toast('לא אציע שוב'); break;
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
    case 'recat': {let n=0; for(const it of items()){ if(it.cat==='other'){const c=guess(it.name); if(c!=='other'){write('items/'+it.id,itemDoc(it,{cat:c}));n++}}} toast(n?`סווגו מחדש ${n} מוצרים`:'לא נמצאו התאמות חדשות'); break}
    case 'cleardone': {const d=items().filter(i=>i.done); d.forEach(i=>write('items/'+i.id,null)); toast(d.length?`הוסרו ${d.length} מוצרים`:'אין מוצרים שנלקחו'); break}
    case 'clearall': if(armed==='all'){armed=null; items().forEach(i=>write('items/'+i.id,null)); toast('הרשימה נוקתה')} else {armed='all'; el.textContent='לחצו שוב לאישור'; setTimeout(()=>{if(armed==='all'){armed=null;render()}},3000)} break;
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.store){const v=norm(t.value); if(v) saveStores(S.stores.map(s=>s.id===t.dataset.store?{...s,name:v}:s)); else render();}
  if(t.dataset&&t.dataset.i!==undefined){IMP[+t.dataset.i].on=t.checked; impRender()}
  if(t.dataset&&t.dataset.ci!==undefined){IMP[+t.dataset.ci].cat=t.value}
  if(t.id==='ecat'){
    if(t.value==='__new__'){ t.value=t.dataset.prev||'other';
      catDlg(null,id=>{const sel=$('#ecat'); if(!sel) return; const o=document.createElement('option'); o.value=id; o.textContent=BYID[id].name;
        sel.insertBefore(o,sel.querySelector('option[value="other"]')); sel.value=id; sel.dataset.prev=id;});
    } else t.dataset.prev=t.value;
  }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if($('#dlgroot').innerHTML){S.confirmFn=null;S.addCat=null;S.catForm=null;dlgClose();return} if(sheetOpen) closeSheet(); } if(e.key==='Enter'&&e.target.id==='newstore') document.querySelector('[data-act=addstore]').click(); });
attachSuggest($('#addin'),$('#sugs'),(row,qty)=>{ addCatalogItem(row,qty); toast('נוסף: '+cleanName(row.name)); });
$('#addform').addEventListener('submit',e=>{ $('#sugs').innerHTML='';e.preventDefault(); const inp=$('#addin'); const rows=splitText(inp.value.replace(/\n/g,', ')); if(!rows.length) return; rows.forEach(r=>addItem(r.name,r.qty)); inp.value=''; toast(rows.length>1?`נוספו ${rows.length} מוצרים`:'נוסף'); inp.focus()});


/* ---------- קטגוריות משלי ---------- */
const PALETTE=['#2e9e55','#3d86d6','#d04a3f','#e08414','#8a63c9','#1fa39a','#c9459a','#a35a35','#c4811a','#7a8b84'];
function catDlg(editId,cb){
  const ex=editId&&BYID[editId]&&BYID[editId].custom?BYID[editId]:null;
  S.catForm={id:ex?ex.id:null,c:ex?ex.c:PALETTE[CUSTOM.length%PALETTE.length],ic:ex?ex.ic:'other',cb};
  dlg(`<h3>${ex?'עריכת קטגוריה':'קטגוריה חדשה'}</h3>
   <div class="field"><label for="cname">שם</label><input id="cname" maxlength="24" value="${esc(ex?ex.name:'')}" placeholder="למשל: תינוקות" autocomplete="off"></div>
   <div class="lbl">צבע</div><div class="swatches" id="cswatches">${PALETTE.map(c=>`<button type="button" class="swc" data-act="pickcolor" data-v="${c}" style="--c:${c}" aria-label="צבע"></button>`).join('')}</div>
   <div class="lbl">אייקון</div><div class="iconpick" id="cicons">${Object.keys(IC).map(k=>`<button type="button" data-act="pickicon" data-v="${k}" aria-label="אייקון"><svg viewBox="0 0 24 24"><path d="${IC[k]}"/></svg></button>`).join('')}</div>
   <div class="acts"><button class="btn grow" data-act="savecat">${ex?'שמור':'צור'}</button><button class="btn ghost" data-act="dlgclose">ביטול</button>${ex?'<button class="btn danger" data-act="delcat">מחק</button>':''}</div>`);
  paintCatForm(); const n=$('#cname'); if(n&&!ex) n.focus();
}
function paintCatForm(){
  const f=S.catForm; if(!f) return;
  document.querySelectorAll('#cswatches [data-v]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===f.c)));
  document.querySelectorAll('#cicons [data-v]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===f.ic)));
  const ic=$('#cicons'); if(ic) ic.style.setProperty('--c',f.c);
}
function saveCat(){
  const f=S.catForm; if(!f) return; const name=norm($('#cname').value);
  if(!name) return toast('כתבו שם לקטגוריה');
  if(CATS.some(c=>c.name===name&&c.id!==f.id)) return toast('כבר יש קטגוריה בשם הזה');
  const list=CUSTOM.map(c=>({id:c.id,name:c.name,c:c.c,ic:c.ic}));
  let id=f.id;
  if(id){const i=list.findIndex(c=>c.id===id); if(i>=0) list[i]={id,name,c:f.c,ic:f.ic};}
  else{ id='u'+Date.now().toString(36); list.push({id,name,c:f.c,ic:f.ic}); }
  setCustomCats(list); write('config/categories',{list});
  const cb=f.cb; S.catForm=null; dlgClose(); render(); toast(f.id?'נשמר':'הקטגוריה נוספה'); if(cb) cb(id);
}
function delCat(){
  const f=S.catForm; if(!f||!f.id) return; const id=f.id,c=BYID[id]; if(!c) return;
  const n=items().filter(i=>i.cat===id).length;
  askConfirm(`למחוק את הקטגוריה "${c.name}"?${n?` ${n} מוצרים יעברו ל"אחר".`:''}`,'מחק',()=>{
    items().filter(i=>i.cat===id).forEach(i=>write('items/'+i.id,itemDoc(i,{cat:'other'})));
    const list=CUSTOM.filter(x=>x.id!==id).map(x=>({id:x.id,name:x.name,c:x.c,ic:x.ic}));
    setCustomCats(list); write('config/categories',{list}); S.catForm=null; render(); toast('הקטגוריה נמחקה');
  });
}

/* ---------- מחיקה, חלונות אישור והוספה לקטגוריה ---------- */
function deleteItem(id){
  const it=S.items[id]; if(!it) return; S.sw=null;
  const snap=itemDoc(it,{});
  write('items/'+id,null); toast(`"${it.name}" נמחק`,()=>write('items/'+id,snap));
}
function dlg(html){ $('#dlgroot').innerHTML=`<div class="scrim dlg" data-act="dlgclose"><div class="sheet dlgbox" role="dialog" aria-modal="true">${html}</div></div>`; }
function dlgClose(){ $('#dlgroot').innerHTML=''; }
function askConfirm(text,okLabel,onOk){
  S.confirmFn=onOk;
  dlg(`<h3 style="font-size:1.05rem;line-height:1.35">${esc(text)}</h3><div class="acts"><button class="btn danger-solid grow" data-act="dlgok">${esc(okLabel)}</button><button class="btn ghost grow" data-act="dlgclose">ביטול</button></div>`);
}
function addDlg(catId){
  const cat=BYID[catId]; if(!cat) return; S.addCat=catId;
  dlg(`<div class="shead" style="--c:${cat.c}">${icon(catId)}<div style="flex:1;min-width:0"><h3>הוספה ל${esc(cat.name)}</h3><span class="note">אפשר לכתוב כמות, למשל 2 חלב</span></div></div>
   <form id="addcatform" class="addbar" style="margin:0"><input id="addcatin" type="text" placeholder="שם המוצר" autocomplete="off" enterkeyhint="done"><button class="btn" type="submit">הוסף</button></form>
   <div id="addcatsugs" class="prodlist sgs"></div>
   <div class="acts"><button class="btn ghost grow" data-act="dlgclose">סיום</button></div>`);
  const inp=$('#addcatin'); if(inp){ attachSuggest(inp,$('#addcatsugs'),(row,qty)=>{ addCatalogItem(row,qty,catId); toast('נוסף: '+cleanName(row.name)); }); inp.focus(); }
}
document.addEventListener('submit',e=>{
  if(!e.target||e.target.id!=='addcatform') return; e.preventDefault();
  const inp=$('#addcatin'),cid=S.addCat; const rows=splitText(inp.value.replace(/\n/g,', ')); if(!rows.length||!cid) return;
  rows.forEach(r=>{ addItem(r.name,r.qty,cid); if(guess(r.name)!==cid) learnCat(r.name,cid); });   // בחירה ידנית של קטגוריה נלמדת
  inp.value=''; toast(rows.length>1?`נוספו ${rows.length} מוצרים`:'נוסף'); inp.focus();
});

/* ---------- חלון: ידית וגרירה למטה לסגירה, והצגת פרטי מבצע כשיש מחיר מבצע ---------- */
let gb=null;
document.addEventListener('pointerdown',e=>{
  const g=e.target.closest&&e.target.closest('.grab'); if(!g) return;
  const sh=g.closest('.sheet'); gb={sh,y0:e.clientY,t0:performance.now(),dy:0}; sh.style.transition='none';
  try{g.setPointerCapture(e.pointerId)}catch(_){}
});
document.addEventListener('pointermove',e=>{ if(!gb) return; gb.dy=Math.max(0,e.clientY-gb.y0); gb.sh.style.transform=`translateY(${gb.dy}px)`; });
function gbEnd(){
  if(!gb) return; const {sh,dy,t0}=gb; gb=null; const v=dy/Math.max(1,performance.now()-t0);
  sh.style.transition='transform .22s ease';
  if(dy>90||(v>.6&&dy>30)){ sh.style.transform='translateY(100%)'; setTimeout(closeSheet,180); } else sh.style.transform='';
}
document.addEventListener('pointerup',gbEnd); document.addEventListener('pointercancel',gbEnd);
document.addEventListener('input',e=>{ const t=e.target; if(t&&t.dataset&&t.dataset.f==='sale'){ const r=t.closest('.prow'); if(r) r.classList.toggle('shownote',!!t.value.trim()); } });

/* ---------- החלקה על פריט: ימינה = מחיקה, שמאלה = כמות (כמו באייפון) ---------- */
let swp=null;
S.sw=null; S.noClickUntil=0;
function swClose(){ if(S.sw){S.sw=null; render();} }
document.addEventListener('pointerdown',e=>{
  const row=e.target.closest&&e.target.closest('.sw > .row');
  if(!row){ if(S.sw&&!(e.target.closest&&e.target.closest('.sw-l,.sw-r'))) swClose(); return; }
  if(S.edit) return;
  const wrap=row.parentElement,id=wrap.dataset.sw;
  if(S.sw&&S.sw.id!==id) swClose();
  const cur=S.sw&&S.sw.id===id?(S.sw.side==='r'?-SW_R:SW_L):0;
  swp={row,wrap,id,x0:e.clientX,y0:e.clientY,cur,off:cur,moved:false};
});
document.addEventListener('pointermove',e=>{
  if(!swp) return;
  const dx=e.clientX-swp.x0,dy=e.clientY-swp.y0;
  if(!swp.moved){
    if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){swp=null;return}      // גלילה אנכית
    if(Math.abs(dx)<8) return;
    swp.moved=true; S.dragging=true; swp.samples=[]; try{swp.row.setPointerCapture(e.pointerId)}catch(_){}
    swp.row.style.transition='none';
  }
  const raw=swp.cur+dx;                                                   // "גומי": התנגדות מעבר לקצה, כמו באייפון
  swp.off=raw>SW_L?SW_L+(raw-SW_L)*.35:raw<-SW_R?-SW_R+(raw+SW_R)*.35:raw;
  swp.row.style.transform=`translateX(${swp.off}px)`;
  const now=performance.now(); swp.samples.push([now,swp.off]); while(swp.samples.length>2&&now-swp.samples[0][0]>100) swp.samples.shift();
});
function swEnd(){
  if(!swp) return; const g=swp; swp=null;
  if(!g.moved) return;
  S.dragging=false; S.noClickUntil=Date.now()+350;
  let v=0; const sm=g.samples||[];                                        // מהירות ההשלכה (פיקסלים למילישנייה)
  if(sm.length>1){const f=sm[0],l=sm[sm.length-1]; if(l[0]>f[0]) v=(l[1]-f[1])/(l[0]-f[0]);}
  const projected=g.off+v*220;                                            // לאן "הזריקה" הייתה מגיעה
  const anchors=[[-SW_R,'r'],[0,''],[SW_L,'l']];
  const target=anchors.reduce((best,a)=>Math.abs(a[0]-projected)<Math.abs(best[0]-projected)?a:best);
  const dist=Math.abs(target[0]-g.off),dur=Math.round(Math.max(220,Math.min(480,dist/(Math.abs(v)+.35)*1.1)));
  g.row.style.transition=`transform ${dur}ms cubic-bezier(.25,1.12,.5,1)`;   // התיישבות קפיצית קלה
  g.row.style.transform=`translateX(${target[0]}px)`;
  S.sw=target[1]?{id:g.id,side:target[1]}:null;
  if(S.pendingRender){S.pendingRender=false;setTimeout(render,dur+30)}
}
document.addEventListener('pointerup',swEnd);
document.addEventListener('pointercancel',swEnd);
document.addEventListener('click',e=>{ if(Date.now()<S.noClickUntil&&e.target.closest&&e.target.closest('.sw > .row')){e.stopPropagation();e.preventDefault()} },true);

/* ---------- סידור אריחים: לחיצה ארוכה, רעידה, גרירה (כמו במסך הבית באייפון) ---------- */
let lpTimer=null,lpStart=null;
function saveOrder(ids){ S.order=ids.concat(S.order.filter(x=>!ids.includes(x))); ls.set('tileOrder',JSON.stringify(S.order)); }
function startDrag(tile,e){
  const grid=tile.parentElement,r=tile.getBoundingClientRect();
  const ghost=tile.cloneNode(true); ghost.classList.add('dragghost'); ghost.classList.remove('complete');
  Object.assign(ghost.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px'});
  document.body.appendChild(ghost); tile.classList.add('ph'); S.dragging=true;
  const dx=e.clientX-r.left,dy=e.clientY-r.top;
  const move=ev=>{
    ghost.style.left=(ev.clientX-dx)+'px'; ghost.style.top=(ev.clientY-dy)+'px';
    const over=document.elementFromPoint(ev.clientX,ev.clientY),tgt=over&&over.closest&&over.closest('.tile');
    if(tgt&&tgt!==tile&&tgt.parentElement===grid){
      const kids=[...grid.children]; grid.insertBefore(tile,kids.indexOf(tile)<kids.indexOf(tgt)?tgt.nextSibling:tgt);
    }
  };
  const up=()=>{
    window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); window.removeEventListener('pointercancel',up);
    ghost.remove(); tile.classList.remove('ph'); S.dragging=false;
    saveOrder([...grid.children].map(c=>c.dataset.id).filter(Boolean));
    if(S.pendingRender){S.pendingRender=false;render()}
  };
  window.addEventListener('pointermove',move); window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
}
document.addEventListener('pointerdown',e=>{
  const t=e.target.closest&&e.target.closest('.tile'); if(!t||!t.closest('#view')) return;
  if(S.edit){ e.preventDefault(); startDrag(t,e); return; }
  lpStart={x:e.clientX,y:e.clientY};
  clearTimeout(lpTimer);
  lpTimer=setTimeout(()=>{ lpTimer=null; S.edit=true; if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){} render(); },500);
});
document.addEventListener('pointermove',e=>{ if(lpTimer&&lpStart&&Math.hypot(e.clientX-lpStart.x,e.clientY-lpStart.y)>8){clearTimeout(lpTimer);lpTimer=null} });
['pointerup','pointercancel','scroll'].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(lpTimer);lpTimer=null},true));
document.addEventListener('contextmenu',e=>{ if(e.target.closest&&e.target.closest('.tile')) e.preventDefault(); });
function setTab(t){S.edit=false;S.tab=t; if(location.hash!=='#'+t) location.hash=t; render(); window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{const t=location.hash.slice(1); if(['list','shop','compare','more'].includes(t)&&t!==S.tab){S.tab=t;render()}});

/* ---------- boot ---------- */
(function(){const t=location.hash.slice(1); if(['list','shop','compare','more'].includes(t)) S.tab=t;})();
render();
const SC=window.SUPABASE_CONFIG||{};
const cfgOk=!!(SC.url&&SC.anonKey&&!/YOUR_/.test(SC.url+SC.anonKey));
const SB_JS='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm';
async function bootCloud(){
  const {createClient}=await import(SB_JS);
  const sb=createClient(SC.url,SC.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const cloud=window.makeCloudDB(sb,{toast});
  DB=cloud;
  const form=$('#loginform'),msg=$('#loginmsg');
  form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='מתחבר…';
    const {error}=await sb.auth.signInWithPassword({email:$('#lemail').value.trim(),password:$('#lpass').value});
    msg.textContent=error?(navigator.onLine?'האימייל או הסיסמה שגויים':'אין חיבור לאינטרנט'):''});
  $('#logout').addEventListener('click',()=>{
    if(cloud.pending()&&!confirm('יש שינויים שעוד לא נשלחו לשרת ויימחקו מהמכשיר. להתנתק בכל זאת?')) return;
    sb.auth.signOut({scope:'local'});
  });
  let started=false,live=false,unsubs=[];
  const showApp=()=>{$('#login').hidden=true;$('#logout').hidden=false};
  function showLogin(){ unsubs.forEach(u=>u());unsubs=[];started=false;S.items={};S.prices={};S.loaded=false;
    $('#login').hidden=false;$('#logout').hidden=true;render(); }
  const goLive=()=>{ if(live) return; live=true; setTimeout(()=>cloud.start(),0); };
  // מכשיר שכבר התחבר בעבר: מציגים מיד את העותק השמור, גם בלי אינטרנט
  if(ls.get('shopUser')&&cloud.hasCache()){ showApp(); listen(); }
  sb.auth.onAuthStateChange((event,session)=>{
    if(session){ ls.set('shopUser','1'); showApp(); listen(); goLive(); return; }
    if(event==='SIGNED_OUT'){ cloud.stop(); cloud.clear(); live=false; ls.set('shopUser',''); showLogin(); return; }
    if(!navigator.onLine&&ls.get('shopUser')&&cloud.hasCache()) return;   // בלי רשת: נשארים על העותק השמור
    cloud.stop(); live=false; showLogin();
  });
  addEventListener('offline',()=>toast('אין חיבור. השינויים יישמרו ויישלחו כשהחיבור יחזור'));
  function listen(){
    if(started) return; started=true; S.armUntil=Date.now()+8000;
    const to=setTimeout(()=>{ if(!S.loaded){S.loaded=true;toast('אין חיבור לשרת. מוצג המידע האחרון ששמור');render()} },10000);
    const fail=()=>{S.loaded=true;render()};
    unsubs.push(DB.collection('items').onSnapshot(s=>{S.items={};s.docs.forEach(d=>S.items[d.id]={id:d.id,...d.data()});S.loaded=true;clearTimeout(to);render(); if(S.armUntil&&Date.now()<S.armUntil) armCheck()},fail));
    unsubs.push(DB.collection('prices').onSnapshot(s=>{S.prices={};s.docs.forEach(d=>S.prices[d.id]={id:d.id,...d.data()});render()},fail));
    unsubs.push(DB.doc('config/stores').onSnapshot(s=>{ if(s.exists){const d=s.data();if(d&&Array.isArray(d.list)){S.stores=d.list;render();return}} S.stores=DEFAULT_STORES; if(!S.seededStores){S.seededStores=true;write('config/stores',{list:DEFAULT_STORES})} render()},fail));
    unsubs.push(DB.doc('config/catmap').onSnapshot(s=>{ CATMAP=(s.exists&&s.data()&&s.data().map)||{}; render()},fail));
    unsubs.push(DB.doc('config/categories').onSnapshot(s=>{ setCustomCats((s.exists&&s.data()&&s.data().list)||[]); render()},fail));
    unsubs.push(DB.doc('config/aliases').onSnapshot(s=>{ ALIAS=(s.exists&&s.data()&&s.data().map)||{}; render()},fail));
    unsubs.push(DB.doc('config/nomerge').onSnapshot(s=>{ NOMERGE=(s.exists&&s.data()&&s.data().map)||{}; render()},fail));
    unsubs.push(DB.doc('config/sync').onSnapshot(s=>{ S.sync=s.exists?s.data():null; render()},fail));
  }
}
if(cfgOk){ $('#login').hidden=!!ls.get('shopUser'); bootCloud().catch(()=>{toast('שגיאה בטעינת החיבור לשרת');$('#login').hidden=false}); }
else { $('#login').hidden=true; $('#demo').hidden=false; localLoad(); S.loaded=true; render(); }
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
