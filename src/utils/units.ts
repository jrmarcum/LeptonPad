// ---------------------------------------------------------------------------
// Unit conversion utilities
// ---------------------------------------------------------------------------
// Functions marked WASM-READY have pure f64→f64 signatures with no state
// access and are candidates for promotion to wasm/units/ via wasmtk.
// ---------------------------------------------------------------------------

import { PX_PER_IN, PX_PER_MM } from '../types.ts';
import { marginUnit } from '../state.ts';

// WASM-READY: (f64) -> f64
export function mmToPx(mm: number): number { return Math.round(mm * PX_PER_MM); }

// WASM-READY: (f64) -> f64
export function inToPx(inches: number): number { return Math.round(inches * PX_PER_IN); }

// WASM-READY: (f64) -> f64
export function pxToMm(px: number): number { return parseFloat((px / PX_PER_MM).toFixed(1)); }

// WASM-READY: (f64) -> f64
export function pxToIn(px: number): number { return parseFloat((px / PX_PER_IN).toFixed(3)); }

// WASM-READY: (f64, f64, f64) -> f64
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// TS-only wrappers: read marginUnit from state, then delegate to pure functions above
export function pxToUnit(px: number): number { return marginUnit === 'mm' ? pxToMm(px) : pxToIn(px); }
export function unitToPx(val: number): number { return marginUnit === 'mm' ? mmToPx(val) : inToPx(val); }
