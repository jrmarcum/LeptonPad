// Reads version from deno.json and patches:
//   public/config.js  — version field
//   public/sw.js      — CACHE name (forces browser to bust the service worker cache)
// Run via: deno task sync:version
// Called automatically by deno task build and deno task dev.

const { version } = JSON.parse(await Deno.readTextFile('deno.json')) as { version: string };

// Patch public/config.js
const configPath = 'public/config.js';
const configSrc = await Deno.readTextFile(configPath);
const configUpdated = configSrc.replace(/(\bversion:\s*')[^']*(')/,  `$1${version}$2`);
if (configUpdated !== configSrc) {
  await Deno.writeTextFile(configPath, configUpdated);
  console.log(`sync:version — public/config.js updated to v${version}`);
} else {
  console.log(`sync:version — already at v${version}`);
}

// Patch public/sw.js cache name so any version bump forces a full SW cache bust
const swPath = 'public/sw.js';
const swSrc = await Deno.readTextFile(swPath);
const swUpdated = swSrc.replace(
  /(const CACHE\s*=\s*')leptonpad-v[^']*(')/,
  `$1leptonpad-v${version}$2`,
);
if (swUpdated !== swSrc) {
  await Deno.writeTextFile(swPath, swUpdated);
  console.log(`sync:version — public/sw.js cache updated to leptonpad-v${version}`);
}
