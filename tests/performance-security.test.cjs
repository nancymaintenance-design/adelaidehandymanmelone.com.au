const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const buildFixture = require('./build-fixture.cjs');

test('optimized logo and initially visible comparison delivery', t => {
  const fixture = buildFixture(t);
  const html = fixture.read('index.html');
  assert.match(html, /mel-one-logo-authorized-224.webp" alt="MEL ONE" width="112" height="64"/);
  assert.ok(fs.statSync(path.join(fixture.output, 'assets/mel-one-logo-authorized-224.webp')).size < 48427);
  const pair = html.match(/class="record-pair"[\s\S]*?<\/a>/)[0];
  assert.equal((pair.match(/fetchpriority="high"/g) || []).length, 1);
  assert.doesNotMatch(pair, /loading="lazy"/);
});

test('configured CSP covers actual executable scripts/styles and rejects drift', async t => {
  const { validateSecurityPolicy, securityPolicy } = await import('../src/security-policy.mjs');
  const fixture = buildFixture(t);
  const html = fixture.read('index.html');
  assert.doesNotThrow(() => validateSecurityPolicy(html, securityPolicy));
  assert.throws(() => validateSecurityPolicy(html.replace("gtag('js'", "gtag('changed'"), securityPolicy), /CSP/);
  assert.throws(() => validateSecurityPolicy(html.replace('--pin-x:48%', '--pin-x:49%'), securityPolicy), /CSP/);
  assert.doesNotMatch(securityPolicy, /unsafe-inline/);
  assert.equal((securityPolicy.match(/sha256-/g) || []).length, 4);
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json')));
  assert.equal(config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value, securityPolicy);
  assert.match(config.headers[1].source, /avif/);
  const fixtureRoot = path.dirname(fixture.output);
  fs.writeFileSync(path.join(fixtureRoot, 'vercel.json'), JSON.stringify(config));
  const run = () => spawnSync(process.execPath, ['build.mjs'], { cwd: fixtureRoot, encoding: 'utf8' });
  assert.equal(run().status, 0, 'fixture with matching configured policy builds');
  config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value += '; upgrade-insecure-requests';
  fs.writeFileSync(path.join(fixtureRoot, 'vercel.json'), JSON.stringify(config));
  const drift = run();
  assert.notEqual(drift.status, 0);
  assert.match(drift.stderr, /CSP configuration drift/);
});
