/*
 * WattMood share window: one-click share to social networks (web share intents), the system share sheet,
 * copy link, and a 1080×1920 "story image" in the current skin for TikTok / Instagram (no web intents there).
 * The +5 community points are counted only for the first share.
 */
(() => {
  const IV = globalThis.WattMood;
  const t = (k, v) => IV.t(k, v);
  const esc = (s) => IV.esc(s);
  const enc = encodeURIComponent;

  const NETWORKS = [
    { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', url: (u, x) => `https://wa.me/?text=${enc(`${x} ${u}`)}` },
    { id: 'telegram', label: 'Telegram', color: '#2AABEE', url: (u, x) => `https://t.me/share/url?url=${enc(u)}&text=${enc(x)}` },
    { id: 'x', label: 'X', color: '#111', url: (u, x) => `https://twitter.com/intent/tweet?text=${enc(x)}&url=${enc(u)}&hashtags=booktok,wattpad` },
    { id: 'facebook', label: 'Facebook', color: '#1877F2', url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
    { id: 'pinterest', label: 'Pinterest', color: '#E60023', url: (u, x) => `https://pinterest.com/pin/create/button/?url=${enc(u)}&description=${enc(x)}` },
    { id: 'reddit', label: 'Reddit', color: '#FF4500', url: (u, x) => `https://www.reddit.com/submit?url=${enc(u)}&title=${enc(x)}` },
    { id: 'email', label: 'Email', color: '#6b7280', url: (u, x) => `mailto:?subject=${enc('WattMood')}&body=${enc(`${x}\n\n${u}`)}` },
  ];
  const HASHTAGS = { es: '#booktokespañol #wattpad #wattpadlatino', pt: '#booktokbrasil #wattpad #livrosdowattpad', fr: '#booktokfrance #wattpad #newromance', en: '#booktok #wattpad #romancebooks' };

  async function counted(ui, channel) {
    const r = await IV.community.recordShare(channel);
    ui.toast(r === 'counted' ? t('shareCopied') : t('shareLimit'));
    if (r === 'counted') setTimeout(() => ui.app.refreshPoints(true), 2500);
  }

  /** Vertical story image in the current skin, with the community line. */
  async function storyImage(ui) {
    const ed = ui.app.skin, m = ed.moods.midnight, snap = ui.snap;
    const W = 1080, H = 1920;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const display = (ed.fonts.display || 'Georgia, serif');
    try { await document.fonts.load(`80px ${display}`); } catch (e) { /* fallback font */ }
    // background + glows
    g.fillStyle = m.bg; g.fillRect(0, 0, W, H);
    const glow = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'transparent'); g.globalAlpha = a; g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalAlpha = 1; };
    glow(0, H, 1100, m.accent, 0.35); glow(W, 0, 1000, m.accent2, 0.25);
    // emblem (resolve currentColor / CSS variables, standalone SVG has neither)
    const svg = String(ed.emblem || '').replace(/currentColor/g, m.accent2).replace(/var\(--iv-accent\)/g, m.accent).replace(/var\(--iv-accent2\)/g, m.accent2)
      .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="440" ');
    await new Promise((res) => { const im = new Image(); im.onload = () => { g.drawImage(im, (W - 440) / 2, 330, 440, 440); res(); }; im.onerror = res; im.src = 'data:image/svg+xml;charset=utf-8,' + enc(svg); });
    const center = (txt, y, font, col, maxW = W - 140) => { g.font = font; g.fillStyle = col; g.textAlign = 'center'; let s = txt; while (g.measureText(s).width > maxW && s.length > 4) s = s.slice(0, -2); g.fillText(s === txt ? s : s + '…', W / 2, y); };
    center(t('shareIRead').toUpperCase(), 230, '600 38px system-ui, sans-serif', m.accent);
    // title: shrink to fit, then wrap on two lines (never cut a book's name)
    let size = 104, lines = [ed.name];
    g.font = `400 ${size}px ${display}`;
    while (g.measureText(ed.name).width > W - 140 && size > 76) { size -= 4; g.font = `400 ${size}px ${display}`; }
    if (g.measureText(ed.name).width > W - 140) {
      const words = ed.name.split(' '); let a1 = '', i = 0;
      while (i < words.length && g.measureText(`${a1} ${words[i]}`.trim()).width <= W - 140) a1 = `${a1} ${words[i++]}`.trim();
      lines = [a1 || words[i++], words.slice(i).join(' ')].filter(Boolean);
    }
    const y0 = lines.length > 1 ? 870 : 900;
    lines.forEach((ln, k) => center(ln, y0 + k * size * 1.05, `400 ${size}px ${display}`, m.text, W - 100));
    if (ed.inspiredBy) center(ed.inspiredBy.author, y0 + (lines.length - 1) * size * 1.05 + 78, 'italic 44px Georgia, serif', m.muted);
    // community line
    const total = snap ? snap.total + (snap.pending || 0) : 0;
    const next = snap && snap.next ? IV.getEdition(snap.next.id) : null;
    center(`🌍 ${IV.fmtNum(total)} ${t('shareCommunity')}`, 1210, '700 54px system-ui, sans-serif', m.text);
    if (next) {
      const prev = [...snap.skins].reverse().find((s) => s.global);
      const from = prev ? prev.goal : 0;
      const pct = Math.max(0.02, Math.min(1, (total - from) / Math.max(1, snap.next.goal - from)));
      const x = 140, y = 1260, w = W - 280, h = 26;
      g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(x, y, w, h, 13); g.fill();
      const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, m.accent); gr.addColorStop(1, m.accent2);
      g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, w * pct, h, 13); g.fill();
      center(`${t('shareNext')}: ${next.name}`, 1360, `400 52px ${next.fonts.display || 'Georgia, serif'}`, m.accent2);
    }
    // call to action
    center('WattMood', 1620, '400 88px Georgia, serif', m.text);
    center(t('shareGet'), 1690, '600 40px system-ui, sans-serif', m.muted);
    center(IV.CONFIG.SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, ''), 1750, '600 36px system-ui, sans-serif', m.accent);
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `wattmood-${ed.id}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  IV.openShare = async (ui) => {
    const link = (ch) => IV.community.shareLink(ch);
    const text = t('shareText');
    const shared = await IV.community.hasShared();
    const m = ui.openModal(`
      <div class="eyebrow">${esc(t('share'))}${shared ? '' : ` · ${esc(t('shareBonus'))}`}</div><h2>${esc(t('shareTitle'))}</h2>
      <p class="d-note">${esc(t('shareSub'))}</p>
      <div class="nets">${NETWORKS.map((n) => `<button class="net" data-net="${n.id}" style="--n:${n.color}"><i>${n.label[0]}</i><span>${n.label}</span></button>`).join('')}
        ${navigator.share ? `<button class="net" data-net="native" style="--n:#8b5cf6"><i>⋯</i><span>${esc(t('shareMore'))}</span></button>` : ''}</div>
      <div class="story-box">
        <div><b>🎬 TikTok · 📸 Instagram</b><p class="d-note">${esc(t('shareStoryHint'))}</p></div>
        <button class="btn primary" data-net="story">⬇ ${esc(t('shareStory'))}</button>
      </div>
      <div class="code-row"><code class="share-link"></code><button class="btn ghost small" data-net="copy">${esc(t('shareCopy'))}</button></div>`, 'share');
    m.querySelector('.share-link').textContent = (await link('copy')).replace(/^https?:\/\//, '');
    m.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-net]');
      if (!b) return;
      const id = b.dataset.net;
      const u = await link(id);
      if (id === 'copy') {
        try { await navigator.clipboard.writeText(`${text} ${u}`); } catch (_) { /* blocked */ }
        b.textContent = t('copied');
      } else if (id === 'native') {
        try { await navigator.share({ title: 'WattMood', text, url: u }); } catch (_) { return; }
      } else if (id === 'story') {
        b.disabled = true;
        await storyImage(ui);
        b.disabled = false;
        const caption = `${t('shareCaption')}\n${u}\n${HASHTAGS[IV.lang()] || HASHTAGS.en}`;
        try { await navigator.clipboard.writeText(caption); } catch (_) { /* blocked */ }
        ui.toast(t('shareStoryDone'));
        await IV.community.recordShare('story');
        setTimeout(() => ui.app.refreshPoints(true), 2500);
        return;
      } else {
        const n = NETWORKS.find((x) => x.id === id);
        window.open(n.url(u, text), '_blank', 'noopener,width=640,height=720');
      }
      await counted(ui, id);
    });
  };
})();
