import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { translateHtml, translateStructured } from '../src/i18n/html.mjs';
import { createTranslator, languageUrl } from '../src/i18n/bilingual.mjs';

const quotationHash = '9b1f2627bf872015ffd03a1f7d5d793f92ecff2a766caecb3b05082586f06a6d';
const assessmentHash = 'ae7251b8c09149cdc07d659317c707b0d4c6616d0fcf4b3ff6295c2f4a7b6008';
function catalogueFixture(t, source, chinese, lock) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-i18n-test-'));
  t.after(() => {
    assert.equal(path.dirname(directory), os.tmpdir());
    assert.ok(path.basename(directory).startsWith('mel-one-i18n-test-'));
    fs.rmSync(directory, { recursive: true, force: true });
  });
  fs.writeFileSync(path.join(directory, 'en.json'), JSON.stringify(source));
  fs.writeFileSync(path.join(directory, 'zh-one.json'), JSON.stringify(chinese));
  if (lock !== undefined) fs.writeFileSync(path.join(directory, 'source-lock.json'), JSON.stringify(lock));
  return directory;
}
function recordSources(directory, ...args) {
  return spawnSync(process.execPath, [path.resolve('scripts/record-translation-sources.mjs'), '--directory', directory, ...args], { encoding: 'utf8' });
}

test('editing English under an existing ID rejects its old Chinese translation until reviewed', t => {
  const directory = catalogueFixture(t, { t1: 'No call-out fee.' }, { t1: '上门费需要确认。' }, { t1: quotationHash });
  const translator = createTranslator(directory);
  translator.translate('No call-out fee.');
  assert.throws(translator.assertComplete, /Stale Chinese translation.*t1/s);
});
test('source bindings normalize whitespace without ignoring wording changes', t => {
  const directory = catalogueFixture(t, { t1: '  A repair\n quotation. ' }, { t1: '维修报价。' }, { t1: quotationHash });
  const translator = createTranslator(directory);
  assert.equal(translator.translate('A repair quotation.'), '维修报价。');
  assert.doesNotThrow(translator.assertComplete);
});
test('a complete but unlocked translation cannot pass the normal publication check', t => {
  const directory = catalogueFixture(t, { t1: 'A repair quotation.' }, { t1: '维修报价。' });
  const translator = createTranslator(directory);
  translator.translate('A repair quotation.');
  assert.throws(translator.assertComplete, /Unreviewed Chinese translation.*t1/s);
});
test('new translated IDs need explicit source bindings even when older bindings are valid', t => {
  const directory = catalogueFixture(t, { t1: 'A repair quotation.', t2: 'An assessment fee.' }, { t1: '维修报价。', t2: '评估费。' }, { t1: quotationHash });
  const translator = createTranslator(directory);
  translator.translate('An assessment fee.');
  assert.throws(translator.assertComplete, /Unreviewed Chinese translation.*t2/s);
});
test('initial source recording creates complete hashes once and never overwrites an existing lock', t => {
  const directory = catalogueFixture(t, { t1: ' \n A repair   quotation.\t ', t2: 'An assessment fee.' }, { t1: '维修报价。', t2: '评估费。' });
  let result = recordSources(directory, '--initial');
  assert.equal(result.status, 0, result.stderr);
  const lockPath = path.join(directory, 'source-lock.json');
  assert.deepEqual(JSON.parse(fs.readFileSync(lockPath, 'utf8')), { t1: quotationHash, t2: assessmentHash });
  const before = fs.readFileSync(lockPath, 'utf8');
  result = recordSources(directory, '--initial');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/);
  assert.equal(fs.readFileSync(lockPath, 'utf8'), before);
});
test('recording explicit reviewed IDs updates only those bindings and leaves other stale entries blocked', t => {
  const directory = catalogueFixture(t, { t1: 'No call-out fee.', t2: 'A written quote.' }, { t1: '无上门费。', t2: '评估费。' }, { t1: quotationHash, t2: assessmentHash });
  const result = recordSources(directory, 't1');
  assert.equal(result.status, 0, result.stderr);
  const lock = JSON.parse(fs.readFileSync(path.join(directory, 'source-lock.json'), 'utf8'));
  assert.equal(lock.t1, '30456f6980fb05c4bd0d9448802922ff01adf31e3df4b2ded12174a7978d2248');
  assert.equal(lock.t2, assessmentHash);
  const translator = createTranslator(directory);
  assert.throws(translator.assertComplete, /Stale Chinese translation.*t2/s);
});
test('recording refuses implicit bulk updates, unknown IDs and untranslated IDs without touching the lock', t => {
  const directory = catalogueFixture(t, { t1: 'A repair quotation.', t2: 'An assessment fee.' }, { t1: '维修报价。' }, { t1: quotationHash });
  const lockPath = path.join(directory, 'source-lock.json');
  const before = fs.readFileSync(lockPath, 'utf8');
  for (const args of [[], ['--all'], ['t999'], ['t2'], ['t1', 't999'], ['--initial', 't1']]) {
    const result = recordSources(directory, ...args);
    assert.notEqual(result.status, 0, `must reject ${args.join(' ')}`);
    assert.equal(fs.readFileSync(lockPath, 'utf8'), before);
  }
});

test('new/changed English copy blocks publication instead of silently using English on Chinese pages', () => {
  const translator = createTranslator();
  translator.translate('A newly introduced untranslated statement — test fixture.');
  assert.throws(translator.assertComplete, /Bilingual sync required/);
});
test('catalogue rejects missing, empty and duplicate Chinese strings', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-i18n-test-'));
  try {
    fs.writeFileSync(path.join(temp, 'en.json'), JSON.stringify({ t1: 'A repair quotation.' }));
    const translator = createTranslator(temp);
    translator.translate('A repair quotation.');
    assert.throws(translator.assertComplete, /lack Chinese/);
    fs.writeFileSync(path.join(temp, 'zh-one.json'), JSON.stringify({ t1: '' }));
    assert.throws(() => createTranslator(temp), /Empty/);
    fs.writeFileSync(path.join(temp, 'zh-one.json'), JSON.stringify({ t1: '维修报价。' }));
    fs.writeFileSync(path.join(temp, 'zh-two.json'), JSON.stringify({ t1: '维修报价。' }));
    assert.throws(() => createTranslator(temp), /Duplicate/);
  } finally {
    assert.equal(path.dirname(temp), os.tmpdir());
    assert.ok(path.basename(temp).startsWith('mel-one-i18n-test-'));
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
test('language URLs preserve queries/fragments and never rewrite external, API, phone, mail or asset URLs', () => {
  const origin = 'https://example.test';
  const routes = new Set(['/', '/contact/', '/services/door-repair/', '/case-studies/feed.json']);
  assert.equal(languageUrl('/contact/?suburb=burnside#main', origin, routes), '/zh/contact/?suburb=burnside#main');
  assert.equal(languageUrl(origin + '/services/door-repair/#options', origin, routes), origin + '/zh/services/door-repair/#options');
  for (const value of ['#main', 'tel:+61416614281', 'mailto:admin@melonemaintenance.com.au', '/assets/a.jpg', '/api/contact', 'https://instagram.com/test', '/not-a-published-page/']) assert.equal(languageUrl(value, origin, routes), value);
});
test('HTML translation changes prose and accessibility text without corrupting code, form names or IDs', () => {
  const dictionary = { 'Repair quote': '维修报价', 'Describe the repair': '描述维修问题', 'Image before work': '维修前照片', 'Optional cost': '参考费用 $&' };
  const input = '<!doctype html><html lang="en-AU"><head><title>Repair quote</title><meta name="description" content="Describe the repair"><script>const text="Repair quote";</script></head><body><h1 id="repair">Repair quote</h1><p>Optional cost</p><a href="tel:+61416614281">0416 614 281</a><input name="message" aria-label="Describe the repair"><img src="/assets/x.jpg" alt="Image before work"></body></html>';
  const output = translateHtml(input, text => dictionary[text] || text);
  assert.match(output, /lang="zh-Hans"/);
  assert.match(output, /<h1 id="repair">维修报价/);
  assert.match(output, /参考费用 \$&amp;/);
  assert.match(output, /const text="Repair quote"/);
  assert.match(output, /name="message" aria-label="描述维修问题"/);
  assert.match(output, /href="tel:\+61416614281"/);
});
test('structured data localizes descriptive fields while preserving identifiers and business numbers', () => {
  const value = { '@type': 'Service', name: 'Door repair', telephone: '+61416614281', email: 'admin@melonemaintenance.com.au', inLanguage: 'en-AU', areaServed: { '@type': 'City', name: 'Burnside' } };
  const result = translateStructured(value, text => text === 'Door repair' ? '门维修' : text);
  assert.equal(result.name, '门维修');
  assert.equal(result.inLanguage, 'zh-Hans');
  assert.equal(result['@type'], 'Service');
  assert.equal(result.telephone, value.telephone);
  assert.equal(result.areaServed.name, 'Burnside');
});
