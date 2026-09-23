import { ANGLE_UNITS, UNIT_LOOKUP } from './utils/unit-defs.ts';

// Recursive-descent expression evaluator with dimensional analysis.
// Supports: + - * / ^ () identifiers function-calls numbers (incl. sci notation)
// Comparison: = == != <> < > <= >=  (return 1 or 0)
// Built-in constants : \pi  pi  (Euler's number is the function exp(x)) — e and tau are variables
// Built-in functions (1-arg): sin cos tan asin acos atan sinh cosh tanh asinh acosh atanh
//                              sqrt cbrt abs exp expm1 log ln log2 log10 log1p
//                              floor ceil round trunc sign degrees radians not
//                              (log = ln = natural log; log10 for base 10)
// Built-in functions (2-arg): min max atan2 mod hypot pow and or xor log(x, base)
// Big operators (4-arg)      : sum(expr, i, a, b)  prod(expr, i, a, b)  integral(expr, x, a, b)
//                              findroot(expr, x, lo, hi) — solves expr = 0 by bisection
// Built-in functions (3-arg): if(cond, then, else)
//                              clamp(x, min, max)
// Statistical/combinatorial  : factorial(n)  gamma(n)  lgamma(n)  erf(x)  erfc(x)
//                              comb(n,k)  perm(n,k)
//
// Units are tracked as UnitMap — a map from unit name to integer/rational exponent.
// Examples:  {mm:1}  {mm:4}  {N:1, mm:-2}  {} (dimensionless)

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Map of unit name → exponent. Empty object means dimensionless. */
export type UnitMap = Readonly<Record<string, number>>;

/**
 * A numeric value paired with its unit — or, when `m` is set, a matrix. A matrix is rows of scalar
 * Quantities, each with its OWN unit (stiffness matrices mix kip/in, kip and kip·in); its own `v` is
 * NaN and `u` is {}. Every scalar operation must reject a matrix (`noMatrix`) rather than read that NaN.
 */
export interface Quantity {
  v: number;
  u: UnitMap;
  m?: Quantity[][];
  /** Set on the 1/0 of a comparison, so a trailing [unit] never labels a pass/fail as "1 kip". */
  isTest?: boolean;
}

/** Scope maps variable names to Quantities (value + unit). */
export type Scope = Record<string, Quantity>;

/** FnScope maps user-defined function names to their parameter and expression. */
export type FnScope = Record<string, { param: string; expr: string; targetUnit?: UnitMap }>;

export interface Statement {
  raw: string; // original text of this statement
  name: string; // assigned variable name, or '' for bare expression
  expr: string; // right-hand side (or whole statement if bare)
  value: number;
  unit: UnitMap; // derived unit (empty = dimensionless)
  matrix?: Quantity[][]; // set when the result is a matrix (value is then NaN)
  error?: string;
  isFn?: boolean; // true when this statement defines a user function
  fnParam?: string; // parameter name when isFn is true
  // Control-flow fields
  rowType?: 'if' | 'elseif' | 'else' | 'end' | 'for';
  active?: boolean; // whether this row's branch/body was executed
  condValue?: number; // for if/elseif: numeric result of condition (non-zero = true)
}

/** A single row in a formula block (JSON-serialized in block.content). */
export interface FormulaRow {
  e: string; // expression or condition text
  d?: string; // optional description (left column)
  ref?: string; // optional reference (right column)
  type?: 'if' | 'elseif' | 'else' | 'end' | 'for';
  sp?: number; // line spacing for this row (1 | 1.5 | 2); absent = follow the block
}

// ---------------------------------------------------------------------------
// Unit arithmetic helpers
// ---------------------------------------------------------------------------

function cleanU(u: Record<string, number>): UnitMap {
  const r: Record<string, number> = {};
  for (const [k, e] of Object.entries(u)) if (e !== 0) r[k] = e;
  return r;
}

function mulU(a: UnitMap, b: UnitMap): UnitMap {
  const r: Record<string, number> = { ...a };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) + e;
  return cleanU(r);
}

function divU(a: UnitMap, b: UnitMap): UnitMap {
  const r: Record<string, number> = { ...a };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) - e;
  return cleanU(r);
}

function powU(u: UnitMap, n: number): UnitMap {
  if (Object.keys(u).length === 0) return u;
  const r: Record<string, number> = {};
  for (const [k, e] of Object.entries(u)) r[k] = e * n;
  return cleanU(r);
}

function eqU(a: UnitMap, b: UnitMap): boolean {
  const ka = Object.keys(a).filter((k) => a[k] !== 0).sort();
  const kb = Object.keys(b).filter((k) => b[k] !== 0).sort();
  if (ka.length !== kb.length) return false;
  return ka.every((k, i) => k === kb[i] && a[k] === (b as Record<string, number>)[k]);
}

function addU(a: UnitMap, b: UnitMap): UnitMap {
  const aEmpty = Object.keys(a).length === 0;
  const bEmpty = Object.keys(b).length === 0;
  if (aEmpty) return b;
  if (bEmpty) return a;
  if (!eqU(a, b)) {
    throw new Error(`Unit mismatch: ${formatUnit(a)} ≠ ${formatUnit(b)}`);
  }
  return a;
}

// ---------------------------------------------------------------------------
// Matrices (step 1, 2026-09-22): literals `{{a, b}, {c, d}}`, per-element units, element-wise
// + − * / on same-shape matrices. Scalar×matrix (step 2) and matrix product `.*` (step 3) are not
// implemented yet and raise a clear error — never a NaN or a plausible wrong number.
// ---------------------------------------------------------------------------

/** Throw if `q` is a matrix — for every operation that only makes sense on a single number. */
function noMatrix(q: Quantity, what: string): Quantity {
  if (q.m) {
    throw new Error(`${what} needs a single value, not a ${q.m.length}×${q.m[0].length} matrix`);
  }
  return q;
}

function matrixOf(rows: Quantity[][]): Quantity {
  return { v: NaN, u: {}, m: rows };
}

/** Scalar arithmetic with unit bookkeeping — the one place + − * / on two numbers is defined. */
function scalarOp(a: Quantity, b: Quantity, op: '+' | '-' | '*' | '/'): Quantity {
  switch (op) {
    case '+':
      return { v: a.v + b.v, u: addU(a.u, b.u) };
    case '-':
      return { v: a.v - b.v, u: addU(a.u, b.u) };
    case '*':
      return { v: a.v * b.v, u: mulU(a.u, b.u) };
    case '/':
      return { v: a.v / b.v, u: divU(a.u, b.u) };
  }
}

/**
 * + − * / for any pair:
 *   number ∘ number   — as before;
 *   matrix ∘ matrix   — element by element on same-shape matrices, each element keeping its own unit
 *                       (so + and − check units per element)                            [step 1];
 *   k * A, A * k, A / k — every element scaled by the number, units multiplied through   [step 2].
 * Refused: A ± k (not defined in matrix algebra) and k / A (division by a matrix means multiplying
 * by its inverse — Jon's rule; there is no element-wise reciprocal).
 */
function combine(a: Quantity, b: Quantity, op: '+' | '-' | '*' | '/'): Quantity {
  if (!a.m && !b.m) return scalarOp(a, b, op);
  if (!a.m || !b.m) {
    const scale = (m: Quantity[][], f: (x: Quantity) => Quantity) =>
      matrixOf(m.map((row) => row.map(f)));
    if (op === '*') {
      return a.m ? scale(a.m, (x) => scalarOp(x, b, '*')) : scale(b.m!, (x) => scalarOp(a, x, '*'));
    }
    if (op === '/' && a.m) return scale(a.m, (x) => scalarOp(x, b, '/'));
    if (op === '/') {
      throw new Error("A number can't be divided by a matrix — that needs the matrix inverse");
    }
    throw new Error(
      `A matrix and a number can't be ${op === '+' ? 'added' : 'subtracted'} — ` +
        'use a matrix of the same size',
    );
  }
  const ar = a.m.length, ac = a.m[0].length, br = b.m.length, bc = b.m[0].length;
  if (ar !== br || ac !== bc) {
    throw new Error(
      `Matrix sizes differ: ${ar}×${ac} ${op} ${br}×${bc} (element-wise needs the same size)`,
    );
  }
  return matrixOf(a.m.map((row, i) =>
    row.map((x, j) => {
      try {
        return scalarOp(x, b.m![i][j], op);
      } catch (e) {
        throw new Error(`Element (${i + 1},${j + 1}): ${(e as Error).message}`);
      }
    })
  ));
}

/**
 * `A .* B` — matrix product, the "dot product" of the algebra1course article Jon cited: row of A
 * times column of B, summed. (m×n) .* (n×p) → m×p [step 3]. Each result element Σⱼ aᵢⱼ·bⱼₖ must be
 * unit-consistent across j (K·u with K in kip/in|kip and u in in|rad gives kip in every term); an
 * inconsistent sum names the element. A 1×1 result is returned as a plain number (a row .* column is
 * a scalar). With a number on either side it is ordinary scaling, same as `*`.
 */
function matMul(a: Quantity, b: Quantity): Quantity {
  if (!a.m || !b.m) return combine(a, b, '*');
  const ar = a.m.length, ac = a.m[0].length, br = b.m.length, bc = b.m[0].length;
  if (ac !== br) {
    throw new Error(
      `Matrix product ${ar}×${ac} .* ${br}×${bc}: columns of the left (${ac}) must equal rows of the right (${br})`,
    );
  }
  const rows: Quantity[][] = [];
  for (let i = 0; i < ar; i++) {
    const row: Quantity[] = [];
    for (let k = 0; k < bc; k++) {
      let acc = scalarOp(a.m[i][0], b.m[0][k], '*');
      let sumAbs = Math.abs(acc.v);
      for (let j = 1; j < ac; j++) {
        try {
          const term = scalarOp(a.m[i][j], b.m[j][k], '*');
          sumAbs += Math.abs(term.v);
          acc = scalarOp(acc, term, '+');
        } catch (e) {
          throw new Error(`Element (${i + 1},${k + 1}) of the product: ${(e as Error).message}`);
        }
      }
      // Terms that cancel leave ~1e-16 of the sum behind — K .* inv(K) should read as the identity,
      // not as 1 and -1.1e-16. The tolerance is relative to the terms actually added.
      if (Math.abs(acc.v) <= 1e-12 * sumAbs) acc = { v: 0, u: acc.u };
      row.push(acc);
    }
    rows.push(row);
  }
  return ar === 1 && bc === 1 ? rows[0][0] : matrixOf(rows);
}

/**
 * findroot(expr, x, lo, hi) — the x in [lo, hi] where `expr` is zero, by bisection.
 *
 * Written as "something = 0", so an equation goes in as its difference:
 * `findroot(P_n(c) - P_u, c, 0 [in], 12 [in])`. The bracket must actually contain a sign change —
 * that is what guarantees a root — and if it does not, that is an error rather than a returned
 * endpoint. Bisection is slower than Newton but cannot diverge and needs no derivative, which suits
 * capacity curves and neutral-axis depths.
 *
 * x carries the unit of the bounds; the expression's own unit only has to stay consistent.
 */
function findRoot(at: (q: Quantity) => Quantity, lo: Quantity, hi: Quantity): Quantity {
  const xu = addU(lo.u, hi.u); // the bounds must share a unit
  let fu: UnitMap = {};
  let evals = 0;
  const f = (x: number): number => {
    if (++evals > 1000) throw new Error('findroot(): gave up before converging');
    const q = noMatrix(at({ v: x, u: xu }), 'findroot()');
    if (!isFinite(q.v)) throw new Error(`findroot(): the expression is not finite at ${x}`);
    if (Object.keys(q.u).length > 0) {
      if (Object.keys(fu).length === 0) fu = q.u;
      else if (!eqU(fu, q.u)) {
        throw new Error(
          `findroot(): the expression's unit changes (${formatUnit(fu)} ≠ ${formatUnit(q.u)})`,
        );
      }
    }
    return q.v;
  };

  let a = lo.v, b = hi.v;
  if (a === b) throw new Error('findroot(): the two bounds are the same');
  if (a > b) [a, b] = [b, a];
  let fa = f(a);
  const fbEnd = f(b);
  if (fa === 0) return { v: a, u: xu };
  if (fbEnd === 0) return { v: b, u: xu };
  if (fa > 0 === fbEnd > 0) {
    throw new Error(
      `findroot(): the expression does not change sign between ${a} and ${b} ` +
        `(it is ${fa > 0 ? 'positive' : 'negative'} at both ends) — widen the range or check it`,
    );
  }

  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  for (let i = 0; i < 200 && b - a > 1e-14 * scale; i++) {
    const m = (a + b) / 2;
    const fmid = f(m);
    if (fmid === 0) return { v: m, u: xu };
    if (fa > 0 === fmid > 0) {
      a = m;
      fa = fmid;
    } else {
      b = m;
    }
  }
  return { v: (a + b) / 2, u: xu };
}

/**
 * transpose(A) — rows become columns; every element keeps its own unit. A column vector becomes a
 * row vector, so transpose(u) .* u is a dot product. A number is its own transpose.
 */
function transpose(a: Quantity): Quantity {
  if (!a.m) return a;
  const m = a.m;
  return matrixOf(m[0].map((_, j) => m.map((row) => row[j])));
}

/**
 * Split a matrix's element units into a row unit × column unit — u(i,j) = r(i)·c(j).
 *
 * Every determinant term (and every element of an inverse) mixes elements from different rows and
 * columns, and only matrices with this structure give those terms a single, well-defined unit. Real
 * stiffness and flexibility matrices have it: K = {{kip/in, kip}, {kip, kip·in}} splits into
 * r = (kip/in, kip) and c = (1, in).
 *
 * An element that is exactly 0 with no unit carries no information (sheets write a plain `0`), so it
 * is skipped and its unit is inferred from the rest. Returns null when the units do not split, or
 * when the known elements leave a row/column unit undetermined — in both cases the caller reports an
 * error rather than inventing a unit.
 */
function unitFactors(
  m: Quantity[][],
): { r: UnitMap[]; c: UnitMap[]; components: { rows: number[]; cols: number[] }[] } | null {
  const n = m.length, k = m[0].length;
  const known = (i: number, j: number) => !(m[i][j].v === 0 && Object.keys(m[i][j].u).length === 0);
  const r: (UnitMap | null)[] = Array(n).fill(null);
  const c: (UnitMap | null)[] = Array(k).fill(null);
  const components: { rows: number[]; cols: number[] }[] = [];

  // Known elements link a row to a column; each connected group is solved from one gauge choice
  // (its first row carries the whole unit). Zeros link nothing, so a matrix can have several groups.
  for (let seed = 0; seed < n; seed++) {
    if (r[seed] !== null) continue;
    r[seed] = {};
    const comp = { rows: [seed], cols: [] as number[] };
    for (let pass = 0; pass < n + k; pass++) {
      let grew = false;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < k; j++) {
          if (!known(i, j)) continue;
          if (r[i] !== null && c[j] === null) {
            c[j] = divU(m[i][j].u, r[i]!);
            comp.cols.push(j);
            grew = true;
          } else if (r[i] === null && c[j] !== null) {
            r[i] = divU(m[i][j].u, c[j]!);
            comp.rows.push(i);
            grew = true;
          }
        }
      }
      if (!grew) break;
    }
    components.push(comp);
  }
  for (let j = 0; j < k; j++) {
    if (c[j] === null) { // a column of nothing but zeros — its own group
      c[j] = {};
      components.push({ rows: [], cols: [j] });
    }
  }
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      if (known(i, j) && !eqU(m[i][j].u, mulU(r[i]!, c[j]!))) return null; // does not split
    }
  }
  return { r: r as UnitMap[], c: c as UnitMap[], components };
}

/**
 * The unit of det(A) — the product of all row units and all column units.
 *
 * Where zeros split the matrix into separate groups, each group's split is only fixed up to a shared
 * factor; that factor cancels out of the total exactly when the group has as many rows as columns,
 * which is the case whenever a non-zero term of the determinant exists at all. An unbalanced group
 * means the unit really is ambiguous, so it is an error instead of a guess.
 */
function detUnit(m: Quantity[][]): UnitMap {
  const f = unitFactors(m);
  const ambiguous = f?.components.some((comp) => comp.rows.length !== comp.cols.length);
  if (!f || ambiguous) {
    throw new Error(
      "det(): this matrix's units don't give the determinant a single unit — every term of the " +
        'expansion must come out the same',
    );
  }
  return [...f.r, ...f.c].reduce(mulU, {});
}

// `inv`/`solve` share the same split, checked by squareFactors() below.

/**
 * det(A) — Gaussian elimination with partial pivoting (product of the pivots, sign from the row
 * swaps). Square matrices only; a 1×1 determinant is its element.
 */
function det(a: Quantity): Quantity {
  if (!a.m) throw new Error('det() needs a square matrix');
  const n = a.m.length;
  if (a.m[0].length !== n) {
    throw new Error(`det() needs a square matrix (got ${n}×${a.m[0].length})`);
  }
  const u = detUnit(a.m);
  const g = a.m.map((row) => row.map((q) => q.v)); // work on the numbers alone
  // Hadamard-style size of the biggest term, for rounding elimination dust to an exact 0 below.
  const scale = g.reduce((p, row) => p * Math.max(...row.map(Math.abs), 1), 1);
  let sign = 1, v = 1;
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let i = col + 1; i < n; i++) if (Math.abs(g[i][col]) > Math.abs(g[piv][col])) piv = i;
    if (g[piv][col] === 0) return { v: 0, u };
    if (piv !== col) {
      [g[col], g[piv]] = [g[piv], g[col]];
      sign = -sign;
    }
    v *= g[col][col];
    for (let i = col + 1; i < n; i++) {
      const f = g[i][col] / g[col][col];
      for (let j = col; j < n; j++) g[i][j] -= f * g[col][j];
    }
  }
  // A singular matrix leaves ~1e-16 × scale behind; report the 0 it mathematically is.
  return { v: Math.abs(v) <= 1e-12 * scale ? 0 : sign * v, u };
}

/**
 * Solve A·X = B for the numbers alone — Gauss-Jordan with partial pivoting. Returns null when A is
 * singular (a pivot vanishes relative to the column's size). Units are handled by the callers.
 */
function luSolve(a: number[][], b: number[][]): number[][] | null {
  const n = a.length, p = b[0].length;
  const m = a.map((row, i) => [...row, ...b[i]]);
  const scale = Math.max(...a.flat().map(Math.abs), 1);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let i = col + 1; i < n; i++) if (Math.abs(m[i][col]) > Math.abs(m[piv][col])) piv = i;
    if (Math.abs(m[piv][col]) <= 1e-12 * scale) return null; // singular
    if (piv !== col) [m[col], m[piv]] = [m[piv], m[col]];
    const d = m[col][col];
    for (let j = col; j < n + p; j++) m[col][j] /= d;
    for (let i = 0; i < n; i++) {
      if (i === col || m[i][col] === 0) continue;
      const f = m[i][col];
      for (let j = col; j < n + p; j++) m[i][j] -= f * m[col][j];
    }
  }
  return m.map((row) => row.slice(n));
}

/** A square matrix's unit factors, with the checks det/inv/solve all need. */
function squareFactors(m: Quantity[][], fn: string): { r: UnitMap[]; c: UnitMap[] } {
  const n = m.length;
  if (m[0].length !== n) throw new Error(`${fn}() needs a square matrix (got ${n}×${m[0].length})`);
  const f = unitFactors(m);
  if (!f || f.components.some((comp) => comp.rows.length !== comp.cols.length)) {
    throw new Error(
      `${fn}(): this matrix's units are not consistent — each element's unit must be a row unit ` +
        'times a column unit (as in a stiffness or flexibility matrix)',
    );
  }
  return f;
}

/**
 * inv(A) — the inverse. Element (i,j) of the inverse carries 1/(r(j)·c(i)), the units that make
 * A⁻¹·A dimensionless: inverting K in kip/in | kip | kip·in gives in/kip, 1/kip and 1/(kip·in).
 */
function inv(a: Quantity): Quantity {
  if (!a.m) throw new Error('inv() needs a square matrix');
  const { r, c } = squareFactors(a.m, 'inv');
  const n = a.m.length;
  const id = Array.from(
    { length: n },
    (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0),
  );
  const x = luSolve(a.m.map((row) => row.map((q) => q.v)), id);
  if (!x) throw new Error('inv(): the matrix is singular — it has no inverse');
  return matrixOf(
    x.map((row, i) => row.map((v, j) => ({ v, u: divU({}, mulU(r[j], c[i])) }))),
  );
}

/**
 * solve(K, F) — the u of K·u = F, by elimination rather than by forming the inverse.
 * Units: with K split as r·c, every F element must give the same f = unit(F(i)) / r(i); then
 * unit(u(k)) = f / c(k). For a stiffness matrix in kip/in | kip | kip·in and forces in kip | kip·in
 * that yields a displacement in in and a rotation that is dimensionless.
 */
function solveSystem(k: Quantity, f: Quantity): Quantity {
  if (!k.m) throw new Error('solve() needs a square matrix as its first argument');
  if (!f.m) throw new Error('solve() needs a vector or matrix as its second argument');
  const { r, c } = squareFactors(k.m, 'solve');
  const n = k.m.length;
  if (f.m.length !== n) {
    throw new Error(
      `solve(): the right-hand side has ${f.m.length} row${f.m.length === 1 ? '' : 's'}, ` +
        `the matrix has ${n}`,
    );
  }
  // One common factor for the whole right-hand side, from the rows that carry a unit.
  let rhs: UnitMap | null = null;
  for (let i = 0; i < n; i++) {
    for (const cell of f.m[i]) {
      if (cell.v === 0 && Object.keys(cell.u).length === 0) continue;
      const cand = divU(cell.u, r[i]);
      if (rhs === null) rhs = cand;
      else if (!eqU(rhs, cand)) {
        throw new Error(
          `solve(): the right-hand side is not unit-consistent with the matrix ` +
            `(row ${i + 1} implies ${formatUnit(cand) || 'no unit'}, earlier rows ${
              formatUnit(rhs) || 'no unit'
            })`,
        );
      }
    }
  }
  const x = luSolve(k.m.map((row) => row.map((q) => q.v)), f.m.map((row) => row.map((q) => q.v)));
  if (!x) throw new Error('solve(): the matrix is singular — the system has no unique solution');
  const u = rhs ?? {};
  return matrixOf(x.map((row, i) => row.map((v) => ({ v, u: divU(u, c[i]) }))));
}

/** Functions that take matrices, dispatched before the scalar-only argument guard in atom(). */
const MATRIX_FNS: Record<string, { arity: number; run: (args: Quantity[]) => Quantity }> = {
  transpose: { arity: 1, run: ([a]) => transpose(a) },
  det: { arity: 1, run: ([a]) => det(a) },
  inv: { arity: 1, run: ([a]) => inv(a) },
  solve: { arity: 2, run: ([k, f]) => solveSystem(k, f) },
  el: { arity: 3, run: ([a, i, j]) => element(a, i, j) },
};

/**
 * min/max over any number of arguments — `max(1.4*D, 1.2*D + 1.6*L, 0.9*D + 1.0*W)` is how load
 * combinations are written — or over every element of one matrix: `max(F)`.
 * Units must agree across the values, the same rule as addition.
 */
function minMax(name: string, args: Quantity[]): Quantity {
  if (args.length === 0) throw new Error(`${name}() needs at least one value`);
  const values = args.length === 1 && args[0].m ? args[0].m!.flat() : args;
  for (const v of values) noMatrix(v, `${name}()`);
  let best = values[0];
  let unit = best.u;
  for (const q of values.slice(1)) {
    unit = addU(unit, q.u); // errors on a genuine mismatch, allows a bare 0
    const take = name === 'max' ? q.v > best.v : q.v < best.v;
    if (take) best = q;
  }
  return { v: best.v, u: addU(unit, best.u) };
}

/**
 * Linear interpolation, in the two forms a calculation sheet needs:
 *   interp(x, x1, y1, x2, y2) — between two points; extrapolates outside them, since it is just
 *                               the line through them.
 *   interp(x, X, Y)           — down a table: X and Y are equal-length vectors, X increasing.
 *                               Outside the table it is an error, not a guess.
 */
function interp(args: Quantity[]): Quantity {
  const lerp = (x: Quantity, x1: Quantity, y1: Quantity, x2: Quantity, y2: Quantity): Quantity => {
    addU(addU(x.u, x1.u), x2.u); // x, x1 and x2 must share a unit — throws if they do not
    const yu = addU(y1.u, y2.u);
    if (x2.v === x1.v) throw new Error('interp(): the two x values are the same');
    const t = (x.v - x1.v) / (x2.v - x1.v);
    return { v: y1.v + t * (y2.v - y1.v), u: yu };
  };

  if (args.length === 5) {
    const [x, x1, y1, x2, y2] = args.map((a) => noMatrix(a, 'interp()'));
    return lerp(x, x1, y1, x2, y2);
  }
  if (args.length !== 3) {
    throw new Error('Usage: interp(x, x1, y1, x2, y2) or interp(x, Xvector, Yvector)');
  }
  const [x, X, Y] = args;
  noMatrix(x, 'interp() x');
  if (!X.m || !Y.m) throw new Error('interp(x, X, Y): X and Y must be vectors');
  const xs = X.m.flat(), ys = Y.m.flat();
  if (xs.length !== ys.length) {
    throw new Error(`interp(): X has ${xs.length} values, Y has ${ys.length}`);
  }
  if (xs.length < 2) throw new Error('interp(): the table needs at least two points');
  for (let i = 1; i < xs.length; i++) {
    if (xs[i].v <= xs[i - 1].v) {
      throw new Error(`interp(): the X values must increase (position ${i + 1} does not)`);
    }
  }
  if (x.v < xs[0].v || x.v > xs[xs.length - 1].v) {
    throw new Error(
      `interp(): ${x.v} is outside the table (${xs[0].v} … ${xs[xs.length - 1].v})`,
    );
  }
  let i = xs.length - 2;
  while (i > 0 && x.v < xs[i].v) i--;
  return lerp(x, xs[i], ys[i], xs[i + 1], ys[i + 1]);
}

/** el(A, i, j) — one element of a matrix, 1-based, with its own unit. */
function element(a: Quantity, i: Quantity, j: Quantity): Quantity {
  if (!a.m) throw new Error('el() needs a matrix as its first argument');
  const idx = (q: Quantity, what: string, max: number): number => {
    noMatrix(q, `el() ${what}`);
    if (Object.keys(q.u).length > 0) throw new Error(`el(): the ${what} must be unitless`);
    const n = Math.round(q.v);
    if (Math.abs(q.v - n) > 1e-9) throw new Error(`el(): the ${what} must be a whole number`);
    if (n < 1 || n > max) throw new Error(`el(): ${what} ${n} is outside 1…${max}`);
    return n;
  };
  const row = idx(i, 'row', a.m.length);
  const col = idx(j, 'column', a.m[0].length);
  return a.m[row - 1][col - 1];
}

/** Apply `f` to a number, or to every element of a matrix. */
function mapQ(q: Quantity, f: (x: Quantity) => Quantity): Quantity {
  return q.m ? matrixOf(q.m.map((row) => row.map(f))) : f(q);
}

// ---------------------------------------------------------------------------
// Unit formatting / parsing
// ---------------------------------------------------------------------------

/** Format a UnitMap as a human-readable string, e.g. "mm^4", "N/mm^2". */
export function formatUnit(u: UnitMap): string {
  const pos = Object.entries(u)
    .filter(([, e]) => e > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const neg = Object.entries(u)
    .filter(([, e]) => e < 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  const fmt = ([name, exp]: [string, number]): string => {
    const e = Math.abs(exp);
    if (e === 1) return name;
    return `${name}^${Number.isInteger(e) ? e : e.toFixed(2)}`;
  };

  const numStr = pos.map(fmt).join('·');
  const denParts = neg.map(fmt);
  if (!numStr && denParts.length === 0) return '';
  if (denParts.length === 0) return numStr;
  const denStr = denParts.length === 1 ? denParts[0] : `(${denParts.join('·')})`;
  return `${numStr || '1'}/${denStr}`;
}

/**
 * Parse a unit expression like "mm", "mm^4", "N/mm^2", "kg·m/s^2".
 * Supports * and · as multipliers, / for division.
 * Compound unit ids with a `baseUnits` entry (e.g. ksi → {kip:1, in:-2}) are
 * expanded so that dimensional cancellation works correctly.
 */
function parseUnitExpr(s: string): UnitMap {
  s = s.trim().replace(/·/g, '*');
  const result: Record<string, number> = {};

  function applyTerms(str: string, sign: 1 | -1) {
    str = str.trim();
    if (str.startsWith('(') && str.endsWith(')')) str = str.slice(1, -1).trim();
    for (const raw of str.split('*')) {
      const t = raw.trim();
      if (!t) continue;
      let name: string;
      let exp: number;
      const ci = t.indexOf('^');
      if (ci >= 0) {
        name = t.slice(0, ci).trim();
        exp = Number(t.slice(ci + 1).trim());
      } else {
        name = t;
        exp = 1;
      }
      if (!name) continue;
      // `[1/kip]`, `[1/s]` — the leading 1 is "no unit", not a unit named "1". Without this it
      // became a phantom symbol that never cancelled (seen as `1·kip^-1`).
      if (name === '1') continue;
      // Expand compound units (e.g. ksi → kip⋅in⁻²) so unit cancellation works.
      const def = UNIT_LOOKUP.get(name);
      if (def?.baseUnits) {
        for (const [bKey, bExp] of Object.entries(def.baseUnits)) {
          result[bKey] = (result[bKey] ?? 0) + sign * exp * bExp;
        }
      } else {
        result[name] = (result[name] ?? 0) + sign * exp;
      }
    }
  }

  const si = s.indexOf('/');
  applyTerms(si >= 0 ? s.slice(0, si) : s, 1);
  if (si >= 0) applyTerms(s.slice(si + 1), -1);
  return cleanU(result);
}

// ---------------------------------------------------------------------------
// [[targetUnit]] conversion helpers
// ---------------------------------------------------------------------------

/**
 * Compute the net SI factor for a compound unit map.
 * e.g. {N:1, mm:-2} → 1^1 * (0.001)^-2 = 1e6  (Pascals per N/mm²)
 * Throws if any symbol is not in the unit catalog.
 */
function unitMapSiFactor(umap: UnitMap): number {
  let f = 1;
  for (const [sym, exp] of Object.entries(umap)) {
    const def = UNIT_LOOKUP.get(sym);
    if (!def) throw new Error(`No SI conversion factor for unit: "${sym}"`);
    f *= Math.pow(def.factor, exp);
  }
  return f;
}

/**
 * Returns true when umap is exactly one temperature unit with exponent 1.
 * Only this case requires affine (offset) conversion; all other cases
 * (temperature differences, compound expressions like J/K) use factor scaling.
 */
function isSingleTempUnit(umap: UnitMap): boolean {
  const keys = Object.keys(umap);
  if (keys.length !== 1 || umap[keys[0]] !== 1) return false;
  const def = UNIT_LOOKUP.get(keys[0]);
  return !!def && (def.offset ?? 0) !== 0;
}

/**
 * Convert a Quantity to targetUmap.
 * - Simple temperature (e.g. °C → °F): full affine conversion with offset.
 * - Everything else (lengths, areas, pressures, compound units): pure factor scaling.
 *   This correctly handles compound units such as {N:1, mm:-2} → {ksi:1}.
 */
function applyTargetUnit(q: Quantity, targetUmap: UnitMap): Quantity {
  // Affine temperature path: only when both sides are a single temperature unit
  if (isSingleTempUnit(q.u) && isSingleTempUnit(targetUmap)) {
    const src = UNIT_LOOKUP.get(Object.keys(q.u)[0])!;
    const tgt = UNIT_LOOKUP.get(Object.keys(targetUmap)[0])!;
    const base = q.v * src.factor + (src.offset ?? 0);
    return { v: (base - (tgt.offset ?? 0)) / tgt.factor, u: targetUmap };
  }
  // Factor-scaling path
  const srcF = unitMapSiFactor(q.u); // throws if source symbol unknown
  const tgtF = unitMapSiFactor(targetUmap); // throws if target symbol unknown
  return { v: q.v * srcF / tgtF, u: targetUmap };
}

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------
type TT =
  | 'NUM'
  | 'ID'
  | 'PLUS'
  | 'MINUS'
  | 'STAR'
  | 'SLASH'
  | 'CARET'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'LBRACE'
  | 'RBRACE'
  | 'DOTSTAR'
  | 'UNIT'
  | 'EQ'
  | 'NEQ'
  | 'LT'
  | 'GT'
  | 'LEQ'
  | 'GEQ'
  | 'EOF';
interface Tok {
  t: TT;
  v: string;
}

/**
 * Reduce display-only LaTeX marks to a plain variable name:
 *   `\phiM_n` → `phiM_n`, `\ell_b` → `ell_b`, `\bar{x}` → `xbar`, `\bar{\sigma}_c` → `sigmabar_c`.
 * The marks only tell the renderer what to draw (see transformPiece in markdown.ts). `\bar{}` is
 * rewritten first, while its braces still delimit the name — the lexer rejects `{` anywhere else.
 * Exception: a standalone `\pi` is a constant, not a mark — its backslash is kept for the lexer
 * (MARKED_CONST). `\pi_1` and `\piR` are names and are stripped as usual.
 */
export function stripGreekMarks(src: string): string {
  return src
    .replace(/\\bar\{\s*\\?([A-Za-z][A-Za-z0-9]*)\s*\}/g, '$1bar')
    .replace(/\\(?=[A-Za-z])(?!pi(?![A-Za-z0-9_]))/g, '');
}

/**
 * Section access: `beam1.L` → `beam1__L`, the key sections export into the global scope. Formula
 * and plot blocks both apply it before evaluating. The member may carry a Greek marker
 * (`beam1.\phi_P` → `beam1__\phi_P`); stripGreekMarks removes it afterwards.
 */
// WASM-READY: (string) -> string
export function expandDotNotation(expr: string): string {
  return expr.replace(/\b([A-Za-z_]\w*)\.(\\?[A-Za-z_]\w*)\b/g, '$1__$2');
}

function lex(src: string): Tok[] {
  src = stripGreekMarks(src);
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (with optional decimal and scientific notation)
    if (/\d/.test(ch) || (ch === '.' && /\d/.test(src[i + 1] ?? ''))) {
      let s = '';
      while (i < src.length && /[\d.]/.test(src[i])) s += src[i++];
      if (i < src.length && /[eE]/.test(src[i])) {
        s += src[i++];
        if (i < src.length && /[+-]/.test(src[i])) s += src[i++];
        while (i < src.length && /\d/.test(src[i])) s += src[i++];
      }
      out.push({ t: 'NUM', v: s });
      continue;
    }

    // Marked constant: \pi — kept as an ID *with* its backslash (see MARKED_CONST)
    if (ch === '\\') {
      const m = src.slice(i).match(/^\\(pi)(?![A-Za-z0-9_])/);
      if (!m) throw new Error(`Unknown character: '\\'`);
      out.push({ t: 'ID', v: m[0] });
      i += m[0].length;
      continue;
    }

    // Identifier
    if (/[a-zA-Z_]/.test(ch)) {
      let s = '';
      while (i < src.length && /\w/.test(src[i])) s += src[i++];
      out.push({ t: 'ID', v: s });
      continue;
    }

    // Inline unit tag: 0.0625 [in] — [[target]] is only valid at the end of a statement
    if (ch === '[') {
      if (src[i + 1] === '[') {
        throw new Error('[[unit]] conversion must be at the end of the statement');
      }
      const close = src.indexOf(']', i);
      if (close < 0) throw new Error("Missing ']' in unit tag");
      const body = src.slice(i + 1, close).trim();
      if (!body) throw new Error('Empty unit tag []');
      out.push({ t: 'UNIT', v: body });
      i = close + 1;
      continue;
    }

    // Comma
    if (ch === ',') {
      out.push({ t: 'COMMA', v: ',' });
      i++;
      continue;
    }

    // Comparison operators
    if (ch === '=') {
      if (src[i + 1] === '=') {
        out.push({ t: 'EQ', v: '==' });
        i += 2;
      } else {
        out.push({ t: 'EQ', v: '=' });
        i++;
      }
      continue;
    }
    if (ch === '!' && src[i + 1] === '=') {
      out.push({ t: 'NEQ', v: '!=' });
      i += 2;
      continue;
    }
    if (ch === '<') {
      if (src[i + 1] === '>') {
        out.push({ t: 'NEQ', v: '<>' });
        i += 2;
      } else if (src[i + 1] === '=') {
        out.push({ t: 'LEQ', v: '<=' });
        i += 2;
      } else {
        out.push({ t: 'LT', v: '<' });
        i++;
      }
      continue;
    }
    if (ch === '>') {
      if (src[i + 1] === '=') {
        out.push({ t: 'GEQ', v: '>=' });
        i += 2;
      } else {
        out.push({ t: 'GT', v: '>' });
        i++;
      }
      continue;
    }

    // `.*` — matrix product. (`2.*A` lexes as the number `2.` then `*`, which is the same scaling.)
    if (ch === '.' && src[i + 1] === '*') {
      out.push({ t: 'DOTSTAR', v: '.*' });
      i += 2;
      continue;
    }

    // Single-char operators
    const ops: Record<string, TT> = {
      '+': 'PLUS',
      '-': 'MINUS',
      '*': 'STAR',
      '/': 'SLASH',
      '^': 'CARET',
      '(': 'LPAREN',
      '{': 'LBRACE', // matrix literal (\bar{…} braces were already rewritten by stripGreekMarks)
      '}': 'RBRACE',
      ')': 'RPAREN',
    };
    if (ops[ch]) {
      out.push({ t: ops[ch], v: ch });
      i++;
      continue;
    }

    throw new Error(`Unknown character: '${ch}'`);
  }
  out.push({ t: 'EOF', v: '' });
  return out;
}

// ---------------------------------------------------------------------------
// Built-ins
// ---------------------------------------------------------------------------

// Lanczos approximation for gamma function
function _gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * _gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Error function approximation (Abramowitz & Stegun 7.1.26)
function _erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t * Math.exp(-x * x);
  return sign * y;
}

/**
 * An angle argument in radians. A plain number is already radians; a value carrying an angle unit
 * (`30 [deg]`, `0.5 [rev]`) is converted. Anything else is an error — `sin(3 [ft])` is meaningless.
 * Used by the trig functions and `degrees()`, so a sheet can say `sin(30 [deg])` directly.
 */
function asRadians(q: Quantity, fn: string): number {
  const keys = Object.keys(q.u);
  if (keys.length === 0) return q.v; // plain number = radians
  if (keys.length === 1 && q.u[keys[0]] === 1 && ANGLE_UNITS.has(keys[0])) {
    return q.v * ANGLE_UNITS.get(keys[0])!;
  }
  throw new Error(
    `${fn}() needs an angle — a plain number (radians) or a unit like [deg], not ${
      formatUnit(q.u)
    }`,
  );
}

/** Functions whose single argument is an angle (radians, or any angle unit). */
const ANGLE_FN: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  degrees: (x) => x * (180 / Math.PI),
};

// Functions that require dimensionless input and produce dimensionless output
const MATH_FN: Record<string, (x: number) => number> = {
  // sin / cos / tan / degrees take an angle — see ANGLE_FN above.
  // Inverse trig RETURNS radians as a plain number; wrap in degrees() to read it in degrees.
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  // Hyperbolic trig
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,
  // Exponential / logarithmic
  exp: Math.exp,
  expm1: Math.expm1,
  log: Math.log, // natural log — NOT base 10 (use log10); kept for existing sheets
  ln: Math.log, // explicit natural log, so a sheet can say what it means
  log2: Math.log2,
  log10: Math.log10,
  log1p: Math.log1p,
  // Angle conversion (degrees() is in ANGLE_FN, so it also accepts a [deg]/[rad] value)
  radians: (x) => x * (Math.PI / 180),
  // Sign / logic
  sign: Math.sign,
  // Statistical
  erf: _erf,
  erfc: (x) => 1 - _erf(x),
  gamma: _gamma,
  lgamma: (x) => Math.log(Math.abs(_gamma(x))),
  factorial: (n) => {
    if (n < 0 || !Number.isInteger(n)) throw new Error('factorial requires a non-negative integer');
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
};

// Functions that preserve the unit of their argument
const PRESERVE_FN: Record<string, (x: number) => number> = {
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc,
  roundup: Math.ceil, // roundup(x) / rounddown(x) are ceil/floor; the 2-arg forms take a step
  rounddown: Math.floor,
};

/**
 * round(x, n) · roundup(x, step) · rounddown(x, step) — the rounding a sheet actually needs.
 *   second argument unitless and whole → decimal places: `round(1.23456, 2)` = 1.23
 *   anything else                      → a step to land on, in x's own unit:
 *                                        `roundup(d, 0.0625 [in])`, `round(x, 0.5)`
 * The step must share x's unit, and must be positive.
 */
function roundTo(name: string, x: Quantity, spec: Quantity): Quantity {
  const op = name === 'roundup' ? Math.ceil : name === 'rounddown' ? Math.floor : Math.round;
  const specIsPlain = Object.keys(spec.u).length === 0;
  if (name === 'round' && specIsPlain && Number.isInteger(spec.v)) {
    const f = Math.pow(10, spec.v);
    return { v: Math.round(x.v * f) / f, u: x.u };
  }
  addU(x.u, spec.u); // the step must be in the same unit as x
  if (!(spec.v > 0)) throw new Error(`${name}(): the step must be greater than zero`);
  return { v: op(x.v / spec.v) * spec.v, u: x.u };
}

// Constants (2026-09-22, revised 2026-09-23). Structural sheets use `e` (eccentricity) and `\tau`
// (shear stress) as variables, and constants used to shadow them silently — `e = 0.5 [in]` was
// ignored and every later `e` was 2.718…. So:
//   exp(x)  Euler's number, as a FUNCTION — `exp(2)`, `exp(-x/2)`; the renderer draws it as eˣ.
//           (v2.3.0 used `\e` as a marked constant; Jon replaced it with exp() on 2026-09-23.)
//   \pi     π. Plain `pi` also stays π (countless `A = pi*d^2/4` sheets); assigning to it is an error.
//   e, tau  ordinary variables — eccentricity, shear stress.
// The marked constant is lexed as an ID token that keeps its backslash, so no user name (letters,
// digits, `_`) can ever collide with it.
const MARKED_CONST: Record<string, number> = { '\\pi': Math.PI };
const PLAIN_CONST: Record<string, number> = { pi: Math.PI };

const CMP_OPS: TT[] = ['EQ', 'NEQ', 'LT', 'GT', 'LEQ', 'GEQ'];

// ---------------------------------------------------------------------------
// Big operators — sum(expr, i, a, b) · prod(expr, i, a, b) · integral(expr, x, a, b)
// ---------------------------------------------------------------------------
// `at(q)` evaluates the captured expression with the bound variable set to q (see Parser.bigOp).

const BIG_OPS = new Set(['sum', 'prod', 'integral', 'findroot']);
const MAX_TERMS = 100_000; // sum/prod term cap — evaluation runs on every keystroke
const MAX_INTEGRAND_EVALS = 200_000;

/** Σ / Π over whole-number i = a … b. Empty range → 0 (sum) or 1 (prod). Terms add under the same
 *  strict unit rule as `+`; products multiply units. */
function sumOrProd(
  name: string,
  at: (q: Quantity) => Quantity,
  lo: Quantity,
  hi: Quantity,
): Quantity {
  if (Object.keys(lo.u).length > 0 || Object.keys(hi.u).length > 0) {
    throw new Error(`${name}(): index limits must be unitless`);
  }
  const a = Math.round(lo.v), b = Math.round(hi.v);
  if (Math.abs(lo.v - a) > 1e-9 || Math.abs(hi.v - b) > 1e-9) {
    throw new Error(`${name}(): index limits must be whole numbers (got ${lo.v} … ${hi.v})`);
  }
  if (b - a + 1 > MAX_TERMS) throw new Error(`${name}(): more than ${MAX_TERMS} terms`);
  const isSum = name === 'sum';
  let acc: Quantity | null = null;
  for (let i = a; i <= b; i++) {
    const t = at({ v: i, u: {} });
    acc = acc === null
      ? t
      : isSum
      ? { v: acc.v + t.v, u: addU(acc.u, t.u) }
      : { v: acc.v * t.v, u: mulU(acc.u, t.u) };
  }
  return acc ?? { v: isSum ? 0 : 1, u: {} };
}

/**
 * ∫ₐᵇ f dx by adaptive Simpson's rule (relative tolerance ~1e-10, at least 4 subdivision levels so a
 * curve that happens to vanish at the first sample points is not read as zero). The variable carries
 * the bounds' unit and the result is unit(f)·unit(x) — kip/ft over ft gives kip. A unitless sample
 * (e.g. an `if(…, 0, w)` branch) is accepted beside a united one, matching `+`.
 */
function integrate(at: (q: Quantity) => Quantity, lo: Quantity, hi: Quantity): Quantity {
  const xu = addU(lo.u, hi.u); // bounds must share a unit (or one may be a bare 0)
  let fu: UnitMap = {};
  let evals = 0;
  const f = (x: number): number => {
    if (++evals > MAX_INTEGRAND_EVALS) {
      throw new Error('integral(): did not converge — is the integrand discontinuous or singular?');
    }
    const q = at({ v: x, u: xu });
    if (!isFinite(q.v)) throw new Error(`integral(): integrand is not finite at ${x}`);
    if (Object.keys(q.u).length > 0) {
      if (Object.keys(fu).length === 0) fu = q.u;
      else if (!eqU(fu, q.u)) {
        throw new Error(
          `integral(): integrand unit changes (${formatUnit(fu)} ≠ ${formatUnit(q.u)})`,
        );
      }
    }
    return q.v;
  };

  const a = lo.v, b = hi.v;
  if (a === b) {
    f(a); // still resolve the integrand's unit
    return { v: 0, u: mulU(fu, xu) };
  }
  const simpson = (x0: number, x1: number, f0: number, fm: number, f1: number) =>
    (x1 - x0) / 6 * (f0 + 4 * fm + f1);
  const rec = (
    x0: number,
    x1: number,
    f0: number,
    fm: number,
    f1: number,
    whole: number,
    eps: number,
    depth: number,
  ): number => {
    const m = (x0 + x1) / 2;
    const flm = f((x0 + m) / 2), frm = f((m + x1) / 2);
    const left = simpson(x0, m, f0, flm, fm), right = simpson(m, x1, fm, frm, f1);
    const delta = left + right - whole;
    if (depth >= 4 && (Math.abs(delta) <= 15 * eps || depth >= 50)) {
      return left + right + delta / 15;
    }
    return rec(x0, m, f0, flm, fm, left, eps / 2, depth + 1) +
      rec(m, x1, fm, frm, f1, right, eps / 2, depth + 1);
  };
  const fa = f(a), fb = f(b), fm = f((a + b) / 2);
  const whole = simpson(a, b, fa, fm, fb);
  // Tolerance scale from a spread of samples, not just the ends and middle — sin(x) over 0…2π is 0 at
  // all three, which made the target tolerance ~0 and the recursion never settle.
  let peak = Math.max(Math.abs(fa), Math.abs(fm), Math.abs(fb));
  for (let k = 1; k < 16; k++) peak = Math.max(peak, Math.abs(f(a + (b - a) * k / 16)));
  const scale = Math.max(peak, 1e-300) * Math.abs(b - a);
  const v = rec(a, b, fa, fm, fb, whole, 1e-10 * scale, 0);
  return { v, u: mulU(fu, xu) };
}

// ---------------------------------------------------------------------------
// Parser / evaluator — returns Quantity (value + unit)
// ---------------------------------------------------------------------------
// Grammar (highest precedence last):
//   compare → arithmetic (CMP_OP arithmetic)?   ← returns 0 or 1 (dimensionless)
//   arithmetic → addend  (('+' | '-') addend)*
//   addend  → tagged     (('*' | '/' | '.*') tagged)*   ← '.*' = matrix product
//   tagged  → '-' tagged | power (UNIT ('^' unary)?)?  ← [unit] declares the unit; -x^2 = -(x^2)
//   unary   → '-' unary  | power                 ← exponents only: 2^-1
//   power   → atom       ('^' unary)?            ← right-associative
//   atom    → NUM | '(' compare ')' | ID '(' arglist ')' | ID
//   arglist → compare (',' compare)*

class Parser {
  private pos = 0;
  constructor(private toks: Tok[], private scope: Scope, private fnScope: FnScope = {}) {}

  peek(): Tok {
    return this.toks[this.pos];
  }
  eat(): Tok {
    return this.toks[this.pos++];
  }
  need(t: TT): Tok {
    const tok = this.eat();
    if (tok.t !== t) throw new Error(`Expected ${t}, got '${tok.v}'`);
    return tok;
  }

  /**
   * sum(expr, i, a, b) · prod(expr, i, a, b) · integral(expr, x, a, b). The name is consumed and
   * LPAREN is next. `expr` must be re-evaluated for every value of the bound variable, so its tokens
   * are captured unevaluated (balanced-paren scan to the first top-level comma) and replayed through
   * a fresh Parser with the variable added to scope.
   */
  private bigOp(name: string): Quantity {
    const usage = `${name}(expression, variable, from, to)`;
    this.need('LPAREN');
    const start = this.pos;
    let depth = 0;
    for (;;) {
      const t = this.peek().t;
      if (t === 'EOF') throw new Error(`${name}(): missing ')' — ${usage}`);
      if (depth === 0 && (t === 'COMMA' || t === 'RPAREN')) break;
      if (t === 'LPAREN' || t === 'LBRACE') depth++;
      else if (t === 'RPAREN' || t === 'RBRACE') depth--;
      this.eat();
    }
    const body = this.toks.slice(start, this.pos);
    if (body.length === 0 || this.peek().t !== 'COMMA') throw new Error(`Usage: ${usage}`);
    this.eat();
    const vTok = this.eat();
    if (vTok.t !== 'ID' || vTok.v.startsWith('\\')) {
      throw new Error(`${name}(): 2nd argument must be the variable name — ${usage}`);
    }
    this.need('COMMA');
    const lo = noMatrix(this.compare(), `${name}() limit`);
    this.need('COMMA');
    const hi = noMatrix(this.compare(), `${name}() limit`);
    this.need('RPAREN');

    const at = (q: Quantity): Quantity => {
      const p = new Parser(
        [...body, { t: 'EOF', v: '' }],
        { ...this.scope, [vTok.v]: q },
        this.fnScope,
      );
      const r = p.compare();
      if (p.peek().t !== 'EOF') throw new Error(`${name}(): unexpected input in the expression`);
      return noMatrix(r, `${name}()`);
    };
    if (name === 'integral') return integrate(at, lo, hi);
    if (name === 'findroot') return findRoot(at, lo, hi);
    return sumOrProd(name, at, lo, hi);
  }

  /**
   * `{{a, b}, {c, d}}` — rows of elements, all rows the same length. A flat `{a, b, c}` is a COLUMN
   * vector (3×1), the shape of u and F in K·u = F; a row vector is `{{a, b, c}}`. Elements are any
   * single-valued expression, each with its own unit: `{{12 [kip/in], -6 [kip]}, …}`.
   */
  private matrixLiteral(): Quantity {
    this.need('LBRACE');
    if (this.peek().t === 'RBRACE') throw new Error('Empty matrix {}');
    const readRow = (): Quantity[] => {
      const row = [noMatrix(this.compare(), 'A matrix element')];
      while (this.peek().t === 'COMMA') {
        this.eat();
        row.push(noMatrix(this.compare(), 'A matrix element'));
      }
      return row;
    };
    let rows: Quantity[][];
    if (this.peek().t === 'LBRACE') {
      rows = [];
      for (;;) {
        this.need('LBRACE');
        rows.push(readRow());
        this.need('RBRACE');
        if (this.peek().t !== 'COMMA') break;
        this.eat();
      }
      const n = rows[0].length;
      const bad = rows.findIndex((r) => r.length !== n);
      if (bad >= 0) {
        const k = rows[bad].length;
        throw new Error(
          `Matrix row ${bad + 1} has ${k} element${k === 1 ? '' : 's'}; row 1 has ${n}`,
        );
      }
    } else {
      rows = readRow().map((x) => [x]); // flat list → column vector
    }
    this.need('RBRACE');
    return matrixOf(rows);
  }

  // Top-level: comparison (returns 0 or 1) or plain arithmetic
  compare(): Quantity {
    const q = this.arithmetic();
    if (CMP_OPS.includes(this.peek().t)) {
      noMatrix(q, 'A comparison');
      const op = this.eat().t;
      const r = noMatrix(this.arithmetic(), 'A comparison');
      let result: boolean;
      const EPS = 1e-12;
      switch (op) {
        case 'EQ':
          result = Math.abs(q.v - r.v) <= EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case 'NEQ':
          result = Math.abs(q.v - r.v) > EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case 'LT':
          result = q.v < r.v;
          break;
        case 'GT':
          result = q.v > r.v;
          break;
        case 'LEQ':
          result = q.v <= r.v;
          break;
        case 'GEQ':
          result = q.v >= r.v;
          break;
        default:
          result = false;
      }
      return { v: result ? 1 : 0, u: {}, isTest: true };
    }
    return q;
  }

  arithmetic(): Quantity {
    let q = this.addend();
    while (this.peek().t === 'PLUS' || this.peek().t === 'MINUS') {
      const op = this.eat().t;
      const r = this.addend();
      q = combine(q, r, op === 'PLUS' ? '+' : '-');
    }
    return q;
  }

  addend(): Quantity {
    let q = this.tagged();
    while (this.peek().t === 'STAR' || this.peek().t === 'SLASH' || this.peek().t === 'DOTSTAR') {
      const op = this.eat().t;
      const r = this.tagged();
      q = op === 'DOTSTAR' ? matMul(q, r) : combine(q, r, op === 'STAR' ? '*' : '/');
    }
    return q;
  }

  // Kept above power() so `x^2 [in^2]` tags x^2, not the exponent. A leading minus is taken here,
  // OUTSIDE the tag and its power, so `-3 [in]^2` = -(3 in)^2 = -9 in², consistent with -x^2.
  tagged(): Quantity {
    if (this.peek().t === 'MINUS') {
      this.eat();
      const q = this.tagged();
      return mapQ(q, (x) => ({ v: -x.v, u: x.u })); // -A negates every element
    }
    const q = this.power();
    if (this.peek().t !== 'UNIT') return q;
    // `{…} [kip]` gives every element that unit (declares, no conversion — same as for a number)
    const tagU = parseUnitExpr(this.eat().v);
    const t = mapQ(q, (x) => ({ v: x.v, u: tagU }));
    // `3 [in]^2` — allow a power on the tagged quantity
    if (this.peek().t === 'CARET') {
      this.eat();
      noMatrix(t, 'A power');
      const exp = noMatrix(this.unary(), 'An exponent');
      if (Object.keys(exp.u).length > 0) {
        throw new Error(`Exponent must be dimensionless (got ${formatUnit(exp.u)})`);
      }
      return { v: Math.pow(t.v, exp.v), u: powU(t.u, exp.v) };
    }
    return t;
  }

  // Unary minus binds LOOSER than '^' (standard math, Mathcad, MATLAB): -x^2 = -(x^2), -2^2 = -4.
  // Before 2026-09-22 the order was reversed and -x^2 silently evaluated as (+x^2).
  unary(): Quantity {
    if (this.peek().t === 'MINUS') {
      this.eat();
      const q = this.unary();
      return mapQ(q, (x) => ({ v: -x.v, u: x.u }));
    }
    return this.power();
  }

  // Exponent is a unary(), so 2^-1 = 0.5 and 2^3^2 = 2^9 (right-associative).
  power(): Quantity {
    const base = this.atom();
    if (this.peek().t === 'CARET') {
      this.eat();
      noMatrix(base, 'A power');
      const exp = noMatrix(this.unary(), 'An exponent');
      if (Object.keys(exp.u).length > 0) {
        throw new Error(`Exponent must be dimensionless (got ${formatUnit(exp.u)})`);
      }
      return { v: Math.pow(base.v, exp.v), u: powU(base.u, exp.v) };
    }
    return base;
  }

  atom(): Quantity {
    const tok = this.peek();

    if (tok.t === 'NUM') {
      this.eat();
      return { v: parseFloat(tok.v), u: {} };
    }

    if (tok.t === 'LPAREN') {
      this.eat();
      const q = this.compare();
      this.need('RPAREN');
      return q;
    }

    if (tok.t === 'LBRACE') return this.matrixLiteral();

    if (tok.t === 'ID') {
      this.eat();
      const name = tok.v;

      // sum / prod / integral — unless the sheet defines its own function by that name
      if (this.peek().t === 'LPAREN' && BIG_OPS.has(name) && !(name in this.fnScope)) {
        return this.bigOp(name);
      }

      if (this.peek().t === 'LPAREN') {
        this.eat();
        // Collect argument list
        const args: Quantity[] = [];
        if (this.peek().t !== 'RPAREN') {
          args.push(this.compare());
          while (this.peek().t === 'COMMA') {
            this.eat();
            args.push(this.compare());
          }
        }
        this.need('RPAREN');

        // ── Functions taking any number of arguments, or a matrix ─────────────
        if (!(name in this.fnScope)) {
          if (name === 'min' || name === 'max') return minMax(name, args);
          if (name === 'interp') return interp(args);
        }

        // ── Matrix functions (unless the sheet defines its own of that name) ──
        if (name in MATRIX_FNS && !(name in this.fnScope)) {
          const fn = MATRIX_FNS[name];
          if (args.length !== fn.arity) {
            throw new Error(`${name}() takes ${fn.arity} argument${fn.arity === 1 ? '' : 's'}`);
          }
          return fn.run(args);
        }

        // All other functions (built-in and user-defined) take single values only.
        for (const a of args) noMatrix(a, `${name}()`);

        // ── Single-arg functions ────────────────────────────────────────────
        if (args.length === 1) {
          const arg = args[0];

          // Logical not: not(x) → 1 if x==0, else 0
          if (name === 'not') return { v: arg.v === 0 ? 1 : 0, u: {} };

          if (name === 'sqrt') {
            return { v: Math.sqrt(arg.v), u: powU(arg.u, 0.5) };
          }
          if (name === 'cbrt') {
            return { v: Math.cbrt(arg.v), u: powU(arg.u, 1 / 3) };
          }
          if (PRESERVE_FN[name]) {
            return { v: PRESERVE_FN[name](arg.v), u: arg.u };
          }
          if (ANGLE_FN[name]) {
            return { v: ANGLE_FN[name](asRadians(arg, name)), u: {} };
          }
          if (MATH_FN[name]) {
            if (Object.keys(arg.u).length > 0) {
              throw new Error(
                `${name}() requires dimensionless argument, got ${formatUnit(arg.u)}`,
              );
            }
            return { v: MATH_FN[name](arg.v), u: {} };
          }
          if (name in this.fnScope) {
            const fn = this.fnScope[name];
            const innerScope: Scope = { ...this.scope, [fn.param]: arg };
            let result = evalExpr(fn.expr, innerScope, this.fnScope);
            if (fn.targetUnit) result = applyTargetUnit(result, fn.targetUnit);
            return result;
          }
        }

        // ── Two-arg functions ───────────────────────────────────────────────
        if (args.length === 2) {
          const [a, b] = args;
          // Logical: and(a,b) or(a,b) xor(a,b)
          if (name === 'and') return { v: (a.v !== 0 && b.v !== 0) ? 1 : 0, u: {} };
          if (name === 'or') return { v: (a.v !== 0 || b.v !== 0) ? 1 : 0, u: {} };
          if (name === 'xor') return { v: ((a.v !== 0) !== (b.v !== 0)) ? 1 : 0, u: {} };
          if (name === 'min') return { v: Math.min(a.v, b.v), u: addU(a.u, b.u) };
          if (name === 'max') return { v: Math.max(a.v, b.v), u: addU(a.u, b.u) };
          if (name === 'atan2') {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error('atan2() requires dimensionless arguments');
            }
            return { v: Math.atan2(a.v, b.v), u: {} };
          }
          if (name === 'mod') return { v: ((a.v % b.v) + b.v) % b.v, u: {} };
          if (name === 'round' || name === 'roundup' || name === 'rounddown') {
            return roundTo(name, a, b);
          }
          // log(x, base) = log_base(x). One-arg log(x) stays the natural log.
          if (name === 'log') {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error('log(x, base) requires dimensionless arguments');
            }
            if (!(b.v > 0) || b.v === 1) {
              throw new Error(`log base must be positive and not 1 (got ${b.v})`);
            }
            return { v: Math.log(a.v) / Math.log(b.v), u: {} };
          }
          if (name === 'pow') {
            if (Object.keys(b.u).length > 0) {
              throw new Error('pow() exponent must be dimensionless');
            }
            return { v: Math.pow(a.v, b.v), u: powU(a.u, b.v) };
          }
          if (name === 'hypot') {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error('hypot() requires dimensionless arguments');
            }
            return { v: Math.hypot(a.v, b.v), u: {} };
          }
          if (name === 'comb') {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error('comb() requires dimensionless arguments');
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error('comb(n,k) requires non-negative integers with k ≤ n');
            }
            // n! / (k! * (n-k)!)  computed without overflow risk for moderate n
            let r = 1;
            for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
            return { v: Math.round(r), u: {} };
          }
          if (name === 'perm') {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error('perm() requires dimensionless arguments');
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error('perm(n,k) requires non-negative integers with k ≤ n');
            }
            let r = 1;
            for (let i = 0; i < k; i++) r *= n - i;
            return { v: r, u: {} };
          }
        }

        // ── Three-arg functions ─────────────────────────────────────────────
        if (args.length === 3 && name === 'if') {
          const [cond, thenVal, elseVal] = args;
          return cond.v !== 0 ? thenVal : elseVal;
        }
        if (args.length === 3 && name === 'clamp') {
          const [x, lo, hi] = args;
          return { v: Math.min(Math.max(x.v, lo.v), hi.v), u: addU(x.u, addU(lo.u, hi.u)) };
        }

        // User-defined single-arg function (fallback after built-ins)
        if (args.length === 1 && name in this.fnScope) {
          const fn = this.fnScope[name];
          const innerScope: Scope = { ...this.scope, [fn.param]: args[0] };
          let result = evalExpr(fn.expr, innerScope, this.fnScope);
          if (fn.targetUnit) result = applyTargetUnit(result, fn.targetUnit);
          return result;
        }

        throw new Error(`Unknown function or wrong argument count: ${name}(${args.length} args)`);
      }

      if (MARKED_CONST[name] !== undefined) return { v: MARKED_CONST[name], u: {} };
      if (PLAIN_CONST[name] !== undefined) return { v: PLAIN_CONST[name], u: {} };
      if (this.scope[name] !== undefined) return this.scope[name];

      throw new Error(`Undefined: ${name}`);
    }

    throw new Error(`Unexpected token: '${tok.v}'`);
  }
}

export function evalExpr(src: string, scope: Scope, fnScope: FnScope = {}): Quantity {
  const toks = lex(src.trim());
  const p = new Parser(toks, scope, fnScope);
  const q = p.compare();
  if (p.peek().t !== 'EOF') throw new Error('Unexpected input after expression');
  return q;
}

// ---------------------------------------------------------------------------
// Public API — flat statement evaluation
// ---------------------------------------------------------------------------

/**
 * Parse and evaluate a semicolon-separated list of statements.
 * Each statement is either:
 *   varName = expression [unit]   (assignment — writes result to scope)
 *   expression [unit]             (bare — result shown but not assigned)
 *
 * A [unit] annotation tags the result with the given unit (overrides propagated
 * units — useful for base quantities like "b = 150 [mm]"). Derived quantities
 * receive their units automatically via propagation.
 *
 * Scope is mutated in-place so results flow forward into later statements.
 */
/** A statement's trailing `[unit]` (declare) and `[[unit]]` (convert). A matrix takes the declared
 *  unit on every element; converting a matrix is not supported yet and says so. */
function applyStatementUnits(q: Quantity, tag?: UnitMap, target?: UnitMap): Quantity {
  // `P_u != 0 [kip]` — the tag belongs to the 0 being compared against, not to the pass/fail.
  // Labelling a 1 as "1 kip" was meaningless; the comparison itself is unaffected.
  if (q.isTest) return q;
  // The legacy whole-result tag would silently overwrite a matrix's own per-element units
  // (`Km / 2 [in]` turned every element into "in"). Allow it only on a matrix whose elements are
  // still unitless (`{{12, -6}, {-6, 4}} [kip/in]`); otherwise the unit belongs next to its number.
  if (tag !== undefined && q.m?.some((row) => row.some((x) => Object.keys(x.u).length > 0))) {
    throw new Error(
      'A trailing [unit] would relabel every element of a matrix that already has units — ' +
        'put the unit next to its number, e.g. Km / (2 [in])',
    );
  }
  if (tag !== undefined) q = mapQ(q, (x) => ({ v: x.v, u: tag }));
  if (target !== undefined) q = applyTargetUnit(noMatrix(q, 'Unit conversion [[…]]'), target);
  return q;
}

export function evalStatements(src: string, scope: Scope, fnScope: FnScope = {}): Statement[] {
  const results: Statement[] = [];

  for (const raw of src.split(';')) {
    const s = raw.trim();
    if (!s) continue;

    // Strip [[targetUnit]] first — double-bracket means "convert result to this unit"
    let targetUnit: UnitMap | undefined;
    let stmt = stripGreekMarks(s); // raw (s) keeps the marker for display
    const targetMatch = stmt.match(/\[\[([^\]]+)\]\]\s*$/);
    if (targetMatch) {
      targetUnit = parseUnitExpr(targetMatch[1]);
      stmt = stmt.slice(0, targetMatch.index!).trim();
    }

    // Strip optional [unit] tag — single-bracket declares/overrides unit, no conversion.
    // Only when it is the sole tag: with inline tags (`a + 1 [in] + 2 [in]`) every tag,
    // including the last, binds to its own term and is left for the parser.
    let tagUnit: UnitMap | undefined;
    let tagText = '';
    const unitMatch = stmt.match(/\[([^\]]+)\]\s*$/);
    if (unitMatch && !stmt.slice(0, unitMatch.index!).includes('[')) {
      tagUnit = parseUnitExpr(unitMatch[1]);
      tagText = unitMatch[0].trim();
      stmt = stmt.slice(0, unitMatch.index!).trim();
    }

    // Function definition: f(x) = expr  — stored in fnScope, no numeric result
    // `=(?!=)` so the comparison `f(x) == 3` is not taken as defining f.
    const fnDefMatch = stmt.match(/^([a-zA-Z_]\w*)\s*\(([a-zA-Z_]\w*)\)\s*=(?!=)\s*(.+)$/);
    if (fnDefMatch) {
      const [, fnName, param] = fnDefMatch;
      // A trailing tag belongs to the BODY of a definition — `f(x) = x * 12 [in/ft]` must keep its
      // in/ft. It used to be stripped as a whole-result tag and then dropped here, so the function
      // silently computed without that unit (found by the test suite, 2026-09-23).
      const fnExpr = (fnDefMatch[3] + (tagText ? ' ' + tagText : '')).trim();
      fnScope[fnName] = { param, expr: fnExpr, ...(targetUnit && { targetUnit }) };
      results.push({
        raw: s,
        name: fnName,
        expr: fnExpr,
        value: NaN,
        unit: {},
        isFn: true,
        fnParam: param,
      });
      continue;
    }

    // The assignment '=' is a lone '=' — never part of ==, <=, >=, != (else `a == b` was read
    // as assigning "= b" to a and errored).
    const eqIdx = stmt.search(/(?<![=<>!])=(?!=)/);
    if (eqIdx > 0) {
      const name = stmt.slice(0, eqIdx).trim();
      const expr = stmt.slice(eqIdx + 1).trim();

      // Constants can't be assigned — say so, rather than let the constant silently win later.
      if (name in MARKED_CONST || name in PLAIN_CONST) {
        const what = 'π';
        results.push({
          raw: s,
          name: '',
          expr,
          value: NaN,
          unit: {},
          error: `${name} is the constant ${what} and can't be assigned — use another name`,
        });
        continue;
      }

      if (/^[a-zA-Z_]\w*$/.test(name)) {
        try {
          let q = evalExpr(expr, scope, fnScope);
          q = applyStatementUnits(q, tagUnit, targetUnit);
          scope[name] = q;
          results.push({ raw: s, name, expr, value: q.v, unit: q.u, matrix: q.m });
        } catch (e) {
          results.push({ raw: s, name, expr, value: NaN, unit: {}, error: (e as Error).message });
        }
        continue;
      }
    }

    // Bare expression
    try {
      let q = evalExpr(stmt, scope, fnScope);
      q = applyStatementUnits(q, tagUnit, targetUnit);
      results.push({ raw: s, name: '', expr: stmt, value: q.v, unit: q.u, matrix: q.m });
    } catch (e) {
      results.push({
        raw: s,
        name: '',
        expr: stmt,
        value: NaN,
        unit: {},
        error: (e as Error).message,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Block-structured formula evaluation (if/elseif/else/end + for loops)
// ---------------------------------------------------------------------------

// Internal AST node types
interface StmtNode {
  kind: 'stmt';
  rowIdx: number;
}
interface IfNode {
  kind: 'if';
  rowIdx: number;
  branches: Array<{ condRowIdx: number; cond: string; body: ASTNode[] }>;
  elseBody: ASTNode[] | null;
  elseRowIdx: number | null;
  endRowIdx: number | null;
}
interface ForNode {
  kind: 'for';
  rowIdx: number;
  endRowIdx: number | null;
  body: ASTNode[];
}
type ASTNode = StmtNode | IfNode | ForNode;

const CTRL_TYPES = new Set(['if', 'elseif', 'else', 'end', 'for']);

function parseRowsToAST(
  rows: FormulaRow[],
  start: number,
  stopTypes: string[],
): { nodes: ASTNode[]; next: number } {
  const nodes: ASTNode[] = [];
  let i = start;

  while (i < rows.length) {
    const row = rows[i];
    const rt = row.type;

    if (!rt) {
      // Regular expression row
      nodes.push({ kind: 'stmt', rowIdx: i });
      i++;
    } else if (rt === 'if') {
      const ifNode: IfNode = {
        kind: 'if',
        rowIdx: i,
        branches: [{ condRowIdx: i, cond: row.e, body: [] }],
        elseBody: null,
        elseRowIdx: null,
        endRowIdx: null,
      };
      i++;
      const thenResult = parseRowsToAST(rows, i, ['elseif', 'else', 'end']);
      ifNode.branches[0].body = thenResult.nodes;
      i = thenResult.next;

      while (i < rows.length && rows[i].type === 'elseif') {
        const elifRowIdx = i;
        const elifCond = rows[i].e;
        i++;
        const elifResult = parseRowsToAST(rows, i, ['elseif', 'else', 'end']);
        ifNode.branches.push({ condRowIdx: elifRowIdx, cond: elifCond, body: elifResult.nodes });
        i = elifResult.next;
      }
      if (i < rows.length && rows[i].type === 'else') {
        ifNode.elseRowIdx = i;
        i++;
        const elseResult = parseRowsToAST(rows, i, ['end']);
        ifNode.elseBody = elseResult.nodes;
        i = elseResult.next;
      }
      if (i < rows.length && rows[i].type === 'end') {
        ifNode.endRowIdx = i;
        i++;
      }
      nodes.push(ifNode);
    } else if (rt === 'for') {
      const forNode: ForNode = { kind: 'for', rowIdx: i, body: [], endRowIdx: null };
      i++;
      const bodyResult = parseRowsToAST(rows, i, ['end']);
      forNode.body = bodyResult.nodes;
      i = bodyResult.next;
      if (i < rows.length && rows[i].type === 'end') {
        forNode.endRowIdx = i;
        i++;
      }
      nodes.push(forNode);
    } else if (stopTypes.includes(rt)) {
      break; // stop but don't consume — caller handles it
    } else {
      // Orphaned elseif / else / end — skip gracefully
      nodes.push({ kind: 'stmt', rowIdx: i });
      i++;
    }
  }

  return { nodes, next: i };
}

/** Parse "i = start to end [step s]" header and evaluate start/end/step. */
function parseForHeader(
  header: string,
  scope: Scope,
  fnScope: FnScope,
): { varName: string; startVal: number; endVal: number; stepVal: number } {
  let mainPart = stripGreekMarks(header.trim());
  let stepExpr: string | undefined;

  // Optional "step" suffix — split from the right
  const stepMatch = mainPart.match(/^(.*)\s+step\s+([^\s].*)$/i);
  if (stepMatch) {
    mainPart = stepMatch[1].trim();
    stepExpr = stepMatch[2].trim();
  }

  // Split on last " to "
  const toIdx = mainPart.lastIndexOf(' to ');
  if (toIdx < 0) throw new Error(`for loop header missing 'to': "${header}"`);
  const lhs = mainPart.slice(0, toIdx).trim();
  const endExpr = mainPart.slice(toIdx + 4).trim();

  const eqIdx = lhs.indexOf('=');
  if (eqIdx < 0) throw new Error(`for loop header missing '=': "${header}"`);
  const varName = lhs.slice(0, eqIdx).trim();
  if (!/^[a-zA-Z_]\w*$/.test(varName)) {
    throw new Error(`Invalid loop variable: "${varName}"`);
  }
  const startExpr = lhs.slice(eqIdx + 1).trim();

  const num = (src: string) => noMatrix(evalExpr(src, scope, fnScope), 'A for-loop limit').v;
  const startVal = num(startExpr);
  const endVal = num(endExpr);
  const stepVal = stepExpr ? num(stepExpr) : (endVal >= startVal ? 1 : -1);

  if (stepVal === 0) throw new Error('for loop step cannot be zero');
  return { varName, startVal, endVal, stepVal };
}

const MAX_LOOP_ITER = 10_000;

function execNodes(
  nodes: ASTNode[],
  rows: FormulaRow[],
  scope: Scope,
  fnScope: FnScope,
  results: Statement[],
  active: boolean,
): void {
  for (const node of nodes) {
    if (node.kind === 'stmt') {
      const row = rows[node.rowIdx];
      if (!active || !row.e.trim()) {
        results[node.rowIdx] = {
          raw: row.e,
          name: '',
          expr: row.e,
          value: NaN,
          unit: {},
          active,
        };
        continue;
      }
      // Evaluate as a single flat statement
      const stmts = evalStatements(row.e, scope, fnScope);
      results[node.rowIdx] = {
        ...(stmts[0] ?? { raw: row.e, name: '', expr: row.e, value: NaN, unit: {} }),
        active: true,
      };
    } else if (node.kind === 'if') {
      let branchTaken = false;
      for (const branch of node.branches) {
        let condVal = 0;
        let condError: string | undefined;
        if (active) {
          try {
            condVal = noMatrix(evalExpr(branch.cond || '0', scope, fnScope), 'An if condition').v;
          } catch (e) {
            condError = (e as Error).message;
          }
        }
        const taken = active && !branchTaken && condVal !== 0 && !condError;
        results[branch.condRowIdx] = {
          raw: branch.cond,
          name: '',
          expr: branch.cond,
          value: condVal,
          unit: {},
          rowType: branch.condRowIdx === node.rowIdx ? 'if' : 'elseif',
          active,
          condValue: condVal,
          error: condError,
        };
        execNodes(branch.body, rows, scope, fnScope, results, taken);
        if (taken) branchTaken = true;
      }
      if (node.elseRowIdx !== null) {
        const elseTaken = active && !branchTaken;
        results[node.elseRowIdx] = {
          raw: 'else',
          name: '',
          expr: '',
          value: NaN,
          unit: {},
          rowType: 'else',
          active,
          condValue: elseTaken ? 1 : 0,
        };
        execNodes(node.elseBody!, rows, scope, fnScope, results, elseTaken);
      }
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: 'end',
          name: '',
          expr: '',
          value: NaN,
          unit: {},
          rowType: 'end',
          active,
        };
      }
    } else if (node.kind === 'for') {
      const row = rows[node.rowIdx];
      let iterCount = 0;
      let forError: string | undefined;

      if (active) {
        try {
          const { varName, startVal, endVal, stepVal } = parseForHeader(row.e, scope, fnScope);
          const dir = stepVal > 0 ? 1 : -1;
          const eps = Math.abs(stepVal) * 1e-9;
          let val = startVal;
          while (dir > 0 ? val <= endVal + eps : val >= endVal - eps) {
            if (iterCount >= MAX_LOOP_ITER) {
              forError = `Loop limit (${MAX_LOOP_ITER}) reached`;
              break;
            }
            scope[varName] = { v: val, u: {} };
            execNodes(node.body, rows, scope, fnScope, results, true);
            val += stepVal;
            iterCount++;
          }
        } catch (e) {
          forError = (e as Error).message;
          execNodes(node.body, rows, scope, fnScope, results, false);
        }
      } else {
        execNodes(node.body, rows, scope, fnScope, results, false);
      }

      results[node.rowIdx] = {
        raw: row.e,
        name: '',
        expr: row.e,
        value: iterCount,
        unit: {},
        rowType: 'for',
        active,
        error: forError,
      };
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: 'end',
          name: '',
          expr: '',
          value: NaN,
          unit: {},
          rowType: 'end',
          active,
        };
      }
    }
  }
}

/**
 * Evaluate an array of FormulaRows (with possible if/elseif/else/end/for structure).
 * Returns one Statement per input row, indexed 1:1.
 * Scope and fnScope are mutated in-place.
 */
export function evalFormulaRows(
  rows: FormulaRow[],
  scope: Scope,
  fnScope: FnScope = {},
): Statement[] {
  const results: Statement[] = rows.map((r) => ({
    raw: r.e,
    name: '',
    expr: r.e,
    value: NaN,
    unit: {},
    active: false,
  }));
  if (rows.length === 0) return results;
  const { nodes } = parseRowsToAST(rows, 0, []);
  execNodes(nodes, rows, scope, fnScope, results, true);
  return results;
}

/** Exported for use in main.ts depth computation (indentation). */
export { CTRL_TYPES };
