const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const buildFixture = require('./build-fixture.cjs');

const fixture = buildFixture(test);
const html = fixture.read('contact/index.html');
const script = fixture.read('assets/js/site.js');
const decode = text => text.replaceAll('&quot;', '"').replaceAll('&#039;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
function initialise(search, initial = '', contact = true) {
  const elements = Object.fromEntries(['suburb','message','name','phone','email','timing'].map(name => [name, {value: name === 'suburb' ? initial : ''}]));
  const map = html.match(/data-suburb-options="([^"]*)"/);
  const form = {
    elements, dataset: contact && map ? {suburbOptions: decode(map[1])} : {},
    querySelector: () => ({addEventListener() {}}), addEventListener() {},
  };
  vm.runInNewContext(script, {
    URLSearchParams,
    window: {location: {hash:'', search}, addEventListener() {}, matchMedia: () => ({matches:false})},
    document: {getElementById: () => null, querySelector: selector => selector === '[data-enquiry-form]' ? form : null, querySelectorAll: () => []},
    fetch() { throw new Error('Initialisation must never send an enquiry'); },
  });
  return elements;
}
test('generated contact lookup prefills exact approved names from current suburb CTA queries', () => {
  assert.equal(JSON.parse(decode(html.match(/data-suburb-options="([^"]*)"/)[1])).length, 32);
  assert.equal(initialise('?region=western-suburbs&suburb=glenelg').suburb.value, 'Glenelg');
  assert.equal(initialise('?region=cbd-north-adelaide&suburb=adelaide-cbd').suburb.value, 'Adelaide CBD');
  assert.equal(initialise('?suburb=adelaide-cbd').suburb.value, 'Adelaide CBD');
  assert.match(html, /rel="canonical" href="https:\/\/www\.adelaidehandymanmelone\.com\.au\/contact\/"/);
});
test('prefill ignores unknown, hostile, mismatched and legacy query values', () => {
  for (const query of ['?suburb=unknown','?suburb=__proto__','?suburb=%3Cimg%20src=x%20onerror=alert(1)%3E','?region=inner-west&suburb=glenelg','?region=&suburb=glenelg','?area=glenelg&street=123%20Example&message=injected&email=other%40example.com']) {
    const fields = initialise(query);
    assert.ok(Object.values(fields).every(field => field.value === ''), query);
  }
});
test('prefill preserves user values and leaves inline forms alone', () => {
  assert.equal(initialise('?suburb=glenelg', 'My chosen location').suburb.value, 'My chosen location');
  assert.equal(initialise('?suburb=glenelg', '', false).suburb.value, '');
  const fields = initialise('?suburb=glenelg&name=Injected&email=injected%40example.com&phone=123456&message=Injected&street=123');
  assert.equal(fields.suburb.value, 'Glenelg');
  for (const name of ['name','email','phone','message','timing']) assert.equal(fields[name].value, '');
  assert.doesNotMatch(fixture.read('services/doors-windows-screens/index.html'), /data-suburb-options=/);
});

test('structured paragraph text, link label and href stay escaped in generated HTML', () => {
  const rendered = buildFixture(test, {}, content => {
    content.news[0].sections.push({heading:'Escaping fixture', paragraphs: [[
      'Text <img src=x> & "quoted" ',
      {url:'/contact/?x="<&\'value', label:'Label <script> & "quoted" \'single\''},
      ' trailing <b> & text',
    ]]});
  });
  const page = rendered.read(`news/${rendered.content.news[0].slug}/index.html`);
  assert.ok(page.includes('<p>Text &lt;img src=x&gt; &amp; &quot;quoted&quot; <a href="/contact/?x=&quot;&lt;&amp;&#039;value">Label &lt;script&gt; &amp; &quot;quoted&quot; &#039;single&#039;</a> trailing &lt;b&gt; &amp; text</p>'));
});
