import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import httpProxy from 'http-proxy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_ORIGIN = process.env.TARGET_ORIGIN || 'http://127.0.0.1:3000';
const LISTEN_PORT = Number(process.env.PORT || 8080);
const LISTEN_HOST = process.env.HOST || '127.0.0.1';
const CSS_PATH = '/mobile-override.css';
const CSS_FILE = path.join(__dirname, 'mobile.css');
const CSS_TAG = `<link rel="stylesheet" href="${CSS_PATH}">`;

const proxy = httpProxy.createProxyServer({
  target: TARGET_ORIGIN,
  changeOrigin: true,
  selfHandleResponse: true,
  xfwd: true,
});

function sendCss(res) {
  let css = '';
  try {
    css = fs.readFileSync(CSS_FILE, 'utf8');
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Failed to read ${CSS_FILE}: ${error.message}`);
    return;
  }

  res.writeHead(200, {
    'content-type': 'text/css; charset=utf-8',
    'cache-control': 'no-cache',
  });
  res.end(css);
}

function injectCssTag(html) {
  if (html.includes(CSS_TAG)) return html;
  const closeHeadIndex = html.search(/<\/head>/i);
  if (closeHeadIndex < 0) {
    return `${CSS_TAG}${html}`;
  }
  return `${html.slice(0, closeHeadIndex)}${CSS_TAG}${html.slice(closeHeadIndex)}`;
}

function copyHeaders(sourceHeaders, destination) {
  for (const [key, value] of Object.entries(sourceHeaders)) {
    if (
      typeof value === 'undefined' ||
      key.toLowerCase() === 'content-length' ||
      key.toLowerCase() === 'content-encoding'
    ) {
      continue;
    }
    destination.setHeader(key, value);
  }
}

proxy.on('proxyRes', (proxyRes, req, res) => {
  const contentType = String(proxyRes.headers['content-type'] || '');
  const isHtml = contentType.includes('text/html');

  if (!isHtml) {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
    return;
  }

  const chunks = [];
  proxyRes.on('data', (chunk) => chunks.push(chunk));
  proxyRes.on('end', () => {
    const originalHtml = Buffer.concat(chunks).toString('utf8');
    const rewrittenHtml = injectCssTag(originalHtml);
    copyHeaders(proxyRes.headers, res);
    res.writeHead(proxyRes.statusCode || 200, {
      'content-type': 'text/html; charset=utf-8',
      'content-length': Buffer.byteLength(rewrittenHtml, 'utf8'),
      'cache-control': 'no-cache',
    });
    res.end(rewrittenHtml);
  });
});

proxy.on('error', (error, req, res) => {
  const message = `Proxy error: ${error.message}`;
  if (!res.headersSent) {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
  }
  res.end(message);
});

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  const requestPath = req.url.split('?')[0];
  if (requestPath === CSS_PATH) {
    sendCss(res);
    return;
  }

  req.headers['accept-encoding'] = 'identity';
  proxy.web(req, res);
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  process.stdout.write(
    `Mobile proxy listening on ${LISTEN_HOST}:${LISTEN_PORT}, upstream ${TARGET_ORIGIN}\n`
  );
});
