# Design Decisions

Each entry is a choice that looks wrong or arbitrary until you know why. Do not undo one without
reading its reason.

## Why the math engine is TypeScript, not WASM

The project name and repo location (`wasmExamples/`) suggest a WASM-first design. It is not, and that
is deliberate:

- **Unit conversion is a lookup plus one multiply.** Moving it to WASM adds async module load, a
  JS↔WASM boundary crossing per call, and no tree-shaking benefit for a lookup table. The TypeScript
  in `src/utils/unit-defs.ts` is the correct fit.
- **The evaluator is string- and object-heavy.** `expr.ts` deals in tokens, `UnitMap` records, and
  scope dictionaries. That is exactly the workload where WASM's numeric advantage evaporates and the
  marshalling cost dominates.
- **What WASM is actually used for** is the right shape for it: three pure `f64 → f64` arithmetic
  functions in `solver/solver.ts` (`rect_area`, `rect_ix`, `solve_beam_deflection`), compiled by
  `jsr:@jrmarcum/wasmtk`.

The `// WASM-READY: (f64, …) -> f64` comments in `units.ts`, `formula.ts`, and `plot.ts` mark
functions whose signatures _would_ survive the promotion. They are documentation of a possibility, not
a plan. **Do not treat a `WASM-READY` marker as a TODO.**

## Compound units expand to primitives — and the display side effect is correct

`parseUnitExpr()` expands `ksi` to `{kip:1, in:-2}` so that `E * I [in^4]` cancels to `kip·in²`
instead of accumulating a nonsense `ksi·in⁴`. Cancellation across compound units is impossible
without this.

**The side effect: intermediate results display the expanded form** (`kip/in²`, not `ksi`). This has
been reported as a bug and it is not one. If a user wants `ksi` on a specific row, `[[ksi]]` puts it
there. Re-collapsing units for display would require a reverse-lookup heuristic that is ambiguous in
general (`kip/in²` is also `ksi`, `1000 psi`, …) and would occasionally lie.

## `[[targetUnit]]` on a function is applied per call, not at definition

`FnScope` stores `targetUnit?: UnitMap` next to the expression, and **both call sites in
`Parser.atom()`** apply `applyTargetUnit()` after evaluating the body. Converting at definition time
would bake in whatever units the arguments happened to have on the defining row; converting per call
is what makes `delta(x) = expr [[in]]` behave the way an engineer expects for any `x`.

## The plot sweep variable inherits its unit from the range bound

The plot block injects the sweep variable with the unit taken from the non-trivial bound — `xMax`
preferred, then `xMin`, then dimensionless. Reason: expressions like `l^3 - 2·l·x² + x³` mix the
sweep variable with scope variables that carry units. If `x` were dimensionless, `addU` would
(correctly) reject the sum. `xMin` is usually `0`, which is why `xMax` is preferred as the unit
source.

## `state.ts` is a mutable singleton with `let` + setters

No store, no reducer, no injection. Chosen for a single-user, single-document, browser-only app where
the alternative would be ceremony without benefit. The costs are known and managed:

- ES modules forbid external assignment to an imported binding, hence the `setX()` pairs.
- `canvas` and `bandEl` are `null!` with a documented "assigned in `start()`" contract.
- Cross-module behavior goes through **callback slots** (`onSelectBlock`, `onUpdatePageCount`, …)
  rather than imports, so no cycle ever closes. `CanvasLike` is a structural type for the same reason.

## `TITLE_BLOCK_H = 112` is a constant, never measured

The comment in `types.ts` says it outright: "Never measured from DOM to avoid layout-timing bugs."
Reading the height back from the DOM returns a pre-layout value at the moment the code needs it, and
the resulting off-by-N pushed every block on the page. 112 = 4 rows × 28 px. If the title block's row
count or row height changes, **change the constant**, do not start measuring.

## Section height recalculation skips collapsed sections

`ResizeObserver` fires while a section is being hidden/shown and reports transitional heights. The
guard (`if (!content || content.classList.contains('collapsed')) return;`) is the fix. Removing it
brings back sections that resize to the wrong height on toggle.

## `globalThis`, never `window`

Deno's linter flags `window` as unavailable, and the same source is bundled for the browser.
`globalThis` works in both. Applies to everything: `globalThis.prompt(...)`,
`globalThis.__LP_CONFIG__`, `globalThis.localStorage`.

## Runtime config is injected, not bundled

`public/index.html` loads `/config.js` **before** `main.js`, setting `globalThis.__LP_CONFIG__` with
the Clerk publishable key, the API base URL, and the version. That lets the same bundle be deployed
against different backends, and lets the host inject values from environment variables at build time.
`neon-clerk.ts` reads it with a `?? {}` fallback so the app still loads (offline, unauthenticated)
when config is missing.

The generator is `scripts/write-config.ts`, deliberately a **single** function shared by `build.ts`
and `dev.ts` — they previously carried near-identical copies that could silently drift.

## A failed entitlement sync is shown, never silently downgraded

`auth.ts` falls back to cached entitlements when the server is unreachable, so a network blip never
locks anyone out of their own sheets. That part is right. What was wrong until 2026-08-13 is that
**"the server says you are free" and "I could not reach the server" rendered identically** — a paying
customer with a dropped connection saw `Free — no packs` and watched their purchased sections
disappear, with nothing on screen explaining it.

`entitlementsStale` and `lastSyncedAt` now record which of the two happened:

- **Synced** — render normally.
- **Stale, with a previous sync** — render the cached role plus `· offline, synced 3 hours ago`, and
  dim the badge. Cached access still applies.
- **Stale, never synced** — render `Unverified` and `Offline — access not yet verified`. Claiming
  `free` here would assert a fact we do not have.

The pro gate follows the same rule: when stale it says _"Couldn't verify your account"_ with a
**Retry**, not _"buy Pro"_ — telling someone who already pays to purchase what they own is the worst
possible reading of a network error. An `online` listener re-syncs automatically so recovery needs no
reload.

⚠️ **Gating itself stays strict when stale.** Being unable to verify is not permission — leniency
here would mean going offline grants Pro. The fix is to explain, not to open the gate.

## Blocks are stored flat; section membership is a field

`state.blocks` is a flat array and a child block carries `parentSectionId`. Nesting would complicate
z-order, drag-and-drop hit testing, serialization, and the top-to-bottom evaluation order that the
whole math model depends on. `childToSection` is the runtime reverse index, rebuilt on load and never
serialized.

## Section namespaces use `__` and names are sanitized

`sectionName` → `beam1__L`. `sanitizeSectionName()` collapses runs of underscores (`/__+/g → '_'`) so
a user-chosen section name can never forge the namespace separator and collide into another section's
variables.

## Greek and √ require a backslash; old sheets are not migrated (2026-09-21, v2.2.5)

Guessing rules for Greek (`phi` whole-word, then `phiM_n` camelCase prefix) could never cover
`phin`, `phi2` or `phialphabeta`, and left users unsure when a name would convert. Jon chose
**LaTeX-style, mandatory**: `\phi` renders φ, `phi` renders `phi`; `\sqrt(` renders √(, `sqrt(`
renders `sqrt(` — "so that there is absolutely no confusion." The backslash is display-only
(stripped before evaluation), so it never changes a variable's identity or value.

Two options were offered and declined: **auto-inserting `\` into existing projects on load** (would
have preserved every sheet's appearance) and **keeping `sqrt` → √ automatic**. Consequence, accepted:
projects and purchased section templates written before 2.2.5 display plain names until edited.

## `\var` letters give the other shape, even where that reverses LaTeX (2026-09-22, v2.3.0)

LeptonPad's `\phi` → φ and `\epsilon` → ε are the glyphs real LaTeX draws for `\varphi` and
`\varepsilon`. Jon chose to keep them (the curly φ is the AISC resistance-factor glyph, and sheets made
since 2.2.5 keep their look) and to make every `\var` form produce the **alternate** glyph —
`\varphi` → ϕ, `\varepsilon` → ϵ — so each name yields a glyph otherwise unavailable. Cost, accepted:
pasted LaTeX that relies on the φ/ϕ distinction renders swapped for those two letters.

## Euler's number is `exp(x)`; plain `e` belongs to the user (2026-09-22, revised 2026-09-23)

**Final form (v2.3.11):** there is no letter for Euler's number — it is the function `exp(x)`, drawn
as eˣ by `renderCall`. Jon's reason: a function reads correctly in a formula (`2*exp(-t/T)`), and it
leaves `e` unambiguously free for eccentricity without a second spelling to remember. The `\e`
marked constant below lasted one day.

### The original decision, kept for the reasoning

In structural work `e` is eccentricity and τ is shear stress, and the old constants silently won
over both. Jon chose an explicit marker over "user definition wins": `\e` = Euler's number, plain `e`
= always a variable. That breaks sheets using plain `e` as 2.718… — deliberately, because the break is
an `Undefined: e` error, never a wrong number. `pi` was the exception: plain `pi` stays π because
nobody names a variable `pi` and `pi*d^2/4` is everywhere; it is simply made unassignable. `tau` (2π)
was dropped outright. Details: [`known-issues.md`](known-issues.md) §11.

## Same-kind units convert and the left unit wins (2026-09-23, v2.3.24)

Jon: _"autoconverting compatible units is probably the nicer thing to do for the users."_ The
alternative — erroring on `1 [ft] + 1 [in]`, as the engine did for its whole life — is safe but
makes the user do arithmetic the program is better placed to do.

**The left-hand unit wins**, so the result reads in the unit written first: `1 [ft] + 1 [in]` is
`1.0833 ft` and `12 [in] + 1 [ft]` is `24 in`. Picking the _smaller_ unit, or the SI one, would
mean the answer's unit depends on a rule the user has to recall; the left operand is the one they
are already looking at.

It applies to `+`, `−` **and** comparisons together, deliberately: two rules would mean remembering
which operation had which. What does **not** convert is a different kind — see
[`units.md`](units.md) on why force is primitive, which is what keeps `lbf` and `lbm` apart.

## There is no global `E` — Young's modulus belongs to a material (2026-09-23, v2.3.31)

`state.constants` seeded `{ E: 200000 }` into every sheet: Young's modulus for **steel, in MPa**,
dimensionless. Every other undefined name throws; `E` alone silently answered, and because it
carried no unit the dimensional checker could not see it — a US engineer working in ksi got a
plausible deflection that was out by a factor of ~7.

Jon: _"E in engineering is Young's modulus and is different for different materials … E would need
to be defined for each specific material anyway."_ Removed, and **stripped from old files on load**
at his direction — otherwise every project saved before this date would keep re-injecting it.

There was never a UI for defining global constants; the field existed solely to carry that value.
The Beam Deflection block keeps `200000` as a **prefill for its own E input**, which is a starting
value in a form, not a name in scope — that distinction is the whole point.

## Display precision is per row, and display only (2026-09-23, v2.3.32)

Results were hard-coded to six significant digits. Jon chose the same arrangement line spacing
uses: **the row owns it (`FormulaRow.sd`), the block control overwrites every row** — one source of
truth, no cascade. It saves with the project, so a reviewer sees the digits the author chose.

**The stored value is never rounded**; only the rendering is, and a result's tooltip shows the full
double. That is what makes this safe to change at any time — no calculation can depend on it.

Fixing it also exposed an inconsistency in `fmtNum`: whole numbers went through `toLocaleString`
and got thousands separators while everything else went through `toString` and got none, so `29000`
read as "29,000" but `1234567.891` read as `1234570` — rounded away at the **integer** part and
ungrouped. A moment in lb·ft lands exactly there.

## Projects save as `.leptonpad`, and `.json` opens forever (2026-09-23, v2.3.32)

The contents are unchanged — still JSON. The Open dialog accepts **both**, because every project
saved before this date carries `.json` and silently failing to list a user's own files would be the
worst possible outcome of a cosmetic rename. The extension, the picker filter and the
`<input accept>` string are defined once in `types.ts` so save and open cannot drift apart.

## A trailing `[unit]` declares a plain number and converts a dimensioned one (2026-09-23, v2.3.29)

It used to relabel in both cases: `l = 12 [ft]; x = l [in]` reported `12 in` — the unit changed and
the number did not. Agreed with Jon on 2026-09-22 and held until `sameKind` existed, so the new
conversion could be checked rather than trusted.

**Why the split rather than "always convert":** `x = 150 [mm]` and `A = b*h [mm^2]` must keep
working, and there is nothing to convert _from_ in either — the result is a plain number. So
"declare" is exactly the dimensionless case, which is why the change left existing sheets alone.

It turns one previously-silent mistake into an error: `L * 12 [in/ft]`, written meaning to cancel
the ft, used to give `300 in/ft` and now reports `Can't convert ft to in/ft`. The parenthesised
`L * (12 [in/ft])` is the correct form and still gives `300 in`.

## `J` and `W` display as themselves; pressure still expands (2026-09-23, v2.3.30)

Jon: _"I do not want to render J as m*N or N*m. If the user wants the J unit that is what needs to
display."_ Their `baseUnits` were removed, which also made them consistent with `kWh`, `cal`, `BTU`
and `hp` — named units in the same two categories that never had a decomposition.

**Pressure deliberately still expands.** `E * I` must cancel to `kip·in²` rather than accumulate
`ksi·in⁴`; that is a real cancellation inside one expression. Energy and power are normally written
rather than derived, so there is nothing to cancel.

**Why not expand and re-collapse for display?** Because `N·m` is both torque and energy. After
expansion the two are indistinguishable, so any reverse lookup would have to guess — the ambiguity
this file already warns about under compound expansion. Not expanding is the only honest fix.

**This was only safe after `CATEGORY_DIMENSION` (2.3.24).** Expansion used to be the sole mechanism
letting one category's units interoperate with another's; `dimensionOf` now supplies that directly.
The same change a week earlier would have broken every cross-category conversion. **A new
capability can retire an old workaround — check what was only propping the workaround up.**

## The math font is a setting, and the default avoids old-style figures (2026-09-23, v2.3.28)

Georgia — the original hardcoded face — draws 3 4 5 7 9 below the baseline. Those are old-style
(text) figures, correct for prose and wrong for a calculation sheet, and they were there from the
beginning; adding the font list is simply what surfaced them.

Three responses rather than one, because no single one is sufficient:
`font-variant-numeric: lining-nums` on every math element (fixes any face carrying the `lnum`
feature — classic Georgia does not), the default moved to **Cambria**, and Georgia and Palatino kept
but sorted last and labelled "low digits" so the behaviour is visible before it is chosen.

**Only OS-resident faces are offered.** A webfont would need bundling or would fail to load exactly
when someone is working offline, and this is a PWA that promises to work offline.

Unlike line spacing, the font is a **per-browser** preference rather than part of the project file —
it is a reading preference, where spacing is sheet layout.

## The catalog is the whole vocabulary — units cannot be defined (2026-09-23, v2.3.27)

An unknown unit id used to be accepted as a **phantom unit**: `[ksii]` displayed as `5 ksii`, never
cancelled with anything, and only failed much later at conversion with "No SI conversion factor".
A typo that renders normally on a calculation sheet is the exact silent fall-through this project
treats as its worst failure. Unknown ids are now an error at parse time, with a nearest-match hint
(`did you mean "ksi"?`) since typos are the cause in practice.

Jon was offered a way to define units alongside the rejection — label-only, or fully derived — and
chose **reject only**: _"any unsupported unit should be rejected."_ The catalog covers the domain
(158 units, verified against AISC needs), and a count is dimensionally a plain number, so
`n = 4 [bolts]` should be `n = 4`. If a real need appears the decision can be revisited; adding a
definition mechanism later is far cheaper than recovering from sheets full of phantom units.

**Consequence to know:** an existing sheet containing a phantom unit now shows an error on that row.
That is the point — it was always wrong — but it is a visible behaviour change on old files.

## Force is DERIVED, M·L·T⁻² (2026-09-23 — corrected the same day)

Force was briefly given its own primitive dimension `F`, on the reasoning that this was what kept
`lbf` and `lbm` from converting into each other. **That reasoning was wrong.** Mass is `M` and
force is `M·L·T⁻²`; the two signatures differ either way, so the protection never depended on it.
What making force primitive _did_ do was break a relationship engineers write constantly:

```
2 [kg] * 1 [G] [[N]]          → 19.6133 N   — a newton IS kg·m/s²
1 [slug] * 1 [ft_s2] [[lbf]]  → 1 lbf       — exact, by definition
1 [lbm]  * 1 [ft_s2] [[lbf]]  → 0.031081    — = 1/32.174, also correct
```

Jon caught it: _"We need to be able to convert the [kg]*[G] into [N] as the multiplication creates
this necessity for units cancelation."_

**The conversion factors needed no change** — every unit's factor is relative to its own category's
SI base, and the SI bases are coherent (N = kg·m/s² exactly), so the arithmetic already worked.
Only the dimensional signature was refusing it. Every existing conversion was re-verified unchanged
(ksi↔MPa, J↔N·m, hp↔W, kN·m↔kip·ft, density, affine temperature).

**The protections that matter all survive**, because they never rested on force being primitive:
`1 [lbf] + 1 [lbm]`, `1 [lbf] [[lbm]]` and `1 [N] [[kg]]` are all still errors.

The lesson worth keeping: **a dimensional model is a claim about physics, and a wrong claim shows up
as a refused conversion rather than a crash.** Check a new signature against the relationships
users actually write, not only against the ones you are trying to forbid.

## Line spacing lives on the row, and the block control overwrites every row (2026-09-23, v2.3.19)

First built as a cascade — a block default that rows could override. Jon: _"maybe it should be row
to row settings and the block setting overwrites each row setting??"_ That is better, and the reason
is that a cascade has **two** places a row's spacing can come from, so "why is this row like that?"
needs both checked. Now every row carries its own value and the block-level menu is a bulk edit.
The CSS reads `--row-space` and nothing else.

Spacing is **half above and half below** the row, not a bottom margin: as a margin it read as a gap
donated to the row underneath, so a row's setting looked like it applied to its neighbour. It is a
property of the content and saves with the project — it is not a display preference like text size,
because a sheet's layout should look the same on someone else's screen.

## Input rows: the licensing problem dissolved rather than traded (2026-09-23, v2.5.0)

A licensed pack template could be read but not **used**. Every edit was dropped on save because
`serializeProject()` re-emits the ciphertext, and `security-model.md` forbids writing plaintext.
That was audit lead 4 in v2.4.1, deliberately left open: the three honest options were re-encrypting
with the per-user key (forcing `serializeProject` to become async), saving plaintext (breaking the
invariant), or making pack blocks read-only (handing someone a template they cannot use).

Jon's counter-proposal was better than all three, and the insight is one sentence:

> **The inputs are not the licensed content — the formulas are.**

So a template author declares which rows are **inputs**. Only those values are saved, as plaintext
beside the ciphertext, because they are the engineer's own numbers. The template body stays
encrypted and untouched. No re-encryption, no async serializer, no broken invariant, and a licensed
template that actually works. **When a constraint and a requirement seem to be in direct conflict,
check whether they are really talking about the same thing** — here they were not.

Four decisions fell out of it, each with a failure it prevents:

**Values are keyed to an author-assigned id, never to row position.** A later version of a pack that
inserts a row above an input must still find that input's value. Matching by index would shift every
saved number quietly onto the wrong row — plausible values, wrong rows, no error. The id is also
independent of the variable name, so an author can rename `P` to `P_u` without orphaning every value
saved against it.

**An input value must be a literal** — a number or a `{…}` vector, with an optional unit. Not
squeamishness about expressions: a value is stored outside the template and re-applied to whatever
version is opened next. `10 [kip]` means the same thing every time; `2*L` picks up whatever `L` is
next time. It is also the line that keeps the plaintext exception safe — a field that can hold an
expression can hold a formula, and a formula out of a template is the template.

**The variable name is locked, in its own column.** Downstream formulas refer to it by name, so
letting it be retyped turns a working template into a sheet of undefined variables with no hint of
what happened.

**A required unit kind is checked dimensionally, not by name** (`uk`, a key of `CATEGORY_DIMENSION`),
so a `force` input accepts kip, kN or lbf alike. It reuses the same machinery as `sameKind` — see
[`units.md`](units.md). When an author marks a row as an input, the kind is **inferred** from the
unit already typed rather than asked for.

## Two locks, and only one of them is enforcement (2026-09-23, v2.5.0)

Jon asked whether other cells should get a lock "that can only be removed by the owner." They should
get a lock; it cannot be owner-only, and saying so plainly mattered more than shipping the stronger
claim.

**In a browser PWA the file is on the user's disk and the code runs on their machine.** A `locked`
flag in the JSON can be deleted by anyone who means to. An owner-only lock would be a guarantee the
product cannot keep, and **an engineer who trusted it would be trusting the wrong thing** — worse
than not offering it.

So there are two mechanisms, deliberately different in kind:

|                    | `FormulaRow.lk`                          | Pack lock                                   |
| ------------------ | ---------------------------------------- | ------------------------------------------- |
| Protects against   | accidents                                | a determined user                           |
| Enforced by        | a flag anyone can remove                 | the plaintext never being on disk           |
| Applies to         | any row the author picks                 | every row of a pack block except its inputs |
| Honest description | "protect this row from accidental edits" | licensing                                   |

The accident case is the one that actually happens: someone tabs through a sheet you sent them and
retypes a coefficient without noticing. A locked row also hides its own delete button — deleting it
is precisely the accident the lock exists to prevent, and offering the button beside a row you
cannot type into would make the lock look decorative.

The pack lock is also what finally closed audit lead 4 honestly. Those edits were **always**
discarded; refusing them is the truthful version of what already happened, and it only became
acceptable once input rows gave the user somewhere legitimate to type.

## Cell navigation is Alt+Arrow because nothing else was free (2026-09-23, v2.3.21)

Plain arrows move the caret inside a cell, `Shift`+arrow selects text — both needed for editing —
and `Ctrl`+arrow already moves the whole block, deliberately even while a cell has focus. `Alt` was
the only modifier left. It has one cost worth knowing: `Alt`+`←`/`→` is the browser's Back/Forward,
so the handler **always** calls `preventDefault`, including when the move is a no-op at the first or
last cell — which is exactly where a user would otherwise be thrown out of the app mid-edit.

## The plot is an SVG string, the crosshair is DOM nodes

`plot.ts` concatenates the static plot as an SVG string (cheap to rebuild wholesale on any config
change) and then attaches the interactive crosshair with `createElementNS` (must be mutated per
pointer-move without re-serializing the plot). Two strategies in one file, on purpose.

## The dev server shuts down when the browser tab closes

An SSE endpoint (`/__dev_sse`) with a **5-second grace period**: tab close aborts the stream and arms
a shutdown timer; a refresh reconnects and cancels it. Chosen so `deno task dev` does not leave an
orphaned server and bundler behind on a Windows dev box. The grace period exists specifically so a
refresh does not kill the session.
