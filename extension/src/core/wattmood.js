/*
 * WattMood core — namespace, Edition registry, settings store, shared helpers.
 * Loaded first in both the content script and the popup.
 */
(() => {
  const IV = (globalThis.WattMood = globalThis.WattMood || {});
  if (IV.__core) return;
  IV.__core = true;
  IV.version = '1.0.0';
  IV.instanceId = `tab-${Math.random().toString(36).slice(2, 10)}`;

  /* ------------------------------------------------------------------ */
  /* Moods — every Edition ships these three palettes.                   */
  /* ------------------------------------------------------------------ */
  IV.MOODS = [
    { id: 'midnight', label: 'Midnight', hint: 'Dark, for night reading' },
    { id: 'daylight', label: 'Daylight', hint: 'Bright and crisp' },
    { id: 'candlelight', label: 'Candlelight', hint: 'Warm paper, easy on the eyes' },
  ];
  // Palette keys every mood must define (see forge/EDITION_FORGE_PROMPT.md).
  IV.PALETTE_KEYS = ['bg', 'surface', 'text', 'muted', 'accent', 'accent2', 'line', 'selection'];

  /* ------------------------------------------------------------------ */
  /* Edition registry                                                    */
  /* ------------------------------------------------------------------ */
  IV.editions = IV.editions || new Map();

  IV.registerEdition = (ed) => {
    const problems = [];
    if (!ed || !/^[a-z0-9-]+$/.test(ed.id || '')) problems.push('id must be kebab-case');
    for (const m of IV.MOODS) {
      const pal = ed.moods && ed.moods[m.id];
      if (!pal) { problems.push(`missing mood "${m.id}"`); continue; }
      for (const k of IV.PALETTE_KEYS) if (!pal[k]) problems.push(`mood ${m.id} missing "${k}"`);
    }
    if (problems.length) {
      console.warn(`[WattMood] Edition "${ed && ed.id}" rejected:`, problems.join('; '));
      return;
    }
    // a skin inspired by a book is shown under the book's title (its creative name stays in ed.theme)
    if (ed.inspiredBy && ed.inspiredBy.title && !ed.theme) {
      ed.theme = ed.name;
      ed.name = ed.inspiredBy.title;
    }
    IV.editions.set(ed.id, ed);
  };

  IV.registerSkin = (sk) => IV.registerEdition(sk);
  IV.getEdition = (id) => IV.editions.get(id) || IV.editions.get('classic') || [...IV.editions.values()][0];

  /** Find an Edition whose `match` keywords appear in a story title. */
  IV.suggestEdition = (storyTitle) => {
    const t = IV.normalize(storyTitle);
    if (!t) return null;
    for (const ed of IV.editions.values()) {
      if ((ed.match || []).some((kw) => t.includes(IV.normalize(kw)))) return ed;
    }
    return null;
  };

  IV.normalize = (s) =>
    String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

  /* ------------------------------------------------------------------ */
  /* Settings                                                            */
  /* ------------------------------------------------------------------ */
  IV.DEFAULTS = {
    enabled: true, // WattMood dresses Wattpad (every page)
    edition: 'classic', // the skin you wear across Wattpad
    autoMatch: true, // on a story with its own (unlocked) skin, wear that one while reading it
    lang: 'auto', // 'auto' (browser) | 'en' | 'es' | 'pt' | 'fr'
    focus: true, // chapters: centred single column
    hideChrome: true, // chapters: Wattpad's top bars slide away while reading
    mood: 'midnight',
    autoMood: false, // Daylight by day, Candlelight at dusk, Midnight at night
    fontScale: 1, // 0.8 – 1.5
    lineHeight: 1.75, // 1.4 – 2.2
    measure: 36, // text column width in em
    atmosphere: 0.7, // 0 – 1 intensity of the animated background
    unveil: true, // play the opening animation when changing skin
    reveal: true, // paragraphs animate in while scrolling
    spotlight: false, // dim everything but the paragraph you're reading
    bubbles: true, // lines that open with speech become speech bubbles
    pointline: true, // community points line (top-left)
  };

  IV.settings = {
    async load() {
      try {
        const { settings } = await chrome.storage.sync.get('settings');
        return { ...IV.DEFAULTS, ...(settings || {}) };
      } catch (e) {
        return { ...IV.DEFAULTS };
      }
    },
    /** Replace the stored settings. `by` tags the writer so it can ignore its own echo. */
    async write(settings, by) {
      try {
        await chrome.storage.sync.set({ settings: { ...settings, _by: by || 'unknown' } });
      } catch (e) { /* extension reloaded — ignore */ }
    },
    async save(patch, by) {
      const next = { ...(await IV.settings.load()), ...patch };
      await IV.settings.write(next, by);
      return next;
    },
    /** cb(newSettings) for changes written by someone other than `self`. */
    onChange(cb, self) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync' || !changes.settings) return;
        const nv = changes.settings.newValue || {};
        if (self && nv._by === self) return;
        cb({ ...IV.DEFAULTS, ...nv });
      });
    },
  };

  /** Reading position per chapter (local storage — sync quota is small). */
  IV.progress = {
    async get(partId) {
      try {
        const { progress = {} } = await chrome.storage.local.get('progress');
        return progress[partId] || null;
      } catch (e) {
        return null;
      }
    },
    async set(partId, value) {
      try {
        const { progress = {} } = await chrome.storage.local.get('progress');
        progress[partId] = { ...value, at: Date.now() };
        // keep the 400 most recent chapters
        const keys = Object.keys(progress);
        if (keys.length > 400) {
          keys.sort((a, b) => progress[a].at - progress[b].at).slice(0, keys.length - 400).forEach((k) => delete progress[k]);
        }
        await chrome.storage.local.set({ progress });
      } catch (e) { /* context invalidated after reload — ignore */ }
    },
  };

  /** Reading journal: words read per day. */
  IV.journal = {
    async add(words) {
      try {
        const day = new Date().toISOString().slice(0, 10);
        const { journal = {} } = await chrome.storage.local.get('journal');
        journal[day] = (journal[day] || 0) + words;
        await chrome.storage.local.set({ journal });
      } catch (e) { /* ignore */ }
    },
    async summary() {
      const { journal = {} } = await chrome.storage.local.get('journal');
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (journal[key]) streak++;
        else if (i > 0) break;
      }
      const week = Object.entries(journal)
        .filter(([k]) => Date.now() - new Date(k).getTime() < 7 * 864e5)
        .reduce((a, [, v]) => a + v, 0);
      return { today: journal[today.toISOString().slice(0, 10)] || 0, week, streak };
    },
  };

  IV.resolveMood = (settings) => {
    if (!settings.autoMood) return settings.mood;
    const h = new Date().getHours();
    if (h >= 7 && h < 17) return 'daylight';
    if (h >= 17 && h < 21) return 'candlelight';
    return 'midnight';
  };

  /** CSS custom properties for an Edition + mood. */
  IV.cssVars = (ed, moodId) => {
    const pal = ed.moods[moodId] || ed.moods.midnight;
    const vars = {};
    for (const [k, v] of Object.entries(pal)) vars[`--iv-${k}`] = v;
    const f = ed.fonts || {};
    vars['--iv-font-body'] = f.body || 'Georgia, serif';
    vars['--iv-font-display'] = f.display || f.body || 'Georgia, serif';
    vars['--iv-font-accent'] = f.accent || f.display || 'Georgia, serif';
    return vars;
  };

  /**
   * Hydration gate. Wattpad's React pages hydrate the whole document: inserting ANY node before that
   * (a <style>, a <link>, a layer) makes React throw "hydration failed". Attributes/classes are fine,
   * so the instant paint uses only those; every insertion waits for IV.hydrated.
   */
  IV.hydrated = typeof document === 'undefined' ? Promise.resolve() : new Promise((resolve) => {
    const done = () => setTimeout(resolve, 400);
    if (document.readyState === 'complete') done();
    else addEventListener('load', done, { once: true });
  });

  IV.loadFonts = (ed, doc = document) => {
    if (!ed.fonts || !ed.fonts.google) return;
    const id = `iv-fonts-${ed.id}`;
    if (doc.getElementById(id)) return;
    const link = doc.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${ed.fonts.google}&display=swap`;
    if (doc !== document) (doc.head || doc.documentElement).appendChild(link);
    else IV.hydrated.then(() => { if (!document.getElementById(id)) (document.head || document.documentElement).appendChild(link); });
  };

  /* Deterministic PRNG so atmospheres look the same across re-renders. */
  IV.rng = (seed = 1) => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  IV.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  IV.reducedMotion = () => globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
