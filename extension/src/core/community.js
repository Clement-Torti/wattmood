/*
 * WattMood community: the points line, skin goals, pledges and personal unlocks.
 *
 * Server-free: a Google Sheet + Apps Script (server/Code.gs) holds the counters. All network calls go
 * through the background service worker (src/background.js); this module only reads/writes extension storage.
 *
 *   global points  = 10 × installs + 1 × shares (counted by the sheet) + verified donation points (entered by hand)
 *   pending        = pledges made after the sheet's last update → shown striped ("in review") on the line
 *   skin unlocked  = global points ≥ its goal  |  personal unlock verified in the sheet (≥ 5 € pick, ≥ 10 € all)
 */
(() => {
  const IV = (globalThis.WattMood = globalThis.WattMood || {});
  const C = () => IV.CONFIG;
  const local = chrome.storage.local;
  const EMPTY = { total: 0, updatedAt: 0, goals: {}, unlocks: [], fetchedAt: 0, offline: true };

  const send = (msg) => new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(msg, (r) => { void chrome.runtime.lastError; resolve(r); });
    } catch (e) { resolve(null); }
  });

  const community = {
    async code() {
      const { wmCode } = await chrome.storage.sync.get('wmCode');
      if (wmCode) return wmCode;
      const code = community.newCode();
      await chrome.storage.sync.set({ wmCode: code });
      return code;
    },
    newCode() {
      const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const r = crypto.getRandomValues(new Uint8Array(6));
      return 'WM-' + [...r].map((b) => abc[b % abc.length]).join('');
    },

    async state() {
      const { wmState } = await local.get('wmState');
      return { ...EMPTY, ...(wmState || {}) };
    },
    /** Ask the background to refresh from the sheet (rate-limited unless forced). */
    async refresh(force = false) {
      const s = await community.state();
      if (!force && Date.now() - s.fetchedAt < C().REFRESH_MIN * 60e3) return s;
      const r = await send({ type: 'wm:fetch' });
      return r && r.state ? { ...EMPTY, ...r.state } : s;
    },

    async pledges() {
      const { wmPledges = [] } = await local.get('wmPledges');
      return wmPledges;
    },

    goals(state) {
      return { ...C().GOALS, ...(state.goals || {}) };
    },

    /** Coupons redeemed with this Chrome profile (chrome.storage.sync → follows the user to other devices). */
    async myUnlocks() {
      const { wmUnlocks = [] } = await chrome.storage.sync.get('wmUnlocks');
      return wmUnlocks;
    },

    /** Everything the UI needs, in one object. */
    async snapshot() {
      const [state, pledges, code, mine] = await Promise.all([community.state(), community.pledges(), community.code(), community.myUnlocks()]);
      const goals = community.goals(state);
      const updatedAt = Number(state.updatedAt) || 0;
      // a pledge stays "in review" until the sheet has been updated after it was made
      const pending = pledges.filter((p) => p.at > updatedAt).reduce((a, p) => a + p.points, 0);
      const verified = new Set([...(state.unlocks || []), ...mine.map((u) => u.skin)]);
      const allMine = verified.has('all');
      const ids = Object.keys(goals).filter((id) => IV.editions.has(id)).sort((a, b) => goals[a] - goals[b]);
      const skins = ids.map((id) => {
        const global = state.total >= goals[id];
        const own = allMine || verified.has(id);
        return { id, goal: goals[id], global, mine: own, unlocked: global || own, review: false };
      });
      const next = skins.find((s) => !s.global) || null;
      return { code, total: state.total, pending, updatedAt, offline: !!state.offline || !C().ENDPOINT, skins, next, goals, max: skins.length ? skins[skins.length - 1].goal : 0 };
    },

    /**
     * Redeem a donation coupon. One use only (enforced by the sheet); the same owner (same WattMood code or
     * same Wattpad username) can re-enter it on another device. `skin` is used by "one skin" coupons.
     * Returns { ok, skins } or { ok: false, error: 'used' | 'invalid' | 'offline' }.
     */
    async redeem(coupon, skin) {
      const clean = String(coupon || '').trim().toUpperCase().replace(/\s+/g, '');
      if (!clean) return { ok: false, error: 'invalid' };
      const r = await send({ type: 'wm:redeem', coupon: clean, skin: skin || '' });
      if (!r || r.error === 'offline') return { ok: false, error: 'offline' };
      if (!r.ok) return { ok: false, error: r.error || 'invalid' };
      const mine = await community.myUnlocks();
      for (const sk of r.skins || []) if (!mine.some((u) => u.skin === sk)) mine.push({ skin: sk, coupon: clean, at: Date.now() });
      await chrome.storage.sync.set({ wmUnlocks: mine });
      return { ok: true, skins: r.skins || [] };
    },

    /** Remember the logged-in Wattpad username (synced), so unlocks can be restored on another device. */
    async rememberUser(username) {
      if (!username) return;
      const { wmUser } = await chrome.storage.sync.get('wmUser');
      if (wmUser !== username) await chrome.storage.sync.set({ wmUser: username });
    },

    async isUnlocked(id) {
      const snap = await community.snapshot();
      const s = snap.skins.find((x) => x.id === id);
      return !!(s && s.unlocked);
    },

    /** Referral link for a channel (whatsapp, tiktok…), carrying the anonymous code. */
    async shareLink(channel) {
      const code = await community.code();
      return `${C().SITE_URL}?ref=${encodeURIComponent(code)}&utm_source=${encodeURIComponent(channel || 'link')}`;
    },
    async hasShared() {
      const { wmShared } = await chrome.storage.sync.get('wmShared');
      return !!wmShared;
    },
    /**
     * Record a share. The +5 is counted only the first time this person shares (ever; also enforced by the sheet).
     * Returns 'counted' | 'already'.
     */
    async recordShare(channel) {
      if (community._sharing || (await community.hasShared())) return 'already';
      community._sharing = true; // two quick clicks can't both count
      await chrome.storage.sync.set({ wmShared: Date.now() });
      await send({ type: 'wm:event', event: { type: 'share', channel: channel || '' } });
      return 'counted';
    },

    toEur(amount, currency) {
      const cur = C().CURRENCIES[currency] || C().CURRENCIES.EUR;
      return Math.max(0, Number(amount) || 0) * cur.rate;
    },
    pointsFor(amount, currency) {
      return Math.floor(community.toEur(amount, currency) * C().POINTS.perEuro);
    },

    /** Record a pledge (before opening Buy Me a Coffee). It shows on the line immediately as "in review". */
    async pledge({ amount, currency, pick }) {
      const eur = community.toEur(amount, currency);
      const p = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        amount: Number(amount), currency, eur: Math.round(eur * 100) / 100,
        points: community.pointsFor(amount, currency),
        coupon: eur >= C().ALL_SKINS_EUR ? 'all' : eur >= C().PICK_ONE_EUR ? 'one' : '',
        pick: eur >= C().PICK_ONE_EUR && eur < C().ALL_SKINS_EUR ? pick || null : null,
        at: Date.now(),
      };
      const pledges = await community.pledges();
      pledges.push(p);
      await local.set({ wmPledges: pledges.slice(-30) });
      await send({ type: 'wm:event', event: { type: 'pledge', amount: p.amount, currency, eur: p.eur, points: p.points, coupon: p.coupon === 'one' && p.pick ? `one: ${p.pick}` : p.coupon } });
      return p;
    },

    /** Feedback goes to the "Feedback" tab of the sheet (queued like every event, so nothing is lost offline). */
    async feedback({ rating, text, skin }) {
      const clean = String(text || '').trim().slice(0, 2000);
      if (!clean && !rating) return false;
      await send({ type: 'wm:event', event: { type: 'feedback', rating: rating || '', text: clean, skin: skin || '', version: chrome.runtime.getManifest().version, page: location.hostname === 'www.wattpad.com' ? location.pathname.split('/')[1] || 'home' : 'popup' } });
      return true;
    },

    async openDonate() {
      await send({ type: 'wm:open', url: C().DONATE_URL });
    },

    /** Skins newly unlocked since last time (for the celebration). The first call just records the baseline. */
    async newlyUnlocked(snap) {
      const { wmSeen } = await local.get('wmSeen');
      const now = snap.skins.filter((s) => s.unlocked).map((s) => ({ id: s.id, mine: s.mine && !s.global }));
      if (!wmSeen) {
        await local.set({ wmSeen: now.map((s) => s.id) });
        return [];
      }
      return now.filter((s) => !wmSeen.includes(s.id));
    },
    async markSeen(ids) {
      const { wmSeen = [] } = await local.get('wmSeen');
      await local.set({ wmSeen: [...new Set([...wmSeen, ...ids])] });
    },

    onChange(cb) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'local' && (changes.wmState || changes.wmPledges)) || (area === 'sync' && changes.wmUnlocks)) cb();
      });
    },
  };

  IV.community = community;
})();
