/* WattMood public site: 4 languages, live points line (Apps Script), skin gallery (docs/skins.json). */
(async () => {
  const STORE_URL = ''; // Chrome Web Store link — fill in once published
  const T = {
    en: {
      kicker: 'For Wattpad readers', title: 'Read Wattpad in the <em>mood</em> of your favourite book.',
      lead: 'Dark, light and warm “candlelight” modes for all of Wattpad, a calm focus layout for chapters — and skins inspired by the most-loved Wattpad books, unlocked together by the community.',
      install: 'Add to Chrome — it’s free', seeLine: 'See the community goal', notAffiliated: 'Not affiliated with Wattpad.', invited: '💌 A friend invited you — install WattMood and you add +10 points for everyone.',
      featTitle: 'Everything Wattpad’s website is missing',
      feats: [['🌙', 'Dark mode everywhere', 'Home, stories, profiles, search, chapters, comments.'], ['🕯️', 'Candlelight', 'A warm paper tone that’s easy on the eyes at night.'], ['📖', 'Focus layout', 'One centred column, Wattpad’s bars slide away while you read.'], ['💬', 'Speech bubbles', 'Dialogue lines turn into bubbles — conversations read like a chat.'], ['✨', 'Book skins', 'Fonts, colours and animations inspired by the books you love.'], ['🌍', '4 languages', 'English, Español, Português, Français.']],
      lineTitle: 'The community goal', lineSub: 'Every install, share and donation adds points. When the line reaches a skin, it unlocks — for free, for everyone.', goal: 'Community points', next: 'Next skin', allDone: 'Every skin is unlocked!',
      howInstall: 'when you install WattMood', howShare: 'each day you share it', howDonate: 'donated — €5 also unlocks a skin of your choice, €10 unlocks them all', donate: 'Support on Buy Me a Coffee',
      skinsTitle: 'The skins', skinsSub: 'Basic is free forever. The others unlock along the community line.', free: 'Free', at: '{n} pts', inspired: 'by {b}', privacy: 'Privacy policy',
      faq: [['Is it free?', 'Yes. WattMood and its Basic skin are free. Book skins unlock for everyone when the community reaches each goal; donations just speed it up.'], ['Does it change the stories?', 'No. WattMood only changes how Wattpad looks in your browser. Comments, votes and reads still count for authors.'], ['Are the skins official?', 'No — they’re original fan-made designs inspired by the mood of each book (no covers, logos or character names). WattMood is not affiliated with Wattpad or the authors.'], ['What data do you collect?', 'Almost nothing: an anonymous random code, install/share events, and what you choose to send (feedback, donation pledges). See the privacy policy.']],
    },
    es: {
      kicker: 'Para lectores de Wattpad', title: 'Lee Wattpad con el <em>ambiente</em> de tu libro favorito.',
      lead: 'Modo oscuro, claro y “vela” en todo Wattpad, un modo foco para los capítulos y skins inspiradas en los libros más queridos de Wattpad, desbloqueadas entre toda la comunidad.',
      install: 'Añadir a Chrome — es gratis', seeLine: 'Ver la meta de la comunidad', notAffiliated: 'No afiliado a Wattpad.', invited: '💌 Te invitó una amiga o amigo: instala WattMood y sumas +10 puntos para todos.',
      featTitle: 'Todo lo que le falta a la web de Wattpad',
      feats: [['🌙', 'Modo oscuro en todas partes', 'Inicio, historias, perfiles, búsqueda, capítulos, comentarios.'], ['🕯️', 'Modo vela', 'Un tono papel cálido que descansa la vista de noche.'], ['📖', 'Modo foco', 'Una columna centrada; las barras de Wattpad se ocultan al leer.'], ['💬', 'Burbujas de diálogo', 'Los diálogos se ven como un chat.'], ['✨', 'Skins de libros', 'Fuentes, colores y animaciones inspiradas en tus libros favoritos.'], ['🌍', '4 idiomas', 'English, Español, Português, Français.']],
      lineTitle: 'La meta de la comunidad', lineSub: 'Cada instalación, cada vez que compartes y cada donación suman puntos. Cuando la línea llega a una skin, se desbloquea gratis para todos.', goal: 'Puntos de la comunidad', next: 'Siguiente skin', allDone: '¡Todas las skins están desbloqueadas!',
      howInstall: 'al instalar WattMood', howShare: 'cada día que lo compartes', howDonate: 'donado — 5 € además desbloquea una skin a tu elección, 10 € todas', donate: 'Apoyar en Buy Me a Coffee',
      skinsTitle: 'Las skins', skinsSub: 'Basic es gratis para siempre. Las demás se desbloquean con la línea de la comunidad.', free: 'Gratis', at: '{n} pts', inspired: 'de {b}', privacy: 'Política de privacidad',
      faq: [['¿Es gratis?', 'Sí. WattMood y su skin Basic son gratis. Las skins de libros se desbloquean para todos cuando la comunidad llega a cada meta; las donaciones solo lo aceleran.'], ['¿Cambia las historias?', 'No. WattMood solo cambia cómo se ve Wattpad en tu navegador. Comentarios, votos y lecturas siguen contando para los autores.'], ['¿Las skins son oficiales?', 'No: son diseños originales hechos por fans, inspirados en el ambiente de cada libro (sin portadas, logos ni nombres de personajes). WattMood no está afiliado a Wattpad ni a los autores.'], ['¿Qué datos recogéis?', 'Casi nada: un código aleatorio anónimo, eventos de instalación/compartir y lo que tú decidas enviar (opiniones, donaciones). Mira la política de privacidad.']],
    },
    pt: {
      kicker: 'Para leitores do Wattpad', title: 'Leia o Wattpad no <em>clima</em> do seu livro favorito.',
      lead: 'Modo escuro, claro e “vela” em todo o Wattpad, um modo foco para os capítulos e skins inspiradas nos livros mais amados do Wattpad, desbloqueadas juntas pela comunidade.',
      install: 'Adicionar ao Chrome — é grátis', seeLine: 'Ver a meta da comunidade', notAffiliated: 'Sem afiliação com o Wattpad.', invited: '💌 Alguém te convidou — instale o WattMood e você soma +10 pontos para todos.',
      featTitle: 'Tudo o que falta no site do Wattpad',
      feats: [['🌙', 'Modo escuro em tudo', 'Início, histórias, perfis, busca, capítulos, comentários.'], ['🕯️', 'Modo vela', 'Um tom de papel quente que descansa a vista à noite.'], ['📖', 'Modo foco', 'Uma coluna centralizada; as barras do Wattpad somem enquanto você lê.'], ['💬', 'Balões de fala', 'Os diálogos viram balões, como num chat.'], ['✨', 'Skins de livros', 'Fontes, cores e animações inspiradas nos livros que você ama.'], ['🌍', '4 idiomas', 'English, Español, Português, Français.']],
      lineTitle: 'A meta da comunidade', lineSub: 'Cada instalação, compartilhamento e doação soma pontos. Quando a linha chega a uma skin, ela é desbloqueada de graça para todos.', goal: 'Pontos da comunidade', next: 'Próxima skin', allDone: 'Todas as skins estão desbloqueadas!',
      howInstall: 'ao instalar o WattMood', howShare: 'por dia que você compartilha', howDonate: 'doado — com 5 € você também desbloqueia uma skin à sua escolha, com 10 € todas', donate: 'Apoiar no Buy Me a Coffee',
      skinsTitle: 'As skins', skinsSub: 'A Basic é grátis para sempre. As outras são desbloqueadas pela linha da comunidade.', free: 'Grátis', at: '{n} pts', inspired: 'de {b}', privacy: 'Política de privacidade',
      faq: [['É grátis?', 'Sim. O WattMood e a skin Basic são grátis. As skins de livros são desbloqueadas para todos quando a comunidade chega a cada meta; as doações só aceleram.'], ['Muda as histórias?', 'Não. O WattMood só muda a aparência do Wattpad no seu navegador. Comentários, votos e leituras continuam contando para os autores.'], ['As skins são oficiais?', 'Não — são designs originais feitos por fãs, inspirados no clima de cada livro (sem capas, logos ou nomes de personagens). O WattMood não tem afiliação com o Wattpad nem com os autores.'], ['Que dados vocês coletam?', 'Quase nada: um código aleatório anônimo, eventos de instalação/compartilhamento e o que você decidir enviar (opiniões, doações). Veja a política de privacidade.']],
    },
    fr: {
      kicker: 'Pour les lecteurs Wattpad', title: 'Lis Wattpad dans l’<em>ambiance</em> de ton livre préféré.',
      lead: 'Modes sombre, clair et « bougie » sur tout Wattpad, un mode focus pour les chapitres — et des skins inspirés des livres Wattpad les plus aimés, débloqués ensemble par la communauté.',
      install: 'Ajouter à Chrome — c’est gratuit', seeLine: 'Voir l’objectif de la communauté', notAffiliated: 'Non affilié à Wattpad.', invited: '💌 On t’a invité·e — installe WattMood et tu ajoutes +10 points pour tout le monde.',
      featTitle: 'Tout ce qui manque au site de Wattpad',
      feats: [['🌙', 'Mode sombre partout', 'Accueil, histoires, profils, recherche, chapitres, commentaires.'], ['🕯️', 'Mode bougie', 'Un ton papier chaud qui repose les yeux le soir.'], ['📖', 'Mode focus', 'Une colonne centrée ; les barres de Wattpad s’effacent pendant la lecture.'], ['💬', 'Bulles de dialogue', 'Les dialogues s’affichent en bulles, comme une conversation.'], ['✨', 'Skins de livres', 'Polices, couleurs et animations inspirées des livres que tu aimes.'], ['🌍', '4 langues', 'English, Español, Português, Français.']],
      lineTitle: 'L’objectif de la communauté', lineSub: 'Chaque installation, partage et don ajoute des points. Quand la ligne atteint un skin, il est débloqué gratuitement pour tout le monde.', goal: 'Points de la communauté', next: 'Prochain skin', allDone: 'Tous les skins sont débloqués !',
      howInstall: 'quand tu installes WattMood', howShare: 'par jour où tu le partages', howDonate: 'donné — 5 € débloquent aussi un skin de ton choix, 10 € tous', donate: 'Soutenir sur Buy Me a Coffee',
      skinsTitle: 'Les skins', skinsSub: 'Basic est gratuit pour toujours. Les autres se débloquent le long de la ligne de la communauté.', free: 'Gratuit', at: '{n} pts', inspired: 'de {b}', privacy: 'Politique de confidentialité',
      faq: [['C’est gratuit ?', 'Oui. WattMood et son skin Basic sont gratuits. Les skins de livres se débloquent pour tous quand la communauté atteint chaque objectif ; les dons accélèrent juste le rythme.'], ['Ça modifie les histoires ?', 'Non. WattMood change seulement l’apparence de Wattpad dans ton navigateur. Commentaires, votes et lectures comptent toujours pour les auteurs.'], ['Les skins sont officiels ?', 'Non — ce sont des créations originales de fans, inspirées de l’ambiance de chaque livre (sans couvertures, logos ni noms de personnages). WattMood n’est affilié ni à Wattpad ni aux auteurs.'], ['Quelles données collectez-vous ?', 'Presque rien : un code aléatoire anonyme, les installations/partages et ce que tu choisis d’envoyer (avis, dons). Voir la politique de confidentialité.']],
    },
  };
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') || localStorage.getItem('wm-lang') || (navigator.language || 'en').slice(0, 2);
  if (!T[lang]) lang = 'en';
  const fmt = (n) => Math.round(n).toLocaleString(lang);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const data = await fetch('skins.json').then((r) => r.json()).catch(() => ({ skins: [] }));
  let total = 0;

  if (params.get('ref')) document.getElementById('invited').hidden = false;
  const install = document.getElementById('install');
  install.href = STORE_URL || 'https://github.com/Clement-Torti/wattmood#install';
  document.getElementById('donate').href = data.donate || 'https://buymeacoffee.com/ctorti';

  // Google Fonts for every skin's display face (gallery + demo)
  const fams = data.skins.map((s) => s.fonts.google).join('&');
  if (fams) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`; document.head.appendChild(l); }

  const svg = (s, size, color) => s.emblem.replace('<svg ', `<svg width="${size}" height="${size}" style="color:${color};--iv-accent:${s.moods.midnight.accent}" `);
  const pos = (p, max) => (max ? Math.min(100, (Math.sqrt(p) / Math.sqrt(max)) * 100) : 0);

  function render() {
    const L = T[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = L[el.dataset.t] || ''; });
    document.querySelectorAll('[data-t-html]').forEach((el) => { el.innerHTML = L[el.dataset.tHtml] || ''; });
    document.getElementById('langs').innerHTML = Object.keys(T).map((k) => `<button class="${k === lang ? 'on' : ''}" data-lang="${k}">${k.toUpperCase()}</button>`).join('');
    document.getElementById('features').innerHTML = L.feats.map(([i, b, s]) => `<div class="feat"><div class="ic">${i}</div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
    document.getElementById('faq').innerHTML = L.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
    document.getElementById('gallery').innerHTML = data.skins.map((s) => {
      const m = s.moods.midnight;
      return `<div class="skin" style="background:${m.bg};color:${m.text}">
        <span class="gl ${s.goal === 0 ? 'free' : ''}">${s.goal === 0 ? L.free : (total >= s.goal ? '✓ ' : '🔒 ') + L.at.replace('{n}', fmt(s.goal))}</span>
        <div class="em">${svg(s, 58, m.accent2)}</div>
        <div class="nm" style="font-family:${s.fonts.display}">${esc(s.name)}</div>
        <div class="fr">${s.inspiredBy ? esc(L.inspired.replace('{b}', s.inspiredBy.author)) : esc(s.tagline)}</div>
        <div class="pal">${['bg', 'accent', 'accent2', 'text'].map((k) => `<i style="background:${m[k]}"></i>`).join('')}</div></div>`;
    }).join('');
    renderLine();
  }

  function renderLine() {
    WMLine.render(document.getElementById('wm-line'), { data, total, lang });
  }

  // demo: the same chapter in a few skins, cross-fading
  function demo() {
    const box = document.getElementById('demo');
    const pick = data.skins.filter((s) => ['masquerade', 'ventana', 'boulevard', 'classic'].includes(s.id));
    box.innerHTML = pick.map((s, i) => {
      const m = s.moods.midnight;
      return `<div class="page" style="background:${m.bg};color:${m.text};opacity:${i ? 0 : 1}">
        <div class="seal">${svg(s, 46, m.accent2)}</div><div class="kick" style="color:${m.accent}">Chapter 1</div>
        <div class="ttl" style="font-family:${s.fonts.display}">${esc(s.name)}</div>
        <p style="opacity:.85">The rain had not stopped for three days, and neither had the rumours.</p>
        <div class="bub" style="background:color-mix(in srgb, ${m.text} 8%, ${m.bg});border-left:2px solid ${m.accent}">“You came back.”</div>
        <p style="opacity:.85">She didn’t answer. Some secrets are louder than words.</p></div>`;
    }).join('');
    let i = 0;
    setInterval(() => {
      const pages = box.querySelectorAll('.page');
      if (!pages.length) return;
      pages[i].style.opacity = 0;
      i = (i + 1) % pages.length;
      pages[i].style.opacity = 1;
    }, 3200);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lang]');
    if (!b) return;
    lang = b.dataset.lang;
    try { localStorage.setItem('wm-lang', lang); } catch (_) { /* ignore */ }
    render();
  });

  render();
  demo();
  if (data.endpoint) {
    try {
      const r = await fetch(data.endpoint).then((x) => x.json());
      total = Number(r.total) || 0;
      if (r.goals) data.skins.forEach((s) => { if (r.goals[s.id] !== undefined) s.goal = Number(r.goals[s.id]); });
      render();
    } catch (e) { /* offline: show 0 */ }
  }
})();
