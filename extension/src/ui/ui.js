/*
 * WattMood floating UI (own shadow root, so Wattpad's CSS can't touch it):
 *   points line (top-left) · dock (bottom) · Atelier (right drawer) · donate / feedback / celebration modals
 *   · skin openings (Unveiling) · toasts
 */
(() => {
  const IV = globalThis.WattMood;
  const t = (k, v) => IV.t(k, v);
  const esc = (s) => IV.esc(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = (tag, cls, html) => { const el = document.createElement(tag); if (cls) el.className = cls; if (html != null) el.innerHTML = html; return el; };

  const ICON = {
    mood: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16z" class="fill"/></svg>',
    atelier: '<svg viewBox="0 0 24 24"><path d="M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z"/></svg>',
    spotlight: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    focus: '<svg viewBox="0 0 24 24"><path d="M8 4v16M16 4v16M4 4h16v16H4z"/></svg>',
    power: '<svg viewBox="0 0 24 24"><path d="M12 3v9M6.3 7.5a8 8 0 1 0 11.4 0"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  };

  class UI {
    constructor(app) {
      this.app = app;
    }

    mount() {
      const host = (this.host = document.createElement('div'));
      host.id = 'wattmood-ui';
      host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;z-index:1040;';
      const shadow = host.attachShadow({ mode: 'open' });
      // invisible until its stylesheet has loaded: otherwise the panel, points card and windows show unstyled for a moment
      host.style.visibility = 'hidden';
      // no transitions while the styles arrive: hidden parts (points card, Atelier, windows) must start hidden,
      // not fade out from visible
      const still = document.createElement('style');
      // …and the parts that start closed are forced closed until then, whatever the timing
      still.textContent = '*, *::before, *::after { transition: none !important; } .pl-card, .panel, .modal-wrap, .scrim, .toast { opacity: 0 !important; visibility: hidden !important; }';
      shadow.appendChild(still);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('src/ui/ui.css');
      const reveal = () => requestAnimationFrame(() => {
        host.style.visibility = '';
        requestAnimationFrame(() => requestAnimationFrame(() => still.remove()));
      });
      link.addEventListener('load', reveal, { once: true });
      link.addEventListener('error', reveal, { once: true });
      shadow.appendChild(link);
      const ui = (this.ui = h('div', 'ui'));
      ui.innerHTML = `
        <div class="pl" aria-live="polite">
          <button class="pill" data-act="pl" aria-expanded="false"></button>
          <div class="pl-card">
            <div class="pl-body"></div>
            <button class="link-btn" data-act="coupon">🎟 ${esc(t('haveCoupon'))}</button>
            <div class="pl-actions">
              <button class="btn ghost" data-act="share">${ICON.share}<span>${esc(t('share'))}</span><em>${esc(t('shareBonus'))}</em></button>
              <button class="btn primary" data-act="donate">${ICON.heart}<span>${esc(t('donate'))}</span><em>${esc(t('donateBonus'))}</em></button>
            </div>
          </div>
        </div>
        <div class="ribbon" aria-hidden="true"><span></span></div>
        <nav class="dock" aria-label="WattMood">
          <span class="left"></span><span class="sep left-sep"></span>
          <button data-act="mood" title="${esc(t('moodCycle'))}">${ICON.mood}</button>
          <button data-act="atelier" title="${esc(t('atelierBtn'))}">${ICON.atelier}</button>
          <button data-act="spotlight" class="chapter-only" title="${esc(t('spotlightBtn'))}">${ICON.spotlight}</button>
          <button data-act="focus" class="chapter-only" title="${esc(t('focusBtn'))}">${ICON.focus}</button>
          <span class="sep"></span>
          <button data-act="power" title="${esc(t('powerBtn'))}">${ICON.power}</button>
        </nav>
        <div class="scrim"></div>
        <aside class="panel" aria-label="${esc(t('atelier'))}"></aside>
        <div class="modal-wrap"><div class="modal" role="dialog" aria-modal="true"></div></div>
        <div class="toast" role="status"></div>`;
      shadow.appendChild(ui);
      this.$ = (sel) => ui.querySelector(sel);
      this.ui.classList.toggle('has-chapter', !!this.app.chapter);
      document.documentElement.appendChild(host);
      this.bind();
      this.renderPanel();
      this.sync();
    }

    /* ---------------------------------------------------------------- */
    sync() {
      const app = this.app, s = app.settings, ed = app.skin;
      const mood = IV.resolveMood(s);
      for (const [k, v] of Object.entries(IV.cssVars(ed, mood))) this.host.style.setProperty(k, v);
      IV.loadFonts(ed);
      this.ui.classList.toggle('is-off', !s.enabled);
      this.ui.classList.toggle('no-pl', s.pointline === false);
      this.$('.dock').classList.toggle('is-on', true);
      this.$('[data-act="spotlight"]').classList.toggle('is-on', !!s.spotlight);
      this.$('[data-act="focus"]').classList.toggle('is-on', !!s.focus);
      this.$('[data-act="power"]').classList.toggle('is-on', !!s.enabled);
      this.syncPanel();
    }

    updatePoints(snap) {
      this.snap = snap;
      this.$('.pill').innerHTML = IV.renderPointlinePill(snap);
      this.$('.pl-body').innerHTML = IV.renderPointline(snap);
      this.scrollLadder();
      this.renderSkins();
    }

    /** Keep the next book in view inside the ladder. */
    scrollLadder() {
      const lad = this.$('.pl-ladder'), row = this.$('.pl-row.is-next');
      if (lad && row) lad.scrollTop = Math.max(0, row.offsetTop - lad.offsetTop - 60);
    }

    setProgress(p) {
      if (!p) return;
      this.$('.left').textContent = p.left < 40 ? t('chapterEnd') : t('minLeft', { n: p.minutes });
      this.$('.ribbon span').style.transform = `scaleX(${p.total ? Math.min(1, p.read / p.total) : 0})`;
    }
    setChromeAway(away, down) {
      this.$('.ribbon').classList.toggle('is-on', away);
      this.$('.dock').classList.toggle('is-away', down);
    }

    /* ---------------------------------------------------------------- */
    /* Atelier                                                           */
    /* ---------------------------------------------------------------- */
    renderPanel() {
      const app = this.app;
      const slider = (key, label, min, max, step) => `<label class="range"><span>${esc(label)}</span><output></output>
        <input type="range" data-set="${key}" min="${min}" max="${max}" step="${step}"></label>`;
      const check = (key, label, cls = '') => `<label class="check ${cls}"><input type="checkbox" data-set="${key}"><span>${esc(label)}</span></label>`;
      this.$('.panel').innerHTML = `
        <div class="panel-head"><div><div class="eyebrow">${esc(t('atelier'))}</div><div class="panel-title">${esc(t('makeItYours'))}</div></div>
          <button class="x" data-act="close">${ICON.close}</button></div>
        <section><h3>${esc(t('skins'))}</h3><div class="cards"></div></section>
        <section><h3>${esc(t('mood'))}</h3><div class="moods">${IV.MOODS.map((m) => `<button class="mood" data-mood="${m.id}"><i></i><span></span></button>`).join('')}</div>
          ${check('autoMood', t('followTime'))}</section>
        ${app.chapter ? `<section><h3>${esc(t('typesetting'))}</h3>
          ${slider('fontScale', t('textSize'), 0.8, 1.5, 0.05)}${slider('lineHeight', t('lineSpacing'), 1.4, 2.2, 0.05)}${slider('measure', t('columnWidth'), 26, 48, 1)}</section>` : ''}
        <section><h3>${esc(t('immersion'))}</h3>
          ${slider('atmosphere', t('atmosphere'), 0, 1, 0.05)}
          ${check('unveil', t('unveil'))}
          ${app.chapter ? check('reveal', t('reveal')) + check('spotlight', t('spotlight')) : ''}
        </section>
        ${app.chapter ? `<section><h3>${esc(t('page'))}</h3>${check('focus', t('focus'))}${check('hideChrome', t('hideChrome'))}</section>` : ''}
        <section><h3>${esc(t('language'))}</h3>
          <select data-set="lang"><option value="auto">${esc(t('auto'))}</option>${IV.LANGS.map((l) => `<option value="${l.id}">${l.label}</option>`).join('')}</select></section>
        <section><h3>${esc(t('haveCoupon'))}</h3><button class="btn ghost wide" data-act="coupon">🎟 <span>${esc(t('couponTitle'))}</span></button></section>
        <section><h3>${esc(t('feedback'))}</h3><button class="btn ghost wide" data-act="feedback">${ICON.chat}<span>${esc(t('feedbackTitle'))}</span></button></section>
        <section class="journal"></section>
        <section><button class="btn ghost wide" data-act="power">${ICON.power}<span class="power-label"></span></button></section>`;
      this.renderSkins();
      this.syncPanel();
    }

    renderSkins() {
      const box = this.$('.panel .cards');
      if (!box) return;
      const snap = this.snap;
      const cur = this.app.skin.id;
      const list = snap ? snap.skins : [...IV.editions.values()].map((e) => ({ id: e.id, goal: 0, unlocked: e.id === 'classic' }));
      box.innerHTML = list.map((s) => {
        const ed = IV.getEdition(s.id);
        if (!ed) return '';
        const m = ed.moods.midnight;
        const state = s.goal === 0 ? t('free') : s.mine && !s.global ? t('yours') : s.unlocked ? '' : s.review ? t('inReview') : t('locked', { n: IV.fmtNum(s.goal) });
        return `<button class="card${s.unlocked ? '' : ' is-locked'}${ed.id === cur ? ' is-on' : ''}" data-skin="${esc(ed.id)}" ${s.unlocked ? '' : 'aria-disabled="true"'}
          style="--c-bg:${m.bg};--c-acc:${m.accent};--c-acc2:${m.accent2};--c-text:${m.text};--c-font:${esc(ed.fonts && ed.fonts.display)}">
          <span class="card-art">${ed.emblem || ''}</span>
          <span class="card-body">
            <span class="card-name">${esc(ed.name)}${state ? `<em class="${s.review ? 'review' : ''}">${s.unlocked ? '' : ICON.lock}${esc(state)}</em>` : ''}</span>
            <span class="card-from">${ed.inspiredBy ? esc(t('inspiredBy', { book: ed.inspiredBy.author })) : esc(ed.tagline || '')}</span>
          </span></button>`;
      }).join('');
    }

    syncPanel() {
      const panel = this.$('.panel');
      if (!panel) return;
      const s = this.app.settings, ed = this.app.skin;
      const mood = IV.resolveMood(s);
      panel.querySelectorAll('.card').forEach((c) => c.classList.toggle('is-on', c.dataset.skin === ed.id));
      panel.querySelectorAll('.mood').forEach((b) => {
        const id = b.dataset.mood;
        b.classList.toggle('is-on', id === mood);
        b.querySelector('span').textContent = (ed.moodLabels && ed.moodLabels[id]) || t(id);
        const pal = ed.moods[id];
        b.querySelector('i').style.background = `linear-gradient(135deg, ${pal.bg} 50%, ${pal.accent} 50%)`;
      });
      panel.querySelectorAll('[data-set]').forEach((inp) => {
        const k = inp.dataset.set;
        if (inp.type === 'checkbox') inp.checked = !!s[k];
        else if (inp.tagName === 'SELECT') inp.value = s[k] || 'auto';
        else {
          inp.value = s[k];
          const out = inp.parentElement.querySelector('output');
          if (out) out.textContent = fmt(k, s[k]);
        }
      });
      const pl = panel.querySelector('.power-label');
      if (pl) pl.textContent = s.enabled ? t('turnOff') : t('turnOn');
    }

    openPanel() {
      this.$('.panel').classList.add('is-open');
      this.ui.classList.add('has-panel');
      IV.journal.summary().then((j) => {
        const box = this.$('.journal');
        if (box) box.innerHTML = `<h3>${esc(t('journal'))}</h3>
          <div class="stats"><div><b>${IV.fmtNum(j.today)}</b><span>${esc(t('wordsToday'))}</span></div>
          <div><b>${IV.fmtNum(j.week)}</b><span>${esc(t('thisWeek'))}</span></div>
          <div><b>${j.streak}</b><span>${esc(t('dayStreak'))}</span></div></div>`;
      }).catch(() => {});
    }
    closePanel() {
      this.$('.panel').classList.remove('is-open');
      this.ui.classList.remove('has-panel');
    }

    /* ---------------------------------------------------------------- */
    /* Modals                                                            */
    /* ---------------------------------------------------------------- */
    openModal(html, cls = '') {
      // fresh element each time: handlers added by a previous window must not fire again
      const old = this.$('.modal');
      const m = old.cloneNode(false);
      old.replaceWith(m);
      m.className = `modal ${cls}`;
      m.innerHTML = `<button class="x modal-x" data-act="modal-close" aria-label="${esc(t('close'))}">${ICON.close}</button>${html}`;
      this.$('.modal-wrap').classList.add('is-open');
      this.closePanel();
      return m;
    }
    closeModal() {
      this.$('.modal-wrap').classList.remove('is-open');
      this.onModalClose && this.onModalClose();
      this.onModalClose = null;
    }

    async openDonate() {
      const C = IV.CONFIG;
      const code = await IV.community.code();
      const snap = this.snap || (await IV.community.snapshot());
      const locked = snap.skins.filter((x) => !x.unlocked);
      const lang = navigator.language || '';
      const byRegion = { MX: 'MXN', AR: 'ARS', CO: 'COP', CL: 'CLP', PE: 'PEN', GB: 'GBP', BR: 'BRL', CA: 'CAD', CH: 'CHF', US: 'USD' };
      const region = (lang.match(/-([A-Z]{2})$/i) || [])[1];
      let cur = (region && byRegion[region.toUpperCase()]) || ({ pt: 'BRL', en: 'USD' }[IV.lang()] || 'EUR');
      let amount = C.CURRENCIES[cur].presets[0]; // 1 € / 1 $ by default
      let pick = locked.length ? locked[0].id : null;
      const thumb = (id, size) => IV.skinThumb(IV.getEdition(id), size);
      const m = this.openModal(`
        <div class="eyebrow">${esc(t('donate'))}</div><h2>${esc(t('donateTitle'))}</h2>
        <label class="field-label">${esc(t('donateAmount'))}</label>
        <div class="amounts"></div>
        <div class="amount-row"><input type="number" min="1" step="1" class="amount" inputmode="decimal">
          <select class="currency" aria-label="${esc(t('currency'))}">${Object.keys(C.CURRENCIES).map((c) => `<option value="${c}">${c}</option>`).join('')}</select></div>
        <label class="field-label">${esc(t('giftTitle'))}</label>
        <div class="ladder"></div>
        <div class="pick-box"></div>
        <div class="code-box"><div>${esc(t('donateCode'))}</div><div class="code-row"><code>${esc(code)}</code><button class="btn ghost small" data-act="copy-code">${esc(t('copy'))}</button></div></div>
        <div class="d-note">👪 ${esc(t('donateMinor'))}</div>
        <div class="modal-actions"><button class="btn ghost" data-act="modal-close">${esc(t('cancel'))}</button><button class="btn primary" data-act="donate-go">${esc(t('donateGo'))} ↗</button></div>`, 'donate');
      const $ = (sel) => m.querySelector(sel);
      const render = () => {
        const c = C.CURRENCIES[cur];
        const money = (v) => `${c.symbol}${IV.fmtNum(v)}`;
        const eur = IV.community.toEur(amount, cur);
        const tier = eur >= C.ALL_SKINS_EUR ? 2 : eur >= C.PICK_ONE_EUR ? 1 : 0;
        $('.amounts').innerHTML = c.presets.map((v) => `<button class="chip${+amount === v ? ' is-on' : ''}" data-amount="${v}">${money(v)}</button>`).join('');
        if (document.activeElement !== $('.amount') || +$('.amount').value !== +amount) $('.amount').value = amount;
        $('.currency').value = cur;
        const steps = [
          { min: c.presets[0], extra: '' },
          { min: Math.ceil(C.PICK_ONE_EUR / c.rate), extra: t('giftOne') },
          { min: Math.ceil(C.ALL_SKINS_EUR / c.rate), extra: t('giftAll') },
        ];
        $('.ladder').innerHTML = steps.map((st, i) => `<button class="step${i === tier ? ' is-on' : ''}${i < tier ? ' is-done' : ''}" data-amount="${st.min}">
          <b>${money(st.min)}${i ? '+' : ''}</b><span>${esc(t('giftPoints', { n: IV.fmtNum(IV.community.pointsFor(i === tier ? amount : st.min, cur)) }))}</span>${st.extra ? `<em>${esc(st.extra)}</em>` : ''}</button>`).join('');
        if (tier === 1 && locked.length) {
          $('.pick-box').innerHTML = `<div class="pick-title">🎁 ${esc(t('pickTitle'))}</div>
            <div class="pick-grid">${locked.map((x) => { const e = IV.getEdition(x.id); return `<button class="pick-skin${x.id === pick ? ' is-on' : ''}" data-pick="${x.id}" style="--c-bg:${e.moods.midnight.bg};--c-text:${e.moods.midnight.text};--c-acc2:${e.moods.midnight.accent2}">
              ${thumb(x.id, 30)}<span class="pn" style="font-family:${esc(e.fonts.display)}">${esc(e.name)}</span>${e.inspiredBy ? `<span class="pf">${esc(e.inspiredBy.author)}</span>` : ''}</button>`; }).join('')}</div>
            <div class="d-note">${esc(t('pickNote'))}</div>`;
        } else if (tier === 2 && locked.length) {
          $('.pick-box').innerHTML = `<div class="pick-title">✨ ${esc(t('allTitle'))}</div><div class="all-row">${locked.map((x) => `<span title="${esc(IV.getEdition(x.id).name)}">${thumb(x.id, 30)}</span>`).join('')}</div>
            <div class="d-note">${esc(t('pickNote'))}</div>`;
        } else $('.pick-box').innerHTML = '';
        $('[data-act="donate-go"]').disabled = !(eur > 0);
      };
      m.addEventListener('click', async (e) => {
        const chip = e.target.closest('[data-amount]');
        if (chip) { amount = +chip.dataset.amount; render(); return; }
        const ps = e.target.closest('[data-pick]');
        if (ps) { pick = ps.dataset.pick; render(); return; }
        if (e.target.closest('[data-act="copy-code"]')) {
          try { await navigator.clipboard.writeText(code); } catch (_) { /* ignore */ }
          e.target.closest('button').textContent = t('copied');
        }
        if (e.target.closest('[data-act="donate-go"]')) {
          try { await navigator.clipboard.writeText(code); } catch (_) { /* ignore */ }
          const eur = IV.community.toEur(amount, cur);
          await IV.community.pledge({ amount, currency: cur, pick: eur >= C.PICK_ONE_EUR && eur < C.ALL_SKINS_EUR ? pick : null });
          await IV.community.openDonate();
          this.openModal(`<div class="thanks-art">${IV.skinThumb(this.app.skin, 64)}</div><h2>${esc(t('donateThanks'))}</h2>
            <p>${esc(t('donateCode'))}</p><div class="code-row center"><code>${esc(code)}</code></div>
            <div class="modal-actions"><button class="btn primary" data-act="modal-close">${esc(t('close'))}</button></div>`, 'thanks');
          this.app.refreshPoints(false);
        }
      });
      m.addEventListener('input', (e) => {
        if (e.target.classList.contains('amount')) { amount = Math.max(0, parseFloat(e.target.value) || 0); render(); }
        if (e.target.classList.contains('currency')) { cur = e.target.value; amount = C.CURRENCIES[cur].presets[0]; render(); }
      });
      render();
    }

    async openCoupon() {
      const snap = this.snap || (await IV.community.snapshot());
      const locked = snap.skins.filter((s) => !s.unlocked);
      const lastPick = ((await IV.community.pledges()).filter((p) => p.pick).pop() || {}).pick;
      const m = this.openModal(`
        <div class="eyebrow">${esc(t('haveCoupon'))}</div><h2>${esc(t('couponTitle'))}</h2>
        <p class="d-note">${esc(t('couponHint'))}</p>
        <label class="field-label">${esc(t('couponCode'))}</label>
        <input class="coupon" autocomplete="off" spellcheck="false" placeholder="WMC-XXXX-XXXX" style="font:700 17px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase">
        ${locked.length ? `<label class="field-label" style="margin-top:12px">${esc(t('couponPick'))}</label>
        <select class="pick">${locked.map((s) => { const e = IV.getEdition(s.id); return `<option value="${s.id}"${s.id === lastPick ? ' selected' : ''}>${esc(e.name)}${e.inspiredBy ? ` — ${esc(t('inspiredBy', { book: e.inspiredBy.author }))}` : ''}</option>`; }).join('')}</select>` : ''}
        <div class="fb-err"></div>
        <p class="d-note">${esc(t('couponSync'))}</p>
        <div class="modal-actions"><button class="btn ghost" data-act="modal-close">${esc(t('cancel'))}</button><button class="btn primary" data-act="coupon-go">${esc(t('couponGo'))}</button></div>`, 'coupon');
      const go = async () => {
        const btn = m.querySelector('[data-act="coupon-go"]');
        btn.disabled = true;
        const r = await IV.community.redeem(m.querySelector('.coupon').value, m.querySelector('.pick') && m.querySelector('.pick').value);
        btn.disabled = false;
        if (!r.ok) { m.querySelector('.fb-err').textContent = t({ used: 'couponUsed', offline: 'couponOffline' }[r.error] || 'couponInvalid'); return; }
        this.closeModal();
        this.toast(t('couponOk'));
        this.app.refreshPoints(false, true); // the celebration plays for the newly unlocked skins
      };
      m.addEventListener('click', (e) => { if (e.target.closest('[data-act="coupon-go"]')) go(); });
      m.querySelector('.coupon').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      setTimeout(() => m.querySelector('.coupon').focus(), 50);
    }

    openFeedback() {
      let rating = 0;
      const faces = ['😞', '🙁', '😐', '🙂', '😍'];
      const m = this.openModal(`
        <div class="eyebrow">${esc(t('feedback'))}</div><h2>${esc(t('feedbackTitle'))}</h2>
        <label class="field-label">${esc(t('feedbackRate'))}</label>
        <div class="faces">${faces.map((f, i) => `<button class="face" data-rate="${i + 1}" aria-label="${i + 1}/5">${f}</button>`).join('')}</div>
        <textarea class="fb-text" rows="5" maxlength="2000" placeholder="${esc(t('feedbackHint'))}"></textarea>
        <div class="fb-err"></div>
        <div class="modal-actions"><button class="btn ghost" data-act="modal-close">${esc(t('cancel'))}</button><button class="btn primary" data-act="fb-send">${esc(t('feedbackSend'))}</button></div>`, 'feedback');
      m.addEventListener('click', async (e) => {
        const f = e.target.closest('[data-rate]');
        if (f) { rating = +f.dataset.rate; m.querySelectorAll('.face').forEach((b) => b.classList.toggle('is-on', +b.dataset.rate === rating)); }
        if (e.target.closest('[data-act="fb-send"]')) {
          const text = m.querySelector('.fb-text').value;
          if (!text.trim() && !rating) { m.querySelector('.fb-err').textContent = t('feedbackEmpty'); return; }
          await IV.community.feedback({ rating, text, skin: this.app.skin.id });
          this.closeModal();
          this.toast(t('feedbackThanks'));
        }
      });
      setTimeout(() => m.querySelector('.fb-text').focus(), 50);
    }

    /** The big moment: a new skin is unlocked (by the community, or for you after your donation was verified). */
    celebrate(unlocks) {
      return new Promise((resolve) => {
        const first = unlocks[0];
        const ed = IV.getEdition(first.id);
        const snap = this.snap || { total: 0 };
        const m = ed.moods.midnight;
        const confetti = Array.from({ length: 60 }, (_, i) => {
          const x = Math.random() * 100, d = 2.2 + Math.random() * 2.2, delay = Math.random() * 0.8, rot = Math.random() * 720 - 360;
          const c = [m.accent, m.accent2, '#ffffff'][i % 3];
          return `<i style="left:${x.toFixed(1)}%;background:${c};animation-duration:${d.toFixed(2)}s;animation-delay:${delay.toFixed(2)}s;--rot:${rot.toFixed(0)}deg;--w:${(5 + Math.random() * 6).toFixed(0)}px"></i>`;
        }).join('');
        const title = first.mine ? t('yoursTitle') : t('unlockedTitle');
        const body = first.mine ? t('yoursBody') : t('unlockedBody', { total: IV.fmtNum(snap.total), skin: ed.name });
        const wrap = h('div', 'celebrate');
        wrap.style.cssText = `--c-bg:${m.bg};--c-acc:${m.accent};--c-acc2:${m.accent2};--c-text:${m.text};--c-font:${ed.fonts.display}`;
        wrap.innerHTML = `
          <div class="cb-rays"></div><div class="cb-confetti">${confetti}</div>
          <div class="cb-card">
            <div class="cb-art">${ed.emblem}</div>
            <div class="cb-kicker">✦ ${esc(title)} ✦</div>
            <div class="cb-name">${esc(ed.name)}</div>
            ${ed.inspiredBy ? `<div class="cb-from">${esc(t('inspiredBy', { book: ed.inspiredBy.author }))}</div>` : ''}
            <p class="cb-body">${esc(body)}</p>
            <div class="cb-actions"><button class="btn ghost" data-act="cb-later">${esc(t('later'))}</button><button class="btn primary" data-act="cb-wear">${esc(t('wearNow'))}</button></div>
          </div>`;
        IV.loadFonts(ed);
        this.ui.appendChild(wrap);
        requestAnimationFrame(() => wrap.classList.add('is-on'));
        const done = (wear) => {
          wrap.classList.remove('is-on');
          setTimeout(() => wrap.remove(), 450);
          resolve(wear ? first.id : null);
        };
        wrap.addEventListener('click', (e) => {
          if (e.target.closest('[data-act="cb-wear"]')) done(true);
          else if (e.target.closest('[data-act="cb-later"]')) done(false);
        });
      });
    }

    /* ---------------------------------------------------------------- */
    /* Openings                                                          */
    /* ---------------------------------------------------------------- */
    async unveil(ed, swap) {
      const u = ed.unveil;
      if (!this.app.settings.unveil || IV.reducedMotion() || !u || typeof u.render !== 'function') return this.crossfade(swap);
      if (this.unveiling) return swap();
      this.unveiling = true;
      const layer = h('div', 'unveil');
      const mood = IV.resolveMood(this.app.settings);
      for (const [k, v] of Object.entries(IV.cssVars(ed, mood))) layer.style.setProperty(k, v);
      const w = document.documentElement.clientWidth || innerWidth, hgt = innerHeight;
      layer.innerHTML = u.render({ w, h: hgt, rand: IV.rng(Date.now() % 100000), mood, edition: ed });
      this.ui.appendChild(layer);
      const swapAt = u.swapAt || (u.duration || 2000) / 2;
      await sleep(swapAt);
      swap();
      await sleep(Math.max(0, (u.duration || 2000) - swapAt));
      layer.classList.add('is-done');
      await sleep(250);
      layer.remove();
      this.unveiling = false;
    }
    async crossfade(swap) {
      const veil = h('div', 'xfade');
      this.ui.appendChild(veil);
      await sleep(16);
      veil.classList.add('is-on');
      await sleep(290);
      swap();
      await sleep(60);
      veil.classList.remove('is-on');
      await sleep(300);
      veil.remove();
    }

    toast(msg) {
      const el = this.$('.toast');
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(this.toastT);
      this.toastT = setTimeout(() => el.classList.remove('is-on'), 2800);
    }

    /* ---------------------------------------------------------------- */
    bind() {
      const app = this.app;
      this.ui.addEventListener('click', async (e) => {
        const card = e.target.closest('.card[data-skin]');
        if (card) {
          if (card.classList.contains('is-locked')) { this.openDonate(); return; }
          return app.setSkin(card.dataset.skin);
        }
        const mood = e.target.closest('.mood');
        if (mood) return app.setSetting('mood', mood.dataset.mood);
        if (e.target.closest('.scrim')) return this.closePanel();
        if (e.target.classList.contains('modal-wrap')) return this.closeModal();
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'pl') {
          const open = !this.$('.pl').classList.contains('is-open');
          this.$('.pl').classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', String(open));
          if (open) { this.scrollLadder(); app.refreshPoints(false); }
        } else if (act === 'share') IV.openShare(this); else if (act === 'donate') this.openDonate();
        else if (act === 'feedback') this.openFeedback();
        else if (act === 'coupon') this.openCoupon();
        else if (act === 'modal-close') this.closeModal();
        else if (act === 'close') this.closePanel();
        else if (act === 'atelier') this.$('.panel').classList.contains('is-open') ? this.closePanel() : this.openPanel();
        else if (act === 'mood') app.cycleMood();
        else if (act === 'spotlight') app.setSetting('spotlight', !app.settings.spotlight);
        else if (act === 'focus') app.toggleFocus();
        else if (act === 'power') app.setEnabled(!app.settings.enabled);
      });
      this.ui.addEventListener('input', (e) => {
        const k = e.target.dataset && e.target.dataset.set;
        if (!k) return;
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.tagName === 'SELECT' ? e.target.value : parseFloat(e.target.value);
        const out = e.target.parentElement.querySelector('output');
        if (out) out.textContent = fmt(k, v);
        app.setSetting(k, v);
      });
      // close the points card when clicking elsewhere on the page
      document.addEventListener('click', (e) => {
        if (!e.composedPath().includes(this.host)) {
          this.$('.pl').classList.remove('is-open');
        }
      }, true);
    }
  }

  function fmt(k, v) {
    if (k === 'fontScale') return `${Math.round(v * 100)}%`;
    if (k === 'atmosphere') return v <= 0 ? '—' : `${Math.round(v * 100)}%`;
    if (k === 'measure') return `${v} em`;
    if (k === 'lineHeight') return (+v).toFixed(2);
    return v;
  }

  IV.UI = UI;
})();
