const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

// Each test builds an isolated copy, leaving the user's local preview untouched.
module.exports = function buildFixture(test, extraEnv = {}, changeContent) {
  const root = path.resolve(__dirname, '..');
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'mel-one-build-'));
  test.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  fs.copyFileSync(path.join(root, 'build.mjs'), path.join(fixture, 'build.mjs'));
  fs.cpSync(path.join(root, 'src'), path.join(fixture, 'src'), { recursive: true });
  const contentPath = path.join(fixture, 'src/content-pack/mel-one-site-content.json');
  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  if (changeContent) {
    changeContent(content);
    fs.writeFileSync(contentPath, JSON.stringify(content));
  }
  execFileSync(process.execPath, ['build.mjs'], { cwd: fixture, env: { ...process.env, SITE_ORIGIN: '', ...extraEnv }, stdio: 'pipe' });
  const output = path.join(fixture, 'public');
  return { content, output, read: file => fs.readFileSync(path.join(output, file), 'utf8') };
};
