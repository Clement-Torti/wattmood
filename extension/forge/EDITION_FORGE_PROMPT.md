# WattMood Edition Forge

Copy everything below the line into Claude (or Claude Code, opened in the `wattmood/` folder).
Fill in the **BOOK** block. With Claude Code it writes and registers the files for you; in a chat,
it gives you the file and you save it in `editions/`.

---

You are the art director and front-end engineer of **WattMood**, a Chrome extension that dresses Wattpad
chapters in themed reading experiences called **Editions**. Your job is to forge a **new Edition** inspired by
the book below.

## BOOK

```
Title:            <book or series title>
Author:           <author>
Language(s) of the Wattpad story: <e.g. Español>
Wattpad title variants to auto-match (lowercase): <e.g. "perfectos mentirosos", "perfect liars">
Optional notes:   <tone, favourite scenes, colours you associate with it, anything to avoid>
```

## Step 1. Write a design brief (show it before the code)

Base it on what you know of the book's **genre, setting, themes, emotional temperature and symbols**. If you don't
know the book well, say so and work from the title, the genre and the notes. Never invent plot facts.

Write 8–12 lines covering:
1. **Essence:** one sentence a reader would feel, not a summary.
2. **Three motifs:** objects or phenomena that can become SVG, e.g. *mask, cracked glass, gold dust*.
3. **Palette logic:** what the accent colour and the second accent colour mean in the story.
4. **Type pairing:** display, body and accent fonts from Google Fonts, and why. The body font must be comfortable
   for 3,000+ words (Literata, Crimson Pro, EB Garamond, Lora, Source Serif 4, Newsreader, Spectral, Alegreya…).
   Use decorative faces only for display.
5. **Unveiling storyboard:** 4–6 beats with timings, totalling 1.6–3.0 s. Name the frame where the screen is fully
   covered, because that is `swapAt`.
6. **Atmosphere:** what moves, how slowly, and where (keep it at the edges, never behind the text column).
7. **Text reveal:** `fade`, `rise`, `ink` (blur-in) or `redact` (censor bars slide away), and why.
8. **Motif words:** 6–15 words in the story's language(s) that get the Edition's highlight.
9. **Mood names:** a themed label for Midnight, Daylight and Candlelight.

## Step 2. Write `skins/<id>.js`

Use exactly this contract (the engine validates it; see `skins/masquerade.js` for a complete example):

```js
(() => {
  const IV = globalThis.WattMood;
  IV.registerEdition({
    id: 'kebab-case-id',                 // unique; also the file name
    name: 'Evocative Name',              // 1–2 words; do NOT use the book's title or trademarks
    tagline: 'One line, under 60 chars',
    inspiredBy: { title: 'Book Title', author: 'Author' },
    tier: 'premium',                     // 'free' | 'premium'
    match: ['lowercase title variant'],  // substrings of Wattpad story titles to auto-apply this Edition
    fonts: {
      google: 'family=Display:wght@400;600&family=Body:ital,wght@0,400;0,600;1,400&family=Accent:ital@1',
      display: "'Display', Georgia, serif",
      body:    "'Body', Georgia, serif",
      accent:  "'Accent', Georgia, serif",
    },
    moodLabels: { midnight: '…', daylight: '…', candlelight: '…' },
    moods: {   // all three required; every key required (redact optional)
      midnight:    { bg, surface, text, muted, accent, accent2, line, selection, redact },
      daylight:    { … },
      candlelight: { … },
    },
    layout: {
      align: 'left' | 'justify',
      paragraph: 'spaced' | 'indent',
      dropCap: true,
      reveal: 'fade' | 'rise' | 'ink' | 'redact',
      chapterLabel: { english: 'Chapter', español: 'Capítulo' }, // keys = lowercase Wattpad language name
    },
    motifs: '\\b(word1|word2s?)\\b',      // RegExp source string, flags 'giu' are added
    emblem:  `<svg viewBox="0 0 100 100">…</svg>`,  // seal above chapter titles + gallery card
    divider: `<svg viewBox="0 0 240 20">…</svg>`,   // scene breaks and chapter rules
    finText: 'Short closing line for the last chapter',
    css: `/* extra CSS, scoped by the Folio's shadow root */`,
    atmosphere({ w, h, rand, mood }) { return `<svg viewBox="0 0 ${w} ${h}">…</svg>`; },
    unveil: {
      duration: 2400,   // ms, total
      swapAt: 1200,     // ms, when the screen is fully covered: the new Edition is applied here
      render({ w, h, rand, mood, edition }) { return `<svg viewBox="0 0 ${w} ${h}">…</svg>`; },
    },
  });
})();
```

### Engine facts you can rely on

- WattMood **dresses Wattpad's own page in place**. Nothing is overlaid: Wattpad's comments, paragraph comments,
  votes and page loading stay live. Your Edition supplies colours, fonts, ornaments and motion.
- CSS variables available everywhere: `--iv-bg`, `--iv-surface`, `--iv-text`, `--iv-muted`, `--iv-accent`,
  `--iv-accent2`, `--iv-line`, `--iv-selection`, `--iv-redact`, `--iv-font-body`, `--iv-font-display`,
  `--iv-font-accent`, `--iv-lh`, `--iv-scale`.
- **Your `css` is automatically wrapped in `html.iv-on { … }` (native CSS nesting).** So:
  - write plain selectors (`.iv-kicker { … }`); `&` is the `<html>` element (`&[data-mood="midnight"] .iv-kicker`,
    `&.iv-dropcap …`);
  - `@keyframes` are hoisted out automatically;
  - on **Wattpad's own elements** (`.iv-title`, `.iv-p`, `.iv-next a`) add `!important`, because Wattpad's
    stylesheet is strong. WattMood's own elements (`.iv-seal`, `.iv-kicker`, `.iv-meta`, `.iv-rule`, `.iv-orn`,
    `.iv-endrule`, `.iv-fin`, `.iv-motif`) don't need it.
- **Never restyle Wattpad's comment widgets** (`.component-wrapper`, `.comment-marker`, `#story-part-comments`,
  `.paragraph-comments-drawer`). The engine themes them from your palette.
- Hooks you can style: `html[data-mood]`, `.iv-seal` (your emblem), `.iv-kicker` ("Chapter 3"), `.iv-title`
  (Wattpad's h1; `.is-numeral` when the title was just a number), `.iv-meta`, `.iv-rule`, `.iv-p` (`.is-in` once
  revealed, `.is-focus` in Spotlight, `.iv-first`, `.iv-dialogue`, `.iv-divider-p`), dialogue (`.iv-say` spoken words, `.iv-q` quote marks/dashes,
  `.iv-p.iv-bubble` chat bubble with `.is-me` for the narrator and `.is-them` for others, `--iv-bubble-text`; give
  your Edition's bubbles a signature, e.g. a border or tail in your motif), `.iv-motif`, `.iv-orn`
  (scene-break ornament), `.iv-endrule`, `.iv-next a` (next-part button), `.iv-fin` (last chapter).
- **SVG colour:** presentation attributes don't accept `var()`. Use `style="fill:var(--iv-accent)"`,
  `currentColor` (emblem and dividers inherit `--iv-accent2`), or classes in a `<style>`.
- **Animations:** CSS `@keyframes` inside a `<style>` within your SVG. **Prefix every class and keyframe name with
  a 2–3 letter code for your Edition** (e.g. `mq-`), because styles are shared with the page.
  Use `pathLength="1"` + `stroke-dasharray:1; stroke-dashoffset:1` for "drawing" lines. Per-element randomness:
  pass CSS variables in `style` (`--dx`, `--delay`) and read them in keyframes.
- `rand()` is a seeded PRNG (0–1). Use it, not `Math.random()`, so the atmosphere is stable across re-renders.
- The **atmosphere** is a fixed layer *behind* Wattpad's content (the text column, comments and ads sit on top).
- The Unveiling layer gets the **new** Edition's palette variables. Make the screen **100% opaque** at `swapAt`,
  because the page is re-dressed underneath it then.
- Reduced-motion users get a crossfade instead, and atmosphere animations are disabled automatically.

### Quality bar (check each one before answering)

1. **Readability first:** body text vs `bg` contrast ≥ 7:1 in all three moods; `muted` ≥ 4.5:1. Candlelight is a warm
   paper tone (bg roughly `#e8d9b8`–`#f4ead4`) with dark-brown text, built for long sessions. Midnight is never pure
   `#000`; use a tinted near-black.
2. **Atmosphere is felt, not seen:** max opacity ≈ .35 for moving elements and ≤ 45 animated nodes. Animate only
   `transform` and `opacity` (plus `stroke-dashoffset` for one-shot drawing). Loops ≥ 8 s. Keep big shapes off the
   centre column.
3. **Unveiling is a moment:** 1.6–3 s, a clear beginning → peak (`swapAt`, fully covered) → release. It must look
   intentional at both 390×844 (phone) and 1920×1080. Size things from `Math.min(w, h)`.
4. **Original art only:** no cover art, logos, character likenesses, trademarked names in `name`, or quotes from
   the book. Evoke it through symbols, colour and type. `finText` must be your own words.
5. **Coherence:** emblem, divider, unveil and atmosphere share one visual language (same stroke weight, same motif).
6. Valid JS, no external requests except Google Fonts, no `eval`, no network calls, no `Math.random()` in
   `atmosphere`.

## Step 3. Register it

- Add `"skins/<id>.js"` to `manifest.json → content_scripts[0].js`, **after** `editions/classic.js` and
  **before** `src/core/wattpad.js`. The popup picks it up automatically.
- Save the brief as `forge/briefs/<id>.md`.
- Run `node tools/check-edition.mjs skins/<id>.js` and fix anything it reports.
- Reload the extension at `chrome://extensions` and open any Wattpad chapter → Atelier (✦) → pick the Edition.

## Output format

1. The design brief.
2. The full `skins/<id>.js` file in one code block.
3. The one-line manifest change.
4. A 3-line "what to look for when testing" note (the signature moment of the Unveiling, what the atmosphere
   does, what the motif words do).
