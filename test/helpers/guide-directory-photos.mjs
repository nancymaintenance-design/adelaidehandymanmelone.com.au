import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
const baseline = JSON.parse(fs.readFileSync(new URL('../fixtures/guide-directory-photos-20261024.json', import.meta.url), 'utf8'));
export const guideDirectoryPhotoFiles = new Set(Object.keys(baseline.before));
export function restoreGuideDirectoryPhotos(html, file) {
  if (!guideDirectoryPhotoFiles.has(file)) return html;
  const $ = load(html);
  assert.equal($('.guide-preview-photo').length, 10, file);
  $('.guide-directory .note-card').each((_, card) => {
    const image = $(card).find('.guide-preview-photo img');
    const href = $(card).find('h3 a').attr('href');
    assert.ok(/^\/(?:zh\/)?guides\/[a-z0-9-]+\/$/.test(href));
    const detail = load(fs.readFileSync('public' + href + 'index.html', 'utf8'));
    const original = detail('.guide-case-photo img');
    for (const attr of ['src', 'alt', 'width', 'height']) assert.equal(image.attr(attr), original.attr(attr), file + ' exact source photograph ' + attr);
    assert.equal(image.attr('loading'), 'lazy');
    assert.ok(image.attr('srcset'));
    assert.ok(image.attr('sizes'));
    assert.equal($(card).find('.guide-preview-photo source[type="image/avif"]').length, 1);
  });
  const restored = html.replace(/<div class="guide-preview-photo">[^]*?<\/div>/g, '');
  assert.equal(createHash('sha256').update(restored.replaceAll('\r\n', '\n')).digest('hex'), baseline.before[file], file + ' exact reviewed original HTML outside added photographs');
  return restored;
}
