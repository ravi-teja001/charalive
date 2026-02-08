#!/usr/bin/env node
/**
 * Serves the built SPA with SPA fallback: /login, /signup, /admin etc. → index.html
 * Uses only Node built-ins - no extra deps.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '..', 'dist');
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  const safePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.join(distPath, path.normalize(safePath));
  const rel = path.relative(distPath, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return fs.readFile(path.join(distPath, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }

  fs.access(filePath, fs.constants.F_OK, (err) => {
    let target = filePath;
    if (err) {
      target = path.join(distPath, 'index.html');
    } else {
      try {
        if (!fs.statSync(filePath).isFile()) target = path.join(distPath, 'index.html');
      } catch {
        target = path.join(distPath, 'index.html');
      }
    }
    const finalExt = path.extname(target);
    const finalType = mimeTypes[finalExt] || 'text/html';
    fs.readFile(target, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading');
        return;
      }
      res.writeHead(200, { 'Content-Type': finalType });
      res.end(content);
    });
  });
});

server.listen(port, () => {
  console.log(`Serving SPA at http://localhost:${port}`);
});
