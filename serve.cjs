const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 5173);
const ROOT = path.join(__dirname, 'public');
const globalHeaders = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8')).headers
  .filter(rule => rule.source === '/(.*)').flatMap(rule => rule.headers);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.xml':  'application/xml',
  '.txt':  'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.webmanifest': 'application/manifest+json',
};

const server = http.createServer((req, res) => {
  for (const header of globalHeaders) res.setHeader(header.key, header.value);
  if (req.url.split('?')[0] === '/api/contact') {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Local preview: enquiries are not sent. Your details remain in the form.' }));
    return;
  }
  let url;
  try { url = decodeURIComponent(req.url.split('?')[0]); }
  catch { res.writeHead(400); res.end('Invalid URL'); return; }
  // Windows treats both separators as paths; browsers interpret // or /\ as an authority.
  // Reject ambiguous decoded paths before filesystem checks or Location construction.
  if (!url.startsWith('/') || url.includes('//') || /[\\\u0000-\u0020\u007f]/.test(url)) {
    res.writeHead(400); res.end('Invalid URL'); return;
  }
  const canonicalPath = url === '/index.html' ? '/' : url.endsWith('/index.html') ? url.slice(0, -10) : !path.extname(url) && !url.endsWith('/') ? url + '/' : null;
  if (canonicalPath && fs.existsSync(path.join(ROOT, canonicalPath, 'index.html'))) {
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    res.writeHead(308, { Location: canonicalPath + query });
    res.end(); return;
  }
  if (url.endsWith('/')) url += 'index.html';
  const filePath = path.join(ROOT, url);
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const notFound = path.join(ROOT, url.startsWith('/zh/') ? 'zh/404.html' : '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(previewHtml(fs.readFileSync(notFound, 'utf8')));
      return;
    }
    const ext = path.extname(filePath);
    const mime = /^\/(?:zh\/)?feed\.json$/.test(url) ? 'application/feed+json; charset=utf-8'
      : /^\/(?:zh\/)?feed\.xml$/.test(url) ? 'application/rss+xml; charset=utf-8'
      : /^\/(?:zh\/)?schema-feed\.json$/.test(url) ? 'application/ld+json; charset=utf-8'
      : mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(ext === '.html' ? previewHtml(fs.readFileSync(filePath, 'utf8')) : fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

function previewHtml(html) {
  return html.replace(/<script\b[^>]*\bsrc=["']https:\/\/www\.googletagmanager\.com\/[^"']*["'][^>]*>\s*<\/script>/gi, '');
}
server.listen(PORT, '127.0.0.1', () => console.log(`MEL ONE local review preview (not deployed): http://127.0.0.1:${server.address().port}`));
