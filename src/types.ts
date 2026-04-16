// ---------------------------------------------------------------------------
// Shared types, interfaces, and constants
// ---------------------------------------------------------------------------

// User roles in ascending privilege order
export type UserRole = 'free' | 'demo' | 'pro' | 'super';

export interface Block {
  id: string;
  type: 'math' | 'plot' | 'text' | 'header' | 'table' | 'formula' | 'section' | 'summary' | 'figure';
  subtype?: string; // module id for math blocks: 'beam-def' | 'sect-prop'
  x: number;
  y: number;
  w?: number;       // explicit width for resizable blocks (e.g. text blocks)
  content: string;
  label?: string;
  result?: string;
  // Section block fields
  sectionName?: string;      // scoping prefix, e.g. "beam1" → vars stored as beam1__L
  collapsed?: boolean;       // collapse toggle state
  sectionColor?: string;     // accent color for left border
  parentSectionId?: string;  // set on child blocks; undefined for top-level blocks
  h?: number;                // explicit height set by pull-down resize handle
  // Purchased template pack fields (section blocks only)
  packId?: string;           // pack slug if this block came from a purchased template
  encrypted?: boolean;       // true = content is encrypted; encIv + encContent hold the data
  encIv?: string;            // AES-GCM IV, base64
  encContent?: string;       // AES-GCM ciphertext, base64
}

export interface WorkspaceState {
  projectName: string;
  blocks: Block[];
  constants: Record<string, number>;
  titleBlock?: TitleBlockData;   // defined = title block is enabled
}

export interface CustomModule {
  id: string;
  name: string;    // user-given toolbar label
  content: string; // legacy: single-formula content (kept for backward compat)
  label: string;   // legacy: formula block label
  blocks?: Array<{ // multi-block tool: all blocks with relative offsets from origin
    type: Block['type'];
    subtype?: string;
    content: string;
    label?: string;
    w?: number;
    dx: number;    // pixel offset from top-left block's canvas position
    dy: number;
  }>;
}

export interface PlotConfig {
  expr: string;      // expression in terms of xVar (and any globalScope variables)
  xVar: string;      // sweep variable name (default 'x')
  xMin: number;
  xMax: number;
  nPts: number;      // number of sample points
  xLabel: string;
  yLabel: string;
  markers: number[]; // x values for permanent labeled markers
}

export const DEFAULT_PLOT: PlotConfig = {
  expr: 'sin(x)',
  xVar: 'x',
  xMin: 0,
  xMax: 6.2832,
  nPts: 200,
  xLabel: 'x',
  yLabel: 'y',
  markers: [],
};

export interface TitleBlockData {
  logo?: string;    // data URL: "data:image/png;base64,..."
  project: string;
  by: string;
  sheetNo: string;
  subject: string;   // subject line 1 (row 2)
  subject2: string;  // subject line 2 (row 3)
  subject3: string;  // subject line 3 (row 4)
  date: string;
  jobNo: string;
}

export interface FigureData { src: string; caption: string; }

// Canvas layout constants
export const GRID_SIZE    = 20;
export const PX_PER_IN    = 96;
export const PX_PER_MM    = PX_PER_IN / 25.4;

/** Fixed height of the title block (4 rows × 28px). Never measured from DOM to avoid layout-timing bugs. */
export const TITLE_BLOCK_H = 112;

export const PAGE_SIZES = {
  a4:      { label: 'A4',      w: Math.round(210 * PX_PER_MM), h: Math.round(297 * PX_PER_MM) },
  a3:      { label: 'A3',      w: Math.round(297 * PX_PER_MM), h: Math.round(420 * PX_PER_MM) },
  letter:  { label: 'Letter',  w: Math.round(8.5 * PX_PER_IN), h: Math.round(11  * PX_PER_IN) },
  legal:   { label: 'Legal',   w: Math.round(8.5 * PX_PER_IN), h: Math.round(14  * PX_PER_IN) },
  tabloid: { label: 'Tabloid', w: Math.round(11  * PX_PER_IN), h: Math.round(17  * PX_PER_IN) },
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;
