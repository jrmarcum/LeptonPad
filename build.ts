// Production build: bundle TS, copy static assets into dist/
await Deno.mkdir('dist', { recursive: true });

// Generate dist/config.js from .env (or fall back to public/config.js placeholder)
async function writeConfigJs() {
  let url = 'https://your-project-id.supabase.co';
  let key = 'your-public-anon-key';
  try {
    const env = await Deno.readTextFile('.env');
    for (const line of env.split('\n')) {
      const [k, ...rest] = line.split('=');
      const v = rest.join('=').trim();
      if (k.trim() === 'SUPABASE_URL')  url = v;
      if (k.trim() === 'SUPABASE_ANON_KEY') key = v;
    }
  } catch { /* no .env — use placeholders */ }
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
