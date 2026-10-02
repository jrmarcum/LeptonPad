// Occasional git housekeeping, replacing the auto-maintenance that exFAT cannot run.
//
// Why this is needed at all: every small file on this volume occupies a 256 KB allocation unit.
// A loose git object is a small file. With auto-gc off (see scripts/git-setup.ts), loose objects
// accumulate from every commit and each one costs 256 KB of disk regardless of its real size —
// so `.git` grows roughly 0.25 MB per object while the content inside it is a few KB.
//
// Measured twice: 338 loose objects → `.git` at 109 MB (2026-09-23), and 429 loose objects →
// 125 MB (2026-10-02). Both came back to ~19 MB after a repack. The content was never the
// problem; the slack was.
//
// Run via: deno task git:tidy

async function git(...args: string[]): Promise<{ ok: boolean; out: string }> {
  const cmd = new Deno.Command('git', { args, stdout: 'piped', stderr: 'piped' });
  const { success, stdout, stderr } = await cmd.output();
  return {
    ok: success,
    out: (new TextDecoder().decode(stdout) + new TextDecoder().decode(stderr)).trim(),
  };
}

/** Loose object count and pack size, straight from `git count-objects -v`. */
async function stats(): Promise<{ loose: number; packs: number; packKb: number }> {
  const { out } = await git('count-objects', '-v');
  const field = (k: string) => Number(out.match(new RegExp(`^${k}: (\\d+)`, 'm'))?.[1] ?? 0);
  return { loose: field('count'), packs: field('packs'), packKb: field('size-pack') };
}

const before = await stats();
console.log(
  `git:tidy — before: ${before.loose} loose object(s), ${before.packs} pack(s), ` +
    `${(before.packKb / 1024).toFixed(1)} MB packed`,
);

if (before.loose === 0 && before.packs <= 1) {
  console.log('git:tidy — already tidy, nothing to do.');
  Deno.exit(0);
}

// Safe in any state: drops loose objects that are already inside a pack.
const pruned = await git('prune-packed');
if (!pruned.ok) console.error(`  ! prune-packed: ${pruned.out}`);

// Consolidates everything reachable into one pack and deletes the rest. This is the step that
// used to fail — the rename-over-a-mapped-pack problem — so a failure here is EXPECTED
// occasionally and is not corruption. It means the pack git wants to write already exists on
// disk, which is why the message says so rather than treating it as an error.
const repacked = await git('repack', '-ad');
if (!repacked.ok) {
  console.error(
    `  ! repack could not complete:\n${repacked.out}\n` +
      '    This is the exFAT rename limitation, not damage — see cmem/known-issues.md § 15.\n' +
      '    Everything reachable is still intact and is also on GitHub. Try again after closing\n' +
      '    any editor or tool holding the repo open, or re-clone if `.git` stays oversized.',
  );
}

const after = await stats();
console.log(
  `git:tidy — after:  ${after.loose} loose object(s), ${after.packs} pack(s), ` +
    `${(after.packKb / 1024).toFixed(1)} MB packed`,
);

// Integrity is cheap to confirm and this script just rewrote the object store, so confirm it
// rather than assuming. --connectivity-only skips the expensive per-object checksum.
const fsck = await git('fsck', '--connectivity-only');
console.log(fsck.ok ? 'git:tidy — fsck clean.' : `git:tidy — ⚠️ fsck reported:\n${fsck.out}`);
if (!fsck.ok) Deno.exit(1);
