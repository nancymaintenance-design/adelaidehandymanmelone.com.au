const fs = require('node:fs');
const path = require('node:path');

// Vercel checks existing static files before this Chinese-path fallback rewrite.
// Use the same translated artifact as local preview, without redirecting to a 200.
function createNotFound({ root = process.cwd(), transform = html => html } = {}) {
  return function notFound(req, res) {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    const html = fs.readFileSync(path.join(root, 'public/zh/404.html'), 'utf8');
    res.writeHead(404, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Language': 'zh-Hans',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, follow',
    });
    res.end(req.method === 'HEAD' ? undefined : transform(html));
  };
}
module.exports = createNotFound();
module.exports.createNotFound = createNotFound;
