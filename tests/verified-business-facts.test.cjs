const test = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./build-fixture.cjs')(test, { SITE_ORIGIN: 'https://example.test' });
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

test('confirmed identity, hours and social profiles are consistent on generated pages', () => {
  for (const file of ['index.html', 'about/index.html', 'contact/index.html']) {
    const html = fixture.read(file);
    const business = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'LocalBusiness');
    assert.equal(business['@id'], 'https://example.test/#business');
    assert.equal(business.legalName, 'MEL ONE PROPERTY MAINTENANCE PTY LTD');
    assert.deepEqual(business.identifier, { '@type': 'PropertyValue', propertyID: 'ABN', value: '39666325408' });
    assert.deepEqual(business.openingHoursSpecification, [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days.map(day => `https://schema.org/${day}`), opens: '09:00', closes: '21:00' }]);
    assert.deepEqual(business.sameAs, ['https://www.instagram.com/melone.maintenance1/', 'https://www.youtube.com/@MelOneMaintenance', 'https://www.tiktok.com/@melonemaintenance5']);
    assert.match(html.match(/<footer\b[^>]*>([^]*?)<\/footer>/)[1], /Monday–Sunday, 09:00–21:00 \(Adelaide local time\)/);
    if (file !== 'index.html') assert.match(html.match(/<main\b[^>]*>([^]*?)<\/main>/)[1], /Monday–Sunday, 09:00–21:00 \(Adelaide local time\)/);
    assert.match(html, /href="https:\/\/share.google\/bnkU7OE83VYCSh44T"/);
    assert.doesNotMatch(JSON.stringify(business), /aggregateRating|review|priceRange|foundingDate|specialOpeningHoursSpecification/i);
  }
  const text = fixture.read('llms.txt');
  for (const value of ['MEL ONE PROPERTY MAINTENANCE PTY LTD', '39666325408', '666325408', 'Monday–Sunday, 09:00–21:00 (Adelaide local time)']) assert.ok(text.includes(value), value);
});
