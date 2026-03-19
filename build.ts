// Production build: bundle TS, copy static assets into dist/
await Deno.mkdir('dist', { recursive: true });

const bundle = new Deno.Command('deno', {
  args: ['bundle', '--platform', 'browser', '--minify', '--outdir', 'dist', 'src/main.ts'],
  stdout: 'inherit',
  stderr: 'inherit',
});
const { success } = await bundle.output();
if (!success) Deno.exit(1);

await Promise.all([
  Deno.copyFile('src/styles/main.css', 'dist/main.css'),
  Deno.copyFile('solver/pkg/solver_bg.wasm', 'dist/solver_bg.wasm'),
  Deno.copyFile('public/manifest.webmanifest', 'dist/manifest.webmanifest'),
  Deno.copyFile('public/sw.js', 'dist/sw.js'),
  Deno.copyFile('index.html', 'dist/index.html'),
  Deno.copyFile('LeptonPadLogo.png', 'dist/LeptonPadLogo.png'),
]);

console.log('Build complete → dist/');
