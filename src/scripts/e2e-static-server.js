const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.E2E_FRONTEND_PORT || 4173);
const root = path.resolve(__dirname, '..', 'frontend');
const chartJsRoot = path.resolve(__dirname, '..', '..', 'node_modules', 'chart.js', 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  if (decoded.startsWith('/vendor/chart.js/')) {
    const vendorTarget = path.normalize(
      path.join(chartJsRoot, decoded.slice('/vendor/chart.js/'.length))
    );
    return vendorTarget.startsWith(chartJsRoot) ? vendorTarget : null;
  }

  const relative = decoded === '/' ? '/pages/login.html' : decoded;
  const target = path.normalize(path.join(root, relative));
  return target.startsWith(root) ? target : null;
}

http.createServer((req, res) => {
  const target = safeResolve(req.url || '/');
  if (!target) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(target, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(target)] || 'application/octet-stream'
    });
    res.end(content);
  });
}).listen(port, () => {
  console.log(`Frontend E2E em http://localhost:${port}`);
});
