// Reads version from deno.json and patches the version field in public/config.js.
// Run via: deno task sync:version
// Called automatically by deno task build and deno task dev.

const { version } = JSON.parse(await Deno.readTextFile('deno.json')) as { version: string };

const configPath = 'public/config.js';
const src = await Deno.readTextFile(configPath);
const updated = src.replace(
  /(\bversion:\s*')[^']*(')/,
  `$1${version}$2`,
);

if (updated === src) {
  console.log(`sync:version — already at v${version}`);
} else {
  await Deno.writeTextFile(configPath, updated);
  console.log(`sync:version — public/config.js updated to v${version}`);
}
