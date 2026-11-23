/**
 * גשר Instinct לרשימת הקניות: קורא מיילים בפורמט קבוע ומעדכן את הרשימה ב-Supabase.
 * רץ ב-Google Apps Script, כל 10 דקות. סקריפט נפרד מזה של WEBTOP, באותה תיבה.
 *
 * Script Properties (Project settings > Script properties), לא בקוד ולא ב-git:
 *   KEY            מילה סודית ששולח המייל (שורת KEY:)
 *   SENDER         כתובת השולח של Instinct. כמה סוכנים: כתובות מופרדות בפסיק (a@x.com,b@x.com)
 *   SUPABASE_URL   כתובת הפרויקט
 *   SUPABASE_ANON  המפתח הציבורי (publishable)
 *   INGEST_SECRET  סוד הקליטה שהוגדר ב-Supabase (ingest_config, name = shop)
 */
var SUBJECT_PREFIX = 'SHOP-LIST';
var LABEL = 'shop-ingested';
var CATS = ['produce','bakery','dairy','meat','frozen','dry','canned','snacks','choc','drinks','clean','care','other'];

function norm_(s) { return String(s || '').replace(/[\u200e\u200f\u202a-\u202e]/g, '').replace(/\s+/g, ' ').trim(); }
// זהה ל-idOf באפליקציה, כדי שאותו מוצר ייקלט כפריט אחד
function idOf_(name) {
  var h = 5381, s = norm_(name);
  for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return 'i' + h.toString(36);
}

/** מפרק גוף מייל לפקודות. מחזיר {ok, ops, error}. */
function parseBody_(body, key) {
  var lines = String(body).split(/\r?\n/), ops = [], keyOk = false, seen = {};
  for (var i = 0; i < lines.length; i++) {
    var line = norm_(lines[i]);
    if (!line) continue;
    var m = line.match(/^KEY:\s*(.+)$/i);
    if (m) { keyOk = (m[1].trim() === key); continue; }
    var parts = line.split('|').map(norm_);
    var op = (parts[0] || '').toUpperCase();
    if (op === 'ITEM') {            // ITEM | כמות | שם | קטגוריה
      var qty = parseInt(parts[1], 10), name = parts[2], cat = (parts[3] || '').toLowerCase();
      if (!name || name.length > 60) continue;
      ops.push({ op: 'add', id: idOf_(name), name: name, qty: isNaN(qty) ? 1 : Math.max(1, Math.min(99, qty)), cat: CATS.indexOf(cat) >= 0 ? cat : 'other' });
    } else if (op === 'DONE' || op === 'REMOVE') {   // DONE | שם
      var n = parts[1];
      if (n) ops.push({ op: op.toLowerCase(), id: idOf_(n), name: n });
    }
  }
  if (!keyOk) return { ok: false, error: 'KEY חסר או שגוי' };
  return { ok: true, ops: ops };
}

/** SENDER יכול להכיל כמה כתובות, מופרדות בפסיק, נקודה-פסיק או רווח. */
function sendersList_(raw) {
  return String(raw || '').split(/[,;\s]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
}
function fromAllowed_(from, senders) {
  var f = String(from || '').toLowerCase();
  return senders.some(function (a) { return f.indexOf(a) >= 0; });
}

function run() {
  var p = PropertiesService.getScriptProperties();
  var key = p.getProperty('KEY'), senders = sendersList_(p.getProperty('SENDER'));
  if (!key || !senders.length) throw new Error('חסרים KEY או SENDER ב-Script Properties');
  var label = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
  var threads = GmailApp.search('subject:"' + SUBJECT_PREFIX + '" from:' + sender + ' is:unread', 0, 20);   // כפילויות נחסמות ב-Supabase לפי מזהה המייל
  threads.forEach(function (t) {
    var handled = false;
    t.getMessages().forEach(function (msg) {
      if (!msg.isUnread()) return;
      if (!fromAllowed_(msg.getFrom(), senders)) return;   // רק משולחים מורשים
      var res = parseBody_(msg.getPlainBody(), key);
      if (!res.ok) { Logger.log('מייל נדחה: ' + res.error + ' | נושא: ' + msg.getSubject()); msg.markRead(); return; }
      if (!res.ops.length) { Logger.log('אין פקודות במייל: ' + msg.getSubject()); msg.markRead(); return; }
      if (post_(msg.getId(), res.ops)) { msg.markRead(); handled = true; }   // כישלון: נשאר לא נקרא וינסה שוב
    });
    if (handled) t.addLabel(label);
  });
}

function post_(msgId, ops) {
  var p = PropertiesService.getScriptProperties();
  var url = p.getProperty('SUPABASE_URL').replace(/\/$/, '') + '/rest/v1/rpc/shop_ingest';
  var anon = p.getProperty('SUPABASE_ANON');
  var resp = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: anon, Authorization: 'Bearer ' + anon },
    payload: JSON.stringify({ p_secret: p.getProperty('INGEST_SECRET'), p_msg: msgId, p_ops: ops })
  });
  Logger.log(resp.getResponseCode() + ' ' + resp.getContentText());
  return resp.getResponseCode() === 200;
}

/** להריץ פעם אחת: יוצר טריגר כל 10 דקות. */
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'run') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('run').timeBased().everyMinutes(10).create();
}

/** בדיקה ללא Gmail ובלי שליחה: מדפיס מה ייקלט. */
function selfTest() {
  var r = parseBody_('KEY: abc\nITEM | 2 | חלב 3% | dairy\nITEM | 1 | לחם\nDONE | קוטג\nREMOVE | נייר טואלט', 'abc');
  Logger.log(JSON.stringify(r));
}
