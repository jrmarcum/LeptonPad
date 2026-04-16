import { serveDir } from 'jsr:@std/http@1/file-server';

// Copy static assets
await Deno.mkdir('dist', { recursive: true });

// Generate config.js from .env (falls back to public/config.js placeholder)
async function writeConfigJs() {
  let url = 'https://your-project-id.supabase.co';
  let key = 'your-public-anon-key';
  try {
    const env = await Deno.readTextFile('.env');
    for (const line of env.split('\n')) {
      const [k, ...rest] = line.split('=');
      const v = rest.join('=').trim();
      if (k.trim() === 'SUPABASE_URL')      url = v;
      if (k.trim() === 'SUPABASE_ANON_KEY') key = v;
    }
  } catch { /* no .env — use placeholders */ }
  const js = `globalThis.__LP_CONFIG__ = {\n  supabaseUrl:     '${url}',\n  supabaseAnonKey: '${key}',\n};\n`;
  await Deno.writeTextFile('dist/config.js', js);
}

await Promise.all([
  Deno.copyFile('src/styles/main.css', 'dist/main.css'),
  Deno.copyFile('public/manifest.webmanifest', 'dist/manifest.webmanifest'),
  Deno.copyFile('public/index.html', 'dist/index.html'),
  Deno.copyFile('public/LeptonPadLogo.png', 'dist/LeptonPadLogo.png'),
  Deno.copyFile('public/sample_project.json', 'dist/sample_project.json'),
  writeConfigJs(),
]);

// Dev service worker: clears all caches + network-only (no stale cache blocking fresh HTML)
await Deno.writeTextFile(
  'dist/sw.js',
  `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((cs) => cs.forEach((c) => c.navigate && c.navigate(c.url)))
  );
});
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));`,
);

// Inject SSE close-detection client into dist/index.html (dev-only, not in source)
const indexHtml = await Deno.readTextFile('dist/index.html');
await Deno.writeTextFile(
  'dist/index.html',
  indexHtml.replace('</body>', `  <script>new EventSource('/__dev_sse');</script>\n  </body>`),
);

// CSS hot-copy watcher
(async () => {
  for await (const event of Deno.watchFs('src/styles/main.css')) {
    if (event.kind === 'modify') {
      await Deno.copyFile('src/styles/main.css', 'dist/main.css');
      console.log('CSS updated → dist/main.css');
    }
  }
})();

// TypeScript bundler (watch mode)
const bundler = new Deno.Command('deno', {
  args: ['bundle', '--platform', 'browser', '--outdir', 'dist', '--watch', 'src/main.ts'],
  stdout: 'inherit',
  stderr: 'inherit',
}).spawn();

// SSE close-detection: 5 s grace period so a page refresh doesn't shut down the server
let closeTimer: ReturnType<typeof setTimeout> | null = null;

Deno.serve(
  { port: 5173, onListen: () => console.log('Dev server → http://localhost:5173') },
  (req) => {
    const { pathname } = new URL(req.url);

    if (pathname === '/__dev_sse') {
      // Cancel any pending shutdown — browser refreshed and reconnected
      if (closeTimer !== null) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }

      // When this SSE connection drops (tab closed), start the shutdown timer
      req.signal.addEventListener('abort', () => {
        closeTimer = setTimeout(() => {
          console.log('\nBrowser closed — stopping dev server.');
          try { bundler.kill(); } catch { /* already gone */ }
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

// Open browser after server is ready
setTimeout(
  () => new Deno.Command('cmd', { args: ['/c', 'start', 'http://localhost:5173'] }).spawn(),
  500,
);

await bundler.status;
