# Pricing and tiers

✅ **Structure decided 2026-10-05** (Jon), after comparing SMath Studio's published plans and price
list against the market. The figures below are the ones to build toward; any single number can move
before launch, the **shape** is settled.

Nothing here is implemented yet. See [`roadmap.md`](roadmap.md) § 4 for the build order and
[`auth-and-licensing.md`](auth-and-licensing.md) for the roles these tiers map onto.

## The tiers

| Tier        | Price                          | What gates it                                                                                                                                |
| ----------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**    | $0                             | Full engine, every block type, unlimited local sheets. **A tiled SVG watermark on the sheet.** No section blocks. **Can buy and use packs.** |
| **Pro**     | **$149/yr** or $19/mo          | Clean print, section blocks, commercial use, offline install                                                                                 |
| **Firm**    | **$129/user/yr, 3 seats +**    | Pro + shared pack library, firm title block, admin — later                                                                                   |
| **Student** | $0, verified, non-commercial   | Clean print                                                                                                                                  |
| **Packs**   | **$29–$99 one-off**, perpetual | The second revenue line                                                                                                                      |

Monthly is priced to push annual: $19 × 12 = $228 against $149.

## Why $149

| Product                            | Price/yr                 |
| ---------------------------------- | ------------------------ |
| SMath Advanced (individual)        | $48 — **non-commercial** |
| Maple Student                      | $75                      |
| **SMath Unlimited (legal entity)** | **$564**                 |
| PTC Mathcad Prime                  | ~$818                    |
| ClearCalcs                         | $948 – $1,788            |
| Maple professional                 | quote, ~$1,570           |

🔑 **The commercial browser-based engineering-calc market is $560–1,800/yr.** SMath's $48 is not in
it — that licence forbids commercial use. The honest comparison for LeptonPad Pro is **$564**.

$149 is 1/5 of Mathcad and 1/4 of SMath's commercial price, and it sits under the threshold where a
practising engineer buys **without a purchase order**. ⚠️ That is the single biggest structural
advantage over PTC and Maplesoft, and it is lost somewhere around $300 — which is the real argument
against pricing up, not the competitors' numbers.

## Two decisions that go against SMath's model

⚠️ **No personal/commercial split.** SMath gates commercial use behind an 11.75× jump ($48 → $564)
because it is freeware by heritage and needs a fiction to monetise. LeptonPad's users are practising
engineers and **a stamped calculation sheet is commercial use by definition** — copying the split
would gate the entire real market behind the top price and leave Pro as a hobbyist tier nobody is
in. Differentiate on **seats and firm features, never on use rights**.

⚠️ **No lifetime licence**, whatever SMath offers. For a solo developer that is an unbounded support
obligation sold for one year of revenue.

## The free tier's mark — an inline SVG watermark (revised 2026-10-05)

⚠️ **Revised from the footer line this file first proposed.** Jon: _"What keeps the user from
printing it to PDF then overwriting the area with a white block in a PDF editor?"_ Nothing does —
and a footer is the easiest possible thing to cover. It is now a **tiled, faint `LeptonPad / FREE
VERSION` wordmark across every page**, built in `src/watermark.ts`.

🔑 **Inline SVG, deliberately not a CSS background.** Browsers drop background graphics when
printing unless the user turns them on, so a CSS watermark would vanish in exactly the output it
exists for. Inline SVG is content and prints like content.

🔑 **The mark is a signal, not a lock, and the model should not pretend otherwise.** The whole app
runs in the user's browser — anyone willing to white-box a PDF can more easily delete the element
in devtools first. What it buys is that removal takes deliberate effort across every page and
leaves an obviously doctored sheet, and that **what gets removed is a trademark**, which is a
cleaner violation than anything copyright gives us over a layout.

⚠️ **The real deterrent in this market is not technical.** These sheets are sealed and submitted to
a building department. Doctoring one to hide its provenance is a licensure problem far larger than
a licence fee. Price and build the mark accordingly: enough friction to make buying easier, not an
arms race.

**Blocks stay opaque** (Jon's call) — the mark shows in the gaps around them, never through the
calculations. And it is **tiled and faint rather than one diagonal band**: a band across the middle
would make the free tier useless for circulating a sheet inside a firm, which is the cheapest
marketing available. ⚠️ `fill-opacity` is tuned for **paper, not screen** — a printer that
flattens light greys is the failure case, so check any change to it on a real print.

**Layering:** the SVG is the first child of `#canvas` at `z-index: 0`, the same layer as
`#margin-guide`, so DOM order puts the **engineering grid above it** — load-bearing while editing
(Jon), and moot in print, where the grid's background image is dropped anyway.

`demo` prints clean, because a paid trial should show the product as bought. It degrades to `free`
server-side in `get_my_role()`, so the mark returns on its own with no client clock to trust.

## Where LeptonPad stands against SMath

| Capability                                         | LeptonPad v2.8.8                     | SMath Studio                                          |
| -------------------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| Browser-native, nothing installed                  | ✅ PWA, installable                  | Desktop app; "Cloud" is a file locker around it       |
| Works offline                                      | ✅ SW + cached role                  | Desktop only                                          |
| **Calculation time limit**                         | ✅ **none — compute is client-side** | 1 s Trial/Personal, 3 s Advanced/Unlimited server CPU |
| Unit algebra, matrices, user functions, `if`/`for` | ✅                                   | ✅                                                    |
| Page-fidelity sheet, title block, print layout     | ✅ built around it                   | partial                                               |
| Tables, heat maps, contours, table interpolation   | ✅                                   | via plugins                                           |
| Purchasable encrypted template packs               | ✅ designed, **not sellable yet**    | ❌ (paid extensions instead)                          |
| Symbolic algebra / CAS                             | ❌                                   | ✅                                                    |
| Cloud storage, sharing, revisions                  | ❌ local files                       | ✅ paid tiers                                         |
| Plugin ecosystem, community library                | ❌                                   | ✅ large                                              |

🔑 **Client-side compute is a margin story, not just a feature.** SMath caps cloud calculation at
1–3 s of _their_ CPU because they pay for it. LeptonPad's marginal cost per user is approximately
zero, so there is no cap to impose and no usage tier to meter — which is also why no tier above is
metered.

The two commercial gaps are **cloud sheets/sharing** and **a library of ready content**. Packs
answer the second and are already architected; the first is what the Firm tier is for.

## The sequencing that follows from this

🔑 **Pro subscriptions can ship without solving the pack blocker.** A Pro sale is Paddle → webhook →
`redeem_license_code` granting `'pro'` — a path that already exists and passes `deno task db:check`.
[`known-issues.md`](known-issues.md) § 22 (`packId` never set; a pack section's children serialize
in plaintext) blocks selling **packs**, not subscriptions.

⚠️ **So file the Paddle application first.** It is free, it gates everything, and vetting is measured
in days. This reverses the open question that had been sitting in the roadmap as
_storefront-or-Paddle_: it is **Paddle first, pack delivery second**, because one of them has a
queue and the other does not.

## Mapping onto what exists

| Tier    | Role                  | Already enforced?                                             |
| ------- | --------------------- | ------------------------------------------------------------- |
| Free    | `free`                | ✅ `canCreateSection()` already refuses section blocks        |
| Trial   | `demo`                | ✅ 30-day expiry, degraded **server-side** by `get_my_role()` |
| Pro     | `pro`                 | ✅ role exists, redemption path tested                        |
| Firm    | `pro` × N seats       | no new role needed at launch; admin comes later               |
| Student | `pro`, non-commercial | a licence-terms distinction, not a code one                   |

So the launch-minimum build is: **Paddle checkout and one webhook** — the free-tier watermark
already shipped in v2.8.12, and commercial-use rights are a change to `LICENSE`, not to the tree.

## When this changes

Update this file, refresh its pointer in [`INDEX.md`](INDEX.md)'s Files table, and re-check
[`roadmap.md`](roadmap.md) § 4. ⚠️ Competitor prices go stale silently — every figure here was
checked 2026-10-05 and should be re-verified before it is quoted anywhere a customer can see it.
