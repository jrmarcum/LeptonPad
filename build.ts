// Production build: bundle TS, copy static assets into dist/
await Deno.mkdir('dist', { recursive: true });

// Generate dist/config.js from env vars (Deno Deploy) or .env file (local dev)
async function writeConfigJs() {
  // Prefer process env vars — set these in the Deno Deploy dashboard
  let url = Deno.env.get('SUPABASE_URL') ?? '';
  let key = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  // Fall back to .env file for local dev
  if (!url || !key) {
    try {
      const env = await Deno.readTextFile('.env');
      for (const line of env.split('\n')) {
        const [k, ...rest] = line.split('=');
        const v = rest.join('=').trim();
        if (k.trim() === 'SUPABASE_URL')      url = url || v;
        if (k.trim() === 'SUPABASE_ANON_KEY') key = key || v;
      }
    } catch { /* no .env — use placeholders */ }
  }

  url = url || 'https://your-project-id.supabase.co';
  key = key || 'your-public-anon-key';

  const js = `globalThis.__LP_CONFIG__ = {\n  supabaseUrl:     '${url}',\n  supabaseAnonKey: '${key}',\n};\n`;
  await Deno.writeTextFile('dist/config.js', js);
}

const bundle = new Deno.Command('deno', {
  args: ['bundle', '--platform', 'browser', '--minify', '--outdir', 'dist', 'src/main.ts'],
  stdout: 'inherit',
  stderr: 'inherit',
});
const { success } = await bundle.output();
if (!success) Deno.exit(1);

await Promise.all([
  Deno.copyFile('src/styles/main.css', 'dist/main.css'),
  Deno.copyFile('public/manifest.webmanifest', 'dist/manifest.webmanifest'),
  Deno.copyFile('public/sw.js', 'dist/sw.js'),
  Deno.copyFile('public/index.html', 'dist/index.html'),
  Deno.copyFile('public/LeptonPadLogo.png', 'dist/LeptonPadLogo.png'),
  Deno.copyFile('public/sample_project.json', 'dist/sample_project.json'),
  writeConfigJs(),
]);

console.log('Build complete → dist/');
