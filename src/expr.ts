// Recursive-descent expression evaluator with dimensional analysis.
// Supports: + - * / ^ () identifiers function-calls numbers (incl. sci notation)
// Comparison: = == != <> < > <= >=  (return 1 or 0)
// Built-in constants : pi  e  tau
// Built-in functions (1-arg): sin cos tan asin acos atan sinh cosh tanh asinh acosh atanh
//                              sqrt cbrt abs exp expm1 log log2 log10 log1p
//                              floor ceil round trunc sign degrees radians not
// Built-in functions (2-arg): min max atan2 mod hypot pow and or xor
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

/** A numeric value paired with its unit. */
export interface Quantity {
  v: number;
  u: UnitMap;
}

/** Scope maps variable names to Quantities (value + unit). */
export type Scope = Record<string, Quantity>;

/** FnScope maps user-defined function names to their parameter and expression. */
export type FnScope = Record<string, { param: string; expr: string }>;

export interface Statement {
  raw: string;      // original text of this statement
  name: string;     // assigned variable name, or '' for bare expression
  expr: string;     // right-hand side (or whole statement if bare)
  value: number;
  unit: UnitMap;    // derived unit (empty = dimensionless)
  error?: string;
  isFn?: boolean;   // true when this statement defines a user function
  fnParam?: string; // parameter name when isFn is true
  // Control-flow fields
  rowType?: 'if' | 'elseif' | 'else' | 'end' | 'for';
  active?: boolean;      // whether this row's branch/body was executed
  condValue?: number;    // for if/elseif: numeric result of condition (non-zero = true)
}

/** A single row in a formula block (JSON-serialized in block.content). */
export interface FormulaRow {
  e: string;   // expression or condition text
  d?: string;  // optional description (left column)
  ref?: string; // optional reference (right column)
  type?: 'if' | 'elseif' | 'else' | 'end' | 'for';
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
      const ci = t.indexOf('^');
      if (ci >= 0) {
        const name = t.slice(0, ci).trim();
        const exp = Number(t.slice(ci + 1).trim());
        if (name) result[name] = (result[name] ?? 0) + sign * exp;
      } else {
        result[t] = (result[t] ?? 0) + sign;
      }
    }
  }

  const si = s.indexOf('/');
  applyTerms(si >= 0 ? s.slice(0, si) : s, 1);
  if (si >= 0) applyTerms(s.slice(si + 1), -1);
  return cleanU(result);
}

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------
type TT =
  | 'NUM' | 'ID'
  | 'PLUS' | 'MINUS' | 'STAR' | 'SLASH' | 'CARET'
  | 'LPAREN' | 'RPAREN' | 'COMMA'
  | 'EQ' | 'NEQ' | 'LT' | 'GT' | 'LEQ' | 'GEQ'
  | 'EOF';
interface Tok { t: TT; v: string; }

function lex(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { i++; continue; }

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

    // Identifier
    if (/[a-zA-Z_]/.test(ch)) {
      let s = '';
      while (i < src.length && /\w/.test(src[i])) s += src[i++];
      out.push({ t: 'ID', v: s });
      continue;
    }

    // Comma
    if (ch === ',') { out.push({ t: 'COMMA', v: ',' }); i++; continue; }

    // Comparison operators
    if (ch === '=') {
      if (src[i + 1] === '=') { out.push({ t: 'EQ', v: '==' }); i += 2; }
      else { out.push({ t: 'EQ', v: '=' }); i++; }
      continue;
    }
    if (ch === '!' && src[i + 1] === '=') { out.push({ t: 'NEQ', v: '!=' }); i += 2; continue; }
    if (ch === '<') {
      if (src[i + 1] === '>') { out.push({ t: 'NEQ', v: '<>' }); i += 2; }
      else if (src[i + 1] === '=') { out.push({ t: 'LEQ', v: '<=' }); i += 2; }
      else { out.push({ t: 'LT', v: '<' }); i++; }
      continue;
    }
    if (ch === '>') {
      if (src[i + 1] === '=') { out.push({ t: 'GEQ', v: '>=' }); i += 2; }
      else { out.push({ t: 'GT', v: '>' }); i++; }
      continue;
    }

    // Single-char operators
    const ops: Record<string, TT> = {
      '+': 'PLUS', '-': 'MINUS', '*': 'STAR', '/': 'SLASH',
      '^': 'CARET', '(': 'LPAREN', ')': 'RPAREN',
    };
    if (ops[ch]) { out.push({ t: ops[ch], v: ch }); i++; continue; }

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
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
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
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}

// Functions that require dimensionless input and produce dimensionless output
const MATH_FN: Record<string, (x: number) => number> = {
  // Basic trig
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  // Hyperbolic trig
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
  // Exponential / logarithmic
  exp: Math.exp, expm1: Math.expm1,
  log: Math.log, log2: Math.log2, log10: Math.log10, log1p: Math.log1p,
  // Angle conversion
  degrees: (x) => x * (180 / Math.PI),
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
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  },
};

// Functions that preserve the unit of their argument
const PRESERVE_FN: Record<string, (x: number) => number> = {
  abs: Math.abs, floor: Math.floor, ceil: Math.ceil, round: Math.round,
  trunc: Math.trunc,
};

const CONST: Record<string, number> = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI };

const CMP_OPS: TT[] = ['EQ', 'NEQ', 'LT', 'GT', 'LEQ', 'GEQ'];

// ---------------------------------------------------------------------------
// Parser / evaluator — returns Quantity (value + unit)
// ---------------------------------------------------------------------------
// Grammar (highest precedence last):
//   compare → arithmetic (CMP_OP arithmetic)?   ← returns 0 or 1 (dimensionless)
//   arithmetic → addend  (('+' | '-') addend)*
//   addend  → power      (('*' | '/') power)*
//   power   → unary      ('^' power)?            ← right-associative
//   unary   → '-' unary  | atom
//   atom    → NUM | '(' compare ')' | ID '(' arglist ')' | ID
//   arglist → compare (',' compare)*

class Parser {
  private pos = 0;
  constructor(private toks: Tok[], private scope: Scope, private fnScope: FnScope = {}) {}

  peek(): Tok { return this.toks[this.pos]; }
  eat(): Tok  { return this.toks[this.pos++]; }
  need(t: TT): Tok {
    const tok = this.eat();
    if (tok.t !== t) throw new Error(`Expected ${t}, got '${tok.v}'`);
    return tok;
  }

  // Top-level: comparison (returns 0 or 1) or plain arithmetic
  compare(): Quantity {
    const q = this.arithmetic();
    if (CMP_OPS.includes(this.peek().t)) {
      const op = this.eat().t;
      const r = this.arithmetic();
      let result: boolean;
      const EPS = 1e-12;
      switch (op) {
        case 'EQ':  result = Math.abs(q.v - r.v) <= EPS * (Math.abs(q.v) + Math.abs(r.v) + 1); break;
        case 'NEQ': result = Math.abs(q.v - r.v) >  EPS * (Math.abs(q.v) + Math.abs(r.v) + 1); break;
        case 'LT':  result = q.v <  r.v; break;
        case 'GT':  result = q.v >  r.v; break;
        case 'LEQ': result = q.v <= r.v; break;
        case 'GEQ': result = q.v >= r.v; break;
        default: result = false;
      }
      return { v: result ? 1 : 0, u: {} };
    }
    return q;
  }

  arithmetic(): Quantity {
    let q = this.addend();
    while (this.peek().t === 'PLUS' || this.peek().t === 'MINUS') {
      const op = this.eat().t;
      const r = this.addend();
      const u = addU(q.u, r.u);
      q = { v: op === 'PLUS' ? q.v + r.v : q.v - r.v, u };
    }
    return q;
  }

  addend(): Quantity {
    let q = this.power();
    while (this.peek().t === 'STAR' || this.peek().t === 'SLASH') {
      const op = this.eat().t;
      const r = this.power();
      q = op === 'STAR'
        ? { v: q.v * r.v, u: mulU(q.u, r.u) }
        : { v: q.v / r.v, u: divU(q.u, r.u) };
    }
    return q;
  }

  power(): Quantity {
    const base = this.unary();
    if (this.peek().t === 'CARET') {
      this.eat();
      const exp = this.power(); // right-associative
      if (Object.keys(exp.u).length > 0) {
        throw new Error(`Exponent must be dimensionless (got ${formatUnit(exp.u)})`);
      }
      return { v: Math.pow(base.v, exp.v), u: powU(base.u, exp.v) };
    }
    return base;
  }

  unary(): Quantity {
    if (this.peek().t === 'MINUS') {
      this.eat();
      const q = this.unary();
      return { v: -q.v, u: q.u };
    }
    return this.atom();
  }

  atom(): Quantity {
    const tok = this.peek();

    if (tok.t === 'NUM') { this.eat(); return { v: parseFloat(tok.v), u: {} }; }

    if (tok.t === 'LPAREN') {
      this.eat();
      const q = this.compare();
      this.need('RPAREN');
      return q;
    }

    if (tok.t === 'ID') {
      this.eat();
      const name = tok.v;

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
          if (MATH_FN[name]) {
            if (Object.keys(arg.u).length > 0) {
              throw new Error(`${name}() requires dimensionless argument, got ${formatUnit(arg.u)}`);
            }
            return { v: MATH_FN[name](arg.v), u: {} };
          }
          if (name in this.fnScope) {
            const fn = this.fnScope[name];
            const innerScope: Scope = { ...this.scope, [fn.param]: arg };
            return evalExpr(fn.expr, innerScope, this.fnScope);
          }
        }

        // ── Two-arg functions ───────────────────────────────────────────────
        if (args.length === 2) {
          const [a, b] = args;
          // Logical: and(a,b) or(a,b) xor(a,b)
          if (name === 'and') return { v: (a.v !== 0 && b.v !== 0) ? 1 : 0, u: {} };
          if (name === 'or')  return { v: (a.v !== 0 || b.v !== 0) ? 1 : 0, u: {} };
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
          if (name === 'pow') {
            if (Object.keys(b.u).length > 0) throw new Error('pow() exponent must be dimensionless');
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
            for (let i = 0; i < k; i++) r *= (n - i);
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
          return evalExpr(fn.expr, innerScope, this.fnScope);
        }

        throw new Error(`Unknown function or wrong argument count: ${name}(${args.length} args)`);
      }

      if (CONST[name] !== undefined) return { v: CONST[name], u: {} };
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
export function evalStatements(src: string, scope: Scope, fnScope: FnScope = {}): Statement[] {
  const results: Statement[] = [];

  for (const raw of src.split(';')) {
    const s = raw.trim();
    if (!s) continue;

    // Strip optional unit tag [unit] from end — overrides propagated unit
    let tagUnit: UnitMap | undefined;
    let stmt = s;
    const unitMatch = s.match(/\[([^\]]+)\]\s*$/);
    if (unitMatch) {
      tagUnit = parseUnitExpr(unitMatch[1]);
      stmt = s.slice(0, unitMatch.index!).trim();
    }

    // Function definition: f(x) = expr  — stored in fnScope, no numeric result
    const fnDefMatch = stmt.match(/^([a-zA-Z_]\w*)\s*\(([a-zA-Z_]\w*)\)\s*=\s*(.+)$/);
    if (fnDefMatch) {
      const [, fnName, param, fnExpr] = fnDefMatch;
      fnScope[fnName] = { param, expr: fnExpr.trim() };
      results.push({ raw: s, name: fnName, expr: fnExpr.trim(), value: NaN, unit: {}, isFn: true, fnParam: param });
      continue;
    }

    const eqIdx = stmt.indexOf('=');
    if (eqIdx > 0) {
      const name = stmt.slice(0, eqIdx).trim();
      const expr = stmt.slice(eqIdx + 1).trim();

      if (/^[a-zA-Z_]\w*$/.test(name)) {
        try {
          let q = evalExpr(expr, scope, fnScope);
          if (tagUnit !== undefined) q = { v: q.v, u: tagUnit };
          scope[name] = q;
          results.push({ raw: s, name, expr, value: q.v, unit: q.u });
        } catch (e) {
          results.push({ raw: s, name, expr, value: NaN, unit: {}, error: (e as Error).message });
        }
        continue;
      }
    }

    // Bare expression
    try {
      let q = evalExpr(stmt, scope, fnScope);
      if (tagUnit !== undefined) q = { v: q.v, u: tagUnit };
      results.push({ raw: s, name: '', expr: stmt, value: q.v, unit: q.u });
    } catch (e) {
      results.push({ raw: s, name: '', expr: stmt, value: NaN, unit: {}, error: (e as Error).message });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Block-structured formula evaluation (if/elseif/else/end + for loops)
// ---------------------------------------------------------------------------

// Internal AST node types
interface StmtNode { kind: 'stmt'; rowIdx: number }
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
  let mainPart = header.trim();
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

  const startVal = evalExpr(startExpr, scope, fnScope).v;
  const endVal   = evalExpr(endExpr,   scope, fnScope).v;
  const stepVal  = stepExpr
    ? evalExpr(stepExpr, scope, fnScope).v
    : (endVal >= startVal ? 1 : -1);

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
          raw: row.e, name: '', expr: row.e, value: NaN, unit: {}, active,
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
            condVal = evalExpr(branch.cond || '0', scope, fnScope).v;
          } catch (e) {
            condError = (e as Error).message;
          }
        }
        const taken = active && !branchTaken && condVal !== 0 && !condError;
        results[branch.condRowIdx] = {
          raw: branch.cond, name: '', expr: branch.cond, value: condVal, unit: {},
          rowType: branch.condRowIdx === node.rowIdx ? 'if' : 'elseif',
          active, condValue: condVal, error: condError,
        };
        execNodes(branch.body, rows, scope, fnScope, results, taken);
        if (taken) branchTaken = true;
      }
      if (node.elseRowIdx !== null) {
        const elseTaken = active && !branchTaken;
        results[node.elseRowIdx] = {
          raw: 'else', name: '', expr: '', value: NaN, unit: {},
          rowType: 'else', active, condValue: elseTaken ? 1 : 0,
        };
        execNodes(node.elseBody!, rows, scope, fnScope, results, elseTaken);
      }
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: 'end', name: '', expr: '', value: NaN, unit: {},
          rowType: 'end', active,
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
        raw: row.e, name: '', expr: row.e, value: iterCount, unit: {},
        rowType: 'for', active, error: forError,
      };
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: 'end', name: '', expr: '', value: NaN, unit: {},
          rowType: 'end', active,
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
    raw: r.e, name: '', expr: r.e, value: NaN, unit: {}, active: false,
  }));
  if (rows.length === 0) return results;
  const { nodes } = parseRowsToAST(rows, 0, []);
  execNodes(nodes, rows, scope, fnScope, results, true);
  return results;
}

/** Exported for use in main.ts depth computation (indentation). */
export { CTRL_TYPES };
