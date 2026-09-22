# Collaboration — how Jon works

Jon Marcum (`jrmarcum.se@gmail.com`) is the owner and sole developer. He is a **structural engineer**,
not a full-time software developer — which shapes everything below.

## Verification

- **Jon confirms features by testing in the browser.** When he says "it worked" or "fixed," take it at
  face value. **Do not re-verify already-confirmed work and do not ask follow-up questions about it.**
- Conversely, since there is no test suite ([`testing.md`](testing.md)), **be explicit about what you
  did and did not verify.** The useful ending to a change is: what changed, and exactly what to click
  to confirm it.

## How a feature gets built (established 2026-09-22, the matrix session)

Jon sets the order himself and says so: _"We will need to test each before moving to the next one."_
The rhythm that worked, 14 releases in a day:

1. **Settle the ambiguous syntax decisions up front**, before any code — operator meaning, what a
   name renders as, what is refused. Offer options with consequences; Jon decides quickly and his
   answers are specific (`.*` for the matrix product, `\` mandatory, no `\pm`).
2. **Build one step**, run it through the real code path in a script, and report a **table of exactly
   what to type and what it should produce**.
3. **Bump, build, push, wait for the live cache name**, then Jon tests in the browser and says
   "proceed" or reports what he saw. Nothing moves to the next step before that.

**Every test table must be self-contained.** This is the lesson of the session, paid for three times:
a table that reused `A` from an earlier table (2×3 where the reader still had a 2×2) sent Jon chasing
an error that was in the instructions, not the code. **Define every variable in the block you hand
over, and say whether a row is about the display or the calculated result** — a row can render
perfectly and still show `err` because a name is undefined.

## Communication

- **Keep responses concise.** No line-by-line narration of changes — Jon reads the diff. End-of-turn
  summaries in 1–2 sentences.
- **Jon describes features in engineering terms** — "fill under the curve," "beam span variable,"
  "stretch the block to the right margin." Translate directly to code. Do not ask for low-level
  detail he has already expressed in domain language.
- When something is genuinely ambiguous, make the routine judgment call and state the assumption
  rather than blocking on a question.

## The deploy cycle

1. `deno task dev` → test in the browser.
2. Bump `"version"` in `deno.json`.
3. Deploy to Vercel.

**Service-worker cache busting is the confirmation signal.** If the SW cache name did not change, the
browser may still be serving stale JS — so "it's not fixed" after a deploy is a cache question before
it is a code question. Full chain in [`build-and-deploy.md`](build-and-deploy.md).

## Project memory

- **`cmem/` is the single home for all project memory** — tracked in git, travels with the project.
  Nothing goes in a machine-local store (`~/.claude/projects/…/memory/`, an untracked `CLAUDE.md`, a
  scratchpad). This was set up 2026-08-13 after discovering `CLAUDE.md` had been gitignored the entire
  time it claimed to be portable ([`known-issues.md`](known-issues.md) §3).
- **"update the project memory"** is a binding trigger with a defined action — see
  [`INDEX.md`](INDEX.md).

## Related projects

LeptonPad lives in `wasmExamples/` alongside `wazmrt`, `wasmrt`, `wasmtk`, `wabt-ts`, `binaryen-ts`,
and `lisp-wat_interpreter`. Two direct relationships:

- **`@jrmarcum/wasmtk`** — Jon's own tool, published on JSR, used by `deno task build:wasm`.
- **`wazmrt`** — the Zig WebAssembly runtime whose `cmem/` convention this directory follows. If the
  memory format evolves in one project, consider whether the other should follow.
