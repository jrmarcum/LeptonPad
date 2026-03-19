import { serveDir } from 'jsr:@std/http@1/file-server';

const port = 5173;

const sseSnippet = `  <script>new EventSource('/__sse');</script>\n  </body>`;
const indexHtml = await Deno.readTextFile('dist/index.html');
if (!indexHtml.includes('/__sse')) {
  await Deno.writeTextFile('dist/index.html', indexHtml.replace('</body>', sseSnippet));
}

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
        new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: ok\n\n')); } }),
        { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } },
      );
    }

    return serveDir(req, { fsRoot: 'dist', quiet: true });
  },
);

setTimeout(
  () => new Deno.Command('cmd', { args: ['/c', 'start', `http://localhost:${port}`] }).spawn(),
  500,
);
