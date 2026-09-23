// ---------------------------------------------------------------------------
// Shared types, interfaces, and constants
// ---------------------------------------------------------------------------

// User roles in ascending privilege order
export type UserRole = 'free' | 'demo' | 'pro' | 'super';

export interface Block {
  id: string;
  type:
    | 'math'
    | 'plot'
    | 'text'
    | 'header'
    | 'table'
    | 'formula'
    | 'section'
    | 'summary'
    | 'figure';
  subtype?: string; // module id for math blocks: 'beam-def' | 'sect-prop'
  x: number;
  y: number;
  w?: number; // explicit width for resizable blocks (e.g. text blocks)
  content: string;
  label?: string;
  // `result?: string` removed 2026-09-23 — declared but never written, read or serialised.
  // Section block fields
  sectionName?: string; // scoping prefix, e.g. "beam1" → vars stored as beam1__L
  collapsed?: boolean; // collapse toggle state
  sectionColor?: string; // accent color for left border
  parentSectionId?: string; // set on child blocks; undefined for top-level blocks
  h?: number; // explicit height set by pull-down resize handle
  lineSpacing?: number; // 1 | 1.5 | 2 — default row spacing for this block (undefined = 1)
  // Values the user typed into author-declared input rows, keyed by the row's stable `in` id.
  //
  // Deliberately OUTSIDE `content`: for a pack block `content` is re-emitted as ciphertext and any
  // edit to it is dropped, which is what made a licensed template unusable. Input values are the
  // engineer's own numbers, not the author's protected work, so they are saved as plaintext beside
  // the ciphertext. The template itself is never decrypted to disk. See cmem/security-model.md.
  inputs?: Record<string, string>;
  // Purchased template pack fields (section blocks only)
  packId?: string; // pack slug if this block came from a purchased template
  // Clerk user id of whoever authored the pack. The author keeps full editing rights over their
  // own template — moving, resizing and retitling the blocks inside it — while a buyer gets the
  // layout as the author arranged it. Everyone else is compared against this, so a pack with no
  // packAuthorId is locked for everybody, which is the safe direction to fail.
  packAuthorId?: string;
  encrypted?: boolean; // true = content is encrypted; encIv + encContent hold the data
  encIv?: string; // AES-GCM IV, base64
  encContent?: string; // AES-GCM ciphertext, base64
}

export interface WorkspaceState {
  projectName: string;
  blocks: Block[];
  constants: Record<string, number>;
  titleBlock?: TitleBlockData; // defined = title block is enabled
}

export interface CustomModule {
  id: string;
  name: string; // user-given toolbar label
  content: string; // legacy: single-formula content (kept for backward compat)
  label: string; // legacy: formula block label
  blocks?: Array<{ // multi-block tool: all blocks with relative offsets from origin
    type: Block['type'];
    subtype?: string;
    content: string;
    label?: string;
    w?: number;
    dx: number; // pixel offset from top-left block's canvas position
    dy: number;
  }>;
}

export interface PlotConfig {
  expr: string; // expression in terms of xVar (and any globalScope variables)
  xVar: string; // sweep variable name (default 'x')
  xMin: number; // resolved numeric lower bound (may be derived from xMinExpr)
  xMax: number; // resolved numeric upper bound (may be derived from xMaxExpr)
  xMinExpr: string; // raw text for lower bound — number literal or scope variable
  xMaxExpr: string; // raw text for upper bound — number literal or scope variable
  nPts: number; // number of sample points
  xLabel: string;
  yLabel: string;
  /**
   * x values for user-placed markers. Each puts a node on the curve at that x.
   *
   * These and `yMarkers` are the ONLY markers that persist, and the only ones
   * "Clear All" touches. Zero crossings and local maxima/minima are recomputed
   * from the sampled points on every render and are never stored — clearing
   * user markers cannot disturb them.
   */
  xMarkers: number[];
  /**
   * y values for user-placed markers — the mirror of `xMarkers`. Each one places
   * a node **on the curve** wherever the curve reaches that y, found by scanning
   * the sampled points for crossings. A single y may produce several nodes (an
   * oscillating curve) or none (the curve never gets there).
   */
  yMarkers: number[];
  /**
   * @deprecated Pre-2026-08-13 name for `xMarkers`. Read by `parsePlotConfig()`
   * so existing saved projects keep their markers, then dropped — never written.
   */
  markers?: number[];
  fill: boolean; // shade area between curve and y=0
}

export const DEFAULT_PLOT: PlotConfig = {
  expr: 'sin(x)',
  xVar: 'x',
  xMin: 0,
  xMax: 6.2832,
  xMinExpr: '0',
  xMaxExpr: '6.2832',
  nPts: 200,
  xLabel: 'x',
  yLabel: 'y',
  xMarkers: [],
  yMarkers: [],
  fill: true,
};

export interface TitleBlockData {
  logo?: string; // data URL: "data:image/png;base64,..."
  project: string;
  by: string;
  /** @deprecated Write-only and never rendered — the sheet number cell is COMPUTED in
   *  buildTitleBlockOverlay as `${pageIdx + 1} of ${numPages}`. Kept so old saved files that
   *  carry the key still parse; do not add new readers. */
  sheetNo?: string;
  subject: string; // subject line 1 (row 2)
  subject2: string; // subject line 2 (row 3)
  subject3: string; // subject line 3 (row 4)
  date: string;
  jobNo: string;
}

export interface FigureData {
  src: string;
  caption: string;
}

/**
 * The scope prefix for a section's variables — `beam1` → `beam1__`.
 *
 * Defined here, in a leaf module both sides can import, because the evaluator and the summary
 * renderer each had their own copy of this expression with a DIFFERENT fallback (`'section1'` vs
 * `'section'`). For any section loaded without a name the evaluator wrote `section1__x` while the
 * summary looked up `section__x`, missed, and fell through to a same-named global — printing one
 * value on the summary line while the section computed with another.
 */
export function sectionPrefix(sectionName?: string): string {
  return (sectionName || 'section') + '__';
}

// ---------------------------------------------------------------------------
// Project file
// ---------------------------------------------------------------------------

/** Extension new projects are SAVED with. The contents are still JSON. */
export const PROJECT_EXT = '.leptonpad';

/**
 * Extensions accepted when OPENING. `.json` stays first-class forever — every project saved
 * before 2026-09-23 has it, and silently refusing to list a user's own files would be the worst
 * possible consequence of a cosmetic rename.
 */
export const PROJECT_OPEN_EXTS = [PROJECT_EXT, '.json'];

/** `accept` filter for the File System Access pickers. One definition so open and save agree. */
export const PROJECT_PICKER_TYPES = [
  { description: 'LeptonPad Project', accept: { 'application/json': PROJECT_OPEN_EXTS } },
];

/** `accept` string for the <input type="file"> fallback used where the picker is unavailable. */
export const PROJECT_ACCEPT_ATTR = PROJECT_OPEN_EXTS.join(',');

// Canvas layout constants
export const GRID_SIZE = 20;
export const PX_PER_IN = 96;
export const PX_PER_MM = PX_PER_IN / 25.4;

/** Fixed height of the title block (4 rows × 28px). Never measured from DOM to avoid layout-timing bugs. */
export const TITLE_BLOCK_H = 112;

export const PAGE_SIZES = {
  a4: { label: 'A4', w: Math.round(210 * PX_PER_MM), h: Math.round(297 * PX_PER_MM) },
  a3: { label: 'A3', w: Math.round(297 * PX_PER_MM), h: Math.round(420 * PX_PER_MM) },
  letter: { label: 'Letter', w: Math.round(8.5 * PX_PER_IN), h: Math.round(11 * PX_PER_IN) },
  legal: { label: 'Legal', w: Math.round(8.5 * PX_PER_IN), h: Math.round(14 * PX_PER_IN) },
  tabloid: { label: 'Tabloid', w: Math.round(11 * PX_PER_IN), h: Math.round(17 * PX_PER_IN) },
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;
