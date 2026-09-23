# Roadmap and Current State

## Where the project stands — v2.5.0 (2026-09-23)

**Shipping and working.** LeptonPad is a functioning product, not a prototype: nine block types, a
unit-aware math engine with an automated test suite, a 23-category / 158-unit catalog, SVG plotting with unit-propagating
sweep variables, markdown text, figures, collapsible sections with scoped namespaces, custom
multi-block user tools, author-declared input rows and per-row accident locks, page-sized canvas
with title block and page numbering, PWA install and offline operation, Clerk auth with four roles
and two-factor sign-in against a production instance, one-time license codes, and AES-256-GCM
encrypted purchasable template packs.

~16k lines across `src/` (13.9k TS + 2.5k CSS), `api/`, `db/`, `solver/`, and the build scripts.
`dist/main.js` is **450 KB**. Live at https://leptonpad.com (also `leptonpad.jrmarcum.deno.net`) —
one Deno Deploy project serving both the site and the API at `/api`, and **a push to `main` is the
deploy**. v2.5.0 (`a1030c7`) was pushed 2026-09-23 and is therefore in production.

### The 2026-09-22 session — the math and notation layer, in 14 releases

Driven by Jon's own sheets (AISC Design Example D.1 first), each step tested in the browser before
the next. Detail in [`math-engine.md`](math-engine.md); the short list:

- **Units:** `[unit]` tags anywhere in an expression, not just one at the end.
- **Notation, LaTeX-style and mandatory:** `\phi` → φ (all 24 letters, both cases), `\ell`, the seven
  `\var` shapes, `\bar{x}`, `\sqrt(`. A bare name renders as typed — no guessing.
- **Constants:** `\e` is Euler's number; plain `e` and `tau` belong to the user (eccentricity, shear
  stress). `pi` stays π. Assigning to a constant is an error.
- **New maths:** `ln`, `log(x, base)`, `sum`, `prod`, `integral` (adaptive Simpson, unit-aware),
  displayed as Σ Π ∫ with limits.
- **Matrices, the largest piece:** brace literals with per-element units, element-wise `+ − * /`,
  scalar scaling, the `.*` product (shown as ×), `transpose`, `det`, `inv`, `solve(K, F)` and
  `el(A, i, j)` — enough for K·u = F with a mixed-unit stiffness matrix, rendered as bracketed grids.
- **Display:** comparisons as ≥ ≤ ≠, any exponent raised, function arguments rendered.
- **Bugs found and fixed along the way:** unary minus bound tighter than `^` (`-x^2` gave `+x²`),
  `==` read as an assignment, plots missing section dot-notation, title blocks drifting down a page
  per Shift+Enter, `[1/kip]` inventing a unit named "1", a service worker that could cache the
  previous release's JS, and a project file loader that rejected a hand-written `\phi`.

**Backend migrated 2026-08-13** — off Supabase, onto Clerk + Neon + Deno Deploy, with the Supabase
code deleted the same day. Driver was cost: the free tier paused after a week of inactivity, and the
obvious alternatives paused identically. Launch cost drops from $25/mo to roughly $3/mo. Full account
in [`backend-migration.md`](backend-migration.md).

**Recent work before that** (from `git log`, most recent first): unit-definition additions, a lint
cleanup pass, a dimensional-analysis bug fix, defined-unit handling in the plot block,
unit-presentation fixes, markdown corrections, block stretch handles, plot variable settings and fill,
automatic version sync from `deno.json`, and fraction-display/parser fixes.

The trajectory is clear: **the unit and presentation layer is where the effort goes**, because that is
where an engineering calculation pad either earns trust or loses it. The backend is a gate, kept
deliberately small.

### The 2026-09-23 session — tests, the unit-correctness series, then a code audit (v2.3.17 → v2.3.34)

The test suite landed first, at Jon's direction, and then found or enabled everything after it.

| Rel    | What                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| 2.3.17 | `tests/` + `deno task check` runs it. Fixed: function definitions dropped their unit tag.     |
| 2.3.18 | Line spacing 1 / 1.5 / 2, per block and per row.                                              |
| 2.3.19 | Rows own their spacing; the block control overwrites every row (Jon's design).                |
| 2.3.20 | Fixed: `syncContent` erased spacing on every keystroke — § 16 of known-issues.                |
| 2.3.21 | Alt+Arrow navigation between cells; readme gained a keyboard section.                         |
| 2.3.22 | Ink-coloured rules; results in the calculation face; comparisons render **OK** / **NG**.      |
| 2.3.23 | **Comparisons ignored units entirely** — `6 [in] > 0.5 [ft]` was true.                        |
| 2.3.24 | Same-kind units convert in `+`, `−` and comparisons; `CATEGORY_DIMENSION` added.              |
| 2.3.25 | `kN-mm` added (`J`, `lbm`, `kg` were already there).                                          |
| 2.3.26 | `[[unit]]` refuses different kinds — `5 [kip] [[in]]` had reported 875634 in.                 |
| 2.3.27 | Unknown unit ids rejected with a did-you-mean; no phantom units, no user-defined units.       |
| 2.3.28 | Math Display font list; lining figures, after Georgia's old-style digits were reported.       |
| 2.3.29 | A trailing `[unit]` converts instead of relabelling — the last of the three agreed items.     |
| 2.3.30 | `J`/`W` display as themselves; `serve.ts` and `dev.ts` stop writing into `dist/`.             |
| 2.3.31 | The code audit: malformed literals, the fraction divergence, implicit `E`, section summaries. |
| 2.3.32 | Per-row significant digits; projects save as `.leptonpad`.                                    |
| 2.3.33 | Page Numbering did nothing, and the Title Block erased it.                                    |
| 2.3.34 | Margins listed Left, Right, Top, Bottom.                                                      |

**A dozen of these were silent wrong answers**, not crashes — the failure mode this product cares
most about. Comparisons ignoring units; `[[unit]]` converting across kinds; a trailing tag
relabelling instead of converting; phantom units; line spacing erased on every keystroke; `[mm^]`
becoming dimensionless and then absorbing any unit; `1.2.3` parsing as `1.2`; a rendered equation
that disagreed with its own printed result; an implicit `E = 200000`; a section summary printing
another scope's value; `mod()` discarding units; and a Page Numbering checkbox that did nothing.
Almost all had been there for the engine's whole life. Detail in
[`math-engine.md`](math-engine.md), [`units.md`](units.md) and
[`known-issues.md`](known-issues.md) §§ 16–20.

The order mattered. The test suite came first at Jon's direction, and `CATEGORY_DIMENSION` — added
only to answer "are these the same kind?" — later made both the `[[unit]]` kind check and
"J displays as J" small changes rather than impossible ones.

### The 2026-09-23 session, continued — sign-in, then the audit leads (v2.3.35 → v2.5.0)

Six more releases the same day. The first three were forced by Jon being locked out of his own admin
account; the last three closed the audit's remaining debt.

| Rel    | What                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 2.3.35 | Bumped the service-worker cache so a new Clerk key actually reached browsers — see the deploy trigger. |
| 2.3.36 | Report **which** sign-in step Clerk is asking for, instead of a generic failure.                       |
| 2.4.0  | **Two-factor sign-in.** Clerk returned `needs_second_factor` and the app had no step to show for it.   |
| 2.4.1  | Closed five of the six open audit leads — [`known-issues.md`](known-issues.md) § 19.                   |
| 2.4.2  | A section **renders** for everyone; only **creating** one is gated.                                    |
| 2.5.0  | Author-declared **input rows** and **two kinds of row lock**; the sixth and last audit lead closed.    |

**v2.3.35 is the deploy trigger in miniature.** A correct new Clerk key was deployed and browsers
kept using the old one, because the service-worker cache name had not changed. The fix was a version
bump, not code — which is exactly why "a version bump is not a deploy" is in `INDEX.md`.

**v2.4.2 was a gate in the wrong place.** Opening a file containing a section showed "Pro required to
create sections" across the whole block, so a recipient could neither read nor print a sheet sent to
them. Rendering is now unconditional and only the create path is gated — consistent with the standing
decision that section _creation_ is not worth defending server-side.

**v2.5.0 is the one with a design behind it**, and the reasoning is in
[`design-decisions.md`](design-decisions.md) §§ "Input rows: the licensing problem dissolved rather
than traded" and "Two locks, and only one of them is enforcement". In short: a licensed pack template
could be read but not used, because every edit was discarded on save by the encryption invariant. The
insight that dissolved it is that **the inputs are not the licensed content — the formulas are**. A
template author now declares which rows are inputs; only those values save, as plaintext beside the
ciphertext, keyed to a stable author-assigned id (`FormulaRow.in`) rather than to row position, so a
later pack version that inserts a row above an input still finds its value. An input must hold a
literal, and its required unit kind (`uk`) is checked dimensionally so a `force` input takes kip, kN
or lbf alike. Alongside it, two locks that are deliberately different in kind: `FormulaRow.lk`
protects a row from **accidents** and is honestly described that way, because a flag in a file on the
user's own disk cannot be enforcement; the pack lock is the real one, and it works by the plaintext
never being on disk. v2.5.0 also fixed § 21 — block-level `lineSpacing` was serialized but never read
back, so it reverted to single on every reload from v2.3.19 onward.

## Open items

**0. ~~Six audit leads that were never reproduced.~~ ALL CLOSED 2026-09-23** — five fixed in v2.4.1,
the sixth (pack edits discarded on save) closed in v2.5.0 by changing the design rather than the code
path. Each was verified in the code before being changed. Kept in
[`known-issues.md`](known-issues.md) § 19 because the _shape_ recurs: every one was a
plausible-looking wrong answer rather than a crash.

**1. ~~A custom domain + Clerk production instance.~~ DONE.** The production instance
`clerk.leptonpad.com` exists and is live on `https://leptonpad.com`, and two-factor sign-in against
it shipped in v2.4.0. This item used to read as the one thing blocking live sign-in; it no longer
blocks anything. — [`auth-and-licensing.md`](auth-and-licensing.md)

**2. Decide how third-party notices reach someone who only receives the deployed site.**
`THIRD_PARTY_NOTICES.md` is complete and correct but is not copied into `dist/`; `@clerk/clerk-js` is
bundled and MIT requires its notice to travel with distributed copies. A link in an about panel is
the usual answer. — [`licensing.md`](licensing.md)

**3. ~~Tests for `expr.ts`.~~ DONE 2026-09-23** — `tests/`, 97 steps, wired into `deno task check`.
It paid for itself immediately, exposing a dropped unit tag on function definitions and then
underpinning the whole unit-correctness series below. What is still uncovered is anything with a
DOM. — [`testing.md`](testing.md)

**4. The section-pack storefront — still the big missing piece.** The database side is complete and
**verified** — `create_section_pack()` generates the secret, `mint_license_codes()` issues codes,
redemption and key derivation pass `deno task db:check`. What is missing is the payment flow and the
pack-authoring UI for a super user. Today packs are created by SQL helper and unlocked with manually
minted codes.

⚠️ **The hard blocker is on the client side, and it is recorded in
[`known-issues.md`](known-issues.md) § 22: nothing in the tree ever sets `packId`.** It is read in
`persistence.ts` (load, decrypt, serialize) and in `section.ts` (the unowned-pack placeholder), and
assigned nowhere — no code path authors, purchases or places a pack block. So the encryption
invariant, the per-user key derivation and the v2.5.0 pack lock are correct **by construction and
untested end to end**; no one has ever opened a real pack block. A second unresolved question sits
under it: a pack section's **children** are ordinary top-level blocks carrying `parentSectionId`, and
they serialize their own `content` in **plaintext** — only the section block's own `content` is
encrypted, and `buildSectionBlock` never reads it. As shaped today the storefront would write the
template body in the clear. Whoever builds it has to settle how a pack's child blocks are carried
before anything is sold. (`encryptTemplate()` in `src/crypto.ts` has no caller and is kept
deliberately — do not remove it in a dead-code sweep.)

**4a. No UI for renaming an input's `in` id.** The stable id is seeded from the variable name when a
row is marked as an input and is independent of it thereafter — which is the point, since an author
must be able to rename `P` to `P_u` without orphaning every saved value. But once assigned there is
no way to change the id itself. That is fine until a template author needs to correct one.

### ✅ DECIDED 2026-08-13: Merchant of Record, not Stripe direct

Jon's call, and the reason is tax, not fees. Selling software to consumers internationally creates
VAT and sales-tax obligations in the buyer's jurisdiction at effectively zero threshold in the EU.
With **Stripe direct** LeptonPad is the merchant and that liability is Jon's — registering, collecting
and remitting, in every jurisdiction. With a **Merchant of Record** the platform is legally the
seller and carries it. The ~2% extra buys away a compliance burden a solo engineer should not be
carrying.

**Vendor: Paddle.** Chosen 2026-08-13 for tax handling _and_ independence — Lemon Squeezy and Stripe
Managed Payments are both Stripe-owned now, so betting on either means accepting whatever terms Stripe
sets later. Paddle is the one established MoR still independent of the processor we would otherwise be
avoiding. Lemon Squeezy additionally carries post-acquisition onboarding delays and reports of
effective fees approaching 9% with add-ons, which erodes the reason to pay an MoR premium at all.

⚠️ **Paddle vets sellers before approving an account**, and wants a reviewable product. That is a
lead time measured in days, not minutes — apply well before launch day rather than on it.

The integration is small:

1. Hosted checkout — **card data never touches LeptonPad**, so PCI scope stays at SAQ-A.
2. One webhook: verify the signature, then either grant the pack or mint a code.
3. It lands on `redeem_license_code`, which already exists and passes `db:check`.

✅ **The sequencing hazard is spent.** Pack keys are `HMAC-SHA256(pack_secret, clerk_user_id)` and
Clerk user ids do not survive a dev → production move, so anything sold before the migration would
have become permanently undecryptable. The production instance `clerk.leptonpad.com` went live
before any sale and while the database was still clean, so nothing was stranded. Keep the rule in
mind only if a Clerk instance is ever moved again.

**5. `'table'` block type** — declared in the `Block['type']` union with no implementation. Either
build it or remove it from the union.

## Explicitly not being built

- **Moving the math engine to WASM.** The `WASM-READY:` comments mark functions whose signatures would
  survive a promotion; they are not a plan. String- and object-heavy evaluation does not benefit from
  a JS↔WASM boundary, and unit conversion is a lookup plus one multiply. —
  [`design-decisions.md`](design-decisions.md)
- **Collapsing expanded compound units for display.** `kip/in²` instead of `ksi` on intermediate rows
  is correct output, and the reverse mapping is ambiguous. `[[ksi]]` is the user-facing answer.
- **A state-management framework.** The mutable `state.ts` singleton plus callback slots is the right
  size for a single-user, single-document browser app.
- **Server-side enforcement of section _creation_.** The boundary that matters is `get_pack_key`;
  drawing an empty section is not worth defending. v2.4.2 narrowed the client gate to match — a
  section **renders** for everyone, and only creating one is gated.
  — [`security-model.md`](security-model.md)
- **A second backend implementation.** `src/backend.ts` keeps the seam so a future swap stays cheap,
  but there is one implementation and adding a speculative second would be cost without benefit.

## When something here changes

Update this file **and** the affected topic file, and refresh the pointer in
[`INDEX.md`](INDEX.md)'s Files table. Convert relative dates to absolute. Re-measure any number before
quoting it — line counts and version strings here go stale silently.
