import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { translateHtml, normalise } from '../src/i18n/html.mjs';
const root = path.resolve(import.meta.dirname, '..');
if (fs.existsSync(path.join(root, 'src/i18n/en.json'))) throw new Error('Initial inventory already exists. Use npm run i18n:extract to append stable IDs; never renumber existing translations.');
const report = path.resolve(root, '../reports/2026-10-16-bilingual');
const all = new Map();
const baseline = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'zh' || entry.name === 'assets') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.name.endsWith('.html')) {
      const route = '/' + path.relative(path.join(root, 'public'), file).replaceAll('\\', '/').replace(/index\.html$/, '');
      const html = fs.readFileSync(file, 'utf8');
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
      baseline.push({ route, h1: html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1], mainHash: createHash('sha256').update(main || '').digest('hex') });
      translateHtml(html, text => {
        const key = normalise(text).replace(/ \| MEL ONE$/, '');
        if (/[A-Za-z]/.test(key)) {
          if (!all.has(key)) all.set(key, new Set());
          all.get(key).add(route);
        }
        return text;
      });
    }
  }
}
scan(path.join(root, 'public'));
fs.mkdirSync(report, { recursive: true });
const groups = [[], [], []];
const sizes = [0, 0, 0];
const manifest = {};
let nextId = 0;
for (const [text, routes] of [...all].sort((a, b) => b[0].length - a[0].length)) {
  const id = `t${String(++nextId).padStart(4, '0')}`;
  manifest[id] = text;
  const index = sizes.indexOf(Math.min(...sizes));
  groups[index].push({ id, en: text, routes: [...routes].slice(0, 3) });
  sizes[index] += text.length;
}
groups.forEach((entries, i) => fs.writeFileSync(path.join(report, `translation-input-${i + 1}.json`), JSON.stringify(entries, null, 2)));
fs.writeFileSync(path.join(root, 'src/i18n/en.json'), JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(report, 'english-baseline.json'), JSON.stringify(baseline, null, 2));
console.log(JSON.stringify({ pages: baseline.length, strings: all.size, groups: groups.map((entries, i) => ({ entries: entries.length, chars: sizes[i] })) }));
