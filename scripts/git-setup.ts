// One-time-per-machine git configuration for this repo.
//
// LeptonPad is meant to be portable — it lives on a removable exFAT volume so it can be read on
// any machine. exFAT is what makes that work, and it is also what breaks git in three ways
// (cmem/known-issues.md § 15). Two of the three are fixed by configuration, and that is the
// problem this script solves: the configuration itself was not portable.
//
//   - `safe.directory` can ONLY be set in global or system config — git deliberately ignores a
//     repo-local value, since a repo you do not trust must not be able to declare itself trusted.
//     So it cannot travel inside .git/config, and a fresh machine gets "detected dubious
//     ownership" on every command until someone remembers the incantation.
//   - `maintenance.auto` / `gc.auto` are repo-local, so they DO survive a folder copy, but not a
//     fresh `git clone`.
//
// Carrying the knowledge in a tracked script means a new machine needs one command instead of a
// memory. Idempotent: safe to run twice, reports what it actually changed.
//
// Run via: deno task setup:git

async function git(...args: string[]): Promise<{ ok: boolean; out: string }> {
  const cmd = new Deno.Command('git', { args, stdout: 'piped', stderr: 'piped' });
  const { success, stdout, stderr } = await cmd.output();
  return {
    ok: success,
    out: (new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr)).trim(),
  };
}

const repo = Deno.cwd().replace(/\\/g, '/');
let changed = 0;

// ── safe.directory (global — cannot live in the repo) ──────────────────────
// Compared case-insensitively: Windows hands out the drive letter in either case, and an entry
// differing only by `D:` vs `d:` does not match, which is how the global list grew duplicates.
const existing = await git('config', '--global', '--get-all', 'safe.directory');
const already = existing.out.split('\n').some((l) => l.trim().toLowerCase() === repo.toLowerCase());

if (already) {
  console.log(`  ✓ safe.directory already covers ${repo}`);
} else {
  const r = await git('config', '--global', '--add', 'safe.directory', repo);
  if (r.ok) {
    console.log(`  + safe.directory ${repo}`);
    changed++;
  } else {
    console.error(`  ✗ could not add safe.directory: ${r.out}`);
  }
}

// ── auto-maintenance off (local) ───────────────────────────────────────────
// Git's post-commit repack builds a new pack, then renames it over the old one. On this volume a
// pack git still has memory-mapped cannot be replaced, so the rename fails — AFTER the repack
// succeeded, leaving a complete duplicate behind every time. The commit and push are unaffected;
// only the cleanup fails. Turning it off trades automatic tidying for `deno task git:tidy`.
for (const [key, want] of [['maintenance.auto', 'false'], ['gc.auto', '0']] as const) {
  const cur = await git('config', '--local', '--get', key);
  if (cur.out === want) {
    console.log(`  ✓ ${key} already ${want}`);
    continue;
  }
  const r = await git('config', '--local', key, want);
  if (r.ok) {
    console.log(`  + ${key} = ${want}`);
    changed++;
  } else {
    console.error(`  ✗ could not set ${key}: ${r.out}`);
  }
}

console.log(
  changed === 0
    ? '\nsetup:git — already configured, nothing to do.'
    : `\nsetup:git — ${changed} setting(s) applied. Run \`deno task git:tidy\` occasionally.`,
);
