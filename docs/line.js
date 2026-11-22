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

  /** mine = points just added by this visitor (highlighted at the end of the line). */
  function render(el, { data, total, mine = 0, lang = 'en' }) {
    const L = S[lang] || S.en;
    const fmt = (n) => Math.round(n).toLocaleString(lang);
    total = Math.max(total, mine); // the visitor's points are always visible, even before the sheet counts them
    const skins = data.skins.filter((s) => s.goal > 0);
    const max = Math.max(1, ...skins.map((s) => s.goal));
    const next = skins.find((s) => s.goal > total);
    const from = pos(total - mine, max), to = pos(total, max);
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
      <div class="track">
        <span class="fill" style="width:0"></span>
        ${mine ? `<span class="mine" style="left:${from}%;width:0"><em>+${mine} ${esc(L.you)}</em></span>` : ''}
        ${skins.map((s) => `<span class="mark${total >= s.goal ? ' on' : ''}" style="left:${pos(s.goal, max)}%" title="${esc(s.name)} — ${fmt(s.goal)} pts">
          <span class="dot">${s.emblem.replace('<svg ', `<svg width="22" height="22" style="color:${s.moods.midnight.accent2};--iv-accent:${s.moods.midnight.accent}" `)}</span>
          <span class="g">${s.goal >= 1000 ? Math.round(s.goal / 100) / 10 + 'k' : s.goal}</span></span>`).join('')}
      </div>`;
    // animate: the community fills first, then the visitor's own points arrive
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.querySelector('.fill').style.width = `${from}%`;
      const m = el.querySelector('.mine');
      if (m) setTimeout(() => { m.style.width = `${Math.max(to - from, 1.2)}%`; m.classList.add('in'); }, 1300);
    }));
  }

  return { load, render };
})();
