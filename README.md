# WattMood — skins & dark mode for Wattpad

WattMood is a Chrome extension that dresses **all of Wattpad** (home, stories, profiles, search, chapters, comments) in a
**skin**: dark / light / warm "candlelight" moods, typography, an ambient animated background and an opening animation.
The **Basic** skin is free. **Book skins**, inspired by the most-loved Wattpad books, unlock for everyone when the
community **points line** reaches each goal (install +10, share +1/day, €1 donated +10). Donating €5+ also gets a coupon
for one skin, €10+ for all of them. Not affiliated with Wattpad.

| Folder | What |
|---|---|
| [`extension/`](extension) | The Chrome extension (load this folder) |
| [`docs/`](docs) | Public site on GitHub Pages: landing, privacy policy, welcome page → https://clement-torti.github.io/wattmood/ |
| [`server/`](server) | Google Sheet + Apps Script backend ([setup](server/SETUP.md)) |
| [`marketing/MARKETING.md`](marketing/MARKETING.md) | Marketing strategy & log |

## Install

1. `chrome://extensions` → Developer mode → **Load unpacked** → select the `extension/` folder.
2. Open any Wattpad page.

## Features

- **Site-wide skins.** A colour pass reads each element's original colours once and tags its role (page, card, text,
  muted, Wattpad orange…). The skin's palette is mapped onto those roles, so new or redesigned Wattpad pages are covered
  without class names. Wattpad's own design tokens (`--wp-*`) are overridden too.
- **Chapters.** Wattpad's own chapter is dressed in place: seal, chapter numeral, drop cap, scene-break ornaments, speech
  bubbles for lines that open with speech, a focus layout (one centred column) and Spotlight. Comments, paragraph comments,
  votes and reads keep working and count for authors.
- **Moods:** Midnight, Daylight and Candlelight, or follow the time of day.
- **Points line** (bottom-left): community total, pending donations ("in review"), skin milestones, Share / Donate /
  coupon. When a skin unlocks, a celebration plays.
- **Coupons:** single use, enforced by the sheet. They follow the user through Chrome sync and their Wattpad username.
- **Feedback** form (rating + text), saved in the sheet.
- **Languages:** English, Spanish, Portuguese and French, following the browser language by default.
- **React-safe.** Nothing is inserted into the page until Wattpad's React has hydrated. Only classes and attributes
  are set before that, which is enough to paint the skin with no white flash.

## Configure

Edit `extension/src/core/config.js`:

- `ENDPOINT`: the Apps Script `/exec` URL. Leave it empty for offline mode, where points stay local.
- `SITE_URL`
- `DONATE_URL`
- the point values
- the default goals (the sheet's **Goals** tab overrides them)

Then run `node extension/tools/build-site.mjs` to refresh `docs/skins.json`.

## Skins

- `extension/skins/_kit.js` is the shared ambient effects (rain, petals, embers, bokeh, smoke, hearts, stars, dust) and
  opening animations (iris, curtain, bloom, flicker).
- `extension/skins/books.js` holds the book skins, built with `WattMood.makeSkin({...})`.
- `extension/skins/masquerade.js` is a fully hand-made skin (the model for the polished versions).
- `extension/forge/`: a prompt to draft a new skin from a book. Validate skins with
  `node extension/tools/check-edition.mjs extension/skins/books.js <id>` (contrast, SVG budget, timings).

Rules: original art only, inspired by a book's mood. No covers, logos, character names or quotes, and never the book's
title as the skin name.

## Publishing on the Chrome Web Store

- [ ] Set `ENDPOINT`, run `build-site.mjs`, then commit and push. GitHub Pages: Settings ▸ Pages ▸ Branch `main` / folder `/docs`.
- [ ] Zip the **contents** of `extension/` (not the folder itself).
- [ ] **Privacy policy URL:** https://clement-torti.github.io/wattmood/privacy.html
- [ ] **Homepage:** https://clement-torti.github.io/wattmood/
- [ ] **Single purpose:** "Customize the appearance of wattpad.com (themes, dark mode, reading layout)."
- [ ] **Permission justifications:**
  - `storage`: settings and reading journal.
  - `alarms`: refresh the community points.
  - Host `www.wattpad.com`: restyle Wattpad pages.
  - Host `script.google.com` / `script.googleusercontent.com`: community points, coupons and feedback endpoint.
- [ ] **Data usage disclosure:** an anonymous identifier, user-provided content (feedback), and optionally the Wattpad
      username (coupons). Not sold, not used for ads.
- [ ] **Listings:** EN / ES / PT / FR (names and descriptions are in `extension/_locales`).
- [ ] **Screenshots:** before/after, the points line, a chapter with bubbles, the skins gallery.

## Tests

The extension was tested against live Wattpad pages (home, story, profile, search, chapter) in headless Chrome:
- no React hydration errors;
- the skin is applied everywhere;
- comments and paragraph comments keep working;
- chapter text is restored byte-for-byte when WattMood is turned off.
