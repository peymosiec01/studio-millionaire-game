import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { handleFoundryAgent, handleFoundryChat, sendJson } from "./server/foundryProxy.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(root, "dist");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".ogg": "audio/ogg",
  ".svg": "image/svg+xml",
  ".webm": "audio/webm",
};

function sendStatic(req, res) {
  const indexPath = join(distDir, "index.html");
  if (!existsSync(indexPath)) {
    sendJson(res, 503, {
      error: "Build output is missing.",
      details: "Run npm run build before starting the server, or deploy the dist folder with the app.",
    });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requested = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(distDir, requested === "/" ? "index.html" : requested);
  if (!filePath.startsWith(distDir)) {
    sendJson(res, 403, { error: "Forbidden." });
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = indexPath;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", contentTypes[extname(filePath)] || "application/octet-stream");
  createReadStream(filePath).pipe(res);
}

const server = createServer((req, res) => {
  if (req.url?.startsWith("/api/foundry/chat")) {
    handleFoundryChat(req, res);
    return;
  }
  if (req.url?.startsWith("/api/foundry/agent")) {
    handleFoundryAgent(req, res);
    return;
  }
  sendStatic(req, res);
});

server.listen(port, () => {
  console.log(`Studio Millionaire server listening on http://127.0.0.1:${port}`);
});
