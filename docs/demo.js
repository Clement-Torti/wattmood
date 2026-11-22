/*
 * Animated product demo (welcome page): a mocked Wattpad chapter that gets the Perfectos Mentirosos skin,
 * then shows bubbles, moods, spotlight and the community points. Pure HTML/CSS + a small timeline, loops.
 */
window.WMDemo = (() => {
  const CAP = {
    en: ['Wattpad, as you know it', 'One click: the Perfectos Mentirosos skin', 'Fonts, colours and an atmosphere made for the book', 'Dialogue becomes speech bubbles', 'Moods: Night · Candlelight · Day', 'Spotlight: only the paragraph you’re reading', 'Community points unlock new book skins for everyone'],
    es: ['Wattpad, tal como lo conoces', 'Un clic: la skin de Perfectos Mentirosos', 'Tipografía, colores y una atmósfera hechos para el libro', 'Los diálogos se vuelven burbujas', 'Ambientes: Noche · Vela · Día', 'Foco: solo el párrafo que estás leyendo', 'Los puntos de la comunidad desbloquean nuevas skins para todos'],
    pt: ['O Wattpad que você conhece', 'Um clique: a skin de Perfectos Mentirosos', 'Fontes, cores e uma atmosfera feitas para o livro', 'Os diálogos viram balões', 'Climas: Noite · Vela · Dia', 'Foco: só o parágrafo que você está lendo', 'Os pontos da comunidade desbloqueiam novas skins para todos'],
    fr: ['Wattpad, tel que tu le connais', 'Un clic : le skin Perfectos Mentirosos', 'Typo, couleurs et une atmosphère faites pour le livre', 'Les dialogues deviennent des bulles', 'Ambiances : Nuit · Bougie · Jour', 'Focus : seulement le paragraphe que tu lis', 'Les points de la communauté débloquent de nouveaux skins pour tous'],
  };
  const TXT = {
    en: { ch: 'Chapter', p1: 'Nobody at the academy told the truth. Not the teachers, not the scholarship kids, and certainly not the three brothers who owned every hallway.', b1: '“You’re new,” he said, as if it were an accusation.', b2: '“And you’re lying,” I answered.', p2: 'He smiled the way people smile when they have already decided how the story ends.', pts: 'pts community' },
    es: { ch: 'Capítulo', p1: 'Nadie en la academia decía la verdad. Ni los profesores, ni los becados, y mucho menos los tres hermanos que eran dueños de cada pasillo.', b1: '—Eres nueva —dijo, como si fuera una acusación.', b2: '—Y tú mientes —respondí.', p2: 'Sonrió como sonríe quien ya decidió cómo termina la historia.', pts: 'pts comunidad' },
    pt: { ch: 'Capítulo', p1: 'Ninguém na academia dizia a verdade. Nem os professores, nem os bolsistas, e muito menos os três irmãos que mandavam em cada corredor.', b1: '— Você é nova — ele disse, como se fosse uma acusação.', b2: '— E você está mentindo — respondi.', p2: 'Ele sorriu como sorri quem já decidiu como a história termina.', pts: 'pts comunidade' },
    fr: { ch: 'Chapitre', p1: 'Personne à l’académie ne disait la vérité. Ni les profs, ni les boursiers, et encore moins les trois frères qui régnaient sur chaque couloir.', b1: '— Tu es nouvelle, dit-il, comme une accusation.', b2: '— Et toi, tu mens, répondis-je.', p2: 'Il sourit comme sourient ceux qui ont déjà décidé de la fin de l’histoire.', pts: 'pts communauté' },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function mount(el, { skin, lang = 'en', total = 10 }) {
    const L = TXT[lang] || TXT.en, C = CAP[lang] || CAP.en;
    const m = skin.moods;
    const emblem = skin.emblem.replace('<svg ', '<svg width="100%" height="100%" ');
    el.innerHTML = `
      <div class="dm-browser">
        <div class="dm-tabbar"><i></i><i></i><i></i><span class="dm-url">wattpad.com/1234-perfectos-mentirosos-capitulo-1</span>
          <span class="dm-ext" title="WattMood"><img src="logo.svg" alt=""></span></div>
        <div class="dm-page">
          <div class="dm-atmo"></div>
          <div class="dm-header"><b>wattpad</b><span>Browse</span><span>Community</span><span class="dm-search"></span><span class="dm-av"></span></div>
          <div class="dm-article">
            <div class="dm-seal">${emblem}</div>
            <div class="dm-kicker">${esc(L.ch)} 1</div>
            <div class="dm-title"><span class="plain">${esc(L.ch)} 1</span><span class="skin">I</span></div>
            <p class="dm-p first">${esc(L.p1)}<em class="dm-c">412</em></p>
            <p class="dm-p dm-b">${esc(L.b1)}<em class="dm-c">1.2K</em></p>
            <p class="dm-p dm-b">${esc(L.b2)}<em class="dm-c">3.8K</em></p>
            <p class="dm-p">${esc(L.p2)}<em class="dm-c">95</em></p>
          </div>
          <div class="dm-pill">🌍 <b>${total.toLocaleString(lang)}</b> ${esc(L.pts)} <i><s></s></i> <span>A través de mi ventana</span></div>
          <div class="dm-dock"><span class="dm-mood">◐</span><span>✦</span><span class="dm-spot">◉</span><span>▥</span><span class="dm-pw">⏻</span></div>
          <div class="dm-unveil">
            <div class="dm-half l"></div><div class="dm-half r"></div>
            <div class="dm-mask">${emblem}</div><div class="dm-crack"></div>
          </div>
          <svg class="dm-cursor" viewBox="0 0 24 24"><path d="M4 2l15 11-7 1 4 8-3 1-4-8-5 5z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>
        </div>
      </div>
      <div class="dm-caption"><span class="dm-step"></span><span class="dm-text"></span></div>`;
    const page = el.querySelector('.dm-page');
    const pal = (mood) => { const p = m[mood]; for (const [k, v] of Object.entries(p)) page.style.setProperty(`--d-${k}`, v); };
    page.style.setProperty('--d-display', skin.fonts.display);
    page.style.setProperty('--d-body', "'Crimson Pro', Georgia, serif");
    const cursor = el.querySelector('.dm-cursor');
    const move = (sel, dx = 0, dy = 0) => {
      const t = sel === 'ext' ? el.querySelector('.dm-ext') : page.querySelector(sel);
      const pr = page.getBoundingClientRect(), r = t.getBoundingClientRect();
      cursor.style.transform = `translate(${r.left - pr.left + r.width / 2 + dx}px, ${r.top - pr.top + r.height / 2 + dy}px)`;
    };
    const click = () => { cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click'); };
    const cap = (i) => {
      const c = el.querySelector('.dm-caption');
      c.classList.remove('in'); void c.offsetWidth;
      el.querySelector('.dm-step').textContent = `${i + 1}/${C.length}`;
      el.querySelector('.dm-text').textContent = C[i];
      c.classList.add('in');
    };
    const set = (s) => { page.dataset.state = s; };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    let alive = true;

    async function loop() {
      while (alive) {
        set('plain'); page.classList.remove('spot', 'hl-b', 'hl-pill'); pal('midnight');
        cursor.style.transition = 'none'; cursor.style.transform = 'translate(70%, 80%)'; void cursor.offsetWidth; cursor.style.transition = '';
        cap(0); await wait(2200);
        move('ext'); await wait(900); click(); cap(1);
        set('unveil'); await wait(2300);
        set('skin'); cap(2); await wait(2800);
        page.classList.add('hl-b'); cap(3); await wait(2600); page.classList.remove('hl-b');
        cap(4); move('.dm-mood'); await wait(800); click(); pal('candlelight'); await wait(1500);
        click(); pal('daylight'); await wait(1500); click(); pal('midnight'); await wait(1000);
        cap(5); move('.dm-spot'); await wait(800); click(); page.classList.add('spot'); await wait(2600);
        click(); page.classList.remove('spot');
        cap(6); move('.dm-pill', 40, 0); await wait(600); page.classList.add('hl-pill'); await wait(3400);
        page.classList.remove('hl-pill');
        page.classList.add('fade'); await wait(600); page.classList.remove('fade');
      }
    }
    requestAnimationFrame(loop);
    return () => { alive = false; };
  }
  return { mount };
})();
