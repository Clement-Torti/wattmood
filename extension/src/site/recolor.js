/*
 * WattMood site-wide skin — a colour pass that works on any Wattpad page (old Bootstrap pages, new React
 * pages with hashed class names, pages that don't exist yet) because it never relies on class names.
 *
 * Each element's ORIGINAL colours are read once and tagged by role:
 *   data-wm-bg = page (near-white, full-width wrapper) | card (near-white) | raised (light grey)
 *              | ink (near-black, e.g. dark buttons) | brand (Wattpad orange)
 *   data-wm-fg = text (dark) | muted (grey) | brand (orange)
 *   data-wm-b  = has a light neutral border
 * site.css maps those roles to the active skin's palette. Tags are inert unless <html> has .iv-on.
 */
(() => {
  const IV = globalThis.WattMood;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'IFRAME', 'svg', 'SVG', 'path', 'BR', 'HR', 'SOURCE', 'TEMPLATE']);
  const CHUNK = 1200;

  function parse(c) {
    const m = c && c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function hsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
    if (max === min) return { h: 0, s: 0, l };
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
  }
  const isBrand = (c) => { const x = hsl(c); return x.s > 0.55 && x.l > 0.35 && x.l < 0.72 && (x.h <= 30 || x.h >= 350); };

  function classify(el, vw) {
    const cs = getComputedStyle(el);
    const out = {};
    const bg = parse(cs.backgroundColor);
    if (bg && bg.a >= 0.6) {
      const x = hsl(bg);
      if (x.l >= 0.9 && !isBrand(bg)) {
        // very light tints (white, cream, Wattpad's peach) are backgrounds whatever their hue
        const r = el.getBoundingClientRect();
        out.bg = r.width >= vw * 0.85 && r.height >= 160 ? 'page' : 'card';
      } else if (x.s < 0.2) {
        if (x.l >= 0.86) {
          const r = el.getBoundingClientRect();
          out.bg = r.width >= vw * 0.85 && r.height >= 160 ? 'page' : 'card';
        } else if (x.l >= 0.6) out.bg = 'raised';
        else if (x.l <= 0.22) out.bg = 'ink';
      } else if (isBrand(bg)) out.bg = 'brand';
    }
    const fg = parse(cs.color);
    if (fg && fg.a > 0.3) {
      const x = hsl(fg);
      if (x.s < 0.25) {
        if (x.l < 0.3) out.fg = 'text';
        else if (x.l < 0.68) out.fg = 'muted';
      } else if (isBrand(fg)) out.fg = 'brand';
    }
    if (parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth) + parseFloat(cs.borderLeftWidth) > 0) {
      const bc = parse(cs.borderTopColor) || parse(cs.borderLeftColor);
      if (bc && bc.a > 0.1 && hsl(bc).s < 0.2 && hsl(bc).l > 0.6) out.b = true;
    }
    return out;
  }

  let queue = [];
  let scheduled = false;
  let running = false;

  function collect(root) {
    if (!root || root.nodeType !== 1) return;
    if (root.closest && root.closest('#wattmood-ui, .iv-ins, .iv-atmo')) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode(n) {
        if (SKIP.has(n.tagName) || n.id === 'wattmood-ui' || n.classList.contains('iv-atmo') || n.classList.contains('iv-ins')) return NodeFilter.FILTER_REJECT;
        return n.dataset.wmC ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT;
      },
    });
    if (!root.dataset.wmC && !SKIP.has(root.tagName)) queue.push(root);
    while (walker.nextNode()) queue.push(walker.currentNode);
    schedule();
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(process);
  }

  /** Measure original colours: drop the skin for a synchronous moment (no frame is painted in between). */
  function process() {
    scheduled = false;
    if (!queue.length) return;
    const batch = queue.splice(0, CHUNK);
    const html = document.documentElement;
    const wasOn = html.classList.contains('iv-on');
    if (wasOn) html.classList.remove('iv-on');
    const vw = html.clientWidth || innerWidth;
    const results = [];
    for (const el of batch) {
      if (!el.isConnected || el.dataset.wmC) continue;
      results.push([el, classify(el, vw)]);
    }
    if (wasOn) html.classList.add('iv-on');
    for (const [el, r] of results) {
      el.dataset.wmC = '1';
      if (r.bg) el.dataset.wmBg = r.bg;
      if (r.fg) el.dataset.wmFg = r.fg;
      if (r.b) el.dataset.wmB = '';
    }
    if (queue.length) schedule();
  }

  /** Class changes made by WattMood itself (iv-*, is-*, wm-*) don't need a new measurement. */
  function ownChange(rec) {
    const before = new Set((rec.oldValue || '').split(/\s+/).filter(Boolean));
    const after = new Set((rec.target.getAttribute('class') || '').split(/\s+/).filter(Boolean));
    const diff = [...before].filter((c) => !after.has(c)).concat([...after].filter((c) => !before.has(c)));
    return diff.every((c) => /^(iv-|is-|wm-)/.test(c));
  }

  let mo = null;
  IV.recolor = {
    start() {
      if (running) return;
      running = true;
      collect(document.body);
      mo = new MutationObserver((records) => {
        for (const rec of records) {
          if (rec.type === 'childList') rec.addedNodes.forEach((n) => n.nodeType === 1 && collect(n));
          else if (rec.type === 'attributes' && rec.target.dataset && rec.target.dataset.wmC && rec.attributeName === 'class' && !ownChange(rec)) {
            // a component changed state (e.g. selected tab) → measure it again
            const el = rec.target;
            delete el.dataset.wmC; delete el.dataset.wmBg; delete el.dataset.wmFg; delete el.dataset.wmB;
            queue.push(el);
            schedule();
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
    },
    stop() {
      running = false;
      mo && mo.disconnect();
      queue = [];
    },
  };
})();
