# Roadmap and Current State

## Where the project stands — v2.3.34 (2026-09-23)

**Shipping and working.** LeptonPad is a functioning product, not a prototype: nine block types, a
unit-aware math engine with an automated test suite, a 23-category / 158-unit catalog, SVG plotting with unit-propagating
sweep variables, markdown text, figures, collapsible sections with scoped namespaces, custom
multi-block user tools, page-sized canvas with title block and page numbering, PWA install and
offline operation, Clerk auth with four roles, one-time license codes, and AES-256-GCM encrypted
purchasable template packs.

~13k lines across `src/` (11k TS + 2.1k CSS), `api/`, `db/`, `solver/`, and the build scripts.
`dist/main.js` is **426 KB**. Live at https://leptonpad.com (also `leptonpad.jrmarcum.deno.net`) —
one Deno Deploy project serving both the site and the API at `/api`, and **a push to `main` is the
deploy**.

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

## Open items

**0. Six audit leads that were never reproduced.** Reported by the 2026-09-23 sweeps, each needs a
browser and none was confirmed, so they are leads rather than findings: the plot range silently
falling back to a default span; `sect-prop`/`beam-def` inputs not persisting and leaving a stale
result on screen; a failed pack decrypt rendering blank; pack edits discarded on save; an unknown
`block.type` overwriting its own content; and summary comparisons silently dropped. Full list with
the reasoning in [`known-issues.md`](known-issues.md) § 19.

**1. A custom domain + Clerk production instance — the one thing blocking live sign-in.**
The deployed site runs fine and the API is healthy, but Clerk is a DEVELOPMENT instance and its
dev-browser handshake does not work on a deployed domain. A production instance needs CNAME records
on a domain you control, which `*.deno.net` cannot provide. Everything else — canvas, math, plots,
save/load — already works live, because the backend is only a gate. — [`auth-and-licensing.md`](auth-and-licensing.md)

**2. Decide how third-party notices reach someone who only receives the deployed site.**
`THIRD_PARTY_NOTICES.md` is complete and correct but is not copied into `dist/`; `@clerk/clerk-js` is
bundled and MIT requires its notice to travel with distributed copies. A link in an about panel is
the usual answer. — [`licensing.md`](licensing.md)

**3. ~~Tests for `expr.ts`.~~ DONE 2026-09-23** — `tests/`, 97 steps, wired into `deno task check`.
It paid for itself immediately, exposing a dropped unit tag on function definitions and then
underpinning the whole unit-correctness series below. What is still uncovered is anything with a
DOM. — [`testing.md`](testing.md)

**4. The section-pack storefront.** The database side is complete and **verified** —
`create_section_pack()` generates the secret, `mint_license_codes()` issues codes, redemption and key
derivation pass `deno task db:check`. What is missing is the payment flow and the pack-authoring UI
for a super user. Today packs are created by SQL helper and unlocked with manually minted codes.

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

⚠️ **Sequence matters: do the Clerk production migration BEFORE the first sale.** Pack keys are
`HMAC-SHA256(pack_secret, clerk_user_id)`, and Clerk user ids do not survive a dev → production
move — so anything sold beforehand becomes permanently undecryptable. Verified 2026-08-13 that the
database is still clean (0 packs, 0 codes, 0 secrets), so the migration is currently free.

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
  drawing an empty section is not worth defending. — [`security-model.md`](security-model.md)
- **A second backend implementation.** `src/backend.ts` keeps the seam so a future swap stays cheap,
  but there is one implementation and adding a speculative second would be cost without benefit.

## When something here changes

Update this file **and** the affected topic file, and refresh the pointer in
[`INDEX.md`](INDEX.md)'s Files table. Convert relative dates to absolute. Re-measure any number before
quoting it — line counts and version strings here go stale silently.
