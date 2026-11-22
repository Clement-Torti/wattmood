/*
 * The points line — rendered the same way in the page (shadow UI) and in the popup.
 * A square-root scale keeps the early milestones readable while goals grow.
 */
(() => {
  const IV = globalThis.WattMood;
  const t = (k, v) => IV.t(k, v);
  const esc = (s) => IV.esc(s);
  const pos = (p, max) => (max > 0 ? Math.min(100, (Math.sqrt(Math.max(0, p)) / Math.sqrt(max)) * 100) : 0);
  const inner = (svg) => String(svg || '').replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '');

  /** Small emblem for a milestone, coloured with the skin's own accent. */
  IV.skinThumb = (ed, size = 22) =>
    `<svg viewBox="0 0 100 100" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="color:${ed.moods.midnight.accent2};--iv-accent:${ed.moods.midnight.accent}" aria-hidden="true">${inner(ed.emblem)}</svg>`;

  /**
   * Expanded view: total + a "book ladder" — one row per book, in goal order, so every threshold says
   * which book it unlocks (title in the skin's own font, author, goal, state).
   */
  IV.renderPointline = (snap) => {
    const next = snap.next;
    const prev = [...snap.skins].reverse().find((s) => s.global);
    const from = prev ? prev.goal : 0;
    const pct = next ? Math.min(100, ((snap.total - from) / Math.max(1, next.goal - from)) * 100) : 100;
    const pendPct = next && snap.pending ? Math.min(100 - pct, (snap.pending / Math.max(1, next.goal - from)) * 100) : 0;
    const nextEd = next ? IV.getEdition(next.id) : null;
    const rows = snap.skins.filter((s) => s.goal > 0).map((s) => {
      const ed = IV.getEdition(s.id);
      const m = ed.moods.midnight;
      const isNext = next && s.id === next.id;
      const state = s.global ? 'done' : s.mine ? 'mine' : isNext ? 'next' : 'locked';
      const icon = s.global ? '✓' : s.mine ? '★' : isNext ? '➜' : '🔒';
      return `<li class="pl-row is-${state}" style="--b-acc:${m.accent};--b-acc2:${m.accent2}">
        <span class="pl-ic">${icon}</span>
        <span class="pl-book"><b style="font-family:${esc(ed.fonts.display)}">${esc(ed.name)}</b>${ed.inspiredBy ? `<small>${esc(ed.inspiredBy.author)}</small>` : ''}
          ${isNext ? `<span class="pl-rowbar"><i style="width:${pct.toFixed(1)}%"></i>${pendPct ? `<em style="left:${pct.toFixed(1)}%;width:${pendPct.toFixed(1)}%"></em>` : ''}</span>` : ''}</span>
        <span class="pl-goal">${s.global ? esc(t('free')) : s.mine ? esc(t('yours')) : `${IV.fmtNum(s.goal)} pts`}</span>
      </li>`;
    }).join('');
    return `
      <div class="pl-head">
        <div><div class="pl-eyebrow">${esc(t('goal'))}</div>
        <div class="pl-total"><b>${IV.fmtNum(snap.total)}</b> pts${snap.pending ? ` <span class="pl-pending-txt">${esc(t('pending', { n: IV.fmtNum(snap.pending) }))}</span>` : ''}</div></div>
        ${nextEd ? `<div class="pl-next"><div class="pl-next-name">${esc(t('next', { skin: '' }).replace(/\s*:?\s*$/, ''))}</div>
          <div class="pl-next-title" style="font-family:${esc(nextEd.fonts.display)}">${esc(nextEd.name)}</div>
          <div class="pl-next-togo">${esc(t('toGo', { n: IV.fmtNum(Math.max(0, next.goal - snap.total)) }))}</div></div>`
          : `<div class="pl-next done">${esc(t('allUnlocked'))}</div>`}
      </div>
      <ol class="pl-ladder">${rows}</ol>
      ${snap.pending ? `<div class="pl-note">⏳ ${esc(t('reviewNote'))}</div>` : ''}
      ${snap.offline ? `<div class="pl-note muted">${esc(t('offline'))}</div>` : ''}`;
  };

  /** Compact pill: points + progress toward the next skin. */
  IV.renderPointlinePill = (snap) => {
    const next = snap.next;
    const prev = [...snap.skins].reverse().find((s) => s.global);
    const from = prev ? prev.goal : 0;
    const pct = next ? Math.min(100, ((snap.total - from) / Math.max(1, next.goal - from)) * 100) : 100;
    const pendPct = next && snap.pending ? Math.min(100 - pct, (snap.pending / Math.max(1, next.goal - from)) * 100) : 0;
    const ed = next ? IV.getEdition(next.id) : null;
    return `<span class="pill-txt"><b>${IV.fmtNum(snap.total)}</b><small> pts</small></span>
      <span class="pill-bar"><i style="width:${pct.toFixed(1)}%"></i>${pendPct ? `<em style="left:${pct.toFixed(1)}%;width:${pendPct.toFixed(1)}%"></em>` : ''}</span>
      ${ed ? `<span class="pill-next" style="font-family:${esc(ed.fonts.display)}">${esc(ed.name)}</span>` : '<span class="pill-next">✦</span>'}`;
  };
})();
