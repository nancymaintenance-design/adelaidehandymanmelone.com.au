const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf8'));

test('apex requests permanently redirect to the HTTPS www host with their path', () => {
  const redirect = config.redirects?.find(rule =>
    rule.source === '/:path*' &&
    rule.has?.some(condition =>
      condition.type === 'host' && condition.value === 'adelaidehandymanmelone.com.au'
    )
  );
  assert.ok(redirect, 'an apex-host-only catch-all redirect exists');
  assert.equal(redirect.destination, 'https://www.adelaidehandymanmelone.com.au/:path*');
  assert.ok(redirect.permanent === true || redirect.statusCode === 301 || redirect.statusCode === 308);
});

test('all responses receive baseline security headers', () => {
  const global = config.headers?.find(rule => rule.source === '/(.*)' || rule.source === '/:path*');
  assert.ok(global, 'a global header rule exists');
  const headers = Object.fromEntries(global.headers.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
  assert.match(headers['permissions-policy'] ?? '', /(?:^|,)\s*camera=\(\)/);
  assert.match(headers['permissions-policy'] ?? '', /(?:^|,)\s*microphone=\(\)/);
  assert.match(headers['permissions-policy'] ?? '', /(?:^|,)\s*geolocation=\(\)/);
  assert.equal(headers['x-frame-options'], 'DENY');
  assert.equal(headers['cache-control'], undefined, 'global rule does not replace asset caching');
});

test('static image and font assets retain their cache policy', () => {
  const assetRule = config.headers?.find(rule =>
    rule.source === '/(.*)\\.(png|jpg|jpeg|webp|avif|gif|svg|ico|woff|woff2)'
  );
  assert.ok(assetRule, 'the existing image and font asset rule exists');
  const cache = assetRule.headers.find(header => header.key.toLowerCase() === 'cache-control');
  assert.equal(cache?.value, 'public, max-age=604800, stale-while-revalidate=86400');
});
