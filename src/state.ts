// ---------------------------------------------------------------------------
// Shared mutable application state
// All modules import directly from here and mutate in place — no injection.
// ---------------------------------------------------------------------------

import {
  type Block,
  type WorkspaceState,
  type CustomModule,
  type TitleBlockData,
  PX_PER_IN,
  PX_PER_MM,
  TITLE_BLOCK_H,
  PAGE_SIZES,
} from './types.ts';
import type { Scope, FnScope } from './expr.ts';

// ---------------------------------------------------------------------------
// Canvas layout dimensions — mutated when page size / margin settings change
// ---------------------------------------------------------------------------

export let CANVAS_W = PAGE_SIZES.letter.w;
export let PAGE_H   = PAGE_SIZES.letter.h;  // single-page height
export let numPages = 1;
export let CANVAS_H = PAGE_H;               // = numPages * PAGE_H
export let marginUnit: 'mm' | 'in' = 'in';

// Letter defaults: Top 0.25", Bottom 0.25", Left 0.75", Right 0.25"
export const margins = {
  top:    Math.round(0.25 * PX_PER_IN),
  bottom: Math.round(0.25 * PX_PER_IN),
  left:   Math.round(0.75 * PX_PER_IN),
  right:  Math.round(0.25 * PX_PER_IN),
};

// Title block overlay — enabled by sidebar checkbox; NOT stored in state.blocks
export let titleBlockEnabled    = false;
export let pageNumberingEnabled = true;

/** Fixed height of the title block — re-exported here for modules that only import state. */
export { TITLE_BLOCK_H };

/** Returns the title block height when enabled, otherwise 0. */
export function titleBlockH(): number {
  return titleBlockEnabled ? TITLE_BLOCK_H : 0;
}

// Setters for `let` exports that external modules need to reassign
export function setCANVAS_W(v: number)            { CANVAS_W             = v; }
export function setPAGE_H(v: number)              { PAGE_H               = v; }
export function setNumPages(v: number)            { numPages             = v; }
export function setCANVAS_H(v: number)            { CANVAS_H             = v; }
export function setMarginUnit(v: 'mm' | 'in')     { marginUnit           = v; }
export function setTitleBlockEnabled(v: boolean)  { titleBlockEnabled    = v; }
export function setPageNumberingEnabled(v: boolean){ pageNumberingEnabled = v; }

// ---------------------------------------------------------------------------
// Project state
// ---------------------------------------------------------------------------

export const state: WorkspaceState = {
  projectName: 'Untitled Project',
  blocks: [],
  constants: { E: 200000 },
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
export const sectionSummaryVarNames   = new Map<string, Set<string>>();
export const sectionSummaryComparisons = new Map<string, Array<{ expr: string; pass: boolean }>>();

// Maps child block id → parent section block id; rebuilt from state on load.
// Never persisted — derived from Block.parentSectionId at runtime.
export const childToSection: Map<string, string> = new Map();

// ---------------------------------------------------------------------------
// Undo
// ---------------------------------------------------------------------------

export const deletionStack: Block[] = [];

// ---------------------------------------------------------------------------
// Custom modules
// ---------------------------------------------------------------------------

export const CUSTOM_MODULES_KEY = 'mathwasm-custom-modules';

export let customModules: CustomModule[] = (() => {
  try { return JSON.parse(localStorage.getItem(CUSTOM_MODULES_KEY) ?? '[]') as CustomModule[]; }
  catch { return []; }
})();

export function saveCustomModules() {
  localStorage.setItem(CUSTOM_MODULES_KEY, JSON.stringify(customModules));
}

export function setCustomModules(v: CustomModule[]) { customModules = v; }

// ---------------------------------------------------------------------------
// File System Access API handle
// ---------------------------------------------------------------------------

// deno-lint-ignore no-explicit-any
export let fileHandle: any = null;
// deno-lint-ignore no-explicit-any
export function setFileHandle(v: any) { fileHandle = v; }

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
export function setCanvas(c: CanvasLike) { canvas = c; }

// ---------------------------------------------------------------------------
// Selection & drag state
// ---------------------------------------------------------------------------

export let selectedEl: HTMLElement | null = null;
export function setSelectedEl(v: HTMLElement | null) { selectedEl = v; }

export const selectedEls: Set<HTMLElement> = new Set();

export let multiDragState: {
  startX: number;
  startY: number;
  origPositions: Map<HTMLElement, { left: number; top: number }>;
} | null = null;
export function setMultiDragState(v: typeof multiDragState) { multiDragState = v; }

export let bandState: { startX: number; startY: number; moved: boolean } | null = null;
export function setBandState(v: typeof bandState) { bandState = v; }

export let skipNextCanvasClick = false;
export function setSkipNextCanvasClick(v: boolean) { skipNextCanvasClick = v; }

// assigned in start() before any user events can fire
export let bandEl: HTMLDivElement = null!;
export function setBandEl(v: HTMLDivElement) { bandEl = v; }

export const gridCursor = { x: 0, y: 0 }; // canvas pixel coordinates, always snapped to grid

// ---------------------------------------------------------------------------
// Callback slots — used to break circular dependencies between modules.
// Registered once in start() before any user interaction can fire.
// ---------------------------------------------------------------------------

export let onSectionSummaryUpdate: ((sectionEl: HTMLElement, block: Block) => void) | null = null;
export let onRefreshAllSectionHeights: (() => void) | null = null;
export let onSelectBlock: ((el: HTMLElement) => void) | null = null;
export let onMoveGridCursor: ((x: number, y: number) => void) | null = null;
export let onUpdatePageCount: (() => void) | null = null;
export let onSyncPageSeparators: (() => void) | null = null;
export let onClearSelection: (() => void) | null = null;
export let onAddToSelection: ((el: HTMLElement) => void) | null = null;
export let onRefreshCustomModulesList: (() => void) | null = null;
export let onAppendCustomModuleToSidebar: ((mod: CustomModule) => void) | null = null;

export function setOnSectionSummaryUpdate(fn: typeof onSectionSummaryUpdate)       { onSectionSummaryUpdate       = fn; }
export function setOnRefreshAllSectionHeights(fn: typeof onRefreshAllSectionHeights){ onRefreshAllSectionHeights   = fn; }
export function setOnSelectBlock(fn: typeof onSelectBlock)                          { onSelectBlock                = fn; }
export function setOnMoveGridCursor(fn: typeof onMoveGridCursor)                    { onMoveGridCursor             = fn; }
export function setOnUpdatePageCount(fn: typeof onUpdatePageCount)                  { onUpdatePageCount            = fn; }
export function setOnSyncPageSeparators(fn: typeof onSyncPageSeparators)            { onSyncPageSeparators         = fn; }
export function setOnClearSelection(fn: typeof onClearSelection)                    { onClearSelection             = fn; }
export function setOnAddToSelection(fn: typeof onAddToSelection)                    { onAddToSelection             = fn; }
export function setOnRefreshCustomModulesList(fn: typeof onRefreshCustomModulesList)  { onRefreshCustomModulesList   = fn; }
export function setOnAppendCustomModuleToSidebar(fn: typeof onAppendCustomModuleToSidebar) { onAppendCustomModuleToSidebar = fn; }

// Re-export types so modules only need one import for both state and types
export type { Block, WorkspaceState, CustomModule, TitleBlockData };
