/*
 * WattMood chapter dressing — on reading pages, dresses Wattpad's own chapter in place:
 * seal + kicker + reading time in the header, drop cap, scene-break ornaments, speech bubbles,
 * motif words, reveal/spotlight observers, chapter-end ornament. undecorate() removes every trace.
 */
(() => {
  const IV = globalThis.WattMood;
  const W = () => IV.wattpad;
  const WPM = 230;
  const CHAPTER_WORD = {
    english: 'Chapter', español: 'Capítulo', espanol: 'Capítulo', français: 'Chapitre', francais: 'Chapitre',
    português: 'Capítulo', portugues: 'Capítulo', italiano: 'Capitolo', deutsch: 'Kapitel', filipino: 'Kabanata',
  };
  const LANG_CODE = {
    english: 'en', español: 'es', espanol: 'es', français: 'fr', francais: 'fr', português: 'pt', portugues: 'pt',
    italiano: 'it', deutsch: 'de', filipino: 'fil', 'bahasa indonesia': 'id', türkçe: 'tr', turkce: 'tr', polski: 'pl',
  };
  const IV_CLASSES = ['iv-p', 'iv-bubble', 'is-pure', 'iv-first', 'iv-lead-br', 'iv-dialogue', 'iv-divider-p', 'iv-after-divider', 'iv-blank', 'iv-title', 'iv-next', 'is-in', 'is-focus', 'is-numeral'];

  const h = (tag, cls, html) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    return el;
  };

  class Chapter {
    constructor(meta, edition) {
      this.meta = meta;
      this.edition = edition;
      this.makeObservers();
    }

    decorate() {
      for (const art of document.querySelectorAll(W().SEL.article)) this.decorateArticle(art);
    }

    decorateArticle(art) {
      const m = this.meta, ed = this.edition;
      const partId = art.id.replace(/^sp/, '') || m.partId;
      const nb = W().neighbours(m, partId);

      /* Chapter head: seal + kicker above Wattpad's title, reading time + rule below */
      const header = art.querySelector(W().SEL.header);
      if (header && !header.dataset.iv) {
        header.dataset.iv = '1';
        const h1 = header.querySelector('h1');
        const lang = IV.normalize(m.language || 'english');
        const chapWord = (ed.layout && ed.layout.chapterLabel && ed.layout.chapterLabel[lang]) || CHAPTER_WORD[lang] || 'Chapter';
        const num = nb.index >= 0 ? nb.index + 1 : null;
        header.insertBefore(h('div', 'iv-ins iv-seal', ed.emblem || ''), header.firstChild);
        header.insertBefore(h('div', 'iv-ins iv-kicker', `${IV.esc(chapWord)} ${num || ''}`), h1 || null);
        if (h1) {
          h1.classList.add('iv-title');
          h1.dataset.iv = '1';
          const generic = /^\s*(chapter|cap[ií]tulo|chapitre|capitolo|kapitel|kabanata|parte?)?\s*\d+\s*[.:]?\s*$/i.test(h1.textContent);
          if (generic && num) {
            h1.dataset.ivOrig = h1.textContent;
            h1.textContent = ed.layout && ed.layout.numerals === 'roman' ? toRoman(num) : String(num);
            h1.classList.add('is-numeral');
          }
        }
        const words = m.words[partId];
        if (words) header.appendChild(h('div', 'iv-ins iv-meta', `${Math.max(1, Math.ceil(words / WPM))} min · ${words.toLocaleString()} words`));
        header.appendChild(h('div', 'iv-ins iv-rule', ed.divider || ''));
        this.io.observe(header);
      }

      /* Paragraphs (Wattpad appends pages while you scroll — the MutationObserver brings us back here) */
      for (const pre of art.querySelectorAll('.panel-reading pre')) {
        if (!pre.lang) {
          pre.lang = LANG_CODE[IV.normalize(m.language || '')] || 'en';
          pre.dataset.iv = '1';
        }
      }
      let motifRe = null;
      try { motifRe = ed.motifs ? new RegExp(ed.motifs, 'giu') : null; } catch (e) { /* invalid regex — skip */ }
      let hasFirst = !!art.querySelector('.iv-first');
      let prevDivider = false;
      for (const p of art.querySelectorAll(W().SEL.paragraph)) {
        if (p.dataset.iv) {
          prevDivider = p.classList.contains('iv-divider-p');
          continue;
        }
        p.dataset.iv = '1';
        const text = W().paragraphText(p);
        if (!text && !p.querySelector('img')) {
          p.classList.add('iv-p', 'iv-blank', 'is-in');
          continue;
        }
        if (text && text.length <= 80 && W().DIVIDER_RE.test(text)) {
          p.classList.add('iv-p', 'iv-divider-p', 'is-in');
          p.appendChild(h('span', 'iv-ins iv-orn', ed.divider || '✦'));
          prevDivider = true;
          continue;
        }
        p.classList.add('iv-p');
        if (prevDivider) p.classList.add('iv-after-divider');
        prevDivider = false;

        /* Dialogue: typeset speech; a paragraph that OPENS with speech becomes a bubble.
           (No speaker guessing: with names, pronouns and 3+ people it can't be done reliably.) */
        const dlg = markDialogue(p);
        const bubble = !!(dlg && dlg.leads);
        if (bubble) {
          p.classList.add('iv-bubble');
          if (!dlg.narration.replace(/[\s\p{P}]/gu, '')) p.classList.add('is-pure');
        }

        if (!hasFirst && !bubble && text.length > 1) {
          p.classList.add('iv-first');
          hasFirst = true;
          // a leading <br> would make the first line empty (no drop cap) — hide it
          const lead = [...p.childNodes].find((n) => !(n.nodeType === 3 && !n.textContent.trim()));
          if (lead && lead.nodeName === 'BR') p.classList.add('iv-lead-br');
        }
        if (motifRe) markMotifs(p, motifRe);
        p.dataset.ivw = text.split(/\s+/).length;
        p.dataset.ivPart = partId;
        this.io.observe(p);
        this.focusIo.observe(p);
      }

      /* Chapter end: ornament above "next part"; a closing line on the last chapter */
      const footer = art.querySelector('footer');
      if (footer && !footer.dataset.iv) {
        footer.dataset.iv = '1';
        const box = footer.querySelector('.container') || footer;
        const nav = footer.querySelector('.part-navigation');
        if (nav) {
          nav.classList.add('iv-next');
          nav.dataset.iv = '1';
        }
        box.insertBefore(h('div', 'iv-ins iv-endrule', ed.divider || ''), box.firstChild);
        if (!nb.next && nb.index >= 0) box.insertBefore(h('div', 'iv-ins iv-fin', IV.esc(ed.finText || IV.t('toBeContinued'))), box.children[1] || null);
        this.endIo.observe(footer);
      }
    }

    undecorate() {
      this.io && this.io.disconnect();
      this.focusIo && this.focusIo.disconnect();
      this.endIo && this.endIo.disconnect();
      document.querySelectorAll('.iv-ins').forEach((n) => n.remove());
      document.querySelectorAll('span.iv-q').forEach((q) => q.replaceWith(document.createTextNode(q.dataset.o)));
      document.querySelectorAll('span.iv-say').forEach((say) => say.replaceWith(...say.childNodes));
      document.querySelectorAll('span.iv-motif').forEach((s) => s.replaceWith(document.createTextNode(s.textContent)));
      document.querySelectorAll('[data-iv-orig]').forEach((el) => {
        el.textContent = el.dataset.ivOrig;
        delete el.dataset.ivOrig;
      });
      document.querySelectorAll('[data-iv]').forEach((el) => {
        delete el.dataset.iv;
        delete el.dataset.ivw;
        delete el.dataset.ivPart;
        el.classList.remove(...IV_CLASSES);
        if (el.tagName === 'PRE') el.removeAttribute('lang');
      });
    }

    /** Re-dress after an Edition change (ornaments, motifs, numerals differ per Edition). */
    redecorate() {
      this.undecorate();
      this.makeObservers();
      this.decorate();
      // what's already on screen shouldn't animate in again
      document.querySelectorAll('.iv-p, .part-header header').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }

    makeObservers() {
      this.io && this.io.disconnect();
      this.focusIo && this.focusIo.disconnect();
      this.endIo && this.endIo.disconnect();
      this.io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) {
          e.target.classList.add('is-in');
          this.io.unobserve(e.target);
        }
      }, { threshold: 0.12 });
      this.focusIo = new IntersectionObserver((entries) => {
        for (const e of entries) e.target.classList.toggle('is-focus', e.isIntersecting);
      }, { rootMargin: '-42% 0px -42% 0px' });
      // reaching the end of a chapter → reading journal
      this.endIo = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) {
          this.endIo.unobserve(e.target);
          this.chapterFinished(e.target.closest(W().SEL.article));
        }
      });
    }

    async chapterFinished(art) {
      const partId = art ? art.id.replace(/^sp/, '') : this.meta.partId;
      const prev = await IV.progress.get(partId);
      if (prev && prev.done) return;
      const words = this.meta.words[partId] || [...document.querySelectorAll(`[data-iv-part="${partId}"]`)].reduce((a, p) => a + +p.dataset.ivw, 0);
      IV.journal.add(words);
      IV.progress.set(partId, { done: true, story: this.meta.storyId });
    }

    /** Reading progress in the chapter under the reader's eyes. */
    progress() {
      const mid = innerHeight * 0.4;
      const art = [...document.querySelectorAll(W().SEL.article)].find((a) => {
        const r = a.getBoundingClientRect();
        return r.top <= mid && r.bottom >= mid;
      });
      if (!art) return null;
      const partId = art.id.replace(/^sp/, '');
      let read = 0, seen = 0;
      for (const p of art.querySelectorAll('.iv-p[data-ivw]')) {
        const w = +p.dataset.ivw;
        seen += w;
        if (p.getBoundingClientRect().top < mid) read += w;
      }
      const total = Math.max(this.meta.words[partId] || 0, seen);
      return { total, read, left: Math.max(0, total - read), minutes: Math.ceil(Math.max(0, total - read) / WPM) };
    }

    /** Keep the paragraph you're reading in place when the layout reflows. */
    anchor() {
      const p = [...document.querySelectorAll('.iv-p')].find((el) => el.getBoundingClientRect().bottom > innerHeight * 0.3);
      return p ? { p, top: p.getBoundingClientRect().top } : null;
    }
    restoreAnchor(a) {
      if (!a) return;
      requestAnimationFrame(() => scrollBy(0, a.p.getBoundingClientRect().top - a.top));
    }
  }

  /* ------------------------------------------------------------------ */
  /**
   * Typeset dialogue: spoken words → <span class="iv-say">, quote marks/dashes → <span class="iv-q">
   * with typographic glyphs. The original character is kept in data-o, so undecorate() restores it exactly.
   *
   *   "…"  “…”  «…»  ‘…’          quoted speech (English, French, British)
   *   —Hola —dijo él—. ¿Y tú?     Spanish dash dialogue: each dialogue dash toggles speech ↔ narration
   *   -Hola -dijo él-.  ―Hola     the same with a hyphen or horizontal bar (common on Wattpad);
   *                               a hyphen only counts at the start, after a space, or before a space/punctuation,
   *                               so "bien-estar" or "1990-2000" are left alone.
   */
  const LONG_DASH = '—―‒–';
  const isWs = (c) => c === undefined || /\s/.test(c);
  const isPunct = (c) => c === undefined || /[\s.,;:!?…"'”»)\]]/.test(c);
  const isLetter = (c) => c !== undefined && /\p{L}|\p{N}/u.test(c);

  /** Plan the marks for a paragraph's text: Map(index → { glyph, cls }) and a per-char "spoken" flag. */
  function planDialogue(t) {
    const marks = new Map();
    const say = new Uint8Array(t.length);
    const start = t.search(/\S/);
    if (start < 0) return null;
    const first = t[start];
    const next = t[start + 1];
    const dashMode = LONG_DASH.includes(first) || (first === '-' && (isLetter(next) || next === '¿' || next === '¡'));
    let inSay = false;
    if (dashMode) {
      for (let i = start; i < t.length; i++) {
        const c = t[i];
        const long = LONG_DASH.includes(c) && !(c === '–' && /\d/.test(t[i - 1] || '') && /\d/.test(t[i + 1] || ''));
        const hyphen = c === '-' && (i === start || isWs(t[i - 1]) || isPunct(t[i + 1]));
        if (long || hyphen) {
          marks.set(i, { glyph: '—', cls: 'is-dash' });
          inSay = !inSay;
        } else if (inSay) say[i] = 1;
      }
      return marks.size ? { marks, say } : null;
    }
    if (!/["“”«»‘]/.test(t)) return null;
    let kind = null; // '"' | '“' | '«' | '‘'
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (!inSay) {
        if (c === '"' || c === '“' || c === '«' || (c === '‘' && !isLetter(t[i - 1]))) {
          marks.set(i, { glyph: c === '"' ? '“' : c, cls: 'is-open' });
          inSay = true;
          kind = c;
          continue;
        }
      } else {
        const closes = (kind === '"' && (c === '"' || c === '”')) || (kind === '“' && (c === '”' || c === '"')) ||
          (kind === '«' && c === '»') || (kind === '‘' && c === '’' && !isLetter(t[i + 1]));
        if (closes) {
          marks.set(i, { glyph: c === '"' ? '”' : c, cls: 'is-close' });
          inSay = false;
          kind = null;
          continue;
        }
        say[i] = 1;
      }
    }
    return marks.size ? { marks, say } : null;
  }

  function markDialogue(p) {
    const nodes = [];
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('.component-wrapper, .iv-ins') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const full = nodes.map((n) => n.textContent).join('');
    const plan = planDialogue(full);
    if (!plan) return null;
    // stats for bubble decisions: does speech lead the paragraph, how much of it is speech, what's the narration
    let sayChars = 0, total = 0, narration = '';
    for (let i = 0; i < full.length; i++) {
      if (plan.marks.has(i)) continue;
      if (!plan.say[i]) narration += full[i];
      if (/\s/.test(full[i])) continue;
      total++;
      if (plan.say[i]) sayChars++;
    }
    const firstChar = full.search(/\S/);
    const stats = { leads: plan.marks.has(firstChar), ratio: total ? sayChars / total : 0, narration: narration.trim() };
    let offset = 0;
    for (const node of nodes) {
      const t = node.textContent;
      const frag = document.createDocumentFragment();
      let buf = '', bufSay = 0;
      const flush = () => {
        if (!buf) return;
        if (bufSay) {
          const span = document.createElement('span');
          span.className = 'iv-say';
          span.textContent = buf;
          frag.appendChild(span);
        } else frag.appendChild(document.createTextNode(buf));
        buf = '';
      };
      for (let i = 0; i < t.length; i++) {
        const g = offset + i;
        const m = plan.marks.get(g);
        if (m) {
          flush();
          const q = document.createElement('span');
          q.className = `iv-q ${m.cls}`;
          q.dataset.o = t[i];
          q.textContent = m.glyph;
          frag.appendChild(q);
          continue;
        }
        if (plan.say[g] !== bufSay) {
          flush();
          bufSay = plan.say[g];
        }
        buf += t[i];
      }
      flush();
      offset += t.length;
      if (frag.childNodes.length !== 1 || frag.firstChild.nodeType !== 3) node.replaceWith(frag);
    }
    return stats;
  }

  /** Wrap motif words in <span class="iv-motif"> — never inside Wattpad's comment widget. */
  function markMotifs(p, re) {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('.component-wrapper, .iv-motif, .iv-ins, .iv-q') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const t = node.textContent;
      re.lastIndex = 0;
      if (!re.test(t)) continue;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(t))) {
        if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
        const span = document.createElement('span');
        span.className = 'iv-motif';
        span.textContent = m[0];
        frag.appendChild(span);
        last = m.index + m[0].length;
        if (!m[0].length) re.lastIndex++;
      }
      if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
      node.replaceWith(frag);
    }
  }

  function toRoman(n) {
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, r] of map) while (n >= v) { out += r; n -= v; }
    return out;
  }

  IV.Chapter = Chapter;
})();
