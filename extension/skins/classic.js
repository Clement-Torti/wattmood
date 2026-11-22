/*
 * WattMood Classic — the free house Edition. A quiet, bookish baseline:
 * Fraunces titles, Literata text, drifting dust and an ink-drop Unveiling.
 */
(() => {
  const IV = globalThis.WattMood;

  const emblem = `
<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="44" opacity=".45"/>
  <circle cx="50" cy="50" r="38" stroke-dasharray="1 5" opacity=".6"/>
  <path d="M50 22 C 60 34, 64 46, 60 60 L 54 70 L 50 78 L 46 70 L 40 60 C 36 46, 40 34, 50 22 Z" style="fill:currentColor;fill-opacity:.12"/>
  <path d="M50 44 V 74"/>
  <circle cx="50" cy="44" r="3.2" style="fill:var(--iv-accent, currentColor);stroke:none"/>
</svg>`;

  const divider = `
<svg viewBox="0 0 240 20" fill="currentColor">
  <path d="M0 10 L106 9.4 L106 10.6 Z" opacity=".55"/>
  <path d="M240 10 L134 9.4 L134 10.6 Z" opacity=".55"/>
  <path d="M120 4 L126 10 L120 16 L114 10 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="120" cy="10" r="1.8" style="fill:var(--iv-accent)"/>
</svg>`;

  IV.registerEdition({
    id: 'classic',
    name: 'Basic',
    tagline: 'Free forever — calm, bookish, easy on the eyes',
    tier: 'free',
    match: [],
    fonts: {
      google: 'family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400',
      display: "'Fraunces', Georgia, serif",
      body: "'Literata', Georgia, serif",
      accent: "'Fraunces', Georgia, serif",
    },
    moodLabels: { midnight: 'Midnight', daylight: 'Daylight', candlelight: 'Candlelight' },
    moods: {
      midnight: { bg: '#121417', surface: '#1a1d22', text: '#e4e1da', muted: '#8d8a83', accent: '#d4a35a', accent2: '#9db8c9', line: 'rgba(228,225,218,.12)', selection: 'rgba(212,163,90,.3)' },
      daylight: { bg: '#fbfaf7', surface: '#ffffff', text: '#1f2328', muted: '#6b6f76', accent: '#b5632d', accent2: '#3e6b8a', line: 'rgba(31,35,40,.1)', selection: 'rgba(181,99,45,.2)' },
      candlelight: { bg: '#f3e9d2', surface: '#f8f0dc', text: '#3b2f22', muted: '#6f5d48', accent: '#a3542a', accent2: '#6e5a2f', line: 'rgba(59,47,34,.14)', selection: 'rgba(163,84,42,.22)' },
    },
    layout: { align: 'left', paragraph: 'spaced', dropCap: true, reveal: 'fade' },
    emblem,
    divider,
    finText: 'To be continued',
    css: `
      .iv-title { font-weight: 350 !important; font-style: italic !important; }
      &[data-mood="midnight"] .iv-say { color: #cfe0ea; }
      .iv-seal svg { animation: cl-breathe 8s ease-in-out infinite; }
      @keyframes cl-breathe { 50% { transform: scale(1.04); } }
    `,

    /* Atmosphere: a few slow dust motes and a soft lamp-glow. */
    atmosphere({ w, h, rand }) {
      const motes = Array.from({ length: 18 }, () => {
        const x = rand() * w, y = rand() * h, r = 0.6 + rand() * 1.6;
        const dur = 22 + rand() * 26, delay = -rand() * dur;
        const dx = (rand() - 0.5) * 80, dy = -(40 + rand() * 120);
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" class="cl-mote" style="--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"/>`;
      }).join('');
      return `
<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
  <defs>
    <radialGradient id="cl-glow" cx="50%" cy="0%" r="75%">
      <stop offset="0" style="stop-color:var(--iv-accent);stop-opacity:.10"/>
      <stop offset="1" style="stop-color:var(--iv-accent);stop-opacity:0"/>
    </radialGradient>
  </defs>
  <style>
    .cl-mote { fill: var(--iv-accent2); opacity: 0; animation: cl-drift linear infinite; }
    @keyframes cl-drift { 0% { opacity: 0; transform: translate(0,0); } 20%,70% { opacity: .55; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)); } }
  </style>
  <rect width="${w}" height="${h}" fill="url(#cl-glow)"/>
  ${motes}
</svg>`;
    },

    /* Unveiling: a drop of ink spreads over the page, then draws back. */
    unveil: {
      duration: 1700,
      swapAt: 760,
      render({ w, h }) {
        const R = Math.hypot(w, h) / 2 + 20;
        return `
<svg viewBox="0 0 ${w} ${h}">
  <style>
    .cl-ink { fill: var(--iv-text); transform-origin: ${w / 2}px ${h / 2}px; transform: scale(0); animation: cl-ink 1.7s cubic-bezier(.7,0,.2,1) forwards; }
    .cl-mark { opacity: 0; transform-origin: ${w / 2}px ${h / 2}px; animation: cl-mark 1.7s ease forwards; }
    @keyframes cl-ink { 0% { transform: scale(0); } 40%, 58% { transform: scale(1); } 100% { transform: scale(0); } }
    @keyframes cl-mark { 0%,24% { opacity: 0; transform: scale(.8); } 42%,56% { opacity: 1; transform: scale(1); } 74%,100% { opacity: 0; transform: scale(1.12); } }
  </style>
  <circle class="cl-ink" cx="${w / 2}" cy="${h / 2}" r="${R}"/>
  <g class="cl-mark"><svg x="${w / 2 - 50}" y="${h / 2 - 50}" width="100" height="100" style="color:var(--iv-bg)">${emblem.replace('<svg ', '<svg width="100" height="100" ')}</svg></g>
</svg>`;
      },
    },
  });
})();
