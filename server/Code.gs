/**
 * WattMood — Google Apps Script backend (bound to the WattMood spreadsheet).
 * Deploy: Extensions ▸ Apps Script ▸ paste this file ▸ Deploy ▸ New deployment ▸ Web app
 *         Execute as: Me · Who has access: Anyone  →  copy the /exec URL into src/core/config.js (ENDPOINT).
 * The spreadsheet itself stays PRIVATE: only this script reads/writes it.
 *
 * Tabs (created automatically by setup()):
 *   Events     time | type | code | lang | details            (install / share, written by the extension)
 *   Pledges    time | code | amount | currency | eur | points | coupon type   (what donors said they'd give)
 *   Donations  date | code | amount € | points | note          ← YOU fill this after checking Buy Me a Coffee
 *   Coupons    coupon | type (one/all) | note | created | used | usedAt | usedByCode | usedByUser | skins
 *   Feedback   time | code | rating | text | skin | version | page | lang
 *   Goals      skin | points                                    (optional: overrides the goals in the extension)
 *   Meta       key | value                                      (updatedAt = last time Donations was edited)
 */

const POINTS = { install: 10, share: 1 };
const TABS = {
  Events: ['time', 'type', 'code', 'lang', 'details'],
  Pledges: ['time', 'code', 'amount', 'currency', 'eur', 'points', 'coupon type'],
  Donations: ['date', 'code (WM-…)', 'amount €', 'points (=€×10)', 'note'],
  Coupons: ['coupon', 'type (one/all)', 'note', 'created', 'used', 'usedAt', 'usedByCode', 'usedByUser', 'skins'],
  Feedback: ['time', 'code', 'rating', 'text', 'skin', 'version', 'page', 'lang'],
  Goals: ['skin', 'points'],
  Meta: ['key', 'value'],
};

/* ------------------------------------------------------------------ */
/* Setup & sheet menu                                                  */
/* ------------------------------------------------------------------ */
function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach((name) => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(TABS[name]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, TABS[name].length).setFontWeight('bold');
    }
  });
  setMeta('updatedAt', Date.now());
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('WattMood')
    .addItem('New coupon — 1 skin (≥ 5 €)', 'newCouponOne')
    .addItem('New coupon — all skins (≥ 10 €)', 'newCouponAll')
    .addSeparator()
    .addItem('Show community total', 'showTotal')
    .addItem('Set up tabs', 'setup')
    .addToUi();
}

/** Any manual edit in Donations or Goals = "the counter was updated now" (clears "in review" pledges). */
function onEdit(e) {
  const name = e && e.range && e.range.getSheet().getName();
  if (name === 'Donations' || name === 'Goals') {
    setMeta('updatedAt', Date.now());
    CacheService.getScriptCache().remove('state');
  }
}

function newCouponOne() { newCoupon_('one'); }
function newCouponAll() { newCoupon_('all'); }
function newCoupon_(type) {
  const ui = SpreadsheetApp.getUi();
  const note = ui.prompt('Note for this coupon (e.g. donor code WM-XXXXXX, amount)', ui.ButtonSet.OK_CANCEL);
  if (note.getSelectedButton() !== ui.Button.OK) return;
  const sh = sheet_('Coupons');
  const existing = new Set(sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).getValues().map((r) => r[0]));
  let code;
  do { code = 'WMC-' + rnd_(4) + '-' + rnd_(4); } while (existing.has(code));
  sh.appendRow([code, type, note.getResponseText(), new Date(), false, '', '', '', '']);
  ui.alert('Coupon created', code + '\n\nSend it to the donor (Buy Me a Coffee reply / message).\nIt can be used once.', ui.ButtonSet.OK);
}

function showTotal() {
  const s = computeState_();
  SpreadsheetApp.getUi().alert('Community total: ' + s.total + ' points\n(installs ' + s.installs + ' · shares ' + s.shares + ' · donations ' + s.donationPoints + ')');
}

/* ------------------------------------------------------------------ */
/* Web app                                                             */
/* ------------------------------------------------------------------ */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'state') {
    const s = cachedState_();
    return json_({ total: s.total, updatedAt: s.updatedAt, goals: s.goals, unlocks: unlocksFor_(p.code, p.user) });
  }
  // public summary (used by the GitHub Pages site)
  const s = cachedState_();
  return json_({ total: s.total, updatedAt: s.updatedAt, goals: s.goals });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }
  if (body.action === 'redeem') return json_(redeem_(body));
  if (Array.isArray(body.events)) {
    body.events.slice(0, 50).forEach(record_);
    CacheService.getScriptCache().remove('state');
    return json_({ ok: true });
  }
  return json_({ ok: false, error: 'unknown action' });
}

/* ------------------------------------------------------------------ */
function record_(ev) {
  const code = String(ev.code || '').slice(0, 20);
  const lang = String(ev.lang || '').slice(0, 10);
  const time = new Date(Number(ev.at) || Date.now());
  if (ev.type === 'install' || ev.type === 'share') {
    sheet_('Events').appendRow([time, ev.type, code, lang, '']);
  } else if (ev.type === 'pledge') {
    sheet_('Pledges').appendRow([time, code, Number(ev.amount) || 0, String(ev.currency || ''), Number(ev.eur) || 0, Number(ev.points) || 0, String(ev.coupon || '')]);
  } else if (ev.type === 'feedback') {
    sheet_('Feedback').appendRow([time, code, ev.rating || '', String(ev.text || '').slice(0, 2000), String(ev.skin || ''), String(ev.version || ''), String(ev.page || ''), lang]);
  }
}

/** Coupons: single use. The same owner (same WattMood code or same Wattpad username) may re-enter it on another device. */
function redeem_(b) {
  const coupon = String(b.coupon || '').trim().toUpperCase();
  const code = String(b.code || '').slice(0, 20);
  const user = String(b.user || '').slice(0, 60).toLowerCase();
  if (!coupon) return { ok: false, error: 'invalid' };
  const lock = LockService.getScriptLock();
  lock.waitLock(15000); // two people can't redeem the same coupon at the same moment
  try {
    const sh = sheet_('Coupons');
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() !== coupon) continue;
      const type = String(rows[i][1]).toLowerCase() === 'all' ? 'all' : 'one';
      const used = rows[i][4] === true || String(rows[i][4]).toUpperCase() === 'TRUE';
      if (used) {
        const sameOwner = (code && rows[i][6] === code) || (user && String(rows[i][7]).toLowerCase() === user);
        if (!sameOwner) return { ok: false, error: 'used' };
        return { ok: true, type, skins: String(rows[i][8] || '').split(',').filter(String) };
      }
      const skins = type === 'all' ? ['all'] : [String(b.skin || '').slice(0, 30)].filter(String);
      if (!skins.length) return { ok: false, error: 'invalid' };
      sh.getRange(i + 1, 5, 1, 5).setValues([[true, new Date(), code, user, skins.join(',')]]);
      CacheService.getScriptCache().remove('state');
      return { ok: true, type, skins };
    }
    return { ok: false, error: 'invalid' };
  } finally {
    lock.releaseLock();
  }
}

function unlocksFor_(code, user) {
  code = String(code || ''); user = String(user || '').toLowerCase();
  if (!code && !user) return [];
  const rows = sheet_('Coupons').getDataRange().getValues().slice(1);
  const out = [];
  rows.forEach((r) => {
    const used = r[4] === true || String(r[4]).toUpperCase() === 'TRUE';
    if (used && ((code && r[6] === code) || (user && String(r[7]).toLowerCase() === user))) {
      String(r[8] || '').split(',').filter(String).forEach((s) => out.push(s));
    }
  });
  return out;
}

function computeState_() {
  const ev = sheet_('Events').getDataRange().getValues().slice(1);
  const installers = new Set(), shares = new Set();
  ev.forEach((r) => {
    const day = Utilities.formatDate(new Date(r[0]), 'UTC', 'yyyy-MM-dd');
    if (r[1] === 'install' && r[2]) installers.add(r[2]); // one install per code
    if (r[1] === 'share' && r[2]) shares.add(r[2] + '|' + day); // one share per code per day
  });
  const don = sheet_('Donations').getDataRange().getValues().slice(1);
  const donationPoints = don.reduce((a, r) => a + (Number(r[3]) || Math.floor((Number(r[2]) || 0) * 10)), 0);
  const goals = {};
  sheet_('Goals').getDataRange().getValues().slice(1).forEach((r) => { if (r[0] && r[1] !== '') goals[String(r[0])] = Number(r[1]); });
  return {
    installs: installers.size, shares: shares.size, donationPoints,
    total: installers.size * POINTS.install + shares.size * POINTS.share + donationPoints,
    updatedAt: Number(getMeta_('updatedAt')) || 0,
    goals,
  };
}

function cachedState_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('state');
  if (hit) return JSON.parse(hit);
  const s = computeState_();
  cache.put('state', JSON.stringify(s), 60);
  return s;
}

/* helpers */
function sheet_(name) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { setup(); sh = ss.getSheetByName(name); }
  return sh;
}
function setMeta(key, value) {
  const sh = sheet_('Meta');
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) if (rows[i][0] === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  sh.appendRow([key, value]);
}
function getMeta_(key) {
  const rows = sheet_('Meta').getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) if (rows[i][0] === key) return rows[i][1];
  return null;
}
function rnd_(n) {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < n; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
