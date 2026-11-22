/*
 * WattMood skin kit — shared ambient effects and opening animations, so a book skin is mostly data.
 *
 *   WattMood.makeSkin({ id, name, inspiredBy, moods, fonts, emblem, ambient: { type, ...opts }, opening: { type } , ... })
 *
 * Ambient effects are slow, kept toward the edges, and never sweep across the reading column.
 * Openings cover the screen 100% at `swapAt` (the moment the page is re-skinned underneath).
 * All classes/keyframes use the "wk-" prefix.
 */
(() => {
  const IV = (globalThis.WattMood = globalThis.WattMood || {});
  const f = (n, d = 1) => Number(n).toFixed(d);

  /** Positions biased to the left/right edges (the text column stays calm). */
  const edgeX = (rand, w) => {
    const side = rand() < 0.5 ? 0 : 1;
    const band = Math.max(80, (w - Math.min(w, 760)) / 2 + 40);
    return side === 0 ? rand() * band : w - rand() * band;
  };

  const AMBIENT = {
    /** Floating motes (dust, fireflies). */
    dust({ w, h, rand }, o = {}) {
      const n = o.count || 22;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), y = rand() * h, r = 0.6 + rand() * (o.size || 1.8);
        const dur = 18 + rand() * 26, delay = -rand() * dur;
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r, 2)}" class="wk-mote" style="--dx:${f((rand() - 0.5) * 90, 0)}px;--dy:${f(-(50 + rand() * 150), 0)}px;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Rain streaks + drops sliding down the glass at the edges. */
    rain({ w, h, rand }, o = {}) {
      const n = o.count || 30;
      const streaks = Array.from({ length: n }, () => {
        const x = edgeX(rand, w), len = 14 + rand() * 26, dur = 0.9 + rand() * 1.1, delay = -rand() * dur * 4;
        return `<line x1="${f(x)}" y1="${f(-40)}" x2="${f(x - len * 0.18)}" y2="${f(-40 + len)}" class="wk-rain" style="--fall:${f(h + 80, 0)}px;animation-duration:${f(dur, 2)}s;animation-delay:${f(delay, 2)}s"/>`;
      });
      const drops = Array.from({ length: Math.round(n / 3) }, () => {
        const x = edgeX(rand, w), y = rand() * h * 0.6, dur = 9 + rand() * 12, delay = -rand() * dur;
        return `<g class="wk-drop" style="--slide:${f(h * (0.25 + rand() * 0.4), 0)}px;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(1.6 + rand() * 2.2)}" ry="${f(2.4 + rand() * 3)}"/></g>`;
      });
      return streaks.join('') + drops.join('');
    },
    /** Falling petals / leaves. */
    petals({ w, h, rand }, o = {}) {
      const n = o.count || 16;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), s = 5 + rand() * 7, dur = 16 + rand() * 18, delay = -rand() * dur;
        return `<path d="M0 0 C ${f(s)} ${f(-s * 0.6)} ${f(s * 1.6)} ${f(s * 0.6)} 0 ${f(s * 1.4)} C ${f(-s * 0.6)} ${f(s * 0.6)} ${f(-s * 0.3)} ${f(-s * 0.2)} 0 0 Z" class="wk-petal" style="--x:${f(x, 0)}px;--fall:${f(h + 60, 0)}px;--sway:${f((rand() - 0.5) * 160, 0)}px;--rot:${f(180 + rand() * 360, 0)}deg;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Rising sparks. */
    embers({ w, h, rand }, o = {}) {
      const n = o.count || 26;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), r = 0.8 + rand() * 1.8, dur = 9 + rand() * 12, delay = -rand() * dur;
        return `<circle cx="${f(x)}" cy="${f(h + 10)}" r="${f(r, 2)}" class="wk-ember" style="--rise:${f(-(h * (0.5 + rand() * 0.6)), 0)}px;--dx:${f((rand() - 0.5) * 120, 0)}px;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Soft out-of-focus lights (streetlights, string lights, neon). */
    bokeh({ w, h, rand }, o = {}) {
      const n = o.count || 12;
      return Array.from({ length: n }, (_, i) => {
        const x = edgeX(rand, w), y = rand() * h, r = 14 + rand() * (o.size || 38), dur = 7 + rand() * 9, delay = -rand() * dur;
        const cls = i % 2 ? 'wk-bokeh b' : 'wk-bokeh';
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" class="${cls}" style="animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Slow drifting smoke / mist. */
    smoke({ w, h, rand }, o = {}) {
      const n = o.count || 7;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), y = h * (0.35 + rand() * 0.75), rx = 90 + rand() * 160, ry = 40 + rand() * 70, dur = 26 + rand() * 24, delay = -rand() * dur;
        return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" class="wk-smoke" style="--dx:${f((rand() - 0.5) * 140, 0)}px;--dy:${f(-(60 + rand() * 140), 0)}px;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Tiny floating hearts. */
    hearts({ w, h, rand }, o = {}) {
      const n = o.count || 14;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), y = h * (0.5 + rand() * 0.6), s = 0.5 + rand() * 0.8, dur = 14 + rand() * 16, delay = -rand() * dur;
        return `<path d="M0 3 C -6 -3 -12 3 0 12 C 12 3 6 -3 0 3 Z" class="wk-heart" transform="translate(${f(x)} ${f(y)}) scale(${f(s, 2)})" style="--rise:${f(-(h * 0.5), 0)}px;animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
    /** Twinkling stars. */
    stars({ w, h, rand }, o = {}) {
      const n = o.count || 40;
      return Array.from({ length: n }, () => {
        const x = edgeX(rand, w), y = rand() * h * 0.8, r = 0.5 + rand() * 1.3, dur = 3 + rand() * 6, delay = -rand() * dur;
        return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r, 2)}" class="wk-star" style="animation-duration:${f(dur)}s;animation-delay:${f(delay)}s"/>`;
      }).join('');
    },
  };

  const AMBIENT_CSS = `
    .wk-mote { fill: var(--iv-accent2); opacity: 0; animation: wk-drift linear infinite; }
    @keyframes wk-drift { 0% { opacity: 0; transform: translate(0,0); } 20%,70% { opacity: .6; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
    .wk-rain { stroke: var(--iv-accent2); stroke-width: 1; stroke-linecap: round; opacity: .22; animation: wk-fall linear infinite; }
    @keyframes wk-fall { to { transform: translateY(var(--fall)); } }
    .wk-drop { fill: var(--iv-accent2); opacity: .18; animation: wk-slide ease-in infinite; }
    @keyframes wk-slide { 0%, 60% { transform: translateY(0); opacity: .18; } 100% { transform: translateY(var(--slide)); opacity: 0; } }
    .wk-petal { fill: var(--iv-accent); opacity: .5; offset-path: none; animation: wk-petal linear infinite; }
    @keyframes wk-petal { 0% { transform: translate(var(--x), -30px) rotate(0); opacity: 0; } 10%, 80% { opacity: .55; } 100% { transform: translate(calc(var(--x) + var(--sway)), var(--fall)) rotate(var(--rot)); opacity: 0; } }
    .wk-ember { fill: var(--iv-accent); opacity: 0; animation: wk-rise ease-out infinite; filter: drop-shadow(0 0 3px var(--iv-accent)); }
    @keyframes wk-rise { 0% { transform: translate(0,0); opacity: 0; } 15% { opacity: .85; } 100% { transform: translate(var(--dx), var(--rise)); opacity: 0; } }
    .wk-bokeh { fill: var(--iv-accent2); opacity: .05; animation: wk-glow ease-in-out infinite alternate; }
    .wk-bokeh.b { fill: var(--iv-accent); }
    @keyframes wk-glow { from { opacity: .03; } to { opacity: .13; } }
    .wk-smoke { fill: var(--iv-muted); opacity: 0; filter: blur(30px); animation: wk-smoke ease-in-out infinite; }
    @keyframes wk-smoke { 0% { transform: translate(0,0); opacity: 0; } 40% { opacity: .1; } 100% { transform: translate(var(--dx), var(--dy)); opacity: 0; } }
    .wk-heart { fill: var(--iv-accent); opacity: 0; animation: wk-heart ease-in-out infinite; }
    @keyframes wk-heart { 0% { translate: 0 0; opacity: 0; } 20%, 70% { opacity: .35; } 100% { translate: 0 var(--rise); opacity: 0; } }
    .wk-star { fill: var(--iv-accent2); animation: wk-twinkle ease-in-out infinite alternate; }
    @keyframes wk-twinkle { from { opacity: .1; } to { opacity: .7; } }
  `;

  function ambientSvg(def) {
    return ({ w, h, rand, mood }) => {
      const dark = mood === 'midnight';
      const a = def.ambient || { type: 'dust' };
      const fn = AMBIENT[a.type] || AMBIENT.dust;
      const glowA = dark ? 0.14 : 0.08;
      return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <defs>
    <radialGradient id="wk-g1" cx="0%" cy="100%" r="70%"><stop offset="0" style="stop-color:var(--iv-accent);stop-opacity:${glowA}"/><stop offset="1" style="stop-color:var(--iv-accent);stop-opacity:0"/></radialGradient>
    <radialGradient id="wk-g2" cx="100%" cy="0%" r="65%"><stop offset="0" style="stop-color:var(--iv-accent2);stop-opacity:${glowA * 0.9}"/><stop offset="1" style="stop-color:var(--iv-accent2);stop-opacity:0"/></radialGradient>
  </defs>
  <style>${AMBIENT_CSS}</style>
  <rect width="${w}" height="${h}" fill="url(#wk-g1)"/><rect width="${w}" height="${h}" fill="url(#wk-g2)"/>
  ${a.watermark && def.emblem ? `<svg x="${f(w - Math.min(w, h) * 0.42)}" y="${f(h * 0.5 - Math.min(w, h) * 0.3)}" width="${f(Math.min(w, h) * 0.6)}" height="${f(Math.min(w, h) * 0.6)}" viewBox="0 0 100 100" style="color:var(--iv-accent2);opacity:${dark ? 0.06 : 0.08};overflow:visible">${def.emblem.replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg>` : ''}
  ${fn({ w, h, rand }, a)}
  ${a.extra ? AMBIENT[a.extra]({ w, h, rand }, { count: 10 }) : ''}
</svg>`;
    };
  }

  /* ------------------------------------------------------------------ */
  /* Openings (the "Unveiling" when you put a skin on)                   */
  /* ------------------------------------------------------------------ */
  const emblemAt = (emblem, x, y, size, cls) =>
    `<svg x="${f(x - size / 2)}" y="${f(y - size / 2)}" width="${f(size)}" height="${f(size)}" viewBox="0 0 100 100" class="${cls}" style="overflow:visible">${emblem.replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg>`;

  const OPENINGS = {
    /** A circle of night closes in, the emblem glows, then the circle opens on the new skin. */
    iris: { duration: 2000, swapAt: 900, render({ w, h, edition }) {
      const R = Math.hypot(w, h) / 2 + 20, cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.26;
      return `<svg viewBox="0 0 ${w} ${h}"><style>
        .wk-o-ring { fill: var(--iv-bg); transform-origin: ${cx}px ${cy}px; transform: scale(0); animation: wk-iris 2s cubic-bezier(.7,0,.2,1) forwards; }
        @keyframes wk-iris { 0% { transform: scale(0); } 42%, 58% { transform: scale(1); } 100% { transform: scale(0); } }
        .wk-o-em { color: var(--iv-accent2); opacity: 0; transform-origin: ${cx}px ${cy}px; animation: wk-em 2s ease forwards; filter: drop-shadow(0 0 18px var(--iv-accent)); }
        @keyframes wk-em { 0%, 22% { opacity: 0; transform: scale(.7); } 40%, 58% { opacity: 1; transform: scale(1); } 76%, 100% { opacity: 0; transform: scale(1.25); } }
      </style><circle class="wk-o-ring" cx="${cx}" cy="${cy}" r="${f(R)}"/>${emblemAt(edition.emblem || '', cx, cy, S, 'wk-o-em')}</svg>`;
    } },
    /** Two curtains close, emblem in the seam, curtains open. */
    curtain: { duration: 2200, swapAt: 1000, render({ w, h, edition }) {
      const S = Math.min(w, h) * 0.24;
      return `<svg viewBox="0 0 ${w} ${h}"><style>
        .wk-c { fill: var(--iv-bg); animation: 2.2s cubic-bezier(.7,0,.2,1) forwards; }
        .wk-cl { animation-name: wk-cl; } .wk-cr { animation-name: wk-cr; }
        @keyframes wk-cl { 0% { transform: translateX(-101%); } 40%, 60% { transform: translateX(0); } 100% { transform: translateX(-101%); } }
        @keyframes wk-cr { 0% { transform: translateX(101%); } 40%, 60% { transform: translateX(0); } 100% { transform: translateX(101%); } }
        .wk-seam { stroke: var(--iv-accent); stroke-width: 2; opacity: 0; animation: wk-seam 2.2s ease forwards; }
        @keyframes wk-seam { 0%, 36% { opacity: 0; } 44%, 58% { opacity: .9; } 64%, 100% { opacity: 0; } }
        .wk-o-em { color: var(--iv-accent2); opacity: 0; animation: wk-seam 2.2s ease forwards; filter: drop-shadow(0 0 16px var(--iv-accent)); }
      </style><rect class="wk-c wk-cl" x="0" y="0" width="${f(w / 2 + 1)}" height="${h}"/><rect class="wk-c wk-cr" x="${f(w / 2)}" y="0" width="${f(w / 2 + 1)}" height="${h}"/>
      <line class="wk-seam" x1="${w / 2}" y1="0" x2="${w / 2}" y2="${h}"/>${emblemAt(edition.emblem || '', w / 2, h / 2, S, 'wk-o-em')}</svg>`;
    } },
    /** Petals/sparks burst from the emblem and flood the screen, then clear. */
    bloom: { duration: 2300, swapAt: 1050, render({ w, h, rand, edition }) {
      const cx = w / 2, cy = h / 2, S = Math.min(w, h) * 0.24, R = Math.hypot(w, h) / 2 + 30;
      const bits = Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2 + rand() * 0.3, d = Math.min(w, h) * (0.25 + rand() * 0.35);
        return `<circle cx="${cx}" cy="${cy}" r="${f(3 + rand() * 6)}" class="wk-bit${i % 2 ? ' b' : ''}" style="--tx:${f(Math.cos(a) * d, 0)}px;--ty:${f(Math.sin(a) * d, 0)}px"/>`;
      }).join('');
      return `<svg viewBox="0 0 ${w} ${h}"><style>
        .wk-fill { fill: var(--iv-bg); transform-origin: ${cx}px ${cy}px; transform: scale(0); animation: wk-fill 2.3s cubic-bezier(.6,0,.25,1) forwards; }
        @keyframes wk-fill { 0%, 15% { transform: scale(0); } 44%, 56% { transform: scale(1); } 100% { transform: scale(1); opacity: 0; } }
        .wk-bit { fill: var(--iv-accent); opacity: 0; animation: wk-bit 1.4s cubic-bezier(.2,.7,.3,1) .1s forwards; } .wk-bit.b { fill: var(--iv-accent2); }
        @keyframes wk-bit { 0% { opacity: 1; transform: translate(0,0); } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)); } }
        .wk-o-em { color: var(--iv-accent2); opacity: 0; transform-origin: ${cx}px ${cy}px; animation: wk-em 2.3s ease forwards; filter: drop-shadow(0 0 18px var(--iv-accent)); }
        @keyframes wk-em { 0% { opacity: 0; transform: scale(.4); } 20%, 58% { opacity: 1; transform: scale(1); } 80%, 100% { opacity: 0; transform: scale(1.2); } }
      </style><circle class="wk-fill" cx="${cx}" cy="${cy}" r="${f(R)}"/>${bits}${emblemAt(edition.emblem || '', cx, cy, S, 'wk-o-em')}</svg>`;
    } },
    /** Lights out, the emblem flickers on like a neon sign, lights up on the new skin. */
    flicker: { duration: 2100, swapAt: 900, render({ w, h, edition }) {
      const S = Math.min(w, h) * 0.28;
      return `<svg viewBox="0 0 ${w} ${h}"><style>
        .wk-dark { fill: var(--iv-bg); opacity: 0; animation: wk-dark 2.1s ease forwards; }
        @keyframes wk-dark { 0% { opacity: 0; } 18%, 70% { opacity: 1; } 100% { opacity: 0; } }
        .wk-o-em { color: var(--iv-accent); opacity: 0; animation: wk-neon 2.1s steps(1) forwards; filter: drop-shadow(0 0 10px var(--iv-accent)) drop-shadow(0 0 26px var(--iv-accent)); }
        @keyframes wk-neon { 0%, 20% { opacity: 0; } 24% { opacity: 1; } 27% { opacity: .2; } 31% { opacity: 1; } 34% { opacity: .1; } 38%, 66% { opacity: 1; } 76%, 100% { opacity: 0; } }
      </style><rect class="wk-dark" width="${w}" height="${h}"/>${emblemAt(edition.emblem || '', w / 2, h / 2, S, 'wk-o-em')}</svg>`;
    } },
  };

  /** Divider: thin lines with the skin's small glyph in the middle. */
  function divider(glyph) {
    return `<svg viewBox="0 0 240 20" fill="currentColor">
  <path d="M0 10 L100 9.4 L100 10.6 Z" opacity=".55"/><path d="M240 10 L140 9.4 L140 10.6 Z" opacity=".55"/>
  <g transform="translate(110 0) scale(.2)" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${glyph || '<path d="M50 15 L80 50 L50 85 L20 50 Z"/>'}</g>
</svg>`;
  }

  IV.kit = { AMBIENT, OPENINGS };

  /** Build a full skin object from a compact definition and register it. */
  IV.makeSkin = (def) => {
    const skin = {
      tier: 'premium',
      layout: { align: 'left', paragraph: 'spaced', dropCap: true, reveal: 'fade', ...(def.layout || {}) },
      ...def,
      divider: def.divider || divider(def.glyph),
      atmosphere: ambientSvg(def),
      unveil: OPENINGS[(def.opening && def.opening.type) || 'iris'],
    };
    IV.registerEdition(skin);
    return skin;
  };
})();
