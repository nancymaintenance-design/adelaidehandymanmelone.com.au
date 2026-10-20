import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { load } from 'cheerio';

const root = path.resolve(import.meta.dirname, '..');
const report = path.resolve(root, '../reports/2026-10-20-benchmark-implementation');
const baseline = path.join(report, 'preservation-baseline.json');
const digest = value => createHash('sha256').update(value).digest('hex');
const files = fs.readdirSync(path.join(root, 'public'), { recursive: true }).filter(f => f.endsWith('.html')).sort();
const pages = Object.fromEntries(files.map(file => {
  const $ = load(fs.readFileSync(path.join(root, 'public', file), 'utf8'));
  return [file, { h1: $('main h1').map((_, el) => $(el).text()).get(), footer: digest($('footer').toString()), office: digest($('.office-location').toString()) }];
}));
const protectedFiles = ['vercel.json', 'src/security-policy.mjs', ...fs.readdirSync(path.join(root, 'src/assets'), { recursive: true }).filter(f => /\.(css|js)$/.test(f)).map(f => `src/assets/${f}`), 'public/robots.txt'];
const hashes = Object.fromEntries(protectedFiles.map(file => [file, digest(fs.readFileSync(path.join(root, file)))]));
fs.mkdirSync(report, { recursive: true });
if (process.argv.includes('--capture')) {
  assert.ok(!fs.existsSync(baseline), 'Never overwrite the pre-edit baseline');
  fs.writeFileSync(baseline, JSON.stringify({ pages, hashes }, null, 2));
  console.log(`Captured ${files.length} page H1/footer/map records and ${protectedFiles.length} protected files.`);
} else {
  const before = JSON.parse(fs.readFileSync(baseline, 'utf8'));
  assert.deepEqual(pages, before.pages, 'H1, footer, map or route changed');
  assert.deepEqual(hashes, before.hashes, 'Layout, browser scripts or crawler/security policy changed');
  console.log(`PASS: ${files.length} H1/footer/map records and ${protectedFiles.length} protected hashes unchanged.`);
}
