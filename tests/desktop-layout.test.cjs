const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {verifyProtectedLayoutCss}=require('../scripts/verify-keyword-content.cjs');
test('a leading H3 keeps its complete answer unsplit when no later group boundary exists',async()=>{
 const {composeDesktopLayout}=await import('../src/desktop-layout.mjs');
 const topic='<section><h2>Scope</h2><h3>Repair choice</h3><p>First answer.</p><p>Second answer.</p></section>';
 const actual=composeDesktopLayout('<article class="reading">'+topic+'</article>','/services/example/');
 assert.doesNotMatch(actual,/desktop-topic-body/,'one H3 answer must not be divided at a paragraph midpoint');
 assert.ok(actual.includes(topic),'heading and both answer paragraphs retain their original grouping');
});
test('leading H3 groups split only before the next H3 or section and preserve all following answers',async()=>{
 const {composeDesktopLayout}=await import('../src/desktop-layout.mjs');
 const first='<h3>Repair choice</h3><p>'+('Keep this first answer with its own heading. '.repeat(6))+'</p><p>Second answer in the same subsection.</p>';
 for(const next of ['<h3>Parts</h3><p>Confirm compatible parts.</p><h3>Visit</h3><p>Agree access.</p>','<section><h3>Parts</h3><p>Confirm compatible parts.</p></section>']) {
  const actual=composeDesktopLayout('<article class="reading"><section><h2>Scope</h2>'+first+next+'</section></article>','/services/example/');
  assert.ok(actual.includes('<div class="desktop-topic-unit">'+first+'</div><div class="desktop-topic-unit">'+next+'</div>'),'columns may separate complete groups, never the answer belonging to the first H3');
 }
});
test('heading evidence reads nested layout prose but stops before an H3 in the next column',async t=>{
 const {chromium}=require('C:/Users/UFTR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const {extractPage}=require('../scripts/verify-keyword-content.cjs');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});t.after(()=>browser.close());
 const page=await browser.newPage();
 await page.setContent('<main><section><h2>Fault assessment</h2><div class="desktop-topic-body"><div><p>Inspect the hinge and the supporting cabinet before agreeing parts.</p><p>Describe the movement.</p></div><div><h3>Visit preparation</h3><p>Later preparation must not qualify the fault heading.</p></div></div></section><section><h2>Next topic</h2><p>Other text.</p></section></main>');
 const result=await extractPage(page,null,'/test/');
 assert.equal(result.headings[0].body,'Inspect the hinge and the supporting cabinet before agreeing parts. Describe the movement.');
 assert.equal(result.headings[1].body,'Later preparation must not qualify the fault heading.');
});
test('approved desktop append rejects scope escape or drift without blessing historical CSS',t=>{
 const dir=fs.mkdtempSync(path.resolve(__dirname,'../../reports/desktop-layout-repair-2026-10-14/css-fixture-'));
 const file=path.join(dir,'site.css');
 const base='body {color:black}\n',hub='/* decision-qa-redesign:start */\n.decision-hub h1 {color:black}\n',guide='/* guide-editorial-repair:start */\n.guide-page p {color:black}\n',desktop='/* desktop-layout-repair:start */\n.desktop-layout .desktop-reading {max-width:none}\n/* desktop-layout-repair:end */\n';
 const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
 const run=(text,profile={scopedCssHash:digest(desktop),selectorPrefix:'.desktop-layout '})=>{fs.writeFileSync(file,text);return verifyProtectedLayoutCss({layoutCssHash:digest(base)},file,{scopedCssHash:digest(hub)},{scopedCssHash:digest(guide)},profile);};
 assert.deepEqual(run(base+hub+guide+desktop),[]);
 assert.match(run(base+hub+guide+desktop.replace('none','780px')).join(' '),/Scoped desktop CSS changed/);
 assert.match(run(base.replace('black','red')+hub+guide+desktop).join(' '),/Protected layout CSS changed/);
 assert.match(run(base+hub+guide.replace('black','red')+desktop).join(' '),/Scoped guide CSS changed/);
 const escaped=desktop.replace('.desktop-layout .desktop-reading','body');
 assert.match(run(base+hub+guide+escaped,{scopedCssHash:digest(escaped),selectorPrefix:'.desktop-layout '}).join(' '),/Unscoped desktop CSS selector/);
});
test('layout composer preserves escaped nested content, links and aliases while keeping neighboring topics together',async()=>{
 const {composeDesktopLayout}=await import('../src/desktop-layout.mjs');
 const original='<article class="reading"><p>A &amp; B</p><section id="one"><h2>One</h2><p>Safe &lt;section&gt;</p><ul><li><a href="/a/#b">Link</a></li></ul></section><section id="two"><span id="alias"></span><h2>Two</h2><p>Other</p></section><section><h2>Questions</h2><div class="faq-list"><details><summary>Why?</summary><p>Because.</p></details></div></section></article>';
 const actual=composeDesktopLayout(original,'/services/example/');
 assert.match(actual,/<div class="desktop-topic-row"><section id="one">[^]*<section id="two">/);
 assert.match(actual,/<\/section><\/div><section><h2>Questions/);
 assert.equal(actual.replace('<div class="desktop-layout">','').replace(/<div class="desktop-topic-row">/g,'').replace(/ desktop-reading/g,'').replace(/<\/div><section><h2>Questions/,'<section><h2>Questions').replace(/<\/div>$/,''),original);
 assert.doesNotMatch(composeDesktopLayout(original,'/privacy/'),/desktop-topic-row/);
});
