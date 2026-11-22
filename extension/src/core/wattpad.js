/*
 * Wattpad adapter — everything that depends on Wattpad's markup lives here,
 * so a Wattpad redesign only needs fixes in this file (and the selectors in folio.css).
 *
 * Live reading page (verified Nov 2026, after Wattpad's JS has run):
 *   #header (fixed) + #funbar (fixed, TOC / library / vote / progress)
 *   main#parts-container-new > article#sp<partId>.story-part
 *     #media-container                       chapter banner
 *     .part-header header.panel-reading      h1.h2 title, .story-stats, .author.hidden-lg
 *     #sticky-end .part-content
 *        .left-rail (author / share, affixed)
 *        .page#sp<partId>-pg<n>  > .panel-reading > pre > p[data-p-id]   (pages load as you scroll)
 *                                > .right-rail  (ads, similar stories)
 *        p[data-p-id] > .component-wrapper > button.comment-marker      paragraph comments (React)
 *     footer .part-navigation #story-part-navigation a                   next part
 *            #part-footer-actions (library, vote, share)
 *            .part-comments #story-part-comments                          chapter comments (React)
 *   window.prefetched JSON in an inline <script>: part + story metadata, TOC
 */
(() => {
  const IV = globalThis.WattMood;

  const SEL = {
    container: '#parts-container-new, #app-container',
    article: 'article.story-part',
    header: '.part-header header',
    title: '.part-header h1',
    paragraph: '.page pre p[data-p-id], .panel-reading pre p[data-p-id]',
    commentWidget: '.component-wrapper',
    nextLink: '#story-part-navigation a',
    footer: 'footer',
    vote: 'button.on-vote',
  };

  const isReadingPage = (path = location.pathname) => /^\/\d+(-[^/]*)?(\/page\/\d+)?\/?$/.test(path);
  const partIdFromUrl = (path = location.pathname) => {
    const m = path.match(/^\/(\d+)/);
    return m ? m[1] : null;
  };

  /** Extract the object literal assigned to window.prefetched (string-aware brace matching). */
  function extractPrefetched(text) {
    const marker = text.indexOf('window.prefetched');
    if (marker < 0) return null;
    const start = text.indexOf('{', marker);
    if (start < 0) return null;
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (c === '\\') esc = true;
        else if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch (e) { return null; }
      }
    }
    return null;
  }

  function readMeta(doc = document) {
    let pre = null;
    for (const s of doc.scripts) {
      if (s.textContent.includes('window.prefetched')) {
        pre = extractPrefetched(s.textContent);
        if (pre) break;
      }
    }
    if (!pre) return null;
    const key = Object.keys(pre).find((k) => /^part\.\d+\.metadata$/.test(k));
    const d = key && pre[key] && pre[key].data;
    if (!d) return null;
    const g = d.group || {};
    const parts = (g.parts || []).map((p) => ({ id: String(p.id), title: p.title, url: p.url }));
    return {
      partId: String(d.id),
      title: d.title,
      wordCount: d.wordCount || 0,
      storyId: String(g.id || ''),
      storyTitle: g.title,
      storyUrl: g.id ? `https://www.wattpad.com/story/${g.id}` : null,
      author: g.user ? { name: g.user.name, username: g.user.username } : null,
      language: g.language && g.language.name,
      parts,
      // per-part word counts are only known for the part the page was loaded on
      words: { [String(d.id)]: d.wordCount || 0 },
    };
  }

  /** Neighbours of a part in the table of contents. */
  function neighbours(meta, partId) {
    const i = meta.parts.findIndex((p) => p.id === String(partId));
    return { index: i, prev: i > 0 ? meta.parts[i - 1] : null, next: i >= 0 && i < meta.parts.length - 1 ? meta.parts[i + 1] : null };
  }

  const DIVIDER_RE = /^[\s*~•·—–\-_=#oO0+x×◇◆♦❖✦✧★☆.∙°♡♥︎❀✿|/\\]+$/; // scene-break lines (≤ 80 chars)

  /** Visible text of a paragraph, without the paragraph-comments widget. */
  function paragraphText(p) {
    let t = '';
    for (const n of p.childNodes) {
      if (n.nodeType === 3) t += n.textContent;
      else if (n.nodeType === 1 && !n.matches(SEL.commentWidget)) t += n.textContent;
    }
    return t.replace(/ /g, ' ').trim();
  }

  function vote() {
    const btn = document.querySelector(SEL.vote);
    if (!btn) return false;
    btn.click();
    return true;
  }

  /** Logged-in Wattpad username, best effort (header profile link, or inline JSON). null when logged out. */
  function username() {
    for (const hdr of document.querySelectorAll('#header, header, nav')) {
      const a = hdr.querySelector('a[href^="/user/"], a[href*="wattpad.com/user/"]');
      if (a) {
        const u = (a.getAttribute('href').split('/user/')[1] || '').split(/[/?#]/)[0];
        if (u) return decodeURIComponent(u);
      }
    }
    for (const s of document.scripts) {
      const m = s.textContent.match(/"currentUser"\s*:\s*\{[^{}]*?"username"\s*:\s*"([^"]+)"/);
      if (m) return m[1];
    }
    return null;
  }

  IV.wattpad = { SEL, username, isReadingPage, partIdFromUrl, readMeta, neighbours, paragraphText, vote, extractPrefetched, DIVIDER_RE };
})();
