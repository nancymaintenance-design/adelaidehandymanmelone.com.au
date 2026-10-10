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
  '.txt':  'text/plain',
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
  if (url.endsWith('/')) url += 'index.html';
  const filePath = path.join(ROOT, url);
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  try {
    if (!fs.existsSync(filePath)) {
      const notFound = path.join(ROOT, '404.html');
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(notFound));
      return;
    }
    const ext = path.extname(filePath);
    const mime = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nMEL ONE — local review preview (not deployed)`);
  console.log(`   Local:   http://127.0.0.1:${PORT}`);
  console.log(`   Network: http://localhost:${PORT}`);
  console.log(`   Ctrl+C to stop\n`);
});
