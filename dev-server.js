// Minimal static file server for previewing index.html in a browser at the
// Electron window's content size. Not used by the app itself.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5177;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/index.html';
  const p = path.join(__dirname, f);
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('dev-server on http://localhost:' + PORT));
