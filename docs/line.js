/* Community points line for the public pages (welcome). Renders from skins.json + the Apps Script endpoint. */
window.WMLine = (() => {
  const S = {
    en: { goal: 'Community goal', you: 'you', next: 'Next skin: {s}', toGo: '{n} pts to go', all: 'Every skin is unlocked!' },
    es: { goal: 'Meta de la comunidad', you: 'tú', next: 'Siguiente skin: {s}', toGo: 'faltan {n} pts', all: '¡Todas las skins están desbloqueadas!' },
    pt: { goal: 'Meta da comunidade', you: 'você', next: 'Próxima skin: {s}', toGo: 'faltam {n} pts', all: 'Todas as skins estão desbloqueadas!' },
    fr: { goal: 'Objectif de la communauté', you: 'toi', next: 'Prochain skin : {s}', toGo: 'encore {n} pts', all: 'Tous les skins sont débloqués !' },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pos = (p, max) => (max ? Math.min(100, (Math.sqrt(Math.max(0, p)) / Math.sqrt(max)) * 100) : 0);

  async function load() {
    const data = await fetch('skins.json').then((r) => r.json()).catch(() => ({ skins: [] }));
    let total = 0;
    if (data.endpoint) {
      try {
        const r = await fetch(data.endpoint).then((x) => x.json());
        total = Number(r.total) || 0;
        if (r.goals) data.skins.forEach((s) => { if (r.goals[s.id] !== undefined) s.goal = Number(r.goals[s.id]); });
      } catch (e) { /* offline */ }
    }
    return { data, total };
  }

  /** Book ladder: one row per book in goal order. mine = points just added by this visitor (highlighted). */
  function render(el, { data, total, mine = 0, lang = 'en' }) {
    const L = S[lang] || S.en;
    const fmt = (n) => Math.round(n).toLocaleString(lang);
    total = Math.max(total, mine); // the visitor's points are always visible, even before the sheet counts them
    const skins = data.skins.filter((s) => s.goal > 0).sort((a, b) => a.goal - b.goal);
    const next = skins.find((s) => s.goal > total);
    const prev = [...skins].reverse().find((s) => s.goal <= total);
    const from = prev ? prev.goal : 0;
    const pct = next ? Math.min(100, ((total - from) / Math.max(1, next.goal - from)) * 100) : 100;
    const minePct = next ? Math.min(pct, (mine / Math.max(1, next.goal - from)) * 100) : 0;
    const fonts = data.skins.map((s) => s.fonts.google).join('&');
    if (fonts && !document.getElementById('wm-skin-fonts')) {
      const l = document.createElement('link'); l.id = 'wm-skin-fonts'; l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?${fonts}&display=swap`; document.head.appendChild(l);
    }
    el.innerHTML = `
      <div class="line-top">
        <div style="text-align:left"><div class="kicker">${esc(L.goal)}</div><div class="total"><span>${fmt(total)}</span> <small>pts</small></div></div>
        <div style="text-align:right">${next
          ? `<div class="kicker">${esc(L.next.replace(/\s*:?\s*{s}/, ''))}</div><div style="font:400 26px/1.1 ${next.fonts.display};margin-top:6px">${esc(next.name)}</div><div class="note" style="margin:2px 0 0">${esc(L.toGo.replace('{n}', fmt(next.goal - total)))}</div>`
          : `<div class="kicker">${esc(L.all)}</div>`}</div>
      </div>
      <ol class="ladder">${skins.map((s) => {
        const m = s.moods.midnight;
        const isNext = next && s.id === next.id;
        const st = total >= s.goal ? 'done' : isNext ? 'next' : 'locked';
        return `<li class="rung is-${st}" style="--b-acc:${m.accent};--b-acc2:${m.accent2}">
          <span class="ic">${st === 'done' ? '✓' : isNext ? '➜' : '🔒'}</span>
          <span class="bk"><b style="font-family:${s.fonts.display}">${esc(s.name)}</b>${s.inspiredBy ? `<small>${esc(s.inspiredBy.author)}</small>` : ''}
            ${isNext ? `<span class="rb"><i style="width:0"></i>${mine ? `<em style="width:0"><span>+${mine} ${esc(L.you)}</span></em>` : ''}</span>` : ''}</span>
          <span class="gl">${fmt(s.goal)} pts</span></li>`;
      }).join('')}</ol>`;
    // animate: the community fills first, then the visitor's own points arrive
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const bar = el.querySelector('.rb i'), em = el.querySelector('.rb em');
      if (bar) bar.style.width = `${Math.max(0, pct - minePct)}%`;
      if (em) setTimeout(() => { em.style.left = `${Math.max(0, pct - minePct)}%`; em.style.width = `${Math.max(minePct, 2)}%`; em.classList.add('in'); }, 900);
    }));
  }

  return { load, render };
})();
