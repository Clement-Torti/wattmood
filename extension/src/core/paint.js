/*
 * WattMood painting: puts the active skin on <html> (classes, data attributes, CSS variables, skin CSS)
 * and keeps a tiny boot cache in the page's localStorage so the skin is painted before Wattpad's first frame.
 */
(() => {
  const IV = globalThis.WattMood;
  const HTML_CLASSES = ['iv-on', 'iv-focus', 'iv-spot', 'iv-bubbles', 'iv-dropcap', 'iv-chrome-away'];
  const HTML_ATTRS = ['data-edition', 'data-mood', 'data-reveal', 'data-align', 'data-para'];
  let paintedVars = [];

  /** Scope an Edition's CSS to html.iv-on (CSS nesting), hoisting @keyframes out of the nest. */
  function scopeEditionCss(css) {
    const keyframes = [];
    let rest = '', i = 0;
    while (i < css.length) {
      const k = css.indexOf('@keyframes', i);
      if (k < 0) { rest += css.slice(i); break; }
      rest += css.slice(i, k);
      let j = css.indexOf('{', k), depth = 0;
      for (; j < css.length; j++) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}' && --depth === 0) break;
      }
      keyframes.push(css.slice(k, j + 1));
      i = j + 1;
    }
    return `${keyframes.join('\n')}\nhtml.iv-on {\n${rest}\n}`;
  }

  IV.paint = (ed, s, on) => {
    const html = document.documentElement;
    let style = document.getElementById('iv-edition-css');
    if (!on) {
      HTML_CLASSES.forEach((c) => html.classList.remove(c));
      HTML_ATTRS.forEach((a) => html.removeAttribute(a));
      paintedVars.forEach((k) => html.style.removeProperty(k));
      paintedVars = [];
      style && style.remove();
      return;
    }
    const mood = IV.resolveMood(s);
    const L = ed.layout || {};
    html.classList.add('iv-on');
    html.classList.toggle('iv-focus', !!s.focus);
    html.classList.toggle('iv-spot', !!s.spotlight);
    html.classList.toggle('iv-bubbles', s.bubbles !== false);
    html.classList.toggle('iv-dropcap', L.dropCap !== false);
    html.dataset.edition = ed.id;
    html.dataset.mood = mood;
    html.dataset.reveal = s.reveal && !IV.reducedMotion() ? L.reveal || 'fade' : 'none';
    html.dataset.align = L.align || 'left';
    html.dataset.para = L.paragraph || 'spaced';
    const vars = IV.cssVars(ed, mood);
    vars['--iv-scale'] = s.fontScale;
    vars['--iv-lh'] = s.lineHeight;
    vars['--iv-measure'] = `${s.measure}em`;
    vars['--iv-atmo'] = s.atmosphere;
    paintedVars.forEach((k) => { if (!(k in vars)) html.style.removeProperty(k); });
    for (const [k, v] of Object.entries(vars)) html.style.setProperty(k, v);
    paintedVars = Object.keys(vars);
    if (!style) {
      style = document.createElement('style');
      style.id = 'iv-edition-css';
    }
    // keep it last so Edition rules win ties against Wattpad's stylesheets
    const parent = document.head || html;
    IV.hydrated.then(() => { const par = document.head || html; if (style.parentNode !== par || style.nextElementSibling) par.appendChild(style); });
    if (style.dataset.edition !== ed.id) {
      style.textContent = scopeEditionCss(ed.css || '');
      style.dataset.edition = ed.id;
    }
    IV.loadFonts(ed);
  };


  IV.boot = {
    read() {
      try { return JSON.parse(localStorage.getItem('wattmood:boot') || 'null'); } catch (e) { return null; }
    },
    /** Remember the look (not the story maps) so the next page paints instantly. */
    write(settings, skinId) {
      try {
        const { storyEditions, ...look } = settings;
        localStorage.setItem('wattmood:boot', JSON.stringify({ settings: look, skin: skinId }));
      } catch (e) { /* storage blocked */ }
    },
  };
})();
