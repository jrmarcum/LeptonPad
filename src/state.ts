// ---------------------------------------------------------------------------
// Shared mutable application state
// All modules import directly from here and mutate in place — no injection.
// ---------------------------------------------------------------------------

import {
  type Block,
  type CustomModule,
  PAGE_SIZES,
  PX_PER_IN,
  TITLE_BLOCK_H,
  type TitleBlockData,
  type WorkspaceState,
} from './types.ts';
import type { FnScope, Scope } from './expr.ts';

// ---------------------------------------------------------------------------
// Canvas layout dimensions — mutated when page size / margin settings change
// ---------------------------------------------------------------------------

export let CANVAS_W = PAGE_SIZES.letter.w;
export let PAGE_H = PAGE_SIZES.letter.h; // single-page height
export let numPages = 1;
export let CANVAS_H = PAGE_H; // = numPages * PAGE_H
export let marginUnit: 'mm' | 'in' = 'in';

// Letter defaults: Top 0.25", Bottom 0.25", Left 0.75", Right 0.25"
export const margins = {
  top: Math.round(0.25 * PX_PER_IN),
  bottom: Math.round(0.25 * PX_PER_IN),
  left: Math.round(0.75 * PX_PER_IN),
  right: Math.round(0.25 * PX_PER_IN),
};

// Title block overlay — enabled by sidebar checkbox; NOT stored in state.blocks
export let titleBlockEnabled = false;
export let pageNumberingEnabled = true;

/** Fixed height of the title block — re-exported here for modules that only import state. */
export { TITLE_BLOCK_H };

/** Returns the title block height when enabled, otherwise 0. */
export function titleBlockH(): number {
  return titleBlockEnabled ? TITLE_BLOCK_H : 0;
}

/**
 * Page geometry — ONE definition, because there were four and they disagreed.
 *
 * A title block overlay is drawn at the top of **every** page with `z-index: 2`, so any block
 * sharing that space is hidden behind it. Four places computed where a block may sit, and only one
 * of them got it right:
 *
 *   - `moveGridCursor` (dnd.ts)      per-page, correct — keyboard placement never lands under one
 *   - `placeBlock` (dnd.ts)          no title-block guard at all, so a DRAG could park a block there
 *   - `Canvas.addBlock`              no guard, and for a section also missing the titleBlockH() that
 *                                    `placeBlock` subtracts when storing `y` — so a section saved
 *                                    directly under the title block reopened 112px too high, inside it
 *   - `Canvas.updateMarginGuide`     a floor, but only for PAGE 1; pages 2+ were unprotected
 *
 * Reported 2026-10-02 as "blocks are getting hidden behind the title block on open".
 */
export function pageIndexOf(canvasY: number): number {
  return Math.max(0, Math.floor(canvasY / PAGE_H));
}

/** The topmost y a block may occupy on `pageIdx` — below that page's title block. */
export function pageContentTop(pageIdx: number): number {
  return pageIdx * PAGE_H + margins.top + titleBlockH();
}

/**
 * Push `top` down out of its own page's title block if it falls inside it; otherwise leave it
 * alone. Applies per page, so a block near the top of page 3 is handled like one on page 1.
 */
export function clearTitleBlock(top: number): number {
  return Math.max(top, pageContentTop(pageIndexOf(top)));
}

/**
 * The usable vertical band on a page — the **active work area**. Bounded above by the top margin
 * plus the title block, below by the bottom margin.
 *
 * Named once because "where may content go on this page" was being open-coded wherever it was
 * needed, and each site remembered a different subset of the three things that bound it. Anything
 * deciding whether content fits, or where a continuation starts, reads it from here.
 */
export function pageWorkArea(pageIdx: number): { top: number; bottom: number; height: number } {
  const top = pageContentTop(pageIdx);
  const bottom = pageIdx * PAGE_H + PAGE_H - margins.bottom;
  return { top, bottom, height: Math.max(0, bottom - top) };
}

// Setters for `let` exports that external modules need to reassign
export function setCANVAS_W(v: number) {
  CANVAS_W = v;
}
export function setPAGE_H(v: number) {
  PAGE_H = v;
}
export function setNumPages(v: number) {
  numPages = v;
}
export function setCANVAS_H(v: number) {
  CANVAS_H = v;
}
export function setMarginUnit(v: 'mm' | 'in') {
  marginUnit = v;
}
export function setTitleBlockEnabled(v: boolean) {
  titleBlockEnabled = v;
}
export function setPageNumberingEnabled(v: boolean) {
  pageNumberingEnabled = v;
}

// ---------------------------------------------------------------------------
// Project state
// ---------------------------------------------------------------------------

export const state: WorkspaceState = {
  projectName: 'Untitled Project',
  blocks: [],
  // Empty by design. This used to seed `E: 200000` — Young's modulus for steel, in MPa — into
  // every sheet's scope. Because every other undefined name throws, that one silently supplied a
  // dimensionless 200000 to a US engineer working in ksi, and the dimensional checker could not
  // see it. Jon: "E in engineering is Young's modulus and is different for different materials …
  // E would need to be defined for each specific material anyway." (2026-09-23)
  constants: {},
};

// Shared variable scope — populated by formula blocks evaluated top-to-bottom
export const globalScope: Scope = {};

// Shared function scope — holds user-defined functions f(x) = expr
export const globalFnScope: FnScope = {};

// ---------------------------------------------------------------------------
// Section tracking
// ---------------------------------------------------------------------------

// Summary-block outputs per section.
// Only Summary Blocks (type='summary') inside a section drive these; Formula Blocks do not.
// variable name → its spelling as typed (keeps `\phi_P_nr` so the summary line can render φ)
export const sectionSummaryVarNames = new Map<string, Map<string, string>>();
// `error` is set when the check could not be evaluated at all. It is carried rather than dropped
// so the summary can show that a check is broken — an absent check reads as a passing one.
export const sectionSummaryComparisons = new Map<
  string,
  Array<{ expr: string; pass: boolean; error?: string }>
>();

// Maps child block id → parent section block id; rebuilt from state on load.
// Never persisted — derived from Block.parentSectionId at runtime.
export const childToSection: Map<string, string> = new Map();

/**
 * The purchased-pack section this block sits INSIDE, or undefined.
 *
 * A pack section is not its own child: the buyer places it on their sheet and may move, resize and
 * rename it freely. Its contents are a different matter — the layout of a purchased template is
 * part of the template, so a recipient must not be able to drag its blocks around, resize them or
 * retitle them. This is what every such check keys off.
 */
export function packSectionOf(block: Block): Block | undefined {
  const parentId = block.parentSectionId ?? childToSection.get(block.id);
  if (!parentId) return undefined;
  const parent = state.blocks.find((b) => b.id === parentId);
  return parent?.packId ? parent : undefined;
}

// ---------------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------------

export const deletionStack: Block[] = [];

/**
 * Blocks held by Copy, waiting for Paste. Deliberately an in-app buffer rather than the system
 * clipboard: a block is a structured record (rows, units, input values, pack ciphertext), and the
 * only faithful text form of it is the project JSON. Round-tripping that through the OS clipboard
 * would invite pasting a half-understood blob from somewhere else into a stamped calculation.
 *
 * Always SNAPSHOTS, never live references — a copied block that still points at the original
 * mutates when the original is edited, so Paste would place whatever the block looks like now
 * instead of what was copied.
 *
 * A copied section carries its children here too, so the set must be rebuilt as a whole on paste.
 */
export let clipboardBlocks: Block[] = [];

export function setClipboardBlocks(blocks: Block[]) {
  clipboardBlocks = blocks;
}

// ---------------------------------------------------------------------------
// Custom modules
// ---------------------------------------------------------------------------

export const CUSTOM_MODULES_KEY = 'mathwasm-custom-modules';

export let customModules: CustomModule[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_MODULES_KEY) ?? '[]') as CustomModule[];
  } catch {
    return [];
  }
})();

export function saveCustomModules() {
  localStorage.setItem(CUSTOM_MODULES_KEY, JSON.stringify(customModules));
}

export function setCustomModules(v: CustomModule[]) {
  customModules = v;
}

// ---------------------------------------------------------------------------
// File System Access API handle
// ---------------------------------------------------------------------------

// deno-lint-ignore no-explicit-any
export let fileHandle: any = null;
// deno-lint-ignore no-explicit-any
export function setFileHandle(v: any) {
  fileHandle = v;
}

// ---------------------------------------------------------------------------
// Canvas instance — structural type avoids a circular import with canvas.ts
// ---------------------------------------------------------------------------

export interface CanvasLike {
  domElement: HTMLElement;
  addBlock(block: Block): void;
  snap(v: number): number;
  updateMarginGuide(): void;
  moveGhost(x: number, y: number): void;
}

export let canvas: CanvasLike = null!; // assigned in start() before any user events
export function setCanvas(c: CanvasLike) {
  canvas = c;
}

// ---------------------------------------------------------------------------
// Selection & drag state
// ---------------------------------------------------------------------------

export let selectedEl: HTMLElement | null = null;
export function setSelectedEl(v: HTMLElement | null) {
  selectedEl = v;
}

export const selectedEls: Set<HTMLElement> = new Set();

export let multiDragState: {
  startX: number;
  startY: number;
  origPositions: Map<HTMLElement, { left: number; top: number }>;
} | null = null;
export function setMultiDragState(v: typeof multiDragState) {
  multiDragState = v;
}

export let bandState: { startX: number; startY: number; moved: boolean } | null = null;
export function setBandState(v: typeof bandState) {
  bandState = v;
}

export let skipNextCanvasClick = false;
export function setSkipNextCanvasClick(v: boolean) {
  skipNextCanvasClick = v;
}

// assigned in start() before any user events can fire
export let bandEl: HTMLDivElement = null!;
export function setBandEl(v: HTMLDivElement) {
  bandEl = v;
}

export const gridCursor = { x: 0, y: 0 }; // canvas pixel coordinates, always snapped to grid

// ---------------------------------------------------------------------------
// Callback slots — used to break circular dependencies between modules.
// Registered once in start() before any user interaction can fire.
// ---------------------------------------------------------------------------

export let onSectionSummaryUpdate: ((sectionEl: HTMLElement, block: Block) => void) | null = null;
export let onRefreshAllSectionHeights: (() => void) | null = null;
export let onSelectBlock: ((el: HTMLElement) => void) | null = null;
export let onMoveGridCursor: ((x: number, y: number) => void) | null = null;
export let onAddToSelection: ((el: HTMLElement) => void) | null = null;
export let onRefreshCustomModulesList: (() => void) | null = null;
export let onAppendCustomModuleToSidebar: ((mod: CustomModule) => void) | null = null;
// Removed 2026-09-23, all four verified to have ZERO `?.()` call sites anywhere in src/:
//   onUpdatePageCount, onSyncPageSeparators, onClearSelection, onAuthStateChange
// They were declared, given setters and registered in start(), but never invoked — the modules
// that need those behaviours import and call them directly. onAuthStateChange documented a
// contract ("fired after login/logout/role change") that was never honoured; the real mechanism
// is auth.ts's own onAuthChange, which main.ts already registers a byte-identical callback with.

export function setOnSectionSummaryUpdate(fn: typeof onSectionSummaryUpdate) {
  onSectionSummaryUpdate = fn;
}
export function setOnRefreshAllSectionHeights(fn: typeof onRefreshAllSectionHeights) {
  onRefreshAllSectionHeights = fn;
}
export function setOnSelectBlock(fn: typeof onSelectBlock) {
  onSelectBlock = fn;
}
export function setOnMoveGridCursor(fn: typeof onMoveGridCursor) {
  onMoveGridCursor = fn;
}
export function setOnAddToSelection(fn: typeof onAddToSelection) {
  onAddToSelection = fn;
}
export function setOnRefreshCustomModulesList(fn: typeof onRefreshCustomModulesList) {
  onRefreshCustomModulesList = fn;
}
export function setOnAppendCustomModuleToSidebar(fn: typeof onAppendCustomModuleToSidebar) {
  onAppendCustomModuleToSidebar = fn;
}

// Re-export types so modules only need one import for both state and types
export type { Block, CustomModule, TitleBlockData, WorkspaceState };
