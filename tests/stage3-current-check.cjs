// Read-only verification of the current generated site. The legacy check.cjs
// remains unchanged and its obsolete 23-page assertions are reported separately.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public');
const origin = 'https://www.adelaidehandymanmelone.com.au';
const files = [];
function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) files.push(p); } }
walk(root);
const pages = files.filter(p => path.basename(p) === 'index.html');
assert.equal(pages.length, 82, 'current production inventory');
const titles = new Set();
let references = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title && !titles.has(title), `${file}: unique title`); titles.add(title);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${file}: H1`);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.ok(canonical?.startsWith(origin + '/'), `${file}: production canonical`);
  const route = '/' + path.relative(root, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  assert.equal(canonical, origin + route, `${file}: exact canonical route`);
  assert.match(html, /admin@melonemaintenance\.com\.au/, `${file}: MEL ONE email`);
  assert.match(html, /0416 614 281/, `${file}: MEL ONE phone`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1].replaceAll('&amp;', '&');
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const local = href.split(/[?#]/)[0];
    const target = path.join(root, local);
    assert.ok(fs.existsSync(target.endsWith(path.sep) ? path.join(target, 'index.html') : target) || fs.existsSync(path.join(target, 'index.html')), `${file}: ${href}`);
    references++;
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]);
    const graph = data['@graph'] || [data];
    for (const faq of graph.filter(s => s['@type'] === 'FAQPage')) for (const q of faq.mainEntity) {
      const escaped = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
      assert.ok(html.includes(escaped(q.name)), `${file}: visible FAQ question`);
      assert.ok(html.includes(escaped(q.acceptedAnswer.text)), `${file}: visible FAQ answer`);
    }
  }
}
const locs = [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
assert.equal(locs.length, 82);
for (const loc of locs) { assert.ok(loc.startsWith(origin + '/')); assert.ok(fs.existsSync(path.join(root, new URL(loc).pathname, 'index.html')), loc); }
const privacy = fs.readFileSync(path.join(root, 'privacy/index.html'), 'utf8');
assert.match(privacy, /not stored in browser storage/);
assert.match(privacy, /not to Google Analytics/);
assert.match(privacy, /enquiry endpoint/);
assert.ok(fs.existsSync(path.join(root, 'case-studies/henley-beach-sliding-screen-door-repair/index.html')));
console.log(`Current MEL ONE check: ${pages.length} index pages, ${files.length} HTML files, ${references} local references; canonical, assets, contacts, privacy and FAQ agreement passed.`);
