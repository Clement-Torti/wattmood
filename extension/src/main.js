/*
 * WattMood — content-script entry, runs at document_start on every wattpad.com page.
 *
 *   1. instant paint from the boot cache (no white flash)
 *   2. site-wide skin: colour pass (src/site/recolor.js) + atmosphere on every page
 *   3. chapters: Wattpad's own chapter dressed in place (src/reader/chapter.js)
 *   4. floating UI: points line, dock, Atelier, donate / feedback / celebration (src/ui/ui.js)
 */
(() => {
  const IV = globalThis.WattMood;
  if (window.top !== window) return;
  const t = (k, v) => IV.t(k, v);
  const PREVIEW_S = 60;

  /* 1 — paint before Wattpad's first frame. The page content waits under the skin's background (.wm-pending)
         until the colour pass has tagged it, so Wattpad's white never shows. */
  const boot = IV.boot.read();
  const bootOn = !boot || (boot.settings && boot.settings.enabled !== false);
  if (bootOn) {
    const ed = IV.getEdition(boot && IV.editions.has(boot.skin) ? boot.skin : 'classic');
    IV.paint(ed, { ...IV.DEFAULTS, ...((boot && boot.settings) || {}) }, true);
    document.documentElement.classList.add('wm-pending', 'wm-boot');
    IV.hydrated.then(() => setTimeout(() => document.documentElement.classList.remove('wm-boot'), 600));
    setTimeout(() => document.documentElement.classList.remove('wm-pending'), 2500); // fail-safe: never stay hidden
  }

  const domReady = () => (document.readyState === 'loading' ? new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true })) : Promise.resolve());

  /* 2 — colour pass as soon as the DOM is parsed (Wattpad's stylesheets are loaded by then), then reveal */
  domReady().then(() => {
    if (bootOn) IV.recolor.start();
    requestAnimationFrame(() => document.documentElement.classList.remove('wm-pending'));
  });

  class App {
    async start() {
      // nodes are only inserted once React has hydrated the page (see IV.hydrated)
      const [settings, snap] = await Promise.all([IV.settings.load(), IV.community.snapshot(), domReady(), IV.hydrated]);
      this.settings = settings;
      this.snap = snap;
      IV.setLang(settings.lang);
      this.meta = IV.wattpad.isReadingPage() ? IV.wattpad.readMeta() : null;
      this.skin = this.resolveSkin();

      this.paint();
      IV.recolor.start(); // no-op if already started at DOMContentLoaded
      IV.community.rememberUser(IV.wattpad.username());
      if (this.meta) {
        this.chapter = new IV.Chapter(this.meta, this.skin);
        if (settings.enabled) this.chapter.decorate();
      }
      this.renderAtmosphere();
      this.ui = new IV.UI(this);
      this.ui.mount();
      this.ui.updatePoints(snap);
      this.bind();
      this.heal();

      IV.settings.onChange((s) => this.applySettings(s), IV.instanceId);
      IV.community.onChange(() => this.refreshPoints(false, true));
      this.refreshPoints(false);
      // opened from the popup on a non-Wattpad tab: ?wattmood=donate|coupon|feedback
      const ask = new URLSearchParams(location.search).get('wattmood');
      if (ask === 'donate') this.ui.openDonate();
      else if (ask === 'coupon') this.ui.openCoupon();
      else if (ask === 'feedback') this.ui.openFeedback();
      else if (ask === 'share') IV.openShare(this.ui);
    }

    /* ---------------------------------------------------------------- */
    unlocked(id) {
      const s = this.snap && this.snap.skins.find((x) => x.id === id);
      return id === 'classic' || !!(s && s.unlocked);
    }

    /** The skin to wear here: a story's own (unlocked) skin while reading it, otherwise the one you chose. */
    resolveSkin() {
      const s = this.settings;
      if (this.meta && s.autoMatch) {
        const own = s.storyEditions && s.storyEditions[this.meta.storyId];
        if (own && IV.editions.has(own) && this.unlocked(own)) return IV.getEdition(own);
        const sug = IV.suggestEdition(this.meta.storyTitle);
        if (sug && this.unlocked(sug.id)) return sug;
      }
      return IV.getEdition(this.unlocked(s.edition) ? s.edition : 'classic');
    }

    paint() {
      IV.paint(this.skin, this.settings, !!this.settings.enabled);
      IV.boot.write(this.settings, this.previewing ? this.previewing.prev.id : this.skin.id);
    }

    renderAtmosphere() {
      let layer = document.querySelector('.iv-atmo');
      const ed = this.skin;
      if (!this.settings.enabled || typeof ed.atmosphere !== 'function' || this.settings.atmosphere <= 0) {
        if (layer) layer.remove();
        return;
      }
      if (!layer) {
        layer = document.createElement('div');
        layer.className = 'iv-atmo';
        layer.setAttribute('aria-hidden', 'true');
        document.documentElement.appendChild(layer);
      }
      const w = document.documentElement.clientWidth || innerWidth, hgt = innerHeight;
      let seed = 0;
      for (const c of ed.id + w) seed = (Math.imul(31, seed) + c.charCodeAt(0)) | 0;
      layer.innerHTML = ed.atmosphere({ w, h: hgt, rand: IV.rng(seed), mood: IV.resolveMood(this.settings) });
    }

    /* ---------------------------------------------------------------- */
    /* Points line                                                       */
    /* ---------------------------------------------------------------- */
    async refreshPoints(force, localOnly) {
      if (!localOnly) await IV.community.refresh(force);
      this.snap = await IV.community.snapshot();
      if (this.ui) this.ui.updatePoints(this.snap);
      // a skin can't stay on if it isn't unlocked (e.g. goals were raised in the sheet)
      if (this.skin && !this.previewing && !this.unlocked(this.skin.id)) this.swapSkin(IV.getEdition('classic'), false);
      const fresh = await IV.community.newlyUnlocked(this.snap);
      if (fresh.length && !this.celebrating && this.ui) {
        this.celebrating = true;
        await IV.community.markSeen(fresh.map((f) => f.id));
        const wear = await this.ui.celebrate(fresh);
        this.celebrating = false;
        if (wear) this.setSkin(wear);
      }
    }

    /* ---------------------------------------------------------------- */
    /* Skin & settings                                                   */
    /* ---------------------------------------------------------------- */
    async setSkin(id) {
      if (!IV.editions.has(id) || !this.unlocked(id)) return;
      if (this.previewing) { clearInterval(this.previewTick); this.previewing = null; this.ui.setPreview(null); }
      const ed = IV.getEdition(id);
      this.settings = { ...this.settings, edition: id, enabled: true };
      if (this.meta) this.settings.storyEditions = { ...this.settings.storyEditions, [this.meta.storyId]: id };
      this.persist(0);
      this.ui.closePanel();
      if (id === this.skin.id && document.documentElement.classList.contains('iv-on')) return;
      await this.ui.unveil(ed, () => this.swapSkin(ed, true));
    }

    /** Try a locked skin for PREVIEW_S seconds, nothing saved; then the previous skin comes back. */
    async preview(id) {
      if (!IV.editions.has(id)) return;
      const prev = this.previewing ? this.previewing.prev : this.skin;
      clearInterval(this.previewTick);
      this.previewing = { id, prev, until: Date.now() + PREVIEW_S * 1000 };
      this.ui.closePanel();
      await this.ui.unveil(IV.getEdition(id), () => this.swapSkin(IV.getEdition(id), true));
      if (!this.previewing || this.previewing.id !== id) return;
      this.ui.setPreview(this.previewing);
      this.previewTick = setInterval(() => {
        if (!this.previewing) return clearInterval(this.previewTick);
        if (Date.now() >= this.previewing.until) this.endPreview(true);
        else this.ui.setPreview(this.previewing);
      }, 1000);
    }

    endPreview(timeUp) {
      if (!this.previewing) return;
      const prev = this.previewing.prev;
      clearInterval(this.previewTick);
      this.previewing = null;
      this.ui.setPreview(null);
      this.ui.crossfade(() => this.swapSkin(this.unlocked(prev.id) ? prev : IV.getEdition('classic'), true));
      if (timeUp) this.ui.toast(t('previewEnd'));
    }

    swapSkin(ed, keepSettings) {
      this.skin = ed;
      if (!keepSettings) this.settings = { ...this.settings, edition: ed.id };
      this.paint();
      if (this.chapter) {
        this.chapter.edition = ed;
        if (this.settings.enabled) this.chapter.redecorate();
      }
      this.renderAtmosphere();
      this.ui.sync();
      this.ui.renderSkins();
    }

    setEnabled(on) {
      this.settings = { ...this.settings, enabled: on };
      this.persist(0);
      this.ui.crossfade(() => {
        this.paint();
        if (this.chapter) {
          if (on) this.chapter.redecorate();
          else this.chapter.undecorate();
        }
        this.renderAtmosphere();
        this.ui.sync();
      });
      this.ui.toast(on ? t('on') : t('classicWattpad'));
    }

    setSetting(key, value) {
      const prev = this.settings;
      const patch = { [key]: value };
      if (key === 'mood') patch.autoMood = false;
      this.settings = { ...prev, ...patch };
      this.persist();
      const a = this.chapter && ['fontScale', 'lineHeight', 'measure', 'focus'].includes(key) ? this.chapter.anchor() : null;
      this.refresh(prev);
      if (a) this.chapter.restoreAnchor(a);
    }

    refresh(prev) {
      const next = this.settings;
      const changed = (k) => prev[k] !== next[k];
      if (changed('enabled')) return this.setEnabled(next.enabled);
      this.paint();
      if (['mood', 'autoMood', 'atmosphere'].some(changed)) this.renderAtmosphere();
      if (changed('reveal') && next.reveal) document.querySelectorAll('.iv-p').forEach((p) => p.classList.add('is-in'));
      if (changed('hideChrome') && !next.hideChrome) document.documentElement.classList.remove('iv-chrome-away');
      if (changed('lang')) {
        IV.setLang(next.lang);
        this.ui.host.remove();
        this.ui = new IV.UI(this);
        this.ui.mount();
        this.ui.updatePoints(this.snap);
        this.ui.openPanel();
        return;
      }
      this.ui.sync();
    }

    cycleMood() {
      const ids = IV.MOODS.map((m) => m.id);
      const next = ids[(ids.indexOf(IV.resolveMood(this.settings)) + 1) % ids.length];
      this.ui.toast((this.skin.moodLabels && this.skin.moodLabels[next]) || t(next));
      this.setSetting('mood', next);
    }

    toggleFocus() {
      this.setSetting('focus', !this.settings.focus);
    }

    persist(delay = 350) {
      clearTimeout(this.persistT);
      this.persistT = setTimeout(() => IV.settings.write(this.settings, IV.instanceId), delay);
    }

    /** Settings changed in the popup or another tab. */
    applySettings(next) {
      const prev = this.settings;
      this.settings = next;
      const want = this.resolveSkin();
      if (want.id !== this.skin.id && next.enabled) {
        // animate only when the user just chose this skin (popup / another tab); otherwise switch quietly
        if (next.edition !== prev.edition && next.edition === want.id) this.ui.unveil(want, () => this.swapSkin(want, true));
        else this.swapSkin(want, true);
        return;
      }
      this.refresh(prev);
    }

    /* ---------------------------------------------------------------- */
    bind() {
      let lastY = scrollY, ticking = false;
      addEventListener('scroll', () => {
        if (ticking || !this.chapter || !this.settings.enabled) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const y = scrollY;
          const down = y > lastY + 4 && y > 300;
          const up = y < lastY - 4;
          if (down || up) {
            const away = down && this.settings.hideChrome;
            document.documentElement.classList.toggle('iv-chrome-away', away);
            this.ui.setChromeAway(away, down);
          }
          lastY = y;
          this.ui.setProgress(this.chapter.progress());
        });
      }, { passive: true });

      addEventListener('keydown', (e) => {
        const tgt = e.composedPath()[0];
        if (tgt && (/^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName) || tgt.isContentEditable)) return;
        if (e.altKey && e.code === 'KeyI') { e.preventDefault(); this.setEnabled(!this.settings.enabled); return; }
        if (!this.settings.enabled || e.metaKey || e.ctrlKey || e.altKey) return;
        const k = e.key.toLowerCase();
        if (k === 'escape') { this.ui.closePanel(); this.ui.closeModal(); return; }
        if (!this.chapter) return; // single-letter shortcuts only while reading
        if (k === 'm') this.cycleMood();
        else if (k === 's') this.setSetting('spotlight', !this.settings.spotlight);
        else if (k === 'a') { if (this.ui.$('.panel').classList.contains('is-open')) this.ui.closePanel(); else this.ui.openPanel(); }
        else if (k === 'f') this.toggleFocus();
        else return;
        e.preventDefault();
      }, true);

      let rT;
      addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => this.renderAtmosphere(), 250); });
      setInterval(() => this.settings.autoMood && this.refresh(this.settings), 5 * 60e3);
      setInterval(() => !document.hidden && this.refreshPoints(false), IV.CONFIG.REFRESH_MIN * 60e3);
    }

    /** Wattpad re-renders (React hydration, pages loaded while scrolling, <html class> rewrites) — keep the skin on. */
    heal() {
      let queued = false;
      const run = () => {
        queued = false;
        const html = document.documentElement;
        if (this.ui.host && !this.ui.host.isConnected) html.appendChild(this.ui.host);
        if (!this.settings.enabled) return;
        if (!html.classList.contains('iv-on') || html.dataset.edition !== this.skin.id) IV.paint(this.skin, this.settings, true);
        if (!document.querySelector('.iv-atmo') && this.settings.atmosphere > 0) this.renderAtmosphere();
        if (this.chapter) this.chapter.decorate();
      };
      const mo = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(run);
      });
      mo.observe(document.body, { childList: true, subtree: true });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-edition'] });
    }
  }

  const app = (IV.app = new App());
  app.start().catch((e) => console.error('[WattMood] start failed', e));

  /* popup ↔ page */
  chrome.runtime.onMessage.addListener((msg, _s, reply) => {
    if (!msg || !msg.type) return;
    if (msg.type === 'wm:status') reply({ reading: !!app.meta, story: app.meta && app.meta.storyTitle, skin: app.skin && app.skin.id, enabled: app.settings && app.settings.enabled });
    else if (msg.type === 'wm:skin') { app.setSkin(msg.skin); reply({ ok: true }); }
    else if (msg.type === 'wm:donate') { app.ui.openDonate(); reply({ ok: true }); }
    else if (msg.type === 'wm:feedback') { app.ui.openFeedback(); reply({ ok: true }); }
    else if (msg.type === 'wm:coupon') { app.ui.openCoupon(); reply({ ok: true }); }
    else if (msg.type === 'wm:share') { IV.openShare(app.ui); reply({ ok: true }); }
  });
})();
