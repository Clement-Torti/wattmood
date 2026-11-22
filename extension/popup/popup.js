/* WattMood popup: points line, skins (locked / unlocked), mood, language, share / donate / coupon / feedback. */
(async () => {
  const IV = globalThis.WattMood;
  const $ = (s) => document.querySelector(s);
  const t = (k, v) => IV.t(k, v);
  let settings = await IV.settings.load();
  IV.setLang(settings.lang);
  const save = () => IV.settings.write(settings, 'popup');

  let tab = null;
  try { [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); } catch (e) { /* no tab */ }
  const onWattpad = !!(tab && /^https:\/\/www\.wattpad\.com\//.test(tab.url || ''));
  const toPage = async (type) => {
    if (onWattpad) {
      try { await chrome.tabs.sendMessage(tab.id, { type }); window.close(); return; } catch (e) { /* fall through */ }
    }
    chrome.tabs.create({ url: `https://www.wattpad.com/?wattmood=${type.replace('wm:', '')}` });
    window.close();
  };

  function texts() {
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('[data-act="share"]').innerHTML = `${t('share')} <em>${t('shareBonus')}</em>`;
    $('[data-act="donate"]').innerHTML = `${t('donate')} <em>${t('donateBonus')}</em>`;
    $('[data-act="coupon"]').textContent = `🎟 ${t('haveCoupon')}`;
    $('[data-act="feedback"]').textContent = `💬 ${t('feedbackTitle')}`;
    $('#lang').innerHTML = `<option value="auto">${t('auto')}</option>` + IV.LANGS.map((l) => `<option value="${l.id}">${l.label}</option>`).join('');
    $('#lang').value = settings.lang || 'auto';
  }

  function theme() {
    const ed = IV.getEdition(settings.edition);
    for (const [k, v] of Object.entries(IV.cssVars(ed, 'midnight'))) document.body.style.setProperty(k, v);
    IV.loadFonts(ed);
  }

  async function render(snap) {
    $('#pl').innerHTML = IV.renderPointline(snap);
    const lad = $('#pl .pl-ladder'), row = $('#pl .pl-row.is-next');
    if (lad && row) lad.scrollTop = Math.max(0, row.offsetTop - lad.offsetTop - 60);
    $('#enabled').checked = settings.enabled;
    $('#skins').innerHTML = snap.skins.map((s) => {
      const ed = IV.getEdition(s.id);
      const m = ed.moods.midnight;
      const badge = s.goal === 0 ? t('free') : s.mine && !s.global ? t('yours') : s.unlocked ? '' : t('locked', { n: IV.fmtNum(s.goal) });
      return `<button class="sk${s.unlocked ? '' : ' locked'}${ed.id === settings.edition ? ' on' : ''}" data-skin="${ed.id}" title="${IV.esc(ed.tagline || '')}"
        style="--c-bg:${m.bg};--c-acc:${m.accent};--c-acc2:${m.accent2};--c-text:${m.text}">
        <span class="sk-art">${IV.skinThumb(ed, 34)}</span>
        <span class="sk-name" style="font-family:${IV.esc(ed.fonts.display)}">${IV.esc(ed.name)}</span>
        ${ed.inspiredBy ? `<span class="sk-from">${IV.esc(ed.inspiredBy.author)}</span>` : ''}
        ${badge ? `<span class="sk-badge">${s.unlocked ? '' : '🔒 '}${IV.esc(badge)}</span>` : ''}
      </button>`;
    }).join('');
    const ed = IV.getEdition(settings.edition);
    const cur = IV.resolveMood(settings);
    $('#moods').innerHTML = IV.MOODS.map((m) => {
      const p = ed.moods[m.id];
      return `<button class="mood${m.id === cur ? ' is-on' : ''}" data-mood="${m.id}"><i style="background:linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)"></i><span>${IV.esc((ed.moodLabels && ed.moodLabels[m.id]) || t(m.id))}</span></button>`;
    }).join('');
  }

  const refresh = async (force) => { await IV.community.refresh(force); render(await IV.community.snapshot()); };

  document.addEventListener('click', async (e) => {
    const sk = e.target.closest('.sk');
    if (sk) {
      if (sk.classList.contains('locked')) return toPage('wm:donate');
      settings.edition = sk.dataset.skin;
      settings.enabled = true;
      await save();
      if (onWattpad) chrome.tabs.sendMessage(tab.id, { type: 'wm:skin', skin: sk.dataset.skin }).catch(() => {});
      theme();
      render(await IV.community.snapshot());
      return;
    }
    const mood = e.target.closest('.mood');
    if (mood) { settings.mood = mood.dataset.mood; settings.autoMood = false; await save(); render(await IV.community.snapshot()); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const a = act.dataset.act;
    if (a === 'share') toPage('wm:share');
    else if (a === 'donate') toPage('wm:donate');
    else if (a === 'coupon') toPage('wm:coupon');
    else if (a === 'feedback') toPage('wm:feedback');
  });
  $('#enabled').addEventListener('change', async () => { settings.enabled = $('#enabled').checked; await save(); });
  $('#lang').addEventListener('change', async () => {
    settings.lang = $('#lang').value;
    IV.setLang(settings.lang);
    await save();
    texts();
    render(await IV.community.snapshot());
  });

  texts();
  theme();
  render(await IV.community.snapshot());
  refresh(false);
})();
