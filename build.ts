// Production build: bundle TS, copy static assets into dist/
import { writeConfigJs } from './scripts/write-config.ts';

await Deno.mkdir('dist', { recursive: true });

const { version } = JSON.parse(await Deno.readTextFile('deno.json')) as { version: string };

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
  // sample_project.json is NOT shipped: nothing fetches it, index.html does not reference it, and
  // it is not in the service worker's precache list. `newFromTemplate()` opens a file picker
  // rather than loading a bundled sample. The file stays in public/ as a format reference.
  writeConfigJs(version),
]);

console.log('Build complete → dist/');
