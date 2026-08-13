# Roadmap and Current State

## Where the project stands — v2.1.4 (2026-08-13)

**Shipping and working.** LeptonPad is a functioning product, not a prototype: nine block types, a
960-line unit-aware math engine, a 22-category unit catalog, SVG plotting with unit-propagating
sweep variables, markdown text, figures, collapsible sections with scoped namespaces, custom
multi-block user tools, page-sized canvas with title block and page numbering, PWA install and
offline operation, Clerk auth with four roles, one-time license codes, and AES-256-GCM encrypted
purchasable template packs.

~11k lines across `src/` (9.1k TS + 1.9k CSS), `api/`, `db/`, `solver/`, and the build scripts.
`dist/main.js` is **403 KB**.

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

## Open items

**1. Deploy `api/main.ts` to Deno Deploy** and point production `LP_API_URL` at it. Local development
is fully working; production is not up. Set `DATABASE_URL`, `CLERK_JWT_KEY` (or `CLERK_SECRET_KEY`),
and `ALLOWED_ORIGINS` in the dashboard. — [`build-and-deploy.md`](build-and-deploy.md)

**2. Decide how third-party notices reach someone who only receives the deployed site.**
`THIRD_PARTY_NOTICES.md` is complete and correct but is not copied into `dist/`; `@clerk/clerk-js` is
bundled and MIT requires its notice to travel with distributed copies. A link in an about panel is
the usual answer. — [`licensing.md`](licensing.md)

**3. Tests for `expr.ts`.** The highest-value, lowest-effort risk reduction available: pure functions,
no DOM, and the module whose failure mode is a wrong number that looks right. A table-driven
`Deno.test` over `evalExpr` would cover the unit algebra, compound expansion, `[[targetUnit]]`, and
affine temperature. — [`testing.md`](testing.md)

**4. The section-pack storefront.** The database side is complete and **verified** —
`create_section_pack()` generates the secret, `mint_license_codes()` issues codes, redemption and key
derivation pass `deno task db:check`. What is missing is the payment flow and the pack-authoring UI
for a super user. Today packs are created by SQL helper and unlocked with manually minted codes.

Payments are a **separate vendor** from the backend — Stripe, or Paddle/Lemon Squeezy as Merchant of
Record if international sales tax is worth outsourcing. With hosted checkout, card data never touches
LeptonPad and PCI scope stays at SAQ-A. The integration is one webhook that verifies a signature and
either grants a pack or mints a code, landing on the redemption path that already exists.

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
