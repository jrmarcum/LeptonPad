import { serveDir } from 'jsr:@std/http@1/file-server';

const port = 5173;

// The live-reload client is injected into the response, never written back to dist/index.html.
// It used to be persisted to disk, which meant any dist/ that had been served once carried a
// dev-only EventSource into production, where it hammers an endpoint that does not exist.
// Serving it from memory keeps dist/ exactly as `deno task build` produced it.
const sseSnippet = `  <script>new EventSource('/__sse');</script>\n  </body>`;
const rawIndex = await Deno.readTextFile('dist/index.html');
const devIndex = rawIndex.includes('/__sse')
  ? rawIndex // already injected by an older build — serve as-is rather than double-inject
  : rawIndex.replace('</body>', sseSnippet);

/** The paths that must be answered with the injected HTML rather than the file on disk. */
const isIndexPath = (p: string) => p === '/' || p === '/index.html';

let closeTimer: ReturnType<typeof setTimeout> | null = null;

Deno.serve(
  { port, onListen: () => console.log(`LeptonPad → http://localhost:${port}`) },
  (req) => {
    const { pathname } = new URL(req.url);

    if (pathname === '/__sse') {
      if (closeTimer !== null) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      req.signal.addEventListener('abort', () => {
        closeTimer = setTimeout(() => {
          console.log('\nBrowser closed — stopping server.');
          Deno.exit(0);
        }, 5000);
      });

      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(new TextEncoder().encode('data: ok\n\n'));
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } },
      );
    }

    if (isIndexPath(pathname)) {
      return new Response(devIndex, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          // Matches dev.ts: without it the browser serves a stale shell across restarts.
          'Cache-Control': 'no-store',
        },
      });
    }

    return serveDir(req, { fsRoot: 'dist', quiet: true });
  },
);

setTimeout(
  () => new Deno.Command('cmd', { args: ['/c', 'start', `http://localhost:${port}`] }).spawn(),
  500,
);
