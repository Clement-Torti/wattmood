/*
 * WattMood background service worker — the only place that talks to the network.
 *   - on install: anonymous code + "install" event (+10 community points)
 *   - events (install / share / pledge) go through a retry queue, so nothing is lost offline
 *   - wm:fetch: pulls the points line from the Google Apps Script endpoint
 */
importScripts('core/config.js');

const C = globalThis.WattMood.CONFIG;

function newCode() {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint8Array(6));
  return 'WM-' + [...r].map((b) => abc[b % abc.length]).join('');
}
async function code() {
  const { wmCode } = await chrome.storage.sync.get('wmCode');
  if (wmCode) return wmCode;
  const c = newCode();
  await chrome.storage.sync.set({ wmCode: c });
  return c;
}

async function enqueue(event) {
  const { wmQueue = [] } = await chrome.storage.local.get('wmQueue');
  wmQueue.push({ ...event, code: await code(), at: Date.now(), lang: chrome.i18n.getUILanguage() });
  await chrome.storage.local.set({ wmQueue: wmQueue.slice(-50) });
  return flush();
}

async function flush() {
  if (!C.ENDPOINT) return false;
  const { wmQueue = [] } = await chrome.storage.local.get('wmQueue');
  if (!wmQueue.length) return true;
  try {
    // text/plain keeps it a "simple" request; Apps Script parses the JSON body
    const res = await fetch(C.ENDPOINT, { method: 'POST', body: JSON.stringify({ events: wmQueue }), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    if (!res.ok) return false;
    await chrome.storage.local.set({ wmQueue: [] });
    fetchState(true);
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchState() {
  const prev = (await chrome.storage.local.get('wmState')).wmState || {};
  if (!C.ENDPOINT) {
    const state = { ...prev, offline: true, fetchedAt: Date.now() };
    await chrome.storage.local.set({ wmState: state });
    return state;
  }
  try {
    const { wmUser = '' } = await chrome.storage.sync.get('wmUser');
    const url = `${C.ENDPOINT}?action=state&code=${encodeURIComponent(await code())}&user=${encodeURIComponent(wmUser)}`;
    const res = await fetch(url, { redirect: 'follow' });
    const data = await res.json();
    const state = {
      total: Number(data.total) || 0,
      updatedAt: Number(data.updatedAt) || 0, // when the owner last entered verified donations
      goals: data.goals || {},
      unlocks: Array.isArray(data.unlocks) ? data.unlocks : [],
      fetchedAt: Date.now(),
      offline: false,
    };
    await chrome.storage.local.set({ wmState: state });
    return state;
  } catch (e) {
    return { ...prev, fetchedAt: prev.fetchedAt || 0 };
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await enqueue({ type: 'install' });
    chrome.tabs.create({ url: `${C.SITE_URL}welcome.html` }).catch(() => {});
  }
  chrome.alarms.create('wm-refresh', { periodInMinutes: C.REFRESH_MIN });
});
chrome.runtime.onStartup.addListener(() => { flush(); fetchState(); });
chrome.alarms.onAlarm.addListener((a) => { if (a.name === 'wm-refresh') { flush(); fetchState(); } });

/** Coupons need an immediate answer from the sheet (not queued). */
async function redeem(coupon, skin) {
  if (!C.ENDPOINT) return { ok: false, error: 'offline' };
  try {
    const { wmUser = '' } = await chrome.storage.sync.get('wmUser');
    const res = await fetch(C.ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'redeem', coupon, skin, code: await code(), user: wmUser }) });
    const data = await res.json();
    if (data.ok) fetchState();
    return data;
  } catch (e) {
    return { ok: false, error: 'offline' };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg && msg.type === 'wm:redeem') { redeem(msg.coupon, msg.skin).then(reply); return true; }
  if (!msg || !msg.type) return;
  if (msg.type === 'wm:fetch') { fetchState().then((state) => reply({ state })); return true; }
  if (msg.type === 'wm:event') { enqueue(msg.event).then((ok) => reply({ ok })); return true; }
  if (msg.type === 'wm:open') { chrome.tabs.create({ url: msg.url }); reply({ ok: true }); }
});
