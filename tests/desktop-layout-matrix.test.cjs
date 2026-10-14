const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.SEO_PLAYWRIGHT_MODULE || 'C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { desktopPairFailure } = require('../scripts/check-desktop-layout.cjs');

test('desktop matrix rejects a real two-child row when its grid is reverted to a vertical stack', async t => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.setContent('<style>.desktop-topic-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:36px;width:1100px}.desktop-topic-row>section{height:80px}</style><div class="desktop-topic-row"><section>First</section><section>Second</section></div>');
  const geometry = () => page.locator('.desktop-topic-row').evaluate(el => {
    const rect = node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
    return { ...rect(el), children: [...el.children].map(rect) };
  });
  assert.equal(desktopPairFailure(await geometry()), null, 'the authored grid is valid');
  await page.addStyleTag({ content: '.desktop-topic-row { grid-template-columns: 1fr !important; }' });
  const stacked = await geometry();
  assert.equal(stacked.children.length, 2, 'the DOM still has two children');
  assert.match(desktopPairFailure(stacked) || '', /column|stack|align|overlap/i, 'the actual matrix predicate must reject the rendered stack');
});
