// שכבת הנתונים מול Supabase.
// האפליקציה עובדת מול "מסמכים" (items/<id>, prices/<id>, config/<id>), כמו שעבדה מול Firestore.
// כאן: עותק מקומי במכשיר, תור שינויים שנשלח כשיש חיבור, ועדכונים בזמן אמת מהמכשירים האחרים.
(function(root){
function makeCloudDB(sb, opt){
  opt = opt || {};
  const store = opt.storage || {
    get: k => { try { return localStorage.getItem(k) } catch(e) { return null } },
    set: (k, v) => { try { localStorage.setItem(k, v) } catch(e) {} },
    del: k => { try { localStorage.removeItem(k) } catch(e) {} }
  };
  const toast = opt.toast || (() => {});
  const K_CACHE = 'shopCache', K_QUEUE = 'shopQueue';

  let cache = { valid: false, d: {} };   // d[col][id] = data. valid = נטען מהשרת לפחות פעם אחת
  let queue = [];                         // [{op:'set'|'del', col, id, data, ts}]
  try { const c = JSON.parse(store.get(K_CACHE) || 'null'); if (c && c.d) cache = c } catch(e) {}
  try { queue = JSON.parse(store.get(K_QUEUE) || '[]') || [] } catch(e) { queue = [] }

  const subs = new Set();
  let channel = null, flushing = false, timer = null, active = false;

  const saveCache = () => store.set(K_CACHE, JSON.stringify(cache));
  const saveQueue = () => store.set(K_QUEUE, JSON.stringify(queue));
  const split = p => { const i = p.indexOf('/'); return [p.slice(0, i), p.slice(i + 1)] };
  const put = (col, id, data) => {
    const c = cache.d[col] || (cache.d[col] = {});
    if (data === null) delete c[id]; else c[id] = data;
  };
  // שינויים מקומיים שעוד לא נשלחו תמיד גוברים על מה שמגיע מהשרת
  const overlayQueue = () => { for (const q of queue) put(q.col, q.id, q.op === 'del' ? null : q.data) };

  function deliver(s){
    const c = cache.d[s.col] || {};
    if (s.kind === 'col') s.next({ docs: Object.keys(c).map(id => ({ id, data: () => c[id] })) });
    else { const v = c[s.id]; s.next({ exists: v !== undefined, id: s.id, data: () => v }) }
  }
  function emit(col){
    if (!cache.valid) return;   // לא מדווחים "אין מסמך" לפני שראינו את השרת, כדי לא לדרוס נתונים
    for (const s of subs) if (!col || s.col === col) deliver(s);
  }
  function fail(e){ for (const s of subs) if (s.error) s.error(e) }

  async function fetchAll(){
    const fresh = {}, size = 1000;
    for (let from = 0; ; from += size) {
      const { data, error } = await sb.from('docs').select('col,id,data')
        .order('col').order('id').range(from, from + size - 1);
      if (error) throw error;
      for (const r of data) (fresh[r.col] || (fresh[r.col] = {}))[r.id] = r.data;
      if (data.length < size) break;
    }
    cache = { valid: true, d: fresh };
    overlayQueue(); saveCache(); emit();
  }
  function refresh(){
    return fetchAll().then(flush).catch(e => { if (!cache.valid) fail(e) });
  }

  // שגיאה קבועה (אין הרשאה, נתון לא תקין): מוותרים על השינוי. כל השאר (אין רשת, טוקן פג): מנסים שוב
  const permanent = e => e && typeof e.code === 'string' && /^(42501|22|23)/.test(e.code);
  async function flush(){
    if (flushing || !active) return;
    flushing = true;
    try {
      while (queue.length) {
        const q = queue[0];
        const res = q.op === 'del'
          ? await sb.from('docs').delete().eq('col', q.col).eq('id', q.id)
          : await sb.from('docs').upsert({ col: q.col, id: q.id, data: q.data, updated_at: new Date(q.ts).toISOString() });
        if (res.error) {
          if (!permanent(res.error)) break;
          toast('שינוי אחד לא נשמר (אין הרשאה)');
        }
        if (queue[0] === q) queue.shift();
        saveQueue();
      }
    } catch(e) { /* אין חיבור, ננסה שוב */ }
    finally { flushing = false }
  }

  function onChange(p){
    const del = p.eventType === 'DELETE', row = del ? p.old : p.new;
    if (!row || !row.col || row.id == null) return;
    put(row.col, row.id, del ? null : row.data);
    overlayQueue(); saveCache(); emit(row.col);
  }

  function write(col, id, data){
    const d = data === null ? null : JSON.parse(JSON.stringify(data));
    queue = queue.filter(q => !(q.col === col && q.id === id));   // רק השינוי האחרון לכל מסמך
    queue.push({ op: d === null ? 'del' : 'set', col, id, data: d, ts: Date.now() });
    saveQueue();
    put(col, id, d); saveCache(); emit(col);
    flush();
    return Promise.resolve();
  }

  function sub(s){ subs.add(s); if (cache.valid) deliver(s); return () => subs.delete(s) }

  const onOnline = () => refresh();
  function start(){
    if (active) return;
    active = true;
    channel = sb.channel('docs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, onChange)
      .subscribe(status => { if (status === 'SUBSCRIBED') refresh() });   // גם אחרי התחברות מחדש
    refresh();
    timer = setInterval(flush, 20000);
    if (root.addEventListener) root.addEventListener('online', onOnline);
  }
  function stop(){
    active = false;
    if (channel) { try { sb.removeChannel(channel) } catch(e) {} channel = null }
    if (timer) { clearInterval(timer); timer = null }
    if (root.removeEventListener) root.removeEventListener('online', onOnline);
  }
  function clear(){ cache = { valid: false, d: {} }; queue = []; store.del(K_CACHE); store.del(K_QUEUE) }

  return {
    doc: p => { const [col, id] = split(p); return {
      set: d => write(col, id, d),
      delete: () => write(col, id, null),
      onSnapshot: (next, error) => sub({ kind: 'doc', col, id, next, error })
    } },
    collection: col => ({ onSnapshot: (next, error) => sub({ kind: 'col', col, next, error }) }),
    start, stop, clear, flush,
    hasCache: () => cache.valid,
    pending: () => queue.length
  };
}
root.makeCloudDB = makeCloudDB;
})(typeof window !== 'undefined' ? window : globalThis);
