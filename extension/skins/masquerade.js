/*
 * Masquerade — Collector's Edition inspired by "Perfectos Mentirosos" (Alex Mírez).
 *
 * Design brief (see forge/briefs/masquerade.md):
 *   An elite academy where everyone wears a mask and every truth is a weapon.
 *   Motifs: the Venetian mask, glass that cracks when a lie breaks, crimson
 *   (danger, desire) against antique gold (privilege), censored lines that
 *   slide away like secrets being exposed.
 *   Original artwork only — no cover art, logos or quotations from the books.
 */
(() => {
  const IV = globalThis.WattMood;

  /* A Venetian mask with a crimson fracture down the middle. viewBox 0 0 100 100 */
  const MASK_PATH =
    'M8 42 C 16 30, 34 27, 50 36 C 66 27, 84 30, 92 42 C 90 58, 78 68, 65 66 C 57 64, 53 58, 50 53 C 47 58, 43 64, 35 66 C 22 68, 10 58, 8 42 Z';
  const EYE_L = 'M22 45 C 28 39, 37 40, 42 46 C 36 51, 28 51, 22 45 Z';
  const EYE_R = 'M78 45 C 72 39, 63 40, 58 46 C 64 51, 72 51, 78 45 Z';
  const CRACK = 'M51 14 L48 26 L53 33 L47.5 44 L52 52 L48.5 61 L51.5 70 L49 86';

  const emblem = `
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <g class="mq-ring"><circle cx="50" cy="50" r="47" stroke-dasharray="2 4" opacity=".5"/></g>
  <circle cx="50" cy="50" r="42" opacity=".35"/>
  <path d="${MASK_PATH} ${EYE_L} ${EYE_R}" fill-rule="evenodd" style="fill:currentColor;fill-opacity:.14"/>
  <path d="M30 31 C 34 22, 40 18, 44 17 M70 31 C 66 22, 60 18, 56 17" opacity=".7"/>
  <path d="${CRACK}" style="stroke:var(--iv-accent)" stroke-width="1.8"/>
</svg>`;

  const divider = `
<svg viewBox="0 0 240 20" fill="currentColor">
  <path d="M0 10 L100 9.3 L100 10.7 Z" opacity=".6"/>
  <path d="M240 10 L140 9.3 L140 10.7 Z" opacity=".6"/>
  <circle cx="106" cy="10" r="1.3"/><circle cx="134" cy="10" r="1.3"/>
  <path d="M120 2 L128 10 L120 18 L112 10 Z" fill="none" stroke="currentColor" stroke-width="1.1"/>
  <path d="M120 6 L124 10 L120 14 L116 10 Z" style="fill:var(--iv-accent)"/>
</svg>`;

  /* Random jagged crack polyline from (x,y) heading in direction a. */
  function crackPath(rand, x, y, a, len, steps) {
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    for (let i = 0; i < steps; i++) {
      a += (rand() - 0.5) * 0.9;
      const l = (len / steps) * (0.6 + rand() * 0.8);
      x += Math.cos(a) * l;
      y += Math.sin(a) * l;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  }

  IV.registerEdition({
    id: 'masquerade',
    name: 'Masquerade',
    tagline: 'Everyone wears a mask. Every page hides a lie.',
    inspiredBy: { title: 'Perfectos Mentirosos', author: 'Alex Mírez' },
    tier: 'premium',
    match: ['perfectos mentirosos', 'perfect liars', 'perfectos peligros', 'perfectos secretos'],
    fonts: {
      google: 'family=Cinzel:wght@400;600&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital@1',
      display: "'Cinzel', 'Trajan Pro', Georgia, serif",
      body: "'Crimson Pro', Georgia, serif",
      accent: "'Playfair Display', Georgia, serif",
    },
    moodLabels: { midnight: 'Gala', daylight: 'Campus', candlelight: 'Candelabra' },
    moods: {
      midnight: { bg: '#0b090a', surface: '#151012', text: '#e9e0d4', muted: '#978a7c', accent: '#c8203d', accent2: '#c9a45c', line: 'rgba(201,164,92,.18)', selection: 'rgba(200,32,61,.38)', redact: '#5c0f1d' },
      daylight: { bg: '#f6f2eb', surface: '#fffdf9', text: '#1c1517', muted: '#6f6460', accent: '#a3122b', accent2: '#9b7430', line: 'rgba(28,21,23,.12)', selection: 'rgba(163,18,43,.18)', redact: '#1c1517' },
      candlelight: { bg: '#ecdfc4', surface: '#f3e8d0', text: '#2b1d17', muted: '#6e5a48', accent: '#8f1a26', accent2: '#86601f', line: 'rgba(43,29,23,.16)', selection: 'rgba(143,26,38,.2)', redact: '#2b1d17' },
    },
    layout: {
      align: 'justify',
      paragraph: 'indent',
      dropCap: true,
      reveal: 'redact',
      numerals: 'roman',
      chapterLabel: { english: 'Chapter', espanol: 'Capítulo', español: 'Capítulo' },
    },
    /* Words that get the "secret" treatment in the text. */
    motifs: '\\b(mentiras?|mentiros[oa]s?|mient[eo]n?|secretos?|verdad(?:es)?|máscaras?|lies?|liars?|lying|secrets?|truths?|masks?)\\b',
    emblem,
    divider,
    finText: 'Todos mienten. To be continued…',
    /* Scoped automatically to html.iv-on (CSS nesting): `&` is <html>. Use !important on Wattpad's own elements. */
    css: `
      .iv-title { font-size: 1.9em !important; text-transform: uppercase; letter-spacing: .07em !important; }
      .iv-title.is-numeral { font-size: 3.2em !important; }
      .iv-kicker { letter-spacing: .5em; }
      .iv-seal { filter: drop-shadow(0 0 22px color-mix(in srgb, var(--iv-accent) 35%, transparent)); }
      .iv-seal .mq-ring { transform-origin: 50px 50px; animation: mq-spin 80s linear infinite; }
      @keyframes mq-spin { to { transform: rotate(360deg); } }
      .iv-p :is(i, em) { font-family: var(--iv-font-accent); font-size: .96em; color: color-mix(in srgb, var(--iv-accent2) 65%, var(--iv-text)); }
      &.iv-dropcap .iv-p.iv-first::first-letter { font-size: 3.4em; color: var(--iv-accent); text-shadow: 0 0 24px color-mix(in srgb, var(--iv-accent) 40%, transparent); }
      .iv-q { color: var(--iv-accent); }
      &[data-mood="midnight"] .iv-say { color: #f4e7d2; }
      &:not([data-mood="midnight"]) .iv-say { color: color-mix(in srgb, var(--iv-text) 82%, var(--iv-accent)); }
      .iv-motif { background: linear-gradient(var(--iv-accent), var(--iv-accent)) 0 92% / 100% 1px no-repeat; }
      .iv-p.is-in .iv-motif { animation: mq-flicker 1.4s steps(1) .9s 1 both; }
      @keyframes mq-flicker { 0% { color: var(--iv-accent); } 8% { color: inherit; } 14% { color: var(--iv-accent); } 22%,100% { color: inherit; } }
      &[data-mood="midnight"] .iv-next a { background: linear-gradient(135deg, #1c1315, #120d0f) !important; }
      .iv-fin { font-family: var(--iv-font-accent); color: var(--iv-accent); }
      .iv-meta { font-family: var(--iv-font-accent); }
    `,

    /* Atmosphere: gala lights, drifting gold dust, cracks in the glass, a watching mask. */
    atmosphere({ w, h, rand, mood }) {
      const dark = mood === 'midnight';
      const dust = Array.from({ length: dark ? 26 : 18 }, () => {
        const x = rand() * w, y = rand() * h, r = 0.5 + rand() * 1.7;
        const dur = 18 + rand() * 30, delay = -rand() * dur;
        const dx = (rand() - 0.5) * 120, dy = -(60 + rand() * 180);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" class="mq-dust" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"/>`;
      }).join('');

      // fractured glass in two corners
      const cracks = [];
      const corner = (cx, cy, base) => {
        for (let i = 0; i < 4; i++) {
          const a = base + (rand() - 0.5) * 1.3;
          const d = crackPath(rand, cx, cy, a, 160 + rand() * 260, 9);
          const delay = (1.5 + rand() * 4).toFixed(2);
          cracks.push(`<path d="${d}" class="mq-crack" style="animation-delay:${delay}s"/>`);
          const bx = cx + Math.cos(a) * 90, by = cy + Math.sin(a) * 90;
          cracks.push(`<path d="${crackPath(rand, bx, by, a + (rand() - 0.5) * 2, 60 + rand() * 90, 5)}" class="mq-crack thin" style="animation-delay:${(+delay + 1).toFixed(2)}s"/>`);
        }
      };
      corner(w + 4, -4, Math.PI * 0.75);
      corner(-4, h + 4, -Math.PI * 0.25);

      const mS = Math.min(w, h) * 0.62;
      return `
<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <defs>
    <radialGradient id="mq-red" cx="0%" cy="100%" r="70%"><stop offset="0" style="stop-color:var(--iv-accent);stop-opacity:${dark ? 0.16 : 0.07}"/><stop offset="1" style="stop-color:var(--iv-accent);stop-opacity:0"/></radialGradient>
    <radialGradient id="mq-gold" cx="100%" cy="0%" r="65%"><stop offset="0" style="stop-color:var(--iv-accent2);stop-opacity:${dark ? 0.13 : 0.09}"/><stop offset="1" style="stop-color:var(--iv-accent2);stop-opacity:0"/></radialGradient>
  </defs>
  <style>
    .mq-dust { fill: var(--iv-accent2); opacity: 0; animation: mq-drift linear infinite; }
    @keyframes mq-drift { 0% { opacity: 0; transform: translate(0,0); } 15% { opacity: .8; } 50% { opacity: .25; } 70% { opacity: .7; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
    .mq-crack { fill: none; stroke: var(--iv-accent2); stroke-width: .9; opacity: .3; stroke-dasharray: 600; stroke-dashoffset: 600; animation: mq-draw 2.4s cubic-bezier(.6,0,.2,1) forwards, mq-shine 9s ease-in-out 4s infinite; }
    .mq-crack.thin { stroke-width: .5; opacity: .22; }
    @keyframes mq-draw { to { stroke-dashoffset: 0; } }
    @keyframes mq-shine { 50% { stroke: var(--iv-accent); } }
    .mq-watch { transform-box: fill-box; transform-origin: center; animation: mq-breathe 14s ease-in-out infinite; }
    @keyframes mq-breathe { 50% { transform: scale(1.035) rotate(-1deg); opacity: .8; } }
  </style>
  <rect width="${w}" height="${h}" fill="url(#mq-red)"/>
  <rect width="${w}" height="${h}" fill="url(#mq-gold)"/>
  <g class="mq-watch" opacity=".55">
    <svg x="${w - mS * 0.62}" y="${h * 0.5 - mS / 2}" width="${mS}" height="${mS}" viewBox="0 0 100 100" style="overflow:visible">
      <path d="${MASK_PATH} ${EYE_L} ${EYE_R}" fill-rule="evenodd" fill="none" style="stroke:var(--iv-accent2);stroke-opacity:${dark ? 0.09 : 0.11}" stroke-width=".5" transform="rotate(-14 50 50)"/>
    </svg>
  </g>
  ${cracks.join('')}
  ${dust}
</svg>`;
    },

    /*
     * Unveiling (2.7s): darkness falls → a gold mask is drawn → its eyes ignite →
     * a crimson fracture splits the screen → both halves fall away with gold shards.
     */
    unveil: {
      duration: 2700,
      swapAt: 1350,
      render({ w, h, rand }) {
        const cx = w / 2, cy = h / 2;
        const S = Math.min(w, h) * 0.42; // mask size
        const mx = cx - S / 2, my = cy - S / 2;

        // the fracture: jagged line top→bottom through the centre
        const pts = [];
        const n = 14;
        for (let i = 0; i <= n; i++) {
          const y = (h / n) * i;
          const j = i === 0 || i === n ? 0 : (rand() - 0.5) * Math.min(90, w * 0.08);
          pts.push([cx + j, y]);
        }
        const crackD = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        const leftPoly = [[-10, -10], ...pts, [-10, h + 10]].map((p) => p.join(',')).join(' ');
        const rightPoly = [[w + 10, -10], ...pts, [w + 10, h + 10]].map((p) => p.join(',')).join(' ');

        const shards = Array.from({ length: 22 }, () => {
          const a = rand() * Math.PI * 2, dist = 140 + rand() * Math.max(w, h) * 0.45;
          const s = 6 + rand() * 18;
          const tx = Math.cos(a) * dist, ty = Math.sin(a) * dist + 120;
          const rot = (rand() - 0.5) * 540;
          const y0 = cy + (rand() - 0.5) * h * 0.7;
          return `<polygon points="0,${-s} ${s * 0.6},${s * 0.5} ${-s * 0.5},${s * 0.4}" class="mq-shard" style="--x0:${cx.toFixed(0)}px;--y0:${y0.toFixed(0)}px;--tx:${tx.toFixed(0)}px;--ty:${ty.toFixed(0)}px;--r:${rot.toFixed(0)}deg;transform:translate(var(--x0),var(--y0))"/>`;
        }).join('');

        const half = (side) => `
  <g class="mq-half mq-${side}" clip-path="url(#mq-clip-${side})">
    <rect x="-20" y="-20" width="${w + 40}" height="${h + 40}" class="mq-curtain"/>
    <rect x="-20" y="-20" width="${w + 40}" height="${h + 40}" fill="url(#mq-spot)"/>
    <svg x="${mx}" y="${my}" width="${S}" height="${S}" viewBox="0 0 100 100" style="overflow:visible">
      <path d="${MASK_PATH}" class="mq-maskline" pathLength="1"/>
      <path d="M30 31 C 34 22, 40 18, 44 17 M70 31 C 66 22, 60 18, 56 17" class="mq-maskline mq-plume" pathLength="1"/>
      <path d="${EYE_L}" class="mq-eye"/><path d="${EYE_R}" class="mq-eye"/>
    </svg>
  </g>`;

        return `
<svg viewBox="0 0 ${w} ${h}">
  <defs>
    <clipPath id="mq-clip-left"><polygon points="${leftPoly}"/></clipPath>
    <clipPath id="mq-clip-right"><polygon points="${rightPoly}"/></clipPath>
    <radialGradient id="mq-spot" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#c8203d" stop-opacity=".22"/><stop offset=".6" stop-color="#c8203d" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    .mq-curtain { fill: #0a0708; opacity: 0; animation: mq-dark .45s ease forwards; }
    @keyframes mq-dark { to { opacity: 1; } }
    .mq-maskline { fill: none; stroke: #d4af6a; stroke-width: 1.1; stroke-linecap: round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: mq-ink .95s cubic-bezier(.6,0,.3,1) .3s forwards; filter: drop-shadow(0 0 6px rgba(212,175,106,.6)); }
    .mq-plume { animation-delay: .75s; animation-duration: .5s; }
    @keyframes mq-ink { to { stroke-dashoffset: 0; } }
    .mq-eye { fill: #c8203d; opacity: 0; animation: mq-ignite .5s ease 1.05s forwards; filter: drop-shadow(0 0 8px #ff2a4d); }
    @keyframes mq-ignite { 40% { opacity: 1; } 60% { opacity: .5; } 100% { opacity: 1; } }
    .mq-fracture { fill: none; stroke: #ff3b58; stroke-width: 2.4; stroke-dasharray: 1; stroke-dashoffset: 1; opacity: 0;
      animation: mq-split .28s cubic-bezier(.9,0,.6,1) 1.28s forwards, mq-fade .3s ease 1.75s forwards; filter: drop-shadow(0 0 10px #ff2a4d); }
    @keyframes mq-split { 0% { opacity: 1; } 100% { opacity: 1; stroke-dashoffset: 0; } }
    @keyframes mq-fade { to { opacity: 0; } }
    .mq-flash { fill: #fff; opacity: 0; animation: mq-flash .5s ease 1.5s; }
    @keyframes mq-flash { 0% { opacity: 0; } 15% { opacity: .22; } 100% { opacity: 0; } }
    .mq-half { animation: .95s cubic-bezier(.55,0,.2,1) 1.62s forwards; }
    .mq-left { animation-name: mq-fall-l; transform-origin: 0 100%; }
    .mq-right { animation-name: mq-fall-r; transform-origin: 100% 100%; }
    @keyframes mq-fall-l { to { transform: translate(-${w * 0.62}px, ${h * 0.08}px) rotate(-7deg); opacity: .0; } }
    @keyframes mq-fall-r { to { transform: translate(${w * 0.62}px, ${h * 0.08}px) rotate(7deg); opacity: .0; } }
    .mq-shard { fill: #d4af6a; opacity: 0; animation: mq-burst 1.05s cubic-bezier(.2,.7,.3,1) 1.6s forwards; }
    .mq-shard:nth-child(3n) { fill: #c8203d; }
    @keyframes mq-burst { 0% { opacity: 1; transform: translate(var(--x0), var(--y0)); } 100% { opacity: 0; transform: translate(calc(var(--x0) + var(--tx)), calc(var(--y0) + var(--ty))) rotate(var(--r)); } }
  </style>
  ${half('left')}
  ${half('right')}
  <path d="${crackD}" class="mq-fracture" pathLength="1"/>
  <rect class="mq-flash" width="${w}" height="${h}"/>
  <g>${shards}</g>
</svg>`;
      },
    },
  });
})();
