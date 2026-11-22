#!/usr/bin/env node
/*
 * Validate an WattMood Edition file.
 *   node tools/check-edition.mjs editions/masquerade.js
 *
 * Checks: contract, contrast in every mood, SVG output at phone + desktop sizes,
 * animated-node budget, unveil timing, prefixed class names, banned APIs.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file) {
  console.error('usage: node tools/check-edition.mjs editions/<id>.js');
  process.exit(2);
}

const errors = [], warns = [], oks = [];
const ctx = { console: { warn: (...a) => errors.push(a.join(' ')), log() {}, error: (...a) => errors.push(a.join(' ')) }, chrome: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(resolve(root, 'src/core/wattmood.js'), 'utf8'), ctx);
vm.runInContext(readFileSync(resolve(root, 'skins/_kit.js'), 'utf8'), ctx);
const src = readFileSync(resolve(process.cwd(), file), 'utf8');
vm.runInContext(src, ctx, { filename: file });

const IV = ctx.WattMood;
const eds = [...IV.editions.values()];
if (!eds.length) {
  console.error('✗ No Edition registered.', errors.join('\n'));
  process.exit(1);
}
const only = process.argv[3];
const targets = only ? eds.filter((e) => e.id === only) : eds;
let ed;
for (ed of targets) {

/* --- contract --- */
for (const k of ['name', 'tagline', 'emblem', 'divider', 'fonts', 'layout']) if (!ed[k]) errors.push(`missing "${k}"`);
if (ed.fonts && !(ed.fonts.body && ed.fonts.display)) errors.push('fonts.body and fonts.display are required');
if (ed.layout && ed.layout.reveal && !['fade', 'rise', 'ink', 'redact', 'none'].includes(ed.layout.reveal)) errors.push(`unknown reveal "${ed.layout.reveal}"`);
if (ed.motifs) { try { new RegExp(ed.motifs, 'giu'); } catch (e) { errors.push(`motifs regex invalid: ${e.message}`); } }

if (/Math\.random|eval\(|new Function|fetch\(|XMLHttpRequest/.test(src)) errors.push('uses a banned API (Math.random / eval / fetch)');

const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));


/* --- contrast --- */
function rgb(c) {
  c = String(c).trim();
  let m;
  if ((m = c.match(/^#([0-9a-f]{3,8})$/i))) {
    let hx = m[1];
    if (hx.length <= 4) hx = [...hx].map((x) => x + x).join('');
    return [0, 2, 4].map((i) => parseInt(hx.slice(i, i + 2), 16));
  }
  if ((m = c.match(/rgba?\(([^)]+)\)/))) return m[1].split(',').slice(0, 3).map(Number);
  return null;
}
const lum = (c) => {
  const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const [mood, p] of Object.entries(ed.moods)) {
  const bg = rgb(p.bg), tx = rgb(p.text), mu = rgb(p.muted), ac = rgb(p.accent);
  if (!bg || !tx) { errors.push(`${mood}: bg/text must be hex or rgb()`); continue; }
  const t = contrast(bg, tx), m = mu ? contrast(bg, mu) : 0, a = ac ? contrast(bg, ac) : 0;
  const line = `${mood.padEnd(12)} text ${t.toFixed(1)}:1  muted ${m.toFixed(1)}:1  accent ${a.toFixed(1)}:1`;
  if (t < 7) errors.push(`${line}  ← text needs ≥ 7:1`);
  else if (m < 4.5) warns.push(`${line}  ← muted should be ≥ 4.5:1`);
  else if (a < 3) warns.push(`${line}  ← accent below 3:1 (drop cap / kicker may be faint)`);
  else oks.push(line);
}

/* --- SVG output --- */
const sizes = [[390, 844], [1920, 1080]];
const animatedCount = (svg) => {
  const classes = new Set([...svg.matchAll(/\.([a-z][\w-]*)\s*\{[^}]*animation/g)].map((m) => m[1]));
  let n = 0;
  for (const m of svg.matchAll(/class="([^"]+)"/g)) if (m[1].split(/\s+/).some((c) => classes.has(c))) n++;
  return n;
};
const prefixCheck = (svg, where) => {
  const names = [...svg.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]).concat([...svg.matchAll(/\.([a-z][\w-]*)\s*[{,:]/g)].map((m) => m[1]));
  const prefixes = new Set(names.map((n) => n.split('-')[0]));
  if (prefixes.size > 2) warns.push(`${where}: use one short prefix for classes/keyframes (found: ${[...prefixes].join(', ')})`);
};
for (const [w, h] of sizes) {
  for (const mood of Object.keys(ed.moods)) {
    if (typeof ed.atmosphere === 'function') {
      try {
        const svg = ed.atmosphere({ w, h, rand: IV.rng(7), mood });
        if (!/^\s*<svg[\s>]/.test(svg)) errors.push(`atmosphere(${w}x${h}) must return an <svg>`);
        const n = animatedCount(svg);
        if (n > 60) warns.push(`atmosphere ${w}x${h} ${mood}: ${n} animated nodes (budget ≈ 45)`);
        if (mood === 'midnight' && w === 1920) { oks.push(`atmosphere ${w}x${h}: ${n} animated nodes, ${(svg.length / 1024).toFixed(1)} KB`); prefixCheck(svg, 'atmosphere'); }
      } catch (e) { errors.push(`atmosphere(${w}x${h}, ${mood}) threw: ${e.message}`); }
    }
  }
  if (ed.unveil) {
    try {
      const svg = ed.unveil.render({ w, h, rand: IV.rng(3), mood: 'midnight', edition: ed });
      if (!/^\s*<svg[\s>]/.test(svg)) errors.push('unveil.render must return an <svg>');
      if (w === 1920) { oks.push(`unveil ${w}x${h}: ${(svg.length / 1024).toFixed(1)} KB`); prefixCheck(svg, 'unveil'); }
    } catch (e) { errors.push(`unveil.render(${w}x${h}) threw: ${e.message}`); }
  }
}
if (ed.unveil) {
  const { duration, swapAt } = ed.unveil;
  if (!(duration >= 1200 && duration <= 3200)) warns.push(`unveil.duration ${duration}ms — aim for 1600–3000`);
  if (!(swapAt > 0 && swapAt < duration)) errors.push('unveil.swapAt must be between 0 and duration');
} else warns.push('no unveil — a crossfade will be used');

console.log(`\n  Edition: ${ed.name} (${ed.id})${ed.inspiredBy ? ` — inspired by ${ed.inspiredBy.title}` : ''}\n`);
oks.forEach((m) => console.log(`  ✓ ${m}`));
warns.forEach((m) => console.log(`  ! ${m}`));
errors.forEach((m) => console.log(`  ✗ ${m}`));
console.log(errors.length ? `\n  ${errors.length} error(s)\n` : '\n  Ready to ship.\n');
}
process.exit(errors.length ? 1 : 0);
