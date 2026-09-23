// ---------------------------------------------------------------------------
// Shared helpers for the test suite
// ---------------------------------------------------------------------------
// The math engine is pure — expressions in, `Quantity` out, no DOM — so it can be exercised
// directly. These helpers keep each assertion to one readable line.

import { assertAlmostEquals, assertEquals, assertMatch, assertThrows } from '@std/assert';
import {
  evalFormulaRows,
  evalStatements,
  expandDotNotation,
  formatUnit,
  type FormulaRow,
  type Quantity,
  type Scope,
} from '../src/expr.ts';

/** Evaluate one statement (or a `;`-separated run) and return the LAST result. */
export function last(src: string, scope: Scope = {}): {
  value: number;
  unit: string;
  matrix?: Quantity[][];
  error?: string;
  isTest?: boolean;
} {
  // Formula blocks expand `beam1.L` before evaluating; do the same so tests exercise that path.
  const stmts = evalStatements(expandDotNotation(src), scope, {});
  const s = stmts[stmts.length - 1];
  return {
    value: s.value,
    unit: formatUnit(s.unit),
    matrix: s.matrix,
    error: s.error,
    isTest: s.isTest,
  };
}

/** Evaluate rows the way a formula block does (dot notation expanded, control flow honoured). */
export function rows(lines: string[], scope: Scope = {}) {
  const rs: FormulaRow[] = lines.map((e) => {
    const m = e.match(/^(if|elseif|else|end|for)\b\s*(.*)$/);
    return m
      ? { e: expandDotNotation(m[2]), type: m[1] as FormulaRow['type'] }
      : { e: expandDotNotation(e) };
  });
  return evalFormulaRows(rs, scope, {});
}

/** Assert a statement's numeric value and unit. `unit` is the display form, e.g. 'kip/in'. */
export function assertValue(
  src: string,
  value: number,
  unit = '',
  tolerance = 1e-9,
  scope: Scope = {},
) {
  const r = last(src, scope);
  if (r.error) throw new Error(`${src} → unexpected error: ${r.error}`);
  assertAlmostEquals(r.value, value, tolerance, `${src} → value`);
  assertEquals(r.unit, unit, `${src} → unit`);
}

/** Assert a statement fails, and that the message mentions `pattern`. */
export function assertError(src: string, pattern: RegExp, scope: Scope = {}) {
  const r = last(src, scope);
  if (!r.error) throw new Error(`${src} → expected an error, got ${r.value} ${r.unit}`);
  assertMatch(r.error, pattern, `${src} → error message`);
}

/** A matrix result as `[a, b; c, d]` with each element's unit — compact enough to assert on. */
export function matrixText(src: string, scope: Scope = {}): string {
  const r = last(src, scope);
  if (r.error) throw new Error(`${src} → unexpected error: ${r.error}`);
  if (!r.matrix) throw new Error(`${src} → expected a matrix, got ${r.value} ${r.unit}`);
  return '[' + r.matrix.map((row) =>
    row.map((q) => {
      const u = formatUnit(q.u);
      const v = Math.abs(q.v) < 1e-12 ? 0 : +q.v.toPrecision(10);
      return u ? `${v} ${u}` : `${v}`;
    }).join(', ')
  ).join('; ') + ']';
}

export { assertAlmostEquals, assertEquals, assertMatch, assertThrows };
