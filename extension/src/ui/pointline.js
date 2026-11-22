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

  /** Full line (expanded view). */
  IV.renderPointline = (snap) => {
    const max = Math.max(snap.max, snap.total + snap.pending, 1);
    const fill = pos(snap.total, max);
    const pend = Math.max(0, pos(snap.total + snap.pending, max) - fill);
    const marks = snap.skins.filter((s) => s.goal > 0).map((s) => {
      const ed = IV.getEdition(s.id);
      const cls = `pl-mark${s.global ? ' is-reached' : ''}${s.mine && !s.global ? ' is-mine' : ''}${s.review ? ' is-review' : ''}`;
      return `<span class="${cls}" style="left:${pos(s.goal, max).toFixed(2)}%" title="${esc(ed.name)} — ${IV.fmtNum(s.goal)} pts">
        <span class="pl-dot">${IV.skinThumb(ed, 18)}</span><span class="pl-goal">${s.goal >= 1000 ? `${Math.round(s.goal / 100) / 10}k` : s.goal}</span></span>`;
    }).join('');
    const next = snap.next ? IV.getEdition(snap.next.id) : null;
    return `
      <div class="pl-head">
        <div><div class="pl-eyebrow">${esc(t('goal'))}</div>
        <div class="pl-total"><b>${IV.fmtNum(snap.total)}</b> pts${snap.pending ? ` <span class="pl-pending-txt">${esc(t('pending', { n: IV.fmtNum(snap.pending) }))}</span>` : ''}</div></div>
        ${next ? `<div class="pl-next">${IV.skinThumb(next, 26)}<div><div class="pl-next-name">${esc(t('next', { skin: next.name }))}</div><div class="pl-next-togo">${esc(t('toGo', { n: IV.fmtNum(Math.max(0, snap.next.goal - snap.total)) }))}</div></div></div>`
          : `<div class="pl-next done">${esc(t('allUnlocked'))}</div>`}
      </div>
      <div class="pl-track" role="img" aria-label="${esc(t('timeline'))}: ${IV.fmtNum(snap.total)} / ${IV.fmtNum(max)}">
        <span class="pl-fill" style="width:${fill.toFixed(2)}%"></span>
        ${pend > 0 ? `<span class="pl-pend" style="left:${fill.toFixed(2)}%;width:${pend.toFixed(2)}%"></span>` : ''}
        ${marks}
      </div>
      ${snap.pending || snap.skins.some((s) => s.review) ? `<div class="pl-note">⏳ ${esc(t('reviewNote'))}</div>` : ''}
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
    return `${ed ? IV.skinThumb(ed, 22) : '✦'}
      <span class="pill-txt"><b>${IV.fmtNum(snap.total)}</b><small> pts</small></span>
      <span class="pill-bar"><i style="width:${pct.toFixed(1)}%"></i>${pendPct ? `<em style="left:${pct.toFixed(1)}%;width:${pendPct.toFixed(1)}%"></em>` : ''}</span>`;
  };
})();
