import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import {titlePhotoSelection} from '../../src/title-photos.mjs';
const baseline = JSON.parse(fs.readFileSync(new URL('../fixtures/title-theme-photos-20261024.json',import.meta.url),'utf8'));
export const titleThemePhotoFiles = new Set(Object.keys(baseline.before));
export function restoreTitleThemePhoto(html, file) {
  if (!titleThemePhotoFiles.has(file)) return html;
  const route = '/' + file.replace(/^zh\//,'').replace(/index\.html$/,'');
  const [slug, index] = titlePhotoSelection[route];
  const $ = load(html);
  const image = $('.title-theme-photo img');
  const detail = load(fs.readFileSync('public/' + (file.startsWith('zh/') ? 'zh/' : '') + 'case-studies/' + slug + '/index.html','utf8'));
  const original = detail('img').filter((_,e) => /case-photo-frame/.test(detail(e).parent().parent().attr('class') || '')).eq(index);
  assert.equal($('.title-theme-photo').length,1);
  assert.equal($('.title-photo-copy').length,1);
  for (const attr of ['src','alt','width','height']) assert.equal(image.attr(attr),original.attr(attr),file+' reviewed title image '+attr);
  assert.ok(image.attr('srcset'));
  assert.equal(image.attr('loading'),'eager');
  const restored = html.replace(/<div class="title-photo-copy">([^]*?)<\/div><figure class="title-theme-photo">[^]*?<\/figure>/, '$1');
  assert.equal(createHash('sha256').update(restored.replaceAll('\r\n','\n')).digest('hex'),baseline.before[file],file+' exact reviewed HTML outside title photograph');
  return restored;
}
