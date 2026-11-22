/*
 * WattMood book skins (built with skins/_kit.js).
 * Every skin is ORIGINAL art "inspired by" a book's mood and symbols: no covers, logos, character names or quotes,
 * and skin names never reuse the book's title. Unlock order & goals: src/core/config.js (overridable from the sheet).
 */
(() => {
  const IV = globalThis.WattMood;
  const S = (inner) => `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="50" cy="50" r="46" opacity=".35"/>${inner}</svg>`;
  const F = (google, display, body, accent) => ({ google, display, body, accent: accent || display });
  const M = (bg, surface, text, muted, accent, accent2, line, selection) => ({ bg, surface, text, muted, accent, accent2, line, selection });

  /* 2 · Rainglass — inspired by "A través de mi ventana" (Ariana Godoy) */
  IV.makeSkin({
    id: 'ventana', name: 'Rainglass', tagline: 'Rain on the glass, a lamp left on for you',
    inspiredBy: { title: 'A través de mi ventana', author: 'Ariana Godoy' },
    match: ['a traves de mi ventana', 'através da minha janela', 'through my window', 'a traves de ti', 'a traves de nosotros'],
    fonts: F('family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,600;1,400', "'Playfair Display', Georgia, serif", "'Lora', Georgia, serif"),
    moods: {
      midnight: M('#0d1320', '#141c2c', '#e3e8f2', '#93a0b8', '#f2b35b', '#86a9d9', 'rgba(134,169,217,.16)', 'rgba(242,179,91,.3)'),
      daylight: M('#f4f6fa', '#ffffff', '#18202e', '#566275', '#a8620c', '#2f5a92', 'rgba(24,32,46,.1)', 'rgba(168,98,12,.18)'),
      candlelight: M('#efe6d3', '#f5eddd', '#2a2620', '#625947', '#955a0c', '#3a5f8a', 'rgba(42,38,32,.14)', 'rgba(149,90,12,.2)'),
    },
    moodLabels: { midnight: 'Midnight rain', daylight: 'Morning', candlelight: 'Lamp' },
    emblem: S('<rect x="28" y="24" width="44" height="52" rx="3"/><path d="M50 24 V76 M28 50 H72"/><path d="M36 32 l-3 6 M44 36 l-3 6 M60 30 l-3 6 M64 56 l-3 6 M37 58 l-3 6" opacity=".7"/><circle cx="62" cy="40" r="3" style="fill:var(--iv-accent);stroke:none"/>'),
    glyph: '<rect x="25" y="20" width="50" height="60" rx="4"/><path d="M50 20 V80 M25 50 H75"/>',
    ambient: { type: 'rain', count: 34, extra: 'bokeh' },
    opening: { type: 'curtain' },
    finText: 'The light stays on.',
  });

  /* 3 · Asphalt — inspired by "Culpa mía" (Mercedes Ron) */
  IV.makeSkin({
    id: 'culpa', name: 'Asphalt', tagline: 'Chrome, sunset roads and a heartbeat at full speed',
    inspiredBy: { title: 'Culpa mía', author: 'Mercedes Ron' },
    match: ['culpa mia', 'culpa tuya', 'culpa nuestra', 'culpables', 'my fault'],
    fonts: F('family=Bebas+Neue&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400', "'Bebas Neue', Impact, sans-serif", "'Source Serif 4', Georgia, serif"),
    moods: {
      midnight: M('#0b0b0d', '#15151a', '#ececf0', '#93939e', '#ff3550', '#c9ced8', 'rgba(201,206,216,.14)', 'rgba(255,53,80,.3)'),
      daylight: M('#f5f5f7', '#ffffff', '#141418', '#5a5a64', '#c8102e', '#4a5363', 'rgba(20,20,24,.1)', 'rgba(200,16,46,.16)'),
      candlelight: M('#ede3d2', '#f3eadb', '#241f1a', '#62584b', '#b0122a', '#5a5f6b', 'rgba(36,31,26,.14)', 'rgba(176,18,42,.18)'),
    },
    moodLabels: { midnight: 'Night race', daylight: 'Coast road', candlelight: 'Sunset' },
    emblem: S('<path d="M50 74 C 22 56 22 34 36 30 C 44 28 48 34 50 38 C 52 34 56 28 64 30 C 78 34 78 56 50 74 Z" stroke-dasharray="5 4"/><path d="M20 62 H34 M16 68 H30 M70 62 H84" opacity=".6"/>'),
    glyph: '<path d="M50 80 C 15 58 15 30 33 25 C 43 22 48 30 50 34 C 52 30 57 22 67 25 C 85 30 85 58 50 80 Z"/>',
    ambient: { type: 'bokeh', count: 14, size: 30, extra: 'dust' },
    opening: { type: 'flicker' },
    layout: { reveal: 'rise' },
    finText: 'Full speed. To be continued.',
  });

  /* 4 · Sepia — inspired by "After" (Anna Todd) */
  IV.makeSkin({
    id: 'after', name: 'Sepia', tagline: 'Old libraries, ink stains and a love that never asks permission',
    inspiredBy: { title: 'After', author: 'Anna Todd' },
    match: ['after we collided', 'after we fell', 'after ever happy', 'after (anna todd)'],
    fonts: F('family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400', "'Libre Baskerville', Georgia, serif", "'EB Garamond', Georgia, serif"),
    moods: {
      midnight: M('#15110d', '#1e1813', '#ece2d3', '#a39079', '#cf8c42', '#a3b0a0', 'rgba(207,140,66,.16)', 'rgba(207,140,66,.3)'),
      daylight: M('#f7f1e6', '#fffaf1', '#2a2119', '#665847', '#8a4f1a', '#4f5f55', 'rgba(42,33,25,.12)', 'rgba(138,79,26,.18)'),
      candlelight: M('#eadcc0', '#f1e5cc', '#2b2016', '#655440', '#7f4512', '#4c5a50', 'rgba(43,32,22,.15)', 'rgba(127,69,18,.2)'),
    },
    moodLabels: { midnight: 'Dorm, 2 a.m.', daylight: 'Library', candlelight: 'Sepia' },
    emblem: S('<path d="M22 34 C 32 30 42 30 50 36 C 58 30 68 30 78 34 V70 C 68 66 58 66 50 72 C 42 66 32 66 22 70 Z"/><path d="M50 36 V72"/><path d="M66 22 C 66 28 70 30 70 34 A 4 4 0 0 1 62 34 C 62 30 66 28 66 22 Z" style="fill:var(--iv-accent)"/>'),
    glyph: '<path d="M15 35 C 30 28 42 28 50 36 C 58 28 70 28 85 35 V72 C 70 66 58 66 50 74 C 42 66 30 66 15 72 Z"/>',
    ambient: { type: 'dust', count: 20, extra: 'smoke' },
    opening: { type: 'iris' },
    layout: { align: 'justify', paragraph: 'indent', reveal: 'ink' },
    finText: 'And after that…',
  });

  /* 5 · Dusk Avenue — inspired by "Boulevard" (Flor M. Salvador) */
  IV.makeSkin({
    id: 'boulevard', name: 'Dusk Avenue', tagline: 'Pastel dusk, streetlights, and words that stay',
    inspiredBy: { title: 'Boulevard', author: 'Flor M. Salvador' },
    match: ['boulevard', 'después de boulevard', 'despues de boulevard'],
    fonts: F('family=Josefin+Sans:wght@300;600&family=Literata:ital,opsz,wght@0,7..72,400;1,7..72,400&family=Dancing+Script:wght@500', "'Josefin Sans', 'Helvetica Neue', sans-serif", "'Literata', Georgia, serif", "'Dancing Script', cursive"),
    moods: {
      midnight: M('#141226', '#1d1a33', '#ebe7f5', '#a09ab9', '#ffb4a2', '#a8c8ff', 'rgba(168,200,255,.15)', 'rgba(255,180,162,.3)'),
      daylight: M('#f6f3fb', '#ffffff', '#1f1b2e', '#5b5570', '#b84d63', '#456ab0', 'rgba(31,27,46,.1)', 'rgba(184,77,99,.16)'),
      candlelight: M('#efe3d6', '#f5ebe0', '#2a2230', '#625866', '#a3415a', '#4a659a', 'rgba(42,34,48,.14)', 'rgba(163,65,90,.18)'),
    },
    moodLabels: { midnight: 'Night avenue', daylight: 'Blue hour', candlelight: 'Golden hour' },
    emblem: S('<path d="M40 80 V36 C 40 26 54 24 58 32"/><path d="M52 32 H64 L60 40 H56 Z" style="fill:var(--iv-accent);fill-opacity:.35"/><path d="M34 80 H46"/><path d="M62 56 L82 48 L70 66 L68 58 Z"/>'),
    glyph: '<path d="M20 60 L85 35 L60 80 L55 62 Z"/>',
    ambient: { type: 'petals', count: 16, extra: 'bokeh' },
    opening: { type: 'bloom' },
    layout: { reveal: 'rise' },
    finText: 'See you at the end of the avenue.',
  });

  /* 6 · Whisper — inspired by "Dímelo bajito" (Mercedes Ron) */
  IV.makeSkin({
    id: 'susurro', name: 'Whisper', tagline: 'Lilac summers, seashells and secrets said softly',
    inspiredBy: { title: 'Dímelo bajito', author: 'Mercedes Ron' },
    match: ['dimelo bajito', 'dimelo en secreto', 'dimelo con besos', 'dímelo'],
    fonts: F('family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Spectral:ital,wght@0,400;0,600;1,400', "'Cormorant Garamond', Georgia, serif", "'Spectral', Georgia, serif"),
    moods: {
      midnight: M('#16121f', '#1f1a2b', '#eee8f6', '#a59cb8', '#c9a7ff', '#f4d6a8', 'rgba(201,167,255,.15)', 'rgba(201,167,255,.3)'),
      daylight: M('#f7f4fb', '#ffffff', '#221c2c', '#5f566f', '#7346c0', '#94702f', 'rgba(34,28,44,.1)', 'rgba(115,70,192,.16)'),
      candlelight: M('#eee4da', '#f4ebe2', '#2a2230', '#645868', '#6a3fae', '#87652c', 'rgba(42,34,48,.14)', 'rgba(106,63,174,.18)'),
    },
    moodLabels: { midnight: 'Lighthouse', daylight: 'Seaside', candlelight: 'Summer dusk' },
    emblem: S('<path d="M50 74 L24 40 C 34 26 66 26 76 40 Z"/><path d="M50 74 L36 34 M50 74 L50 30 M50 74 L64 34"/><path d="M44 78 H56"/>'),
    glyph: '<path d="M50 85 L15 40 C 30 20 70 20 85 40 Z M50 85 V25"/>',
    ambient: { type: 'stars', count: 34, extra: 'dust' },
    opening: { type: 'iris' },
    layout: { reveal: 'ink' },
    finText: 'Shh… to be continued.',
  });

  /* 7 · Sunflower — inspired by "My Life with the Walter Boys" (Ali Novak) */
  IV.makeSkin({
    id: 'rancho', name: 'Sunflower', tagline: 'Big skies, denim, a house full of noise',
    inspiredBy: { title: 'My Life with the Walter Boys', author: 'Ali Novak' },
    match: ['walter boys', 'mi vida con los chicos walter', 'minha vida com os garotos walter'],
    fonts: F('family=Bitter:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Caveat:wght@600', "'Bitter', Georgia, serif", "'Merriweather', Georgia, serif", "'Caveat', cursive"),
    moods: {
      midnight: M('#121510', '#1a1e17', '#ecebdf', '#a3a58f', '#f4c430', '#86a7cb', 'rgba(244,196,48,.14)', 'rgba(244,196,48,.28)'),
      daylight: M('#fbf8ee', '#ffffff', '#1f2119', '#5a5d4d', '#8f6800', '#3e6390', 'rgba(31,33,25,.1)', 'rgba(143,104,0,.18)'),
      candlelight: M('#f0e5c8', '#f6edd6', '#262416', '#605a44', '#7f5d00', '#3e5f86', 'rgba(38,36,22,.14)', 'rgba(127,93,0,.2)'),
    },
    moodLabels: { midnight: 'Porch night', daylight: 'Ranch day', candlelight: 'Hay sunset' },
    emblem: S('<circle cx="50" cy="50" r="11" style="fill:var(--iv-accent);fill-opacity:.3"/>' + Array.from({ length: 12 }, (_, i) => `<ellipse cx="50" cy="28" rx="5" ry="11" transform="rotate(${i * 30} 50 50)"/>`).join('')),
    glyph: '<circle cx="50" cy="50" r="14"/><path d="M50 15 V30 M50 70 V85 M15 50 H30 M70 50 H85 M25 25 L36 36 M64 64 L75 75 M75 25 L64 36 M36 64 L25 75"/>',
    ambient: { type: 'dust', count: 26, size: 2.2, extra: 'stars' },
    opening: { type: 'bloom' },
    finText: 'More from the ranch soon.',
  });

  /* 8 · Carnival — inspired by "The Kissing Booth" (Beth Reekles) */
  IV.makeSkin({
    id: 'cabina', name: 'Carnival', tagline: 'String lights, bubblegum and a summer you won’t forget',
    inspiredBy: { title: 'The Kissing Booth', author: 'Beth Reekles' },
    match: ['kissing booth', 'el stand de los besos', 'a barraca do beijo'],
    fonts: F('family=Fredoka:wght@400;600&family=Nunito:ital,wght@0,400;0,700;1,400&family=Pacifico', "'Fredoka', 'Nunito', sans-serif", "'Nunito', 'Helvetica Neue', sans-serif", "'Pacifico', cursive"),
    moods: {
      midnight: M('#1a0f17', '#241520', '#f6e9f0', '#b89cab', '#ff5c8a', '#ffd166', 'rgba(255,92,138,.16)', 'rgba(255,92,138,.3)'),
      daylight: M('#fff5f8', '#ffffff', '#2a1520', '#6a4d5d', '#c8175a', '#9a6c00', 'rgba(42,21,32,.1)', 'rgba(200,23,90,.16)'),
      candlelight: M('#f3e3d8', '#f8ebe2', '#2b1a1f', '#68505b', '#ab1549', '#836000', 'rgba(43,26,31,.14)', 'rgba(171,21,73,.18)'),
    },
    moodLabels: { midnight: 'Fair at night', daylight: 'Boardwalk', candlelight: 'Last ride' },
    emblem: S('<path d="M30 46 C 38 36 46 40 50 44 C 54 40 62 36 70 46 C 62 50 58 60 50 60 C 42 60 38 50 30 46 Z" style="fill:var(--iv-accent);fill-opacity:.35"/><path d="M30 46 C 42 52 58 52 70 46"/><path d="M18 26 Q 50 40 82 26" stroke-dasharray="1 7" stroke-width="4"/>'),
    glyph: '<path d="M20 50 C 32 34 44 40 50 46 C 56 40 68 34 80 50 C 68 56 62 70 50 70 C 38 70 32 56 20 50 Z"/>',
    ambient: { type: 'bokeh', count: 16, size: 22, extra: 'hearts' },
    opening: { type: 'bloom' },
    layout: { reveal: 'rise' },
    finText: 'One more ride? Soon.',
  });

  /* 9 · Knockout — inspired by "Perfect Addiction" (Claudia Tan) */
  IV.makeSkin({
    id: 'ring', name: 'Knockout', tagline: 'Neon ropes, red lights and a heart that fights back',
    inspiredBy: { title: 'Perfect Addiction', author: 'Claudia Tan' },
    match: ['perfect addiction', 'adiccion perfecta', 'adicción perfecta'],
    fonts: F('family=Anton&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400', "'Anton', Impact, sans-serif", "'Source Serif 4', Georgia, serif"),
    moods: {
      midnight: M('#0c0a0a', '#161212', '#f0e8e6', '#a8958f', '#ff3b30', '#ffd60a', 'rgba(255,59,48,.16)', 'rgba(255,59,48,.3)'),
      daylight: M('#f6f4f3', '#ffffff', '#1a1414', '#5f5553', '#c22a20', '#806500', 'rgba(26,20,20,.1)', 'rgba(194,42,32,.16)'),
      candlelight: M('#ede1d4', '#f3e9de', '#241a17', '#62544b', '#a91f16', '#735b00', 'rgba(36,26,23,.14)', 'rgba(169,31,22,.18)'),
    },
    moodLabels: { midnight: 'Fight night', daylight: 'Training', candlelight: 'Locker room' },
    emblem: S('<path d="M24 34 V72 M76 34 V72"/><path d="M24 44 H76 M24 54 H76 M24 64 H76" style="stroke:var(--iv-accent)"/><path d="M50 22 L53 30 L61 30 L55 35 L57 43 L50 38 L43 43 L45 35 L39 30 L47 30 Z" style="fill:var(--iv-accent2);fill-opacity:.4"/>'),
    glyph: '<path d="M15 40 H85 M15 55 H85 M15 70 H85 M20 30 V80 M80 30 V80"/>',
    ambient: { type: 'embers', count: 18, extra: 'bokeh' },
    opening: { type: 'flicker' },
    layout: { reveal: 'rise' },
    finText: 'Round over. Next round soon.',
  });

  /* 10 · Ash — inspired by "Ciudades de humo" (Joana Marcús) */
  IV.makeSkin({
    id: 'humo', name: 'Ash', tagline: 'Smoke over the city, embers and circuits',
    inspiredBy: { title: 'Ciudades de humo', author: 'Joana Marcús' },
    match: ['ciudades de humo', 'ciudades de cenizas', 'ciudades de fuego'],
    fonts: F('family=Rajdhani:wght@500;700&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400', "'Rajdhani', 'Helvetica Neue', sans-serif", "'IBM Plex Serif', Georgia, serif"),
    moods: {
      midnight: M('#111214', '#1a1b1e', '#e6e6e3', '#979894', '#ff7a2f', '#6fd3c7', 'rgba(111,211,199,.14)', 'rgba(255,122,47,.28)'),
      daylight: M('#f3f3f1', '#ffffff', '#1b1c1e', '#585956', '#b84d14', '#1d776e', 'rgba(27,28,30,.1)', 'rgba(184,77,20,.16)'),
      candlelight: M('#eae2d4', '#f1eadf', '#24211c', '#615a4e', '#a14411', '#28675f', 'rgba(36,33,28,.14)', 'rgba(161,68,17,.18)'),
    },
    moodLabels: { midnight: 'Curfew', daylight: 'Grey city', candlelight: 'Embers' },
    emblem: S('<path d="M50 22 L74 36 V64 L50 78 L26 64 V36 Z"/><path d="M50 22 V40 M74 64 L58 56 M26 64 L42 56" style="stroke:var(--iv-accent2)"/><circle cx="50" cy="50" r="7" style="fill:var(--iv-accent);fill-opacity:.5"/>'),
    glyph: '<path d="M50 15 L80 32 V68 L50 85 L20 68 V32 Z"/>',
    ambient: { type: 'smoke', count: 8, extra: 'embers' },
    opening: { type: 'iris' },
    layout: { reveal: 'ink' },
    finText: 'The city is still burning.',
  });

  /* 11 · Rooftops — inspired by Morgane Moncomble (Viens, on s'aime / Never) */
  IV.makeSkin({
    id: 'toits', name: 'Rooftops', tagline: 'Zinc roofs, blush skies and coffee for two',
    inspiredBy: { title: 'Viens, on s’aime', author: 'Morgane Moncomble' },
    match: ['viens on s aime', 'viens, on s\'aime', 'never never', 'moncomble'],
    fonts: F('family=Italiana&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400', "'Italiana', Georgia, serif", "'Libre Caslon Text', Georgia, serif"),
    moods: {
      midnight: M('#131418', '#1c1d23', '#ecebee', '#9e9da7', '#f2a7b5', '#a9b4c2', 'rgba(169,180,194,.15)', 'rgba(242,167,181,.28)'),
      daylight: M('#f7f5f5', '#ffffff', '#1f1e22', '#5a5961', '#b04862', '#4f5b6b', 'rgba(31,30,34,.1)', 'rgba(176,72,98,.16)'),
      candlelight: M('#eee4dc', '#f5ece5', '#26221f', '#635a53', '#9e3f58', '#4f5866', 'rgba(38,34,31,.14)', 'rgba(158,63,88,.18)'),
    },
    moodLabels: { midnight: 'Paris la nuit', daylight: 'Café', candlelight: 'Crépuscule' },
    emblem: S('<path d="M18 70 H82 M22 70 V52 L34 42 L46 52 V70 M46 70 V46 L60 36 L74 46 V70"/><path d="M64 40 V30 H69 V44"/><circle cx="72" cy="24" r="6" style="fill:var(--iv-accent);fill-opacity:.4"/>'),
    glyph: '<path d="M10 75 V50 L30 35 L50 50 V75 M50 75 V45 L70 30 L90 45 V75"/>',
    ambient: { type: 'stars', count: 26, extra: 'smoke' },
    opening: { type: 'curtain' },
    layout: { align: 'justify', paragraph: 'indent', reveal: 'fade' },
    finText: 'À suivre…',
  });
})();
