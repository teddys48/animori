const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = './dist';

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    
    if (pathname.endsWith('/')) {
      pathname += 'index.html';
    }

    let filePath = `${DIST_DIR}${pathname}`;
    let file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    // SPA fallback for client routing
    const indexFile = Bun.file(`${DIST_DIR}/index.html`);
    if (await indexFile.exists()) {
      return new Response(indexFile, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 Animori server running on http://localhost:${PORT}`);
