// ---------------------------------------------------------------------------
// The free-version watermark
// ---------------------------------------------------------------------------
// 🔑 **An inline SVG element, deliberately not a CSS background.** Browsers drop background
// graphics when printing unless the user turns them on, so a CSS watermark would vanish in
// exactly the output it exists for. Inline SVG is content and prints like any other content.
//
// ⚠️ **It is a signal, not a lock, and should not be mistaken for one.** The whole app runs in
// the user's browser: anyone willing to white-box this in a PDF editor can more easily delete the
// element in devtools first. What it buys is that the mark is tiled across every page, so
// removing it by hand means covering many regions on each one and leaves a sheet that looks
// obviously doctored — and that what gets removed is a **trademark**. In this market the real
// deterrent is not technical: these sheets are sealed and submitted to a building department, and
// doctoring one to hide its provenance is a licensure problem far larger than a licence fee.
//
// **Blocks stay opaque** (Jon, 2026-10-05) — the mark shows in the gaps around them, not through
// the calculations. Legibility of the work wins; the mark only has to be present and visible.
//
// Tiled and faint rather than one diagonal band: a band across the middle makes the free tier
// useless for circulating a sheet inside a firm, which is the cheapest marketing there is.

import { canvas } from './state.ts';
import { currentRole } from './auth.ts';

const WM_ID = 'page-watermark';
const NS = 'http://www.w3.org/2000/svg';

/**
 * Whether this user's sheets carry the mark.
 *
 * `demo` is a paid trial and prints clean — the trial exists to show the product as bought. It
 * degrades to `free` server-side when it expires (`get_my_role`), so the mark comes back on its
 * own with no client-side clock to trust.
 */
function isMarked(): boolean {
  return currentRole !== 'pro' && currentRole !== 'demo' && currentRole !== 'super';
}

/** Add, remove or leave the watermark to match the current role. Safe to call at any time. */
export function syncWatermark(): void {
  const host = canvas?.domElement;
  if (!host) return;

  const existing = document.getElementById(WM_ID);
  if (!isMarked()) {
    existing?.remove();
    return;
  }
  if (existing) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.id = WM_ID;
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  // No viewBox: the pattern is in user-space px, so it tiles at a fixed size however tall the
  // canvas grows as pages are added, instead of stretching with it.
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');

  const defs = document.createElementNS(NS, 'defs');
  const pat = document.createElementNS(NS, 'pattern');
  pat.setAttribute('id', 'lp-watermark-tile');
  pat.setAttribute('width', '300');
  pat.setAttribute('height', '190');
  pat.setAttribute('patternUnits', 'userSpaceOnUse');
  pat.setAttribute('patternTransform', 'rotate(-30)');

  const word = document.createElementNS(NS, 'text');
  word.setAttribute('x', '0');
  word.setAttribute('y', '40');
  word.setAttribute('font-family', 'system-ui, sans-serif');
  word.setAttribute('font-size', '26');
  word.setAttribute('font-weight', '700');
  word.setAttribute('fill', '#0f172a');
  // Faint enough to read a calculation straight through, dark enough to survive a printer that
  // flattens light greys. Tuned on paper, not on screen.
  word.setAttribute('fill-opacity', '0.07');
  word.textContent = 'LeptonPad';

  const tier = document.createElementNS(NS, 'text');
  tier.setAttribute('x', '1');
  tier.setAttribute('y', '62');
  tier.setAttribute('font-family', 'system-ui, sans-serif');
  tier.setAttribute('font-size', '12');
  tier.setAttribute('font-weight', '600');
  tier.setAttribute('letter-spacing', '3');
  tier.setAttribute('fill', '#0f172a');
  tier.setAttribute('fill-opacity', '0.07');
  tier.textContent = 'FREE VERSION';

  pat.append(word, tier);
  defs.appendChild(pat);

  const fill = document.createElementNS(NS, 'rect');
  fill.setAttribute('width', '100%');
  fill.setAttribute('height', '100%');
  fill.setAttribute('fill', 'url(#lp-watermark-tile)');

  svg.append(defs, fill);

  // ⚠️ FIRST child, so it paints under `#margin-guide`. The guide carries the engineering grid
  // and both sit at `z-index: 0`, where DOM order decides — so the grid stays legible on top of
  // the mark while editing (Jon, 2026-10-05), and blocks at `z-index: 1` stay above both.
  host.insertBefore(svg, host.firstChild);
}
