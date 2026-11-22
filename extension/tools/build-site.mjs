#!/usr/bin/env node
// Exports the skin catalogue (names, palettes, emblems, goals) from the extension to docs/skins.json
// so the public site always shows the same skins and goals as the extension.   node extension/tools/build-site.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const ext = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console, chrome: {}, navigator: { language: 'en' } };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['src/core/config.js', 'src/core/i18n.js', 'src/core/wattmood.js', 'skins/_kit.js', 'skins/classic.js', 'skins/masquerade.js', 'skins/books.js']) {
  vm.runInContext(readFileSync(resolve(ext, f), 'utf8'), ctx, { filename: f });
}
const IV = ctx.WattMood;
const goals = IV.CONFIG.GOALS;
const skins = [...IV.editions.values()].map((e) => ({
  id: e.id, name: e.name, tagline: e.tagline || '', inspiredBy: e.inspiredBy || null, goal: goals[e.id] ?? null,
  emblem: e.emblem, moods: e.moods, fonts: { google: e.fonts.google, display: e.fonts.display },
})).filter((s) => s.goal !== null).sort((a, b) => a.goal - b.goal);
const out = resolve(ext, '..', 'docs', 'skins.json');
writeFileSync(out, JSON.stringify({ endpoint: IV.CONFIG.ENDPOINT, donate: IV.CONFIG.DONATE_URL, points: IV.CONFIG.POINTS, skins }, null, 1));
console.log(`wrote ${skins.length} skins → ${out}`);
