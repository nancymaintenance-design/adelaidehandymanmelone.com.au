const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {chromium} = require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const report = path.resolve(root, '../reports/footer-compact-2026-10-15');
const expectedLinks = [
  ['https://share.google/bnkU7OE83VYCSh44T', 'Google Reviews'],
  ['https://www.instagram.com/melone.maintenance1/', 'Instagram'],
  ['https://www.youtube.com/@MelOneMaintenance', 'YouTube'],
  ['https://www.tiktok.com/@melonemaintenance5', 'TikTok'],
];
let rows = [];
let fixture;
test.after(() => {
  if (!fixture) return;
  assert.equal(path.dirname(path.resolve(fixture)), report, 'Only remove this test fixture inside its report directory');
  assert.ok(path.basename(fixture).startsWith('fixture-'));
  fs.rmSync(fixture, {recursive:true, force:true, maxRetries:3});
});
test.before(async () => {
  fs.mkdirSync(report, {recursive:true});
  fixture = fs.mkdtempSync(path.join(report, 'fixture-'));
  require('./english-builder-fixture.cjs')(root, fixture);
  fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), {recursive:true});
  execFileSync(process.execPath, ['build.mjs'], {cwd:fixture, stdio:'pipe'});
  const output = path.join(fixture, 'public');
  const server = http.createServer((req,res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.join(output, url.pathname, url.pathname.endsWith('/') ? 'index.html' : '');
    if (!fs.existsSync(file)) {res.writeHead(404); res.end(); return;}
    res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({executablePath:process.env.FOOTER_BROWSER || 'C:/Users/UFTR/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe', headless:true});
    const page = await browser.newPage();
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    for (const width of [1920,1440,1024,851,850,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      for (const route of ['/', '/services/interior-repairs-assembly/', '/guides/field-notes-cleaning-removals-preparation/']) {
        await page.goto(origin+route, {waitUntil:'networkidle'});
        await page.evaluate(()=>document.fonts.ready);
        const row = await page.locator('.site-footer').evaluate(footer => {
          const rect = node => {const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
          const grid=footer.querySelector('.footer-grid'), brand=grid.firstElementChild;
          const social=footer.querySelector('.footer-social'), nav=social.querySelector('nav');
          const links=[...nav.querySelectorAll('a')];
          return {footer:rect(footer),grid:rect(grid),brand:rect(brand),social:rect(social),socialInBrand:brand.contains(social),description:rect(brand.querySelector('p')),bottom:rect(footer.querySelector('.footer-bottom')),links:links.map(a=>[a.getAttribute('href'),a.textContent.trim()]),targets:links.map(rect),safe:links.every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')),columns:grid.children.length,overflow:document.documentElement.scrollWidth-innerWidth};
        });
        rows.push({route,width,...row});
        if (route==='/' && [1920,390].includes(width)) await page.locator('.site-footer').screenshot({path:path.join(report,`${process.env.FOOTER_PHASE || 'current'}-${width}.png`)});
      }
    }
    // All generated pages use the same accessible social navigation exactly once.
    const sitemap = fs.readFileSync(path.join(output,'sitemap.xml'),'utf8');
    for (const [,url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const file=path.join(output,new URL(url).pathname,'index.html');
      const html=fs.readFileSync(file,'utf8');
      assert.equal((html.match(/aria-label="MEL ONE reviews and social media"/g)||[]).length,1,url);
    }
  } finally {
    fs.writeFileSync(path.join(report,`${process.env.FOOTER_PHASE || 'current'}-geometry.json`),JSON.stringify(rows,null,2));
    if(browser) await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
test('footer social links sit immediately beneath brand copy instead of creating a standalone full-width row', () => {
  assert.equal(rows.length,24,'Three shared-footer templates at eight widths must be measured');
  for (const row of rows) {
    const label=`${row.width} ${row.route}`;
    assert.ok(row.socialInBrand,label+': social navigation must share the brand column');
    assert.equal(row.columns,4,label+': preserve the four existing footer columns');
    assert.ok(row.social.y-row.description.bottom>=0&&row.social.y-row.description.bottom<=20,label+': overlap or excessive gap below brand description');
    assert.ok(row.bottom.y-row.grid.bottom>=0&&row.bottom.y-row.grid.bottom<=32,label+': overlap or excessive gap above bottom divider');
    if(row.width>=1280) assert.ok(row.footer.height<=420,label+': desktop footer remains unnecessarily tall');
  }
});
test('compact footer retains four unchanged accessible links without overflow or undersized targets', () => {
  for (const row of rows) {
    assert.deepEqual(row.links,expectedLinks);
    assert.equal(row.safe,true);
    assert.ok(row.overflow<=1,`${row.width}: horizontal overflow`);
    for(const target of row.targets) {
      assert.ok(target.height>=44,'44px minimum click target');
      assert.ok(target.x>=row.brand.x-1&&target.right<=row.brand.right+1,`${row.width}: social link escapes brand column`);
    }
  }
});
