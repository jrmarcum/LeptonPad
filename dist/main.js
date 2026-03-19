// src/solver.ts
var exp;
async function init() {
  const { instance } = await WebAssembly.instantiateStreaming(fetch("./solver.wasm"));
  exp = instance.exports;
}
var rect_area = (b, h) => exp.rect_area(b, h);
var rect_ix = (b, h) => exp.rect_ix(b, h);
var solve_beam_deflection = (p, l, e, i) => exp.solve_beam_deflection(p, l, e, i);

// src/types.ts
var DEFAULT_PLOT = {
  expr: "sin(x)",
  xVar: "x",
  xMin: 0,
  xMax: 6.2832,
  nPts: 200,
  xLabel: "x",
  yLabel: "y",
  markers: []
};
var GRID_SIZE = 20;
var PX_PER_IN = 96;
var PX_PER_MM = PX_PER_IN / 25.4;
var TITLE_BLOCK_H = 112;
var PAGE_SIZES = {
  a4: {
    label: "A4",
    w: Math.round(210 * PX_PER_MM),
    h: Math.round(297 * PX_PER_MM)
  },
  a3: {
    label: "A3",
    w: Math.round(297 * PX_PER_MM),
    h: Math.round(420 * PX_PER_MM)
  },
  letter: {
    label: "Letter",
    w: Math.round(8.5 * PX_PER_IN),
    h: Math.round(11 * PX_PER_IN)
  },
  legal: {
    label: "Legal",
    w: Math.round(8.5 * PX_PER_IN),
    h: Math.round(14 * PX_PER_IN)
  },
  tabloid: {
    label: "Tabloid",
    w: Math.round(11 * PX_PER_IN),
    h: Math.round(17 * PX_PER_IN)
  }
};

// src/state.ts
var CANVAS_W = PAGE_SIZES.letter.w;
var PAGE_H = PAGE_SIZES.letter.h;
var numPages = 1;
var CANVAS_H = PAGE_H;
var marginUnit = "in";
var margins = {
  top: Math.round(0.25 * PX_PER_IN),
  bottom: Math.round(0.25 * PX_PER_IN),
  left: Math.round(0.75 * PX_PER_IN),
  right: Math.round(0.25 * PX_PER_IN)
};
var titleBlockEnabled = false;
var pageNumberingEnabled = true;
function titleBlockH() {
  return titleBlockEnabled ? TITLE_BLOCK_H : 0;
}
function setCANVAS_W(v) {
  CANVAS_W = v;
}
function setPAGE_H(v) {
  PAGE_H = v;
}
function setNumPages(v) {
  numPages = v;
}
function setCANVAS_H(v) {
  CANVAS_H = v;
}
function setMarginUnit(v) {
  marginUnit = v;
}
function setTitleBlockEnabled(v) {
  titleBlockEnabled = v;
}
function setPageNumberingEnabled(v) {
  pageNumberingEnabled = v;
}
var state = {
  projectName: "Untitled Project",
  blocks: [],
  constants: {
    E: 2e5
  }
};
var globalScope = {};
var globalFnScope = {};
var sectionSummaryVarNames = /* @__PURE__ */ new Map();
var sectionSummaryComparisons = /* @__PURE__ */ new Map();
var childToSection = /* @__PURE__ */ new Map();
var deletionStack = [];
var CUSTOM_MODULES_KEY = "mathwasm-custom-modules";
var customModules = (() => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_MODULES_KEY) ?? "[]");
  } catch {
    return [];
  }
})();
function saveCustomModules() {
  localStorage.setItem(CUSTOM_MODULES_KEY, JSON.stringify(customModules));
}
function setCustomModules(v) {
  customModules = v;
}
var fileHandle = null;
function setFileHandle(v) {
  fileHandle = v;
}
var canvas = null;
function setCanvas(c) {
  canvas = c;
}
var selectedEl = null;
function setSelectedEl(v) {
  selectedEl = v;
}
var selectedEls = /* @__PURE__ */ new Set();
var multiDragState = null;
function setMultiDragState(v) {
  multiDragState = v;
}
var bandState = null;
function setBandState(v) {
  bandState = v;
}
var skipNextCanvasClick = false;
function setSkipNextCanvasClick(v) {
  skipNextCanvasClick = v;
}
var bandEl = null;
function setBandEl(v) {
  bandEl = v;
}
var gridCursor = {
  x: 0,
  y: 0
};
var onSectionSummaryUpdate = null;
var onRefreshAllSectionHeights = null;
var onSelectBlock = null;
var onMoveGridCursor = null;
var onUpdatePageCount = null;
var onSyncPageSeparators = null;
var onClearSelection = null;
var onAddToSelection = null;
var onRefreshCustomModulesList = null;
var onAppendCustomModuleToSidebar = null;
function setOnSectionSummaryUpdate(fn) {
  onSectionSummaryUpdate = fn;
}
function setOnRefreshAllSectionHeights(fn) {
  onRefreshAllSectionHeights = fn;
}
function setOnSelectBlock(fn) {
  onSelectBlock = fn;
}
function setOnMoveGridCursor(fn) {
  onMoveGridCursor = fn;
}
function setOnUpdatePageCount(fn) {
  onUpdatePageCount = fn;
}
function setOnSyncPageSeparators(fn) {
  onSyncPageSeparators = fn;
}
function setOnClearSelection(fn) {
  onClearSelection = fn;
}
function setOnAddToSelection(fn) {
  onAddToSelection = fn;
}
function setOnRefreshCustomModulesList(fn) {
  onRefreshCustomModulesList = fn;
}
function setOnAppendCustomModuleToSidebar(fn) {
  onAppendCustomModuleToSidebar = fn;
}

// src/utils/units.ts
function mmToPx(mm) {
  return Math.round(mm * PX_PER_MM);
}
function inToPx(inches) {
  return Math.round(inches * PX_PER_IN);
}
function pxToMm(px) {
  return parseFloat((px / PX_PER_MM).toFixed(1));
}
function pxToIn(px) {
  return parseFloat((px / PX_PER_IN).toFixed(3));
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function pxToUnit(px) {
  return marginUnit === "mm" ? pxToMm(px) : pxToIn(px);
}
function unitToPx(val) {
  return marginUnit === "mm" ? mmToPx(val) : inToPx(val);
}

// src/utils/theme.ts
function isDark() {
  return globalThis.matchMedia("(prefers-color-scheme: dark)").matches;
}

// src/expr.ts
function cleanU(u) {
  const r = {};
  for (const [k, e] of Object.entries(u)) if (e !== 0) r[k] = e;
  return r;
}
function mulU(a, b) {
  const r = {
    ...a
  };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) + e;
  return cleanU(r);
}
function divU(a, b) {
  const r = {
    ...a
  };
  for (const [k, e] of Object.entries(b)) r[k] = (r[k] ?? 0) - e;
  return cleanU(r);
}
function powU(u, n) {
  if (Object.keys(u).length === 0) return u;
  const r = {};
  for (const [k, e] of Object.entries(u)) r[k] = e * n;
  return cleanU(r);
}
function eqU(a, b) {
  const ka = Object.keys(a).filter((k) => a[k] !== 0).sort();
  const kb = Object.keys(b).filter((k) => b[k] !== 0).sort();
  if (ka.length !== kb.length) return false;
  return ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}
function addU(a, b) {
  const aEmpty = Object.keys(a).length === 0;
  const bEmpty = Object.keys(b).length === 0;
  if (aEmpty) return b;
  if (bEmpty) return a;
  if (!eqU(a, b)) {
    throw new Error(`Unit mismatch: ${formatUnit(a)} \u2260 ${formatUnit(b)}`);
  }
  return a;
}
function formatUnit(u) {
  const pos = Object.entries(u).filter(([, e]) => e > 0).sort((a, b) => a[0].localeCompare(b[0]));
  const neg = Object.entries(u).filter(([, e]) => e < 0).sort((a, b) => a[0].localeCompare(b[0]));
  const fmt = ([name, exp2]) => {
    const e = Math.abs(exp2);
    if (e === 1) return name;
    return `${name}^${Number.isInteger(e) ? e : e.toFixed(2)}`;
  };
  const numStr = pos.map(fmt).join("\xB7");
  const denParts = neg.map(fmt);
  if (!numStr && denParts.length === 0) return "";
  if (denParts.length === 0) return numStr;
  const denStr = denParts.length === 1 ? denParts[0] : `(${denParts.join("\xB7")})`;
  return `${numStr || "1"}/${denStr}`;
}
function parseUnitExpr(s) {
  s = s.trim().replace(/·/g, "*");
  const result = {};
  function applyTerms(str, sign) {
    str = str.trim();
    if (str.startsWith("(") && str.endsWith(")")) str = str.slice(1, -1).trim();
    for (const raw of str.split("*")) {
      const t = raw.trim();
      if (!t) continue;
      const ci = t.indexOf("^");
      if (ci >= 0) {
        const name = t.slice(0, ci).trim();
        const exp2 = Number(t.slice(ci + 1).trim());
        if (name) result[name] = (result[name] ?? 0) + sign * exp2;
      } else {
        result[t] = (result[t] ?? 0) + sign;
      }
    }
  }
  const si = s.indexOf("/");
  applyTerms(si >= 0 ? s.slice(0, si) : s, 1);
  if (si >= 0) applyTerms(s.slice(si + 1), -1);
  return cleanU(result);
}
function lex(src) {
  const out = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/\d/.test(ch) || ch === "." && /\d/.test(src[i + 1] ?? "")) {
      let s = "";
      while (i < src.length && /[\d.]/.test(src[i])) s += src[i++];
      if (i < src.length && /[eE]/.test(src[i])) {
        s += src[i++];
        if (i < src.length && /[+-]/.test(src[i])) s += src[i++];
        while (i < src.length && /\d/.test(src[i])) s += src[i++];
      }
      out.push({
        t: "NUM",
        v: s
      });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let s = "";
      while (i < src.length && /\w/.test(src[i])) s += src[i++];
      out.push({
        t: "ID",
        v: s
      });
      continue;
    }
    if (ch === ",") {
      out.push({
        t: "COMMA",
        v: ","
      });
      i++;
      continue;
    }
    if (ch === "=") {
      if (src[i + 1] === "=") {
        out.push({
          t: "EQ",
          v: "=="
        });
        i += 2;
      } else {
        out.push({
          t: "EQ",
          v: "="
        });
        i++;
      }
      continue;
    }
    if (ch === "!" && src[i + 1] === "=") {
      out.push({
        t: "NEQ",
        v: "!="
      });
      i += 2;
      continue;
    }
    if (ch === "<") {
      if (src[i + 1] === ">") {
        out.push({
          t: "NEQ",
          v: "<>"
        });
        i += 2;
      } else if (src[i + 1] === "=") {
        out.push({
          t: "LEQ",
          v: "<="
        });
        i += 2;
      } else {
        out.push({
          t: "LT",
          v: "<"
        });
        i++;
      }
      continue;
    }
    if (ch === ">") {
      if (src[i + 1] === "=") {
        out.push({
          t: "GEQ",
          v: ">="
        });
        i += 2;
      } else {
        out.push({
          t: "GT",
          v: ">"
        });
        i++;
      }
      continue;
    }
    const ops = {
      "+": "PLUS",
      "-": "MINUS",
      "*": "STAR",
      "/": "SLASH",
      "^": "CARET",
      "(": "LPAREN",
      ")": "RPAREN"
    };
    if (ops[ch]) {
      out.push({
        t: ops[ch],
        v: ch
      });
      i++;
      continue;
    }
    throw new Error(`Unknown character: '${ch}'`);
  }
  out.push({
    t: "EOF",
    v: ""
  });
  return out;
}
function _gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * _gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.9999999999998099,
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9984369578019572e-21,
    15056327351493116e-23
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
function _erf(x) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return sign * y;
}
var MATH_FN = {
  // Basic trig
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
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
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  log1p: Math.log1p,
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
    if (n < 0 || !Number.isInteger(n)) throw new Error("factorial requires a non-negative integer");
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }
};
var PRESERVE_FN = {
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc
};
var CONST = {
  pi: Math.PI,
  e: Math.E,
  tau: 2 * Math.PI
};
var CMP_OPS = [
  "EQ",
  "NEQ",
  "LT",
  "GT",
  "LEQ",
  "GEQ"
];
var Parser = class {
  toks;
  scope;
  fnScope;
  pos;
  constructor(toks, scope, fnScope = {}) {
    this.toks = toks;
    this.scope = scope;
    this.fnScope = fnScope;
    this.pos = 0;
  }
  peek() {
    return this.toks[this.pos];
  }
  eat() {
    return this.toks[this.pos++];
  }
  need(t) {
    const tok = this.eat();
    if (tok.t !== t) throw new Error(`Expected ${t}, got '${tok.v}'`);
    return tok;
  }
  // Top-level: comparison (returns 0 or 1) or plain arithmetic
  compare() {
    const q = this.arithmetic();
    if (CMP_OPS.includes(this.peek().t)) {
      const op = this.eat().t;
      const r = this.arithmetic();
      let result;
      const EPS = 1e-12;
      switch (op) {
        case "EQ":
          result = Math.abs(q.v - r.v) <= EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case "NEQ":
          result = Math.abs(q.v - r.v) > EPS * (Math.abs(q.v) + Math.abs(r.v) + 1);
          break;
        case "LT":
          result = q.v < r.v;
          break;
        case "GT":
          result = q.v > r.v;
          break;
        case "LEQ":
          result = q.v <= r.v;
          break;
        case "GEQ":
          result = q.v >= r.v;
          break;
        default:
          result = false;
      }
      return {
        v: result ? 1 : 0,
        u: {}
      };
    }
    return q;
  }
  arithmetic() {
    let q = this.addend();
    while (this.peek().t === "PLUS" || this.peek().t === "MINUS") {
      const op = this.eat().t;
      const r = this.addend();
      const u = addU(q.u, r.u);
      q = {
        v: op === "PLUS" ? q.v + r.v : q.v - r.v,
        u
      };
    }
    return q;
  }
  addend() {
    let q = this.power();
    while (this.peek().t === "STAR" || this.peek().t === "SLASH") {
      const op = this.eat().t;
      const r = this.power();
      q = op === "STAR" ? {
        v: q.v * r.v,
        u: mulU(q.u, r.u)
      } : {
        v: q.v / r.v,
        u: divU(q.u, r.u)
      };
    }
    return q;
  }
  power() {
    const base = this.unary();
    if (this.peek().t === "CARET") {
      this.eat();
      const exp2 = this.power();
      if (Object.keys(exp2.u).length > 0) {
        throw new Error(`Exponent must be dimensionless (got ${formatUnit(exp2.u)})`);
      }
      return {
        v: Math.pow(base.v, exp2.v),
        u: powU(base.u, exp2.v)
      };
    }
    return base;
  }
  unary() {
    if (this.peek().t === "MINUS") {
      this.eat();
      const q = this.unary();
      return {
        v: -q.v,
        u: q.u
      };
    }
    return this.atom();
  }
  atom() {
    const tok = this.peek();
    if (tok.t === "NUM") {
      this.eat();
      return {
        v: parseFloat(tok.v),
        u: {}
      };
    }
    if (tok.t === "LPAREN") {
      this.eat();
      const q = this.compare();
      this.need("RPAREN");
      return q;
    }
    if (tok.t === "ID") {
      this.eat();
      const name = tok.v;
      if (this.peek().t === "LPAREN") {
        this.eat();
        const args = [];
        if (this.peek().t !== "RPAREN") {
          args.push(this.compare());
          while (this.peek().t === "COMMA") {
            this.eat();
            args.push(this.compare());
          }
        }
        this.need("RPAREN");
        if (args.length === 1) {
          const arg = args[0];
          if (name === "not") return {
            v: arg.v === 0 ? 1 : 0,
            u: {}
          };
          if (name === "sqrt") {
            return {
              v: Math.sqrt(arg.v),
              u: powU(arg.u, 0.5)
            };
          }
          if (name === "cbrt") {
            return {
              v: Math.cbrt(arg.v),
              u: powU(arg.u, 1 / 3)
            };
          }
          if (PRESERVE_FN[name]) {
            return {
              v: PRESERVE_FN[name](arg.v),
              u: arg.u
            };
          }
          if (MATH_FN[name]) {
            if (Object.keys(arg.u).length > 0) {
              throw new Error(`${name}() requires dimensionless argument, got ${formatUnit(arg.u)}`);
            }
            return {
              v: MATH_FN[name](arg.v),
              u: {}
            };
          }
          if (name in this.fnScope) {
            const fn = this.fnScope[name];
            const innerScope = {
              ...this.scope,
              [fn.param]: arg
            };
            return evalExpr(fn.expr, innerScope, this.fnScope);
          }
        }
        if (args.length === 2) {
          const [a, b] = args;
          if (name === "and") return {
            v: a.v !== 0 && b.v !== 0 ? 1 : 0,
            u: {}
          };
          if (name === "or") return {
            v: a.v !== 0 || b.v !== 0 ? 1 : 0,
            u: {}
          };
          if (name === "xor") return {
            v: a.v !== 0 !== (b.v !== 0) ? 1 : 0,
            u: {}
          };
          if (name === "min") return {
            v: Math.min(a.v, b.v),
            u: addU(a.u, b.u)
          };
          if (name === "max") return {
            v: Math.max(a.v, b.v),
            u: addU(a.u, b.u)
          };
          if (name === "atan2") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("atan2() requires dimensionless arguments");
            }
            return {
              v: Math.atan2(a.v, b.v),
              u: {}
            };
          }
          if (name === "mod") return {
            v: (a.v % b.v + b.v) % b.v,
            u: {}
          };
          if (name === "pow") {
            if (Object.keys(b.u).length > 0) throw new Error("pow() exponent must be dimensionless");
            return {
              v: Math.pow(a.v, b.v),
              u: powU(a.u, b.v)
            };
          }
          if (name === "hypot") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("hypot() requires dimensionless arguments");
            }
            return {
              v: Math.hypot(a.v, b.v),
              u: {}
            };
          }
          if (name === "comb") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("comb() requires dimensionless arguments");
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error("comb(n,k) requires non-negative integers with k \u2264 n");
            }
            let r = 1;
            for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
            return {
              v: Math.round(r),
              u: {}
            };
          }
          if (name === "perm") {
            if (Object.keys(a.u).length > 0 || Object.keys(b.u).length > 0) {
              throw new Error("perm() requires dimensionless arguments");
            }
            const n = a.v, k = b.v;
            if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) {
              throw new Error("perm(n,k) requires non-negative integers with k \u2264 n");
            }
            let r = 1;
            for (let i = 0; i < k; i++) r *= n - i;
            return {
              v: r,
              u: {}
            };
          }
        }
        if (args.length === 3 && name === "if") {
          const [cond, thenVal, elseVal] = args;
          return cond.v !== 0 ? thenVal : elseVal;
        }
        if (args.length === 3 && name === "clamp") {
          const [x, lo, hi] = args;
          return {
            v: Math.min(Math.max(x.v, lo.v), hi.v),
            u: addU(x.u, addU(lo.u, hi.u))
          };
        }
        if (args.length === 1 && name in this.fnScope) {
          const fn = this.fnScope[name];
          const innerScope = {
            ...this.scope,
            [fn.param]: args[0]
          };
          return evalExpr(fn.expr, innerScope, this.fnScope);
        }
        throw new Error(`Unknown function or wrong argument count: ${name}(${args.length} args)`);
      }
      if (CONST[name] !== void 0) return {
        v: CONST[name],
        u: {}
      };
      if (this.scope[name] !== void 0) return this.scope[name];
      throw new Error(`Undefined: ${name}`);
    }
    throw new Error(`Unexpected token: '${tok.v}'`);
  }
};
function evalExpr(src, scope, fnScope = {}) {
  const toks = lex(src.trim());
  const p = new Parser(toks, scope, fnScope);
  const q = p.compare();
  if (p.peek().t !== "EOF") throw new Error("Unexpected input after expression");
  return q;
}
function evalStatements(src, scope, fnScope = {}) {
  const results = [];
  for (const raw of src.split(";")) {
    const s = raw.trim();
    if (!s) continue;
    let tagUnit;
    let stmt = s;
    const unitMatch = s.match(/\[([^\]]+)\]\s*$/);
    if (unitMatch) {
      tagUnit = parseUnitExpr(unitMatch[1]);
      stmt = s.slice(0, unitMatch.index).trim();
    }
    const fnDefMatch = stmt.match(/^([a-zA-Z_]\w*)\s*\(([a-zA-Z_]\w*)\)\s*=\s*(.+)$/);
    if (fnDefMatch) {
      const [, fnName, param, fnExpr] = fnDefMatch;
      fnScope[fnName] = {
        param,
        expr: fnExpr.trim()
      };
      results.push({
        raw: s,
        name: fnName,
        expr: fnExpr.trim(),
        value: NaN,
        unit: {},
        isFn: true,
        fnParam: param
      });
      continue;
    }
    const eqIdx = stmt.indexOf("=");
    if (eqIdx > 0) {
      const name = stmt.slice(0, eqIdx).trim();
      const expr = stmt.slice(eqIdx + 1).trim();
      if (/^[a-zA-Z_]\w*$/.test(name)) {
        try {
          let q = evalExpr(expr, scope, fnScope);
          if (tagUnit !== void 0) q = {
            v: q.v,
            u: tagUnit
          };
          scope[name] = q;
          results.push({
            raw: s,
            name,
            expr,
            value: q.v,
            unit: q.u
          });
        } catch (e) {
          results.push({
            raw: s,
            name,
            expr,
            value: NaN,
            unit: {},
            error: e.message
          });
        }
        continue;
      }
    }
    try {
      let q = evalExpr(stmt, scope, fnScope);
      if (tagUnit !== void 0) q = {
        v: q.v,
        u: tagUnit
      };
      results.push({
        raw: s,
        name: "",
        expr: stmt,
        value: q.v,
        unit: q.u
      });
    } catch (e) {
      results.push({
        raw: s,
        name: "",
        expr: stmt,
        value: NaN,
        unit: {},
        error: e.message
      });
    }
  }
  return results;
}
function parseRowsToAST(rows, start2, stopTypes) {
  const nodes = [];
  let i = start2;
  while (i < rows.length) {
    const row = rows[i];
    const rt = row.type;
    if (!rt) {
      nodes.push({
        kind: "stmt",
        rowIdx: i
      });
      i++;
    } else if (rt === "if") {
      const ifNode = {
        kind: "if",
        rowIdx: i,
        branches: [
          {
            condRowIdx: i,
            cond: row.e,
            body: []
          }
        ],
        elseBody: null,
        elseRowIdx: null,
        endRowIdx: null
      };
      i++;
      const thenResult = parseRowsToAST(rows, i, [
        "elseif",
        "else",
        "end"
      ]);
      ifNode.branches[0].body = thenResult.nodes;
      i = thenResult.next;
      while (i < rows.length && rows[i].type === "elseif") {
        const elifRowIdx = i;
        const elifCond = rows[i].e;
        i++;
        const elifResult = parseRowsToAST(rows, i, [
          "elseif",
          "else",
          "end"
        ]);
        ifNode.branches.push({
          condRowIdx: elifRowIdx,
          cond: elifCond,
          body: elifResult.nodes
        });
        i = elifResult.next;
      }
      if (i < rows.length && rows[i].type === "else") {
        ifNode.elseRowIdx = i;
        i++;
        const elseResult = parseRowsToAST(rows, i, [
          "end"
        ]);
        ifNode.elseBody = elseResult.nodes;
        i = elseResult.next;
      }
      if (i < rows.length && rows[i].type === "end") {
        ifNode.endRowIdx = i;
        i++;
      }
      nodes.push(ifNode);
    } else if (rt === "for") {
      const forNode = {
        kind: "for",
        rowIdx: i,
        body: [],
        endRowIdx: null
      };
      i++;
      const bodyResult = parseRowsToAST(rows, i, [
        "end"
      ]);
      forNode.body = bodyResult.nodes;
      i = bodyResult.next;
      if (i < rows.length && rows[i].type === "end") {
        forNode.endRowIdx = i;
        i++;
      }
      nodes.push(forNode);
    } else if (stopTypes.includes(rt)) {
      break;
    } else {
      nodes.push({
        kind: "stmt",
        rowIdx: i
      });
      i++;
    }
  }
  return {
    nodes,
    next: i
  };
}
function parseForHeader(header, scope, fnScope) {
  let mainPart = header.trim();
  let stepExpr;
  const stepMatch = mainPart.match(/^(.*)\s+step\s+([^\s].*)$/i);
  if (stepMatch) {
    mainPart = stepMatch[1].trim();
    stepExpr = stepMatch[2].trim();
  }
  const toIdx = mainPart.lastIndexOf(" to ");
  if (toIdx < 0) throw new Error(`for loop header missing 'to': "${header}"`);
  const lhs = mainPart.slice(0, toIdx).trim();
  const endExpr = mainPart.slice(toIdx + 4).trim();
  const eqIdx = lhs.indexOf("=");
  if (eqIdx < 0) throw new Error(`for loop header missing '=': "${header}"`);
  const varName = lhs.slice(0, eqIdx).trim();
  if (!/^[a-zA-Z_]\w*$/.test(varName)) {
    throw new Error(`Invalid loop variable: "${varName}"`);
  }
  const startExpr = lhs.slice(eqIdx + 1).trim();
  const startVal = evalExpr(startExpr, scope, fnScope).v;
  const endVal = evalExpr(endExpr, scope, fnScope).v;
  const stepVal = stepExpr ? evalExpr(stepExpr, scope, fnScope).v : endVal >= startVal ? 1 : -1;
  if (stepVal === 0) throw new Error("for loop step cannot be zero");
  return {
    varName,
    startVal,
    endVal,
    stepVal
  };
}
var MAX_LOOP_ITER = 1e4;
function execNodes(nodes, rows, scope, fnScope, results, active) {
  for (const node of nodes) {
    if (node.kind === "stmt") {
      const row = rows[node.rowIdx];
      if (!active || !row.e.trim()) {
        results[node.rowIdx] = {
          raw: row.e,
          name: "",
          expr: row.e,
          value: NaN,
          unit: {},
          active
        };
        continue;
      }
      const stmts = evalStatements(row.e, scope, fnScope);
      results[node.rowIdx] = {
        ...stmts[0] ?? {
          raw: row.e,
          name: "",
          expr: row.e,
          value: NaN,
          unit: {}
        },
        active: true
      };
    } else if (node.kind === "if") {
      let branchTaken = false;
      for (const branch of node.branches) {
        let condVal = 0;
        let condError;
        if (active) {
          try {
            condVal = evalExpr(branch.cond || "0", scope, fnScope).v;
          } catch (e) {
            condError = e.message;
          }
        }
        const taken = active && !branchTaken && condVal !== 0 && !condError;
        results[branch.condRowIdx] = {
          raw: branch.cond,
          name: "",
          expr: branch.cond,
          value: condVal,
          unit: {},
          rowType: branch.condRowIdx === node.rowIdx ? "if" : "elseif",
          active,
          condValue: condVal,
          error: condError
        };
        execNodes(branch.body, rows, scope, fnScope, results, taken);
        if (taken) branchTaken = true;
      }
      if (node.elseRowIdx !== null) {
        const elseTaken = active && !branchTaken;
        results[node.elseRowIdx] = {
          raw: "else",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "else",
          active,
          condValue: elseTaken ? 1 : 0
        };
        execNodes(node.elseBody, rows, scope, fnScope, results, elseTaken);
      }
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: "end",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "end",
          active
        };
      }
    } else if (node.kind === "for") {
      const row = rows[node.rowIdx];
      let iterCount = 0;
      let forError;
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
            scope[varName] = {
              v: val,
              u: {}
            };
            execNodes(node.body, rows, scope, fnScope, results, true);
            val += stepVal;
            iterCount++;
          }
        } catch (e) {
          forError = e.message;
          execNodes(node.body, rows, scope, fnScope, results, false);
        }
      } else {
        execNodes(node.body, rows, scope, fnScope, results, false);
      }
      results[node.rowIdx] = {
        raw: row.e,
        name: "",
        expr: row.e,
        value: iterCount,
        unit: {},
        rowType: "for",
        active,
        error: forError
      };
      if (node.endRowIdx !== null) {
        results[node.endRowIdx] = {
          raw: "end",
          name: "",
          expr: "",
          value: NaN,
          unit: {},
          rowType: "end",
          active
        };
      }
    }
  }
}
function evalFormulaRows(rows, scope, fnScope = {}) {
  const results = rows.map((r) => ({
    raw: r.e,
    name: "",
    expr: r.e,
    value: NaN,
    unit: {},
    active: false
  }));
  if (rows.length === 0) return results;
  const { nodes } = parseRowsToAST(rows, 0, []);
  execNodes(nodes, rows, scope, fnScope, results, true);
  return results;
}

// src/utils/markdown.ts
var GREEK_TABLE = [
  [
    /\bepsilon\b/g,
    "\u03B5"
  ],
  [
    /\bEpsilon\b/g,
    "\u03B5"
  ],
  [
    /\blambda\b/g,
    "\u03BB"
  ],
  [
    /\bLambda\b/g,
    "\u039B"
  ],
  [
    /\balpha\b/g,
    "\u03B1"
  ],
  [
    /\bAlpha\b/g,
    "\u03B1"
  ],
  [
    /\btheta\b/g,
    "\u03B8"
  ],
  [
    /\bTheta\b/g,
    "\u0398"
  ],
  [
    /\bdelta\b/g,
    "\u03B4"
  ],
  [
    /\bDelta\b/g,
    "\u0394"
  ],
  [
    /\bgamma\b/g,
    "\u03B3"
  ],
  [
    /\bGamma\b/g,
    "\u0393"
  ],
  [
    /\bomega\b/g,
    "\u03C9"
  ],
  [
    /\bOmega\b/g,
    "\u03A9"
  ],
  [
    /\bsigma\b/g,
    "\u03C3"
  ],
  [
    /\bSigma\b/g,
    "\u03A3"
  ],
  [
    /\bbeta\b/g,
    "\u03B2"
  ],
  [
    /\bBeta\b/g,
    "\u0392"
  ],
  [
    /\bphi\b/g,
    "\u03C6"
  ],
  [
    /\bPhi\b/g,
    "\u03A6"
  ],
  [
    /\bpsi\b/g,
    "\u03C8"
  ],
  [
    /\bPsi\b/g,
    "\u03A8"
  ],
  [
    /\bchi\b/g,
    "\u03C7"
  ],
  [
    /\bChi\b/g,
    "\u03A7"
  ],
  [
    /\bxi\b/g,
    "\u03BE"
  ],
  [
    /\bXi\b/g,
    "\u039E"
  ],
  [
    /\beta\b/g,
    "\u03B7"
  ],
  [
    /\bEta\b/g,
    "\u0397"
  ],
  [
    /\bmu\b/g,
    "\u03BC"
  ],
  [
    /\bMu\b/g,
    "\u039C"
  ],
  [
    /\bnu\b/g,
    "\u03BD"
  ],
  [
    /\bNu\b/g,
    "\u039D"
  ],
  [
    /\brho\b/g,
    "\u03C1"
  ],
  [
    /\bRho\b/g,
    "\u03A1"
  ],
  [
    /\btau\b/g,
    "\u03C4"
  ],
  [
    /\bTau\b/g,
    "\u03A4"
  ],
  [
    /\bpi\b/g,
    "\u03C0"
  ],
  [
    /\bPi\b/g,
    "\u03A0"
  ]
];
function sanitizeUrl(url) {
  const t = url.trim();
  return /^javascript:/i.test(t) ? "#" : t;
}
function topLevelIdx(s, ch) {
  let depth = 0;
  for (let i = 0; i <= s.length - ch.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && s.slice(i, i + ch.length) === ch) return i;
  }
  return -1;
}
function stripOuter(s) {
  s = s.trim();
  if (!s.startsWith("(") || !s.endsWith(")")) return s;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") {
      depth--;
      if (depth === 0 && i < s.length - 1) return s;
    }
  }
  return s.slice(1, -1).trim();
}
function transformPiece(raw) {
  let s = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/\bsqrt\s*\(/g, "\u221A(");
  s = s.replace(/\b([A-Za-z][A-Za-z0-9]*)((?:_[A-Za-z0-9]+)+)\b/g, (_m, base, subs) => {
    let baseHtml = base;
    for (const [re, sym] of GREEK_TABLE) baseHtml = baseHtml.replace(re, sym);
    const subParts = subs.split("_").filter(Boolean).join(",");
    return `${baseHtml}<sub>${subParts}</sub>`;
  });
  for (const [re, sym] of GREEK_TABLE) s = s.replace(re, sym);
  s = s.replace(/\^(\d+)/g, "<sup>$1</sup>");
  s = s.replace(/\^([A-Za-z])\b/g, "<sup>$1</sup>");
  s = s.replace(/\s*\*\s*/g, " \xB7 ");
  return s;
}
function renderExpr(raw) {
  const s = raw.trim();
  if (!s) return "";
  const addSplits = [];
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (depth === 0 && i > 0 && (s[i] === "+" || s[i] === "-")) addSplits.push(i);
  }
  if (addSplits.length > 0) {
    let html = "";
    let start2 = 0;
    for (const idx of addSplits) {
      html += renderExpr(s.slice(start2, idx));
      html += ` ${s[idx]} `;
      start2 = idx + 1;
    }
    html += renderExpr(s.slice(start2));
    return html;
  }
  const divIdx = topLevelIdx(s, "/");
  if (divIdx >= 0) {
    const num = stripOuter(s.slice(0, divIdx).trim());
    const den = stripOuter(s.slice(divIdx + 1).trim());
    return `<span class="frac"><span>${renderExpr(num)}</span><span>${renderExpr(den)}</span></span>`;
  }
  return transformPiece(s);
}
function prettifyExpr(src) {
  const raw = src.trim();
  if (!raw) return "";
  let unitHtml = "";
  const unitMatch = raw.match(/\[([^\]]+)\]\s*$/);
  const body = unitMatch ? raw.slice(0, unitMatch.index).trim() : raw;
  if (unitMatch) {
    unitHtml = ` <span class="fp-unit">${transformPiece(unitMatch[1])}</span>`;
  }
  let lhsHtml = "";
  let rhsRaw = body;
  const eqIdx = topLevelIdx(body, "=");
  if (eqIdx > 0) {
    const lhs = body.slice(0, eqIdx).trim();
    if (/^[A-Za-z_]\w*$/.test(lhs)) {
      lhsHtml = transformPiece(lhs) + ' <span class="fp-eq">=</span> ';
      rhsRaw = body.slice(eqIdx + 1).trim();
    }
  }
  const rhsHtml = renderExpr(rhsRaw);
  return lhsHtml + rhsHtml + unitHtml;
}
function renderInlineMd(src) {
  if (!src) return "";
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const spans = [];
  const p = src.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
    return `\0${spans.length - 1}\0`;
  }).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
    return `\0${spans.length - 1}\0`;
  }).replace(/`([^`]+)`/g, (_, c) => {
    spans.push(`<code>${esc(c)}</code>`);
    return `\0${spans.length - 1}\0`;
  }).replace(/\$([^$\n]+?)\$/g, (_, m) => {
    const html = prettifyExpr(m);
    spans.push(`<span class="md-math">${html || esc(m)}</span>`);
    return `\0${spans.length - 1}\0`;
  });
  const r = esc(p).replace(/\*{3}(.+?)\*{3}/g, "<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>").replace(/_{2}(.+?)_{2}/g, "<strong>$1</strong>").replace(/\*([^*\n]+?)\*/g, "<em>$1</em>").replace(/_([^_\n]+?)_/g, "<em>$1</em>");
  return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]).replace(/\n/g, "<br>");
}
function parseEqTag(line) {
  const m = line.match(/#([\w-]*)(?::([\w. +-]+))?\s*$/);
  if (!m) return {
    label: null,
    display: null,
    exprEnd: line.length
  };
  const label = m[1] || null;
  const display = m[2]?.trim() || null;
  return {
    label,
    display,
    exprEnd: m.index
  };
}
function collectEqLabels(src) {
  const map = /* @__PURE__ */ new Map();
  let counter = 0;
  let inMath = false;
  for (const line of src.split("\n")) {
    const isSingle = /^\$\$.+\$\$\s*$/.test(line);
    if (!isSingle && line.trim() === "$$") {
      inMath = !inMath;
      continue;
    }
    if (!isSingle && !inMath) continue;
    const raw = isSingle ? line.replace(/^\$\$/, "").replace(/\$\$$/, "") : line;
    if (!raw.trim()) continue;
    const { label, display } = parseEqTag(raw);
    const displayStr = display ?? String(++counter);
    if (label) map.set(label, displayStr);
    else if (!display) counter++;
  }
  return map;
}
function renderMarkdown(src) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const eqLabels = collectEqLabels(src);
  let eqCounter = 0;
  function eqRow(raw) {
    const { label, display, exprEnd } = parseEqTag(raw.trim());
    const expr = raw.trim().slice(0, exprEnd).trim();
    const displayStr = display !== null ? display : String(++eqCounter);
    const numCell = `<span class="eq-num">[eq ${esc(displayStr)}]</span>`;
    const html = prettifyExpr(expr);
    const idAttr = label ? ` id="eq-${esc(label)}"` : "";
    return `<div class="eq-row"><span></span><span class="md-math"${idAttr}>${html || esc(expr)}</span>${numCell}</div>`;
  }
  function inline(s) {
    const spans = [];
    const p = s.replace(/\(#([\w-]+)\)/g, (_, label) => {
      const n = eqLabels.get(label);
      const inner = n !== void 0 ? `<a class="eq-ref" href="#eq-${esc(label)}">[eq ${esc(n)}]</a>` : `<span class="eq-ref eq-ref-missing">[eq ?]</span>`;
      spans.push(inner);
      return `\0${spans.length - 1}\0`;
    }).replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
      return `\0${spans.length - 1}\0`;
    }).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
      return `\0${spans.length - 1}\0`;
    }).replace(/`([^`]+)`/g, (_, c) => {
      spans.push(`<code>${esc(c)}</code>`);
      return `\0${spans.length - 1}\0`;
    }).replace(/\$([^$\n]+?)\$/g, (_, m) => {
      const html = prettifyExpr(m);
      spans.push(`<span class="md-math">${html || esc(m)}</span>`);
      return `\0${spans.length - 1}\0`;
    });
    const r = esc(p).replace(/\*{3}(.+?)\*{3}/g, "<strong><em>$1</em></strong>").replace(/\*{2}(.+?)\*{2}/g, "<strong>$1</strong>").replace(/_{2}(.+?)_{2}/g, "<strong>$1</strong>").replace(/\*([^*\n]+?)\*/g, "<em>$1</em>").replace(/_([^_\n]+?)_/g, "<em>$1</em>");
    return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]);
  }
  const lines = src.split("\n");
  const out = [];
  let inPre = false, preLang = "";
  let inMath = false;
  let lineIdx = -1;
  const mathLines = [];
  const listStack = [];
  const para = [];
  const bqLines = [];
  function flushPara() {
    if (!para.length) return;
    out.push(`<p>${para.map(inline).join("<br>")}</p>`);
    para.length = 0;
  }
  function flushBq() {
    if (!bqLines.length) return;
    out.push(`<blockquote>${bqLines.map((l) => `<p>${inline(l)}</p>`).join("\n")}</blockquote>`);
    bqLines.length = 0;
  }
  function closeListsToIndent(targetIndent) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent >= targetIndent) {
      const top = listStack.pop();
      out.push(top.type === "ul" ? "</ul>" : "</ol>");
    }
  }
  function closeAllLists() {
    closeListsToIndent(-1);
  }
  function flushAll() {
    flushPara();
    flushBq();
    closeAllLists();
  }
  function flushBlock() {
    flushPara();
    flushBq();
  }
  for (const line of lines) {
    lineIdx++;
    if (!inMath && line.startsWith("```")) {
      if (inPre) {
        out.push("</code></pre>");
        inPre = false;
        preLang = "";
      } else {
        flushAll();
        preLang = line.slice(3).trim();
        out.push(`<pre><code${preLang ? ` class="lang-${esc(preLang)}"` : ""}>`);
        inPre = true;
      }
      continue;
    }
    if (inPre) {
      out.push(esc(line));
      continue;
    }
    const singleMath = line.match(/^\$\$(.+)\$\$\s*$/);
    if (singleMath) {
      flushAll();
      out.push(`<div class="md-math-block">${eqRow(singleMath[1].trim())}</div>`);
      continue;
    }
    if (line.trim() === "$$") {
      if (inMath) {
        const rows = mathLines.filter((l) => l.trim()).map(eqRow).join("");
        out.push(`<div class="md-math-block">${rows}</div>`);
        mathLines.length = 0;
        inMath = false;
      } else {
        flushAll();
        inMath = true;
      }
      continue;
    }
    if (inMath) {
      mathLines.push(line);
      continue;
    }
    if (line.startsWith("> ") || line === ">") {
      flushPara();
      closeAllLists();
      bqLines.push(line.startsWith("> ") ? line.slice(2) : "");
      continue;
    }
    flushBq();
    const hm = line.match(/^(#{1,4})\s+(.+)$/);
    if (hm) {
      flushPara();
      closeAllLists();
      out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
      continue;
    }
    if (/^[-*=_]{3,}\s*$/.test(line)) {
      flushPara();
      closeAllLists();
      out.push("<hr>");
      continue;
    }
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(.*)$/);
    if (listMatch) {
      flushPara();
      const indent = listMatch[1].length;
      const marker = listMatch[2];
      const content = listMatch[3];
      let listType;
      let listTag;
      if (/^[-*+]$/.test(marker)) {
        listType = "ul";
        listTag = "<ul>";
      } else if (/^\d+\.$/.test(marker)) {
        listType = "ol";
        listTag = "<ol>";
      } else if (/^[a-z]\.$/.test(marker)) {
        listType = "ol";
        listTag = '<ol type="a">';
      } else {
        listType = "ol";
        listTag = '<ol type="A">';
      }
      closeListsToIndent(indent + 1);
      if (listStack.length === 0 || listStack[listStack.length - 1].indent < indent) {
        out.push(listTag);
        listStack.push({
          type: listType,
          tag: listTag,
          indent
        });
      } else if (listStack[listStack.length - 1].tag !== listTag) {
        const top = listStack.pop();
        out.push(top.type === "ul" ? "</ul>" : "</ol>");
        out.push(listTag);
        listStack.push({
          type: listType,
          tag: listTag,
          indent
        });
      }
      const taskMatch = listType === "ul" && content.match(/^\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === "x";
        out.push(`<li class="task-item"><input type="checkbox" data-task-line="${lineIdx}"${checked ? " checked" : ""}> ${inline(taskMatch[2])}</li>`);
      } else {
        out.push(`<li>${inline(content)}</li>`);
      }
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      closeAllLists();
      continue;
    }
    closeAllLists();
    para.push(line);
  }
  flushPara();
  flushBq();
  if (inMath) {
    const rows = mathLines.filter((l) => l.trim()).map(eqRow).join("");
    out.push(`<div class="md-math-block">${rows}</div>`);
  }
  if (inPre) out.push("</code></pre>");
  closeAllLists();
  return out.join("\n");
}

// src/blocks/formula.ts
var COMP_RE = /[<>]=?|[!=]=/;
function fmtNum(n) {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e9) return n.toLocaleString();
  return parseFloat(n.toPrecision(6)).toString();
}
function expandDotNotation(expr) {
  return expr.replace(/\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)\b/g, "$1__$2");
}
function parseFormulaRows(content) {
  try {
    const p = JSON.parse(content);
    if (Array.isArray(p) && (p.length === 0 || "e" in p[0])) {
      return p.map((r) => {
        const row = {
          e: String(r.e ?? ""),
          d: String(r.d ?? "")
        };
        if (r.type) row.type = r.type;
        if (r.ref) row.ref = String(r.ref);
        return row;
      });
    }
  } catch {
  }
  return content.split(";").map((s) => ({
    e: s.trim(),
    d: ""
  }));
}
function insertLineBreak() {
  const sel = globalThis.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const br = document.createElement("br");
  range.insertNode(br);
  if (!br.nextSibling || br.nextSibling.nodeType === Node.TEXT_NODE && br.nextSibling.textContent === "") {
    const sentinel = document.createElement("br");
    br.after(sentinel);
    range.setStartBefore(sentinel);
  } else {
    range.setStartAfter(br);
  }
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}
function serializeEditable(el) {
  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    const elem = node;
    if (elem.tagName === "BR") return "\n";
    if (elem.tagName === "DIV" || elem.tagName === "P") {
      const kids = Array.from(elem.childNodes);
      const isEmptyBlock = kids.length === 0 || kids.length === 1 && kids[0].tagName === "BR";
      return isEmptyBlock ? "" : kids.map(processNode).join("");
    }
    return Array.from(elem.childNodes).map(processNode).join("");
  }
  const children = Array.from(el.childNodes);
  const hasBlocks = children.some((n) => n instanceof HTMLElement && (n.tagName === "DIV" || n.tagName === "P"));
  if (hasBlocks) {
    const lines = [];
    for (const child of children) {
      if (child instanceof HTMLElement && (child.tagName === "DIV" || child.tagName === "P")) {
        lines.push(processNode(child));
      } else {
        if (lines.length === 0) lines.push("");
        lines[lines.length - 1] += processNode(child);
      }
    }
    return lines.join("\n");
  }
  return children.map(processNode).join("");
}
function applyEvalResults(formulaEl, stmts) {
  const rowEls = Array.from(formulaEl.querySelectorAll(".formula-row"));
  stmts.forEach((stmt, i) => {
    const rowEl = rowEls[i];
    if (rowEl) rowEl.classList.toggle("formula-row--inactive", stmt.active === false && !stmt.rowType);
    const r = formulaEl.querySelector(`[data-result="${i}"]`);
    if (!r) return;
    if (stmt.rowType === "if" || stmt.rowType === "elseif") {
      const taken = (stmt.condValue ?? 0) !== 0 && !stmt.error;
      if (stmt.error) {
        r.textContent = "err";
        r.title = stmt.error;
        r.className = "formula-result formula-error";
      } else {
        r.textContent = taken ? "\u25B6 true" : "\u25B7 false";
        r.title = "";
        r.className = `formula-result ${taken ? "formula-cond-true" : "formula-cond-false"}`;
      }
      return;
    }
    if (stmt.rowType === "else") {
      const taken = (stmt.condValue ?? 0) !== 0;
      r.textContent = taken ? "\u25B6" : "\u25B7";
      r.title = "";
      r.className = `formula-result ${taken ? "formula-cond-true" : "formula-cond-false"}`;
      return;
    }
    if (stmt.rowType === "end") {
      r.textContent = "";
      r.title = "";
      r.className = "formula-result";
      return;
    }
    if (stmt.rowType === "for") {
      if (stmt.error) {
        r.textContent = "err";
        r.title = stmt.error;
        r.className = "formula-result formula-error";
      } else {
        r.textContent = `${stmt.value}\xD7`;
        r.title = `${stmt.value} iteration${stmt.value !== 1 ? "s" : ""}`;
        r.className = "formula-result formula-loop-count";
      }
      return;
    }
    if (!stmt.active) {
      r.textContent = "\u2014";
      r.title = "inactive branch";
      r.className = "formula-result formula-inactive";
      return;
    }
    if (stmt.isFn) {
      r.textContent = "fn";
      r.title = `${stmt.name}(${stmt.fnParam}) \u2014 user-defined function`;
      r.className = "formula-result formula-fn";
    } else if (stmt.error) {
      r.textContent = "err";
      r.title = stmt.error;
      r.className = "formula-result formula-error";
    } else {
      const unitStr = formatUnit(stmt.unit);
      r.innerHTML = fmtNum(stmt.value) + (unitStr ? ` <span class="result-unit">${transformPiece(unitStr)}</span>` : "");
      r.title = "";
      r.className = "formula-result";
    }
  });
}
function reEvalAllFormulas() {
  if (!canvas) return;
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  for (const [k, v] of Object.entries(state.constants)) globalScope[k] = {
    v,
    u: {}
  };
  const topLevelEls = [
    ...Array.from(canvas.domElement.querySelectorAll(".formula-block")).filter((el) => !childToSection.has(el.id)),
    ...Array.from(canvas.domElement.querySelectorAll(".section-block"))
  ].sort((a, b) => {
    const dy = parseInt(a.style.top) - parseInt(b.style.top);
    return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
  });
  for (const el of topLevelEls) {
    const block = state.blocks.find((b) => b.id === el.id);
    if (!block) continue;
    if (block.type === "section") {
      const prefix = (block.sectionName || "section1") + "__";
      const sectionScope = {
        ...globalScope
      };
      const sectionFnScope = {
        ...globalFnScope
      };
      const sectionAliasKeys = /* @__PURE__ */ new Set();
      for (const [k, v] of Object.entries(globalScope)) {
        if (k.startsWith(prefix)) {
          const bare = k.slice(prefix.length);
          sectionScope[bare] = v;
          sectionAliasKeys.add(bare);
        }
      }
      const preKeys = new Set(Object.keys(sectionScope));
      const content = el.querySelector(".section-content");
      const childFormulaEls = content ? Array.from(content.querySelectorAll(".formula-block")).filter((cel) => childToSection.get(cel.id) === el.id).sort((a, b) => {
        const dy = parseInt(a.style.top) - parseInt(b.style.top);
        return dy !== 0 ? dy : parseInt(a.style.left) - parseInt(b.style.left);
      }) : [];
      const summaryVars = /* @__PURE__ */ new Set();
      const summaryComps = [];
      for (const cel of childFormulaEls) {
        const cBlock = state.blocks.find((b) => b.id === cel.id);
        if (!cBlock) continue;
        const rows = parseFormulaRows(cBlock.content).map((r) => ({
          ...r,
          e: expandDotNotation(r.e)
        }));
        const stmts = evalFormulaRows(rows, sectionScope, sectionFnScope);
        applyEvalResults(cel, stmts);
        if (cBlock.type === "summary") {
          for (const stmt of stmts) {
            if (!stmt.active || stmt.rowType) continue;
            if (stmt.name && !stmt.error) {
              summaryVars.add(stmt.name);
            } else if (!stmt.name && !stmt.error && COMP_RE.test(stmt.expr)) {
              summaryComps.push({
                expr: stmt.raw,
                pass: stmt.value !== 0
              });
            } else if (!stmt.name && !stmt.error && /^[a-zA-Z_]\w*$/.test(stmt.expr.trim())) {
              summaryVars.add(stmt.expr.trim());
            } else if (COMP_RE.test(stmt.raw)) {
              try {
                const result = evalExpr(stmt.raw, sectionScope, sectionFnScope);
                summaryComps.push({
                  expr: stmt.raw,
                  pass: result.v !== 0
                });
              } catch {
              }
            }
          }
        }
      }
      sectionSummaryVarNames.set(el.id, summaryVars);
      sectionSummaryComparisons.set(el.id, summaryComps);
      for (const [k, v] of Object.entries(sectionScope)) {
        if (!k.startsWith(prefix) && (!preKeys.has(k) || sectionAliasKeys.has(k))) {
          globalScope[`${prefix}${k}`] = v;
        }
      }
      for (const [k, v] of Object.entries(sectionScope)) {
        if (k.startsWith(prefix)) globalScope[k] = v;
      }
      onSectionSummaryUpdate?.(el, block);
    } else {
      const rows = parseFormulaRows(block.content).map((r) => ({
        ...r,
        e: expandDotNotation(r.e)
      }));
      const stmts = evalFormulaRows(rows, globalScope, globalFnScope);
      applyEvalResults(el, stmts);
    }
  }
  canvas.domElement.querySelectorAll(".plot-block").forEach((el) => {
    const rerender = el.__plotRerender;
    if (rerender) rerender();
  });
  onRefreshAllSectionHeights?.();
}
function buildFormulaBlock(el, block) {
  el.classList.add("formula-block");
  const labelEl = document.createElement("div");
  labelEl.className = "formula-label";
  labelEl.contentEditable = "true";
  labelEl.textContent = block.label ?? "Formula";
  labelEl.dataset.placeholder = "Label\u2026";
  labelEl.addEventListener("blur", () => {
    block.label = labelEl.textContent ?? "";
  });
  el.appendChild(labelEl);
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  el.appendChild(divider);
  const rowsEl = document.createElement("div");
  rowsEl.className = "formula-rows";
  el.appendChild(rowsEl);
  let lastFocusedRowIdx = -1;
  function updateHasAnyDesc() {
    const arr = parseFormulaRows(block.content);
    const anyDesc = arr.some((r) => !!r.d);
    rowsEl.classList.toggle("has-any-desc", anyDesc);
    rowsEl.classList.toggle("has-any-row-desc", anyDesc);
  }
  function updateHasAnyRef() {
    const arr = parseFormulaRows(block.content);
    const anyRef = arr.some((r) => !!r.ref);
    rowsEl.classList.toggle("has-any-ref", anyRef);
    rowsEl.classList.toggle("has-any-row-ref", anyRef);
  }
  function syncContent() {
    const rows = rowsEl.querySelectorAll(".formula-row");
    block.content = JSON.stringify(Array.from(rows).map((r) => {
      const obj = {
        e: r.dataset.raw ?? "",
        d: r.dataset.desc ?? ""
      };
      if (r.dataset.rowType) obj.type = r.dataset.rowType;
      if (r.dataset.ref) obj.ref = r.dataset.ref;
      return obj;
    }));
    reEvalAllFormulas();
    updateHasAnyDesc();
    updateHasAnyRef();
  }
  function findBranchInsertPoint(arr, ifIdx) {
    let depth = 1;
    let hasElse = false;
    for (let j = ifIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        depth--;
        if (depth === 0) return {
          insertIdx: j,
          hasElse
        };
      }
      if (t === "else" && depth === 1) {
        hasElse = true;
        return {
          insertIdx: j,
          hasElse
        };
      }
    }
    return {
      insertIdx: arr.length,
      hasElse
    };
  }
  function findOwningIfIdx(arr, rowIdx) {
    if (arr[rowIdx]?.type === "if") return rowIdx;
    let depth = 0;
    for (let j = rowIdx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === "end") depth++;
      else if ((t === "if" || t === "for") && depth > 0) depth--;
      else if (t === "if" && depth === 0) return j;
    }
    return rowIdx;
  }
  function findBlockEndIdx(arr, blockIdx) {
    let depth = 1;
    for (let j = blockIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        depth--;
        if (depth === 0) return j;
      }
    }
    return arr.length - 1;
  }
  function findBranchBodyEnd(arr, branchIdx) {
    let depth = 0;
    for (let j = branchIdx + 1; j < arr.length; j++) {
      const t = arr[j].type;
      if (t === "if" || t === "for") depth++;
      if (t === "end") {
        if (depth === 0) return j;
        depth--;
      }
      if ((t === "elseif" || t === "else") && depth === 0) return j;
    }
    return arr.length;
  }
  function findOwningBlockStart(arr, idx) {
    let depth = 0;
    for (let j = idx - 1; j >= 0; j--) {
      const t = arr[j].type;
      if (t === "end") depth++;
      else if ((t === "if" || t === "for") && depth > 0) depth--;
      else if ((t === "if" || t === "for") && depth === 0) return j;
    }
    return 0;
  }
  function smartDelete(arr, idx) {
    const rt = arr[idx].type;
    if (!rt) {
      arr.splice(idx, 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "if" || rt === "for") {
      const endIdx = findBlockEndIdx(arr, idx);
      arr.splice(idx, endIdx - idx + 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "elseif" || rt === "else") {
      const bodyEnd = findBranchBodyEnd(arr, idx);
      arr.splice(idx, bodyEnd - idx);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(idx, arr.length - 1);
    }
    if (rt === "end") {
      const ownerIdx = findOwningBlockStart(arr, idx);
      arr.splice(ownerIdx, idx - ownerIdx + 1);
      if (arr.length === 0) arr.push({
        e: "",
        d: ""
      });
      return Math.min(ownerIdx, arr.length - 1);
    }
    return idx;
  }
  function findContextIfBlock(arr) {
    if (lastFocusedRowIdx >= 0 && lastFocusedRowIdx < arr.length) {
      const rt = arr[lastFocusedRowIdx]?.type;
      const candidate = rt === "if" ? lastFocusedRowIdx : findOwningBlockStart(arr, lastFocusedRowIdx);
      if (arr[candidate]?.type === "if") return candidate;
    }
    for (let j = arr.length - 1; j >= 0; j--) {
      if (arr[j].type === "if") return j;
    }
    return -1;
  }
  function computeDepths(rowData) {
    const depths = [];
    let depth = 0;
    for (const row of rowData) {
      const rt = row.type;
      if (rt === "elseif" || rt === "else" || rt === "end") depth = Math.max(0, depth - 1);
      depths.push(depth);
      if (rt === "if" || rt === "for" || rt === "elseif" || rt === "else") depth++;
    }
    return depths;
  }
  function rebuildRows() {
    const rowData = parseFormulaRows(block.content);
    rowsEl.innerHTML = "";
    block.content = JSON.stringify(rowData);
    if (!rowsEl._rowUndoStack) rowsEl._rowUndoStack = [];
    const rowUndoStack = rowsEl._rowUndoStack;
    const depths = computeDepths(rowData);
    const containerStack = [
      rowsEl
    ];
    const peekContainer = () => containerStack[containerStack.length - 1];
    rowData.forEach((rowDatum, i) => {
      const { e: stmt, d: desc, ref, type: rowType } = rowDatum;
      const isCtrl = !!rowType;
      const isBodyOnly = rowType === "else" || rowType === "end";
      const row = document.createElement("div");
      row.className = "formula-row";
      if (isCtrl) row.classList.add("formula-row--control");
      if (isBodyOnly) row.classList.add("formula-row--no-expr");
      if (rowType) row.dataset.rowType = rowType;
      row.dataset.raw = stmt;
      row.dataset.desc = desc ?? "";
      row.dataset.ref = ref ?? "";
      if (desc) row.classList.add("has-desc");
      if (ref) row.classList.add("has-ref");
      const d = depths[i] ?? 0;
      row.style.setProperty("--depth", String(d));
      if (isCtrl) {
        const badge = document.createElement("span");
        badge.className = `formula-keyword formula-keyword--${rowType}`;
        badge.textContent = rowType;
        if (isBodyOnly) {
          badge.tabIndex = 0;
          badge.addEventListener("focus", () => {
            lastFocusedRowIdx = i;
          });
          badge.addEventListener("keydown", (ev) => {
            if (!ev.ctrlKey || ev.key !== "-" || ev.shiftKey || ev.altKey) return;
            ev.preventDefault();
            ev.stopPropagation();
            const arr = parseFormulaRows(block.content);
            const allRowEls = Array.from(rowsEl.querySelectorAll(".formula-row"));
            const rowIdx = allRowEls.indexOf(row);
            rowUndoStack.push(Object.assign({}, arr[rowIdx], {
              idx: rowIdx
            }));
            const refocusIdx = smartDelete(arr, rowIdx);
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const cells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
            cells[Math.min(refocusIdx, cells.length - 1)]?.focus();
          });
        }
        row.appendChild(badge);
      } else {
        const descWrap = document.createElement("div");
        descWrap.className = "formula-desc-wrap";
        const descCell = document.createElement("div");
        descCell.contentEditable = "true";
        descCell.className = "formula-desc-cell";
        descCell.dataset.placeholder = "Description\u2026";
        const renderDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? "");
          if (html) descCell.innerHTML = html;
          else descCell.textContent = "";
        };
        descCell.addEventListener("focus", () => {
          descCell.innerText = row.dataset.desc ?? "";
          const range = document.createRange();
          range.selectNodeContents(descCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        descCell.addEventListener("input", () => {
          row.dataset.desc = serializeEditable(descCell);
        });
        descCell.addEventListener("blur", () => {
          row.dataset.desc = serializeEditable(descCell);
          if (row.dataset.desc) row.classList.add("has-desc");
          else row.classList.remove("has-desc");
          syncContent();
          updateHasAnyDesc();
          renderDesc();
        });
        descCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && !ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        renderDesc();
        descWrap.appendChild(descCell);
        row.appendChild(descWrap);
      }
      const exprSide = document.createElement("div");
      exprSide.className = "formula-expr-side";
      const cell = document.createElement("div");
      cell.className = "formula-cell";
      if (isBodyOnly) {
        cell.style.display = "none";
      } else {
        cell.contentEditable = "true";
        const PLAIN_TYPES = /* @__PURE__ */ new Set([
          "if",
          "elseif",
          "for"
        ]);
        const renderMath = () => {
          if (PLAIN_TYPES.has(row.dataset.rowType ?? "")) {
            cell.textContent = row.dataset.raw ?? "";
          } else {
            const html = prettifyExpr(row.dataset.raw ?? "");
            if (html) cell.innerHTML = html;
            else cell.textContent = row.dataset.raw ?? "";
          }
        };
        if (rowType === "if" || rowType === "elseif") {
          cell.dataset.placeholder = "condition  e.g. x > 0";
        } else if (rowType === "for") {
          cell.dataset.placeholder = "i = 1 to n";
        } else {
          cell.dataset.placeholder = "x = expression";
        }
        cell.addEventListener("focus", () => {
          lastFocusedRowIdx = i;
          cell.textContent = row.dataset.raw ?? "";
          const range = document.createRange();
          range.selectNodeContents(cell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        cell.addEventListener("blur", () => {
          row.dataset.raw = cell.textContent?.trim() ?? "";
          syncContent();
          renderMath();
        });
        cell.addEventListener("input", () => {
          row.dataset.raw = cell.textContent ?? "";
          syncContent();
        });
        cell.addEventListener("keydown", (e) => {
          const k = e.key;
          if (k === "Enter" && e.altKey && !e.ctrlKey) {
            e.preventDefault();
            return;
          }
          if (!e.ctrlKey) return;
          if (k !== "Enter" && k !== "-" && k.toLowerCase() !== "z" && k.toLowerCase() !== "i" && k.toLowerCase() !== "l" && k.toLowerCase() !== "e") return;
          e.preventDefault();
          e.stopPropagation();
          row.dataset.raw = cell.textContent?.trim() ?? "";
          const arr = parseFormulaRows(block.content);
          const allRows = Array.from(rowsEl.querySelectorAll(".formula-row"));
          const idx = allRows.indexOf(row);
          const refocus = (targetIdx) => {
            rebuildRows();
            reEvalAllFormulas();
            const newCells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
            newCells[Math.max(0, Math.min(targetIdx, newCells.length - 1))]?.focus();
          };
          if (k === "Enter" && !e.altKey) {
            arr.splice(idx + 1, 0, {
              e: "",
              d: ""
            });
            block.content = JSON.stringify(arr);
            refocus(idx + 1);
          } else if (k === "Enter" && e.altKey) {
            arr.splice(idx, 0, {
              e: "",
              d: ""
            });
            block.content = JSON.stringify(arr);
            refocus(idx);
          } else if (k === "-" && !e.shiftKey && !e.altKey) {
            rowUndoStack.push(Object.assign({}, arr[idx], {
              idx
            }));
            const refocusIdx = smartDelete(arr, idx);
            block.content = JSON.stringify(arr);
            refocus(refocusIdx);
          } else if (k.toLowerCase() === "z" && e.shiftKey && !e.altKey) {
            const entry = rowUndoStack.pop();
            if (!entry) return;
            const restoreIdx = entry.idx ?? idx;
            arr.splice(restoreIdx, 0, {
              e: entry.e,
              d: entry.d ?? "",
              type: entry.type
            });
            block.content = JSON.stringify(arr);
            refocus(restoreIdx);
          } else if (k.toLowerCase() === "i" && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0, {
              e: "",
              d: "",
              type: "if"
            }, {
              e: "",
              d: ""
            }, {
              e: "",
              d: "",
              type: "end"
            });
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            allCells[idx + 2]?.focus();
          } else if (k.toLowerCase() === "l" && !e.altKey && !e.shiftKey) {
            arr.splice(idx + 1, 0, {
              e: "i = 1 to n",
              d: "",
              type: "for"
            }, {
              e: "",
              d: ""
            }, {
              e: "",
              d: "",
              type: "end"
            });
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const allCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            allCells[idx + 1]?.focus();
          } else if (k.toLowerCase() === "e" && (rowType === "if" || rowType === "elseif")) {
            const ownerIdx = findOwningIfIdx(arr, idx);
            const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
            if (insertIdx < 0 || hasElse) return;
            if (e.shiftKey) {
              arr.splice(insertIdx, 0, {
                e: "",
                d: "",
                type: "else"
              }, {
                e: "",
                d: ""
              });
            } else {
              arr.splice(insertIdx, 0, {
                e: "",
                d: "",
                type: "elseif"
              }, {
                e: "",
                d: ""
              });
            }
            block.content = JSON.stringify(arr);
            rebuildRows();
            reEvalAllFormulas();
            const newAllCells = Array.from(rowsEl.querySelectorAll(".formula-cell"));
            newAllCells[insertIdx]?.focus();
          }
        });
        renderMath();
      }
      const sep = document.createElement("span");
      sep.className = "formula-sep";
      if (isBodyOnly) {
        sep.style.display = "none";
      } else if (isCtrl) {
        sep.textContent = " \u2192 ";
      } else {
        sep.textContent = " = ";
      }
      const resultEl = document.createElement("span");
      resultEl.className = "formula-result";
      resultEl.dataset.result = String(i);
      resultEl.textContent = isBodyOnly ? "" : "\u2014";
      exprSide.appendChild(cell);
      exprSide.appendChild(sep);
      exprSide.appendChild(resultEl);
      row.appendChild(exprSide);
      const refWrap = document.createElement("div");
      refWrap.className = "formula-ref-wrap";
      if (!isCtrl) {
        const refCell = document.createElement("div");
        refCell.contentEditable = "true";
        refCell.className = "formula-ref-cell";
        refCell.dataset.placeholder = "Reference\u2026";
        if (ref) refCell.innerText = ref;
        refCell.addEventListener("focus", () => {
          refCell.innerText = row.dataset.ref ?? "";
          const range = document.createRange();
          range.selectNodeContents(refCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        refCell.addEventListener("input", () => {
          row.dataset.ref = serializeEditable(refCell);
        });
        refCell.addEventListener("blur", () => {
          row.dataset.ref = serializeEditable(refCell);
          if (row.dataset.ref) row.classList.add("has-ref");
          else row.classList.remove("has-ref");
          syncContent();
          updateHasAnyRef();
        });
        refCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        refWrap.appendChild(refCell);
      }
      row.appendChild(refWrap);
      if (rowType === "if" || rowType === "for") {
        const group = document.createElement("div");
        group.className = "formula-block-group";
        if (desc) group.classList.add("has-group-desc");
        if (ref) group.classList.add("has-group-ref");
        const groupDescWrap = document.createElement("div");
        groupDescWrap.className = "formula-desc-wrap";
        const groupDescCell = document.createElement("div");
        groupDescCell.contentEditable = "true";
        groupDescCell.className = "formula-desc-cell";
        groupDescCell.dataset.placeholder = "Description\u2026";
        const renderGroupDesc = () => {
          const html = renderInlineMd(row.dataset.desc ?? "");
          if (html) groupDescCell.innerHTML = html;
          else groupDescCell.textContent = "";
        };
        groupDescCell.addEventListener("focus", () => {
          groupDescCell.innerText = row.dataset.desc ?? "";
          const range = document.createRange();
          range.selectNodeContents(groupDescCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupDescCell.addEventListener("input", () => {
          row.dataset.desc = serializeEditable(groupDescCell);
        });
        groupDescCell.addEventListener("blur", () => {
          row.dataset.desc = serializeEditable(groupDescCell);
          if (row.dataset.desc) {
            row.classList.add("has-desc");
            group.classList.add("has-group-desc");
          } else {
            row.classList.remove("has-desc");
            group.classList.remove("has-group-desc");
          }
          syncContent();
          updateHasAnyDesc();
          renderGroupDesc();
        });
        groupDescCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && !ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        renderGroupDesc();
        groupDescWrap.appendChild(groupDescCell);
        group.appendChild(groupDescWrap);
        const inner = document.createElement("div");
        inner.className = "formula-block-inner";
        group.appendChild(inner);
        const groupRefWrap = document.createElement("div");
        groupRefWrap.className = "formula-ref-wrap";
        const groupRefCell = document.createElement("div");
        groupRefCell.contentEditable = "true";
        groupRefCell.className = "formula-ref-cell";
        groupRefCell.dataset.placeholder = "Reference\u2026";
        if (ref) groupRefCell.innerText = ref;
        groupRefCell.addEventListener("focus", () => {
          groupRefCell.innerText = row.dataset.ref ?? "";
          const range = document.createRange();
          range.selectNodeContents(groupRefCell);
          range.collapse(false);
          globalThis.getSelection()?.removeAllRanges();
          globalThis.getSelection()?.addRange(range);
        });
        groupRefCell.addEventListener("input", () => {
          row.dataset.ref = serializeEditable(groupRefCell);
        });
        groupRefCell.addEventListener("blur", () => {
          row.dataset.ref = serializeEditable(groupRefCell);
          if (row.dataset.ref) {
            row.classList.add("has-ref");
            group.classList.add("has-group-ref");
          } else {
            row.classList.remove("has-ref");
            group.classList.remove("has-group-ref");
          }
          syncContent();
          updateHasAnyRef();
        });
        groupRefCell.addEventListener("keydown", (ev) => {
          if (ev.key === "Tab" && ev.shiftKey) {
            ev.preventDefault();
            cell.focus();
          }
          if (ev.key === "Enter") {
            ev.preventDefault();
            insertLineBreak();
          }
        });
        groupRefWrap.appendChild(groupRefCell);
        group.appendChild(groupRefWrap);
        peekContainer().appendChild(group);
        containerStack.push(inner);
        inner.appendChild(row);
      } else if (rowType === "end") {
        peekContainer().appendChild(row);
        if (containerStack.length > 1) containerStack.pop();
      } else {
        peekContainer().appendChild(row);
      }
    });
    updateHasAnyDesc();
    updateHasAnyRef();
  }
  const getRowIdx = (rowEl) => Array.from(rowsEl.querySelectorAll(".formula-row")).indexOf(rowEl);
  const ctxRefocus = (idx) => {
    rebuildRows();
    reEvalAllFormulas();
    const cells = rowsEl.querySelectorAll('.formula-cell:not([style*="display: none"])');
    cells[Math.max(0, Math.min(idx, cells.length - 1))]?.focus();
  };
  rowsEl._formulaCtxActions = {
    getRowState: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : -1;
      const rowType = rowEl?.dataset.rowType ?? null;
      const hasIf = arr.some((r) => r.type === "if");
      let hasElse = false;
      if (hasIf) {
        const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningBlockStart(arr, idx) : findContextIfBlock(arr);
        if (ownerIdx >= 0 && arr[ownerIdx]?.type === "if") {
          ({ hasElse } = findBranchInsertPoint(arr, ownerIdx));
        }
      }
      const canDelBranch = rowType === "elseif" || rowType === "else" || rowType === "for";
      return {
        rowType,
        hasIf,
        hasElse,
        canDelBranch
      };
    },
    insertRowAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },
    insertIfAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "",
        d: "",
        type: "if"
      }, {
        e: "",
        d: ""
      }, {
        e: "",
        d: "",
        type: "end"
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 2);
    },
    insertForAfter: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : arr.length - 1;
      arr.splice(idx + 1, 0, {
        e: "i = 1 to n",
        d: "",
        type: "for"
      }, {
        e: "",
        d: ""
      }, {
        e: "",
        d: "",
        type: "end"
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(idx + 1);
    },
    insertElseifFor: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningIfIdx(arr, idx) : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0, {
        e: "",
        d: "",
        type: "elseif"
      }, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx);
    },
    insertElseFor: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = rowEl ? getRowIdx(rowEl) : lastFocusedRowIdx;
      const ownerIdx = idx >= 0 ? arr[idx]?.type === "if" ? idx : findOwningIfIdx(arr, idx) : findContextIfBlock(arr);
      if (ownerIdx < 0) return;
      const { insertIdx, hasElse } = findBranchInsertPoint(arr, ownerIdx);
      if (hasElse) return;
      arr.splice(insertIdx, 0, {
        e: "",
        d: "",
        type: "else"
      }, {
        e: "",
        d: ""
      });
      block.content = JSON.stringify(arr);
      ctxRefocus(insertIdx + 1);
    },
    smartDeleteRow: (rowEl) => {
      const arr = parseFormulaRows(block.content);
      const idx = getRowIdx(rowEl);
      if (idx < 0) return;
      const undoStack = rowsEl._rowUndoStack ?? [];
      undoStack.push(Object.assign({}, arr[idx], {
        idx
      }));
      rowsEl._rowUndoStack = undoStack;
      const refocusIdx = smartDelete(arr, idx);
      block.content = JSON.stringify(arr);
      ctxRefocus(refocusIdx);
    },
    addDescription: (rowEl) => {
      const rt = rowEl.dataset.rowType;
      let descCell;
      if (rt === "if" || rt === "for") {
        const group = rowEl.closest(".formula-block-group");
        descCell = group?.querySelector(":scope > .formula-desc-wrap .formula-desc-cell") ?? null;
        if (descCell) {
          rowEl.classList.add("has-desc");
          group?.classList.add("has-group-desc");
          rowsEl.classList.add("has-any-desc");
          rowsEl.classList.add("has-any-row-desc");
        }
      } else {
        descCell = rowEl.querySelector(".formula-desc-cell");
        if (descCell) {
          rowEl.classList.add("has-desc");
          rowsEl.classList.add("has-any-row-desc");
          rowsEl.classList.add("has-any-desc");
        }
      }
      if (!descCell) return;
      descCell.focus();
    },
    isRegularRow: (rowEl) => !rowEl?.dataset.rowType,
    hasDescription: (rowEl) => !!rowEl?.classList.contains("has-desc"),
    addReference: (rowEl) => {
      const rt = rowEl.dataset.rowType;
      let refCell;
      if (rt === "if" || rt === "for") {
        const group = rowEl.closest(".formula-block-group");
        refCell = group?.querySelector(":scope > .formula-ref-wrap .formula-ref-cell") ?? null;
        if (refCell) {
          rowEl.classList.add("has-ref");
          group?.classList.add("has-group-ref");
          rowsEl.classList.add("has-any-ref");
          rowsEl.classList.add("has-any-row-ref");
        }
      } else {
        refCell = rowEl.querySelector(".formula-ref-cell");
        if (refCell) {
          rowEl.classList.add("has-ref");
          rowsEl.classList.add("has-any-row-ref");
          rowsEl.classList.add("has-any-ref");
        }
      }
      if (!refCell) return;
      refCell.focus();
    },
    hasReference: (rowEl) => !!rowEl?.classList.contains("has-ref")
  };
  rebuildRows();
}

// src/blocks/section.ts
function shiftBlocksBelowSection(sectionEl, prevBottom, deltaY) {
  if (!canvas || Math.abs(deltaY) < 1) return;
  for (const block of state.blocks) {
    if (block.id === sectionEl.id) continue;
    if (childToSection.has(block.id)) continue;
    const blockEl = canvas.domElement.querySelector(`#${block.id}`);
    if (!blockEl) continue;
    const blockTop = parseInt(blockEl.style.top || "0");
    if (blockTop >= prevBottom - 2) {
      const newTop = Math.max(margins.top, blockTop + deltaY);
      blockEl.style.top = `${newTop}px`;
      block.y = newTop - margins.top;
    }
  }
}
function refreshSectionHeight(sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content || content.classList.contains("collapsed")) return;
  const prevTop = parseInt(sectionEl.style.top || "0");
  const prevH = sectionEl.offsetHeight;
  let maxBottom = 60;
  content.querySelectorAll(".block").forEach((child) => {
    const b = parseInt(child.style.top || "0") + child.offsetHeight + GRID_SIZE;
    if (b > maxBottom) maxBottom = b;
  });
  const block = state.blocks.find((blk) => blk.id === sectionEl.id);
  const headerH = (sectionEl.querySelector(".section-header")?.offsetHeight ?? GRID_SIZE) + (sectionEl.querySelector(".section-summary")?.offsetHeight ?? GRID_SIZE) + (sectionEl.querySelector(".section-resize-handle")?.offsetHeight ?? 8);
  if (block?.h) {
    const contentCapacity = block.h - headerH - 2;
    if (maxBottom > contentCapacity) {
      sectionEl.style.height = "";
    } else {
      maxBottom = Math.max(maxBottom, contentCapacity);
    }
  }
  content.style.minHeight = `${maxBottom}px`;
  const newH = sectionEl.offsetHeight;
  const deltaY = newH - prevH;
  if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(sectionEl, prevTop + prevH, deltaY);
}
function refreshAllSectionHeights() {
  canvas.domElement.querySelectorAll(".section-block").forEach(refreshSectionHeight);
}
function updateSectionSummary(sectionEl, block) {
  const summary = sectionEl.querySelector(".section-summary");
  if (!summary) return;
  const prefix = (block.sectionName || "section") + "__";
  const summaryVars = sectionSummaryVarNames.get(sectionEl.id);
  const entries = summaryVars && summaryVars.size > 0 ? [
    ...summaryVars
  ].map((k) => {
    const v = globalScope[prefix + k] ?? globalScope[k];
    if (!v) return null;
    const unit = formatUnit(v.u);
    return `${k} = ${fmtNum(v.v)}${unit ? " " + unit : ""}`;
  }).filter(Boolean) : [];
  const comparisons = sectionSummaryComparisons.get(sectionEl.id) ?? [];
  if (entries.length === 0 && comparisons.length === 0) {
    summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
    return;
  }
  summary.innerHTML = "";
  if (entries.length > 0) {
    const varsSpan = document.createElement("span");
    varsSpan.textContent = entries.join("\xA0\xA0|\xA0\xA0");
    summary.appendChild(varsSpan);
  }
  for (const cmp of comparisons) {
    if (entries.length > 0 || summary.childElementCount > 0) {
      summary.appendChild(document.createTextNode("\xA0\xA0|\xA0\xA0"));
    }
    const badge = document.createElement("span");
    badge.className = cmp.pass ? "section-cmp-pass" : "section-cmp-fail";
    badge.textContent = (cmp.pass ? "\u2713 " : "\u2717 ") + cmp.expr;
    summary.appendChild(badge);
  }
}
function reparentToSection(childEl, sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content) return;
  const sectionBlock = state.blocks.find((b) => b.id === sectionEl.id);
  const childBlock = state.blocks.find((b) => b.id === childEl.id);
  if (!sectionBlock || !childBlock) return;
  const contentRect = content.getBoundingClientRect();
  const childRect = childEl.getBoundingClientRect();
  const relLeft = Math.max(0, Math.round((childRect.left - contentRect.left) / GRID_SIZE) * GRID_SIZE);
  const relTop = Math.max(0, Math.round((childRect.top - contentRect.top) / GRID_SIZE) * GRID_SIZE);
  content.appendChild(childEl);
  childEl.style.left = `${relLeft}px`;
  childEl.style.top = `${relTop}px`;
  childEl.style.maxWidth = "";
  childBlock.x = relLeft;
  childBlock.y = relTop;
  childBlock.parentSectionId = sectionBlock.id;
  childToSection.set(childBlock.id, sectionBlock.id);
  refreshSectionHeight(sectionEl);
}
function unparentFromSection(childEl, sectionEl) {
  const content = sectionEl.querySelector(".section-content");
  if (!content) return;
  const childBlock = state.blocks.find((b) => b.id === childEl.id);
  if (!childBlock) return;
  const contentRect = content.getBoundingClientRect();
  const canvasRect = canvas.domElement.getBoundingClientRect();
  const absLeft = clamp(Math.round((contentRect.left - canvasRect.left + childBlock.x) / GRID_SIZE) * GRID_SIZE, margins.left, CANVAS_W - margins.right);
  const absTop = clamp(Math.round((contentRect.top - canvasRect.top + childBlock.y) / GRID_SIZE) * GRID_SIZE, margins.top, CANVAS_H);
  canvas.domElement.appendChild(childEl);
  childEl.style.left = `${absLeft}px`;
  childEl.style.top = `${absTop}px`;
  childEl.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;
  childBlock.x = absLeft - margins.left;
  childBlock.y = absTop - margins.top;
  delete childBlock.parentSectionId;
  childToSection.delete(childBlock.id);
  refreshSectionHeight(sectionEl);
}
function sectionAtPoint(cx, cy) {
  for (const el of canvas.domElement.querySelectorAll(".section-block")) {
    const content = el.querySelector(".section-content");
    if (!content || content.classList.contains("collapsed")) continue;
    const elLeft = parseInt(el.style.left || "0");
    const elTop = parseInt(el.style.top || "0");
    const contentTop = elTop + content.offsetTop;
    if (cx >= elLeft && cx <= elLeft + el.offsetWidth && cy >= contentTop && cy <= contentTop + content.offsetHeight) return el;
  }
  return null;
}
var SECTION_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899"
];
var _sectionColorIdx = 0;
function nextSectionColor() {
  return SECTION_COLORS[_sectionColorIdx++ % SECTION_COLORS.length];
}
function nextSectionName() {
  const existing = new Set(state.blocks.filter((b) => b.type === "section" && b.sectionName).map((b) => b.sectionName));
  let i = 1;
  while (existing.has(`section${i}`)) i++;
  return `section${i}`;
}
function sanitizeSectionName(raw) {
  return raw.trim().replace(/[\s\-]+/g, "_").replace(/[^A-Za-z0-9_]/g, "").replace(/__+/g, "_").replace(/^[0-9_]+/, "").replace(/_+$/, "");
}
function buildSectionBlock(el, block) {
  const color = block.sectionColor ?? nextSectionColor();
  block.sectionColor = color;
  el.style.setProperty("--section-color", color);
  el.classList.add("section-block");
  const header = document.createElement("div");
  header.className = "section-header";
  const toggle = document.createElement("button");
  toggle.className = "section-toggle";
  toggle.textContent = block.collapsed ? "\u25B6" : "\u25BC";
  toggle.title = "Collapse / expand section";
  const title = document.createElement("span");
  title.className = "section-title";
  title.contentEditable = "true";
  title.textContent = block.sectionName ?? "section1";
  title.dataset.placeholder = "Section name\u2026";
  title.addEventListener("mousedown", (ev) => {
    ev.stopPropagation();
  });
  title.addEventListener("blur", () => {
    const candidate = sanitizeSectionName(title.textContent ?? "") || block.sectionName || nextSectionName();
    const isDuplicate = state.blocks.some((b) => b.type === "section" && b.id !== block.id && b.sectionName === candidate);
    if (isDuplicate) {
      title.style.color = "#ef4444";
      title.style.outline = "1px solid #ef4444";
      title.textContent = block.sectionName ?? candidate;
      setTimeout(() => {
        title.style.color = "";
        title.style.outline = "";
      }, 1500);
    } else {
      title.textContent = candidate;
      block.sectionName = candidate;
      reEvalAllFormulas();
    }
  });
  title.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      title.blur();
    }
  });
  header.appendChild(toggle);
  header.appendChild(title);
  el.appendChild(header);
  const summary = document.createElement("div");
  summary.className = "section-summary";
  summary.innerHTML = '<span class="section-summary-empty">no outputs yet</span>';
  el.appendChild(summary);
  const content = document.createElement("div");
  content.className = "section-content";
  if (block.collapsed) {
    content.classList.add("collapsed");
    el.style.minHeight = "0";
  }
  el.appendChild(content);
  toggle.addEventListener("click", (ev) => {
    ev.stopPropagation();
    const prevBottom = parseInt(el.style.top || "0") + el.offsetHeight;
    block.collapsed = !block.collapsed;
    toggle.textContent = block.collapsed ? "\u25B6" : "\u25BC";
    content.classList.toggle("collapsed", block.collapsed);
    if (block.collapsed) {
      el.style.height = "";
      el.style.minHeight = "0";
      resizeHandle.style.display = "none";
    } else {
      el.style.minHeight = "";
      el.style.height = "";
      resizeHandle.style.display = "";
      updateSectionSummary(el, block);
    }
    const newBottom = parseInt(el.style.top || "0") + el.offsetHeight;
    const deltaY = newBottom - prevBottom;
    if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, prevBottom, deltaY);
  });
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "section-resize-handle";
  if (block.collapsed) resizeHandle.style.display = "none";
  el.appendChild(resizeHandle);
  resizeHandle.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    ev.stopPropagation();
    ev.preventDefault();
    resizeHandle.setPointerCapture(ev.pointerId);
    resizeHandle.classList.add("handle-active");
    const startY = ev.clientY;
    const startH = el.offsetHeight;
    const startBottom = parseInt(el.style.top || "0") + startH;
    document.body.style.cursor = "ns-resize";
    const onMove = (mv) => {
      const newH = Math.max(80, startH + (mv.clientY - startY));
      block.h = newH;
      el.style.height = `${newH}px`;
      const headerH = (el.querySelector(".section-header")?.offsetHeight ?? GRID_SIZE) + (el.querySelector(".section-summary")?.offsetHeight ?? GRID_SIZE) + (el.querySelector(".section-resize-handle")?.offsetHeight ?? 8);
      content.style.minHeight = `${Math.max(GRID_SIZE * 2, newH - headerH - 2)}px`;
    };
    const onUp = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onUp);
      resizeHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
      const newBottom = parseInt(el.style.top || "0") + el.offsetHeight;
      const deltaY = newBottom - startBottom;
      if (Math.abs(deltaY) > 1) shiftBlocksBelowSection(el, startBottom, deltaY);
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onUp);
  });
  content.addEventListener("click", (ev) => {
    if (ev.target.closest(".block:not(.section-block)")) return;
    const canvasRect = canvas.domElement.getBoundingClientRect();
    onMoveGridCursor?.(ev.clientX - canvasRect.left, ev.clientY - canvasRect.top);
  });
  const childResizeObserver = new ResizeObserver(() => refreshSectionHeight(el));
  const childMutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLElement && node.classList.contains("block")) {
          childResizeObserver.observe(node);
        }
      }
      for (const node of m.removedNodes) {
        if (node instanceof HTMLElement && node.classList.contains("block")) {
          childResizeObserver.unobserve(node);
        }
      }
    }
    refreshSectionHeight(el);
  });
  childMutationObserver.observe(content, {
    childList: true
  });
  header.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    if (ev.target.isContentEditable) return;
    if (ev.target.tagName === "BUTTON") return;
    ev.stopPropagation();
    if (!selectedEls.has(el)) onSelectBlock?.(el);
    setMultiDragState({
      startX: ev.clientX,
      startY: ev.clientY,
      origPositions: new Map([
        ...selectedEls
      ].map((s) => [
        s,
        {
          left: parseInt(s.style.left),
          top: parseInt(s.style.top)
        }
      ]))
    });
    document.body.style.cursor = "grabbing";
    ev.preventDefault();
  });
}

// src/blocks/plot.ts
var PLOT_W = 420;
var PLOT_H = 240;
var PLOT_ML = 54;
var PLOT_MR = 12;
var PLOT_MT = 14;
var PLOT_MB = 40;
function fmtTick(v) {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e4 || abs < 1e-3 && abs > 0) return v.toExponential(1);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}
function niceStep(range, targetTicks) {
  if (range === 0) return 1;
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  return (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
}
function computePlotML(yMin, yMax) {
  const yRange = yMax - yMin || 1;
  const yStep = niceStep(yRange, 5);
  let maxLen = 1;
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 1e-3; yv += yStep) {
    const len = fmtTick(+yv.toPrecision(10)).length;
    if (len > maxLen) maxLen = len;
  }
  return Math.max(PLOT_ML, Math.round(maxLen * 5.5 + 12));
}
function interpolatePlot(points, xTarget) {
  if (points.length === 0) return NaN;
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i][0] <= xTarget && points[i + 1][0] >= xTarget) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      if (!isFinite(y0) || !isFinite(y1)) return NaN;
      return y0 + (xTarget - x0) / (x1 - x0) * (y1 - y0);
    }
  }
  return NaN;
}
function buildPlotSVG(points, cfg, yMin, yMax, dark, markerData = []) {
  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
  const bg = dark ? "#18181b" : "#ffffff";
  const fg = dark ? "#e4e4e7" : "#18181b";
  const grid = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const axis = dark ? "#52525b" : "#9ca3af";
  const zero = dark ? "#71717a" : "#d1d5db";
  const curve = dark ? "#38bdf8" : "#2563eb";
  const xRange = cfg.xMax - cfg.xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSX = (x) => ml + (x - cfg.xMin) / xRange * pw;
  const toSY = (y) => PLOT_MT + ph - (y - yMin) / yRange * ph;
  const cpId = `pc${Math.random().toString(36).slice(2, 9)}`;
  const clampLy = (y) => Math.max(PLOT_MT + 8, Math.min(PLOT_H - 6, y));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${PLOT_W}" height="${PLOT_H}" style="display:block;max-width:100%">`;
  s += `<rect width="${PLOT_W}" height="${PLOT_H}" fill="${bg}"/>`;
  s += `<clipPath id="${cpId}"><rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}"/></clipPath>`;
  const xStep = niceStep(xRange, 5);
  for (let xv = Math.ceil(cfg.xMin / xStep) * xStep; xv <= cfg.xMax + xStep * 1e-3; xv += xStep) {
    const sx = toSX(xv).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${sx}" y1="${PLOT_MT + ph}" x2="${sx}" y2="${PLOT_MT + ph + 4}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${sx}" y="${PLOT_MT + ph + 14}" text-anchor="middle" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+xv.toPrecision(10))}</text>`;
  }
  const yStep = niceStep(yRange, 5);
  for (let yv = Math.ceil(yMin / yStep) * yStep; yv <= yMax + yStep * 1e-3; yv += yStep) {
    const sy = toSY(yv).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${grid}" stroke-width="1"/>`;
    s += `<line x1="${ml - 4}" y1="${sy}" x2="${ml}" y2="${sy}" stroke="${axis}" stroke-width="1"/>`;
    s += `<text x="${ml - 6}" y="${sy}" dominant-baseline="middle" text-anchor="end" font-size="9" fill="${fg}" font-family="monospace">${fmtTick(+yv.toPrecision(10))}</text>`;
  }
  s += `<rect x="${ml}" y="${PLOT_MT}" width="${pw}" height="${ph}" fill="none" stroke="${axis}" stroke-width="1"/>`;
  if (cfg.xMin <= 0 && cfg.xMax >= 0) {
    const sx = toSX(0).toFixed(1);
    s += `<line x1="${sx}" y1="${PLOT_MT}" x2="${sx}" y2="${PLOT_MT + ph}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (yMin <= 0 && yMax >= 0) {
    const sy = toSY(0).toFixed(1);
    s += `<line x1="${ml}" y1="${sy}" x2="${ml + pw}" y2="${sy}" stroke="${zero}" stroke-width="1" stroke-dasharray="3,2"/>`;
  }
  if (points.length > 1) {
    let d = "";
    let penDown = false;
    for (const [xv, yv] of points) {
      if (!isFinite(yv)) {
        penDown = false;
        continue;
      }
      d += `${penDown ? "L" : "M"}${toSX(xv).toFixed(1)},${toSY(yv).toFixed(1)} `;
      penDown = true;
    }
    if (d) s += `<path d="${d.trim()}" fill="none" stroke="${curve}" stroke-width="2" stroke-linejoin="round" clip-path="url(#${cpId})"/>`;
  }
  const MAX_ANNOT = 14;
  const zeroCrossings = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (!isFinite(y0) || !isFinite(y1)) continue;
    if (y0 === 0) {
      zeroCrossings.push(x0);
    } else if (y0 * y1 < 0) {
      zeroCrossings.push(x0 + -y0 / (y1 - y0) * (x1 - x0));
    }
  }
  const zeroCol = dark ? "#2dd4bf" : "#0d9488";
  if (zeroCrossings.length <= MAX_ANNOT) {
    for (const xc of zeroCrossings) {
      const sx = toSX(xc);
      if (sx < ml || sx > ml + pw) continue;
      const sy = toSY(0);
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${zeroCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy - 5).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${zeroCol}" font-family="monospace">(${fmtTick(xc)}, 0)</text>`;
    }
  }
  const extrema = [];
  for (let i = 2; i < points.length - 2; i++) {
    const [, ya] = points[i - 2];
    const [, yb] = points[i - 1];
    const [xv, yv] = points[i];
    const [, yc] = points[i + 1];
    const [, yd] = points[i + 2];
    if (!isFinite(ya) || !isFinite(yb) || !isFinite(yv) || !isFinite(yc) || !isFinite(yd)) continue;
    if (yv >= yb && yv >= yc && yv > ya && yv > yd) {
      extrema.push({
        x: xv,
        y: yv,
        kind: "max"
      });
    } else if (yv <= yb && yv <= yc && yv < ya && yv < yd) {
      extrema.push({
        x: xv,
        y: yv,
        kind: "min"
      });
    }
  }
  const maxCol = dark ? "#fbbf24" : "#d97706";
  const minCol = dark ? "#f87171" : "#dc2626";
  if (extrema.length <= MAX_ANNOT) {
    for (const { x: xv, y: yv, kind } of extrema) {
      const sx = toSX(xv), sy = toSY(yv);
      if (sx < ml || sx > ml + pw || sy < PLOT_MT || sy > PLOT_MT + ph) continue;
      const col = kind === "max" ? maxCol : minCol;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="${col}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 4 : sx + 4;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      const rawLy = kind === "max" ? sy - 5 : sy + 12;
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(rawLy).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${col}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }
  const markerCol = dark ? "#f472b6" : "#db2777";
  for (const [xv, yv] of markerData) {
    if (!isFinite(yv)) continue;
    const sx = toSX(xv), sy = toSY(yv);
    if (sx >= ml && sx <= ml + pw && sy >= PLOT_MT && sy <= PLOT_MT + ph) {
      const d = 5;
      s += `<polygon points="${sx.toFixed(1)},${(sy - d).toFixed(1)} ${(sx + d).toFixed(1)},${sy.toFixed(1)} ${sx.toFixed(1)},${(sy + d).toFixed(1)} ${(sx - d).toFixed(1)},${sy.toFixed(1)}" fill="${markerCol}" stroke="${bg}" stroke-width="1" clip-path="url(#${cpId})"/>`;
      const lx = sx > ml + pw * 0.75 ? sx - 7 : sx + 7;
      const anchor = sx > ml + pw * 0.75 ? "end" : "start";
      s += `<text x="${lx.toFixed(1)}" y="${clampLy(sy + 4).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="${markerCol}" font-family="monospace">(${fmtTick(xv)}, ${fmtTick(yv)})</text>`;
    }
  }
  if (cfg.xLabel) {
    s += `<text x="${ml + pw / 2}" y="${PLOT_H - 4}" text-anchor="middle" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.xLabel}</text>`;
  }
  if (cfg.yLabel) {
    const cy = PLOT_MT + ph / 2;
    s += `<text x="10" y="${cy}" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90,10,${cy})" font-size="10" fill="${fg}" font-family="system-ui,sans-serif">${cfg.yLabel}</text>`;
  }
  s += "</svg>";
  return s;
}
function evalPlotData(block) {
  let cfg;
  try {
    cfg = {
      ...DEFAULT_PLOT,
      ...JSON.parse(block.content || "{}")
    };
  } catch {
    cfg = {
      ...DEFAULT_PLOT
    };
  }
  if (!cfg.expr.trim()) return {
    points: [],
    yMin: -1,
    yMax: 1,
    markerData: []
  };
  const points = [];
  let yMin = Infinity, yMax = -Infinity;
  let error;
  for (let i = 0; i <= cfg.nPts; i++) {
    const xv = cfg.xMin + (cfg.xMax - cfg.xMin) * (i / cfg.nPts);
    const scope = {
      ...globalScope,
      [cfg.xVar]: {
        v: xv,
        u: {}
      }
    };
    try {
      const yv = evalExpr(cfg.expr, scope, globalFnScope).v;
      points.push([
        xv,
        isFinite(yv) ? yv : NaN
      ]);
      if (isFinite(yv)) {
        if (yv < yMin) yMin = yv;
        if (yv > yMax) yMax = yv;
      }
    } catch (e) {
      error = e.message;
      break;
    }
  }
  if (!isFinite(yMin)) {
    yMin = -1;
    yMax = 1;
  } else if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  } else {
    const pad = (yMax - yMin) * 0.05;
    yMin -= pad;
    yMax += pad;
  }
  const markers = Array.isArray(cfg.markers) ? cfg.markers : [];
  const markerData = markers.map((xv) => {
    const scope = {
      ...globalScope,
      [cfg.xVar]: {
        v: xv,
        u: {}
      }
    };
    try {
      return [
        xv,
        evalExpr(cfg.expr, scope, globalFnScope).v
      ];
    } catch {
      return [
        xv,
        NaN
      ];
    }
  });
  return {
    points,
    yMin,
    yMax,
    markerData,
    error
  };
}
function showPlotMarkerInput(xDefault, cfg, onMarkerChange, clientX, clientY) {
  document.querySelector(".plot-ctx-popup")?.remove();
  const popup = document.createElement("div");
  popup.className = "plot-ctx-popup";
  popup.style.left = `${clientX}px`;
  popup.style.top = `${clientY}px`;
  const row = document.createElement("div");
  row.className = "plot-ctx-row";
  const label = document.createElement("span");
  label.className = "plot-ctx-label";
  label.textContent = "x =";
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "plot-ctx-input";
  inp.value = fmtTick(+xDefault.toPrecision(6));
  inp.step = "any";
  const addBtn = document.createElement("button");
  addBtn.className = "plot-ctx-btn plot-ctx-btn-primary";
  addBtn.textContent = "Add";
  addBtn.onclick = () => {
    const xv = parseFloat(inp.value);
    if (isFinite(xv)) {
      if (!Array.isArray(cfg.markers)) cfg.markers = [];
      cfg.markers.push(xv);
      onMarkerChange();
    }
    popup.remove();
  };
  const clearBtn = document.createElement("button");
  clearBtn.className = "plot-ctx-btn";
  clearBtn.textContent = "Clear All";
  clearBtn.onclick = () => {
    cfg.markers = [];
    onMarkerChange();
    popup.remove();
  };
  row.appendChild(label);
  row.appendChild(inp);
  row.appendChild(addBtn);
  row.appendChild(clearBtn);
  popup.appendChild(row);
  document.body.appendChild(popup);
  inp.focus();
  inp.select();
  inp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addBtn.click();
    if (e.key === "Escape") popup.remove();
  });
  const closeOutside = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener("mousedown", closeOutside);
    }
  };
  setTimeout(() => document.addEventListener("mousedown", closeOutside), 0);
}
function attachPlotHover(svgWrap, points, cfg, yMin, yMax, onMarkerChange) {
  const svgEl = svgWrap.querySelector("svg");
  if (!svgEl) return;
  const ml = computePlotML(yMin, yMax);
  const pw = PLOT_W - ml - PLOT_MR;
  const ph = PLOT_H - PLOT_MT - PLOT_MB;
  const xRange = cfg.xMax - cfg.xMin || 1;
  const yRange = yMax - yMin || 1;
  const toSY = (y) => PLOT_MT + ph - (y - yMin) / yRange * ph;
  const toDataX = (sx) => cfg.xMin + (sx - ml) / pw * xRange;
  const dark = isDark();
  const hoverColor = dark ? "#34d399" : "#059669";
  const hoverBg = dark ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.88)";
  const hoverFg = dark ? "#e4e4e7" : "#18181b";
  const ns = "http://www.w3.org/2000/svg";
  const hg = document.createElementNS(ns, "g");
  hg.style.display = "none";
  hg.style.pointerEvents = "none";
  const hLine = document.createElementNS(ns, "line");
  hLine.setAttribute("stroke", hoverColor);
  hLine.setAttribute("stroke-width", "1");
  hLine.setAttribute("stroke-dasharray", "3,2");
  hLine.setAttribute("y1", String(PLOT_MT));
  hLine.setAttribute("y2", String(PLOT_MT + ph));
  const hDot = document.createElementNS(ns, "circle");
  hDot.setAttribute("r", "4");
  hDot.setAttribute("fill", hoverColor);
  const hBg = document.createElementNS(ns, "rect");
  hBg.setAttribute("rx", "3");
  hBg.setAttribute("fill", hoverBg);
  const hTxt = document.createElementNS(ns, "text");
  hTxt.setAttribute("font-size", "9");
  hTxt.setAttribute("fill", hoverFg);
  hTxt.setAttribute("font-family", "monospace");
  hg.appendChild(hLine);
  hg.appendChild(hDot);
  hg.appendChild(hBg);
  hg.appendChild(hTxt);
  svgEl.appendChild(hg);
  function getSVGX(e) {
    const rect = svgEl.getBoundingClientRect();
    return (e.clientX - rect.left) * (PLOT_W / rect.width);
  }
  svgEl.addEventListener("mousemove", (e) => {
    const me = e;
    const sx = getSVGX(me);
    if (sx < ml || sx > ml + pw) {
      hg.style.display = "none";
      return;
    }
    const xv = toDataX(sx);
    const yv = interpolatePlot(points, xv);
    if (!isFinite(yv)) {
      hg.style.display = "none";
      return;
    }
    const sy = toSY(yv);
    hg.style.display = "";
    hLine.setAttribute("x1", sx.toFixed(1));
    hLine.setAttribute("x2", sx.toFixed(1));
    hDot.setAttribute("cx", sx.toFixed(1));
    hDot.setAttribute("cy", sy.toFixed(1));
    const label = `(${fmtTick(+xv.toPrecision(5))}, ${fmtTick(+yv.toPrecision(5))})`;
    hTxt.textContent = label;
    const txtW = label.length * 5.5 + 8;
    const txtH = 14;
    let tx = sx + 8;
    if (tx + txtW > ml + pw) tx = sx - txtW - 8;
    const ty = sy < PLOT_MT + ph * 0.25 ? sy + 16 : sy - 6;
    hBg.setAttribute("x", String(tx - 2));
    hBg.setAttribute("y", String(ty - 11));
    hBg.setAttribute("width", String(txtW));
    hBg.setAttribute("height", String(txtH));
    hTxt.setAttribute("x", String(tx));
    hTxt.setAttribute("y", String(ty));
  });
  svgEl.addEventListener("mouseleave", () => {
    hg.style.display = "none";
  });
  svgEl.addEventListener("contextmenu", (e) => {
    const me = e;
    me.preventDefault();
    me.stopPropagation();
    const sx = getSVGX(me);
    showPlotMarkerInput(toDataX(sx), cfg, onMarkerChange, me.clientX, me.clientY);
  });
  svgEl.addEventListener("mousedown", (e) => e.stopPropagation());
}
function buildPlotBlock(el, block) {
  el.classList.add("plot-block");
  let cfg;
  try {
    cfg = {
      ...DEFAULT_PLOT,
      ...JSON.parse(block.content || "{}")
    };
  } catch {
    cfg = {
      ...DEFAULT_PLOT
    };
    block.content = JSON.stringify(cfg);
  }
  const controls = document.createElement("div");
  controls.className = "plot-controls";
  const exprRow = document.createElement("div");
  exprRow.className = "plot-row";
  const exprLabel = document.createElement("span");
  exprLabel.className = "plot-label";
  exprLabel.textContent = "y =";
  const exprCell = document.createElement("div");
  exprCell.contentEditable = "true";
  exprCell.className = "plot-input plot-expr plot-cell";
  exprCell.dataset.placeholder = "e.g. sin(x),  x^2 + b,  m*x + c";
  exprCell.dataset.raw = cfg.expr;
  exprRow.appendChild(exprLabel);
  exprRow.appendChild(exprCell);
  controls.appendChild(exprRow);
  const rangeRow = document.createElement("div");
  rangeRow.className = "plot-row";
  const mkLabel = (text) => {
    const s = document.createElement("span");
    s.className = "plot-label";
    s.textContent = text;
    return s;
  };
  const mkNumInput = (val, w) => {
    const inp = document.createElement("input");
    inp.type = "number";
    inp.className = "plot-input plot-range";
    inp.style.width = w;
    inp.value = String(val);
    inp.step = "any";
    return inp;
  };
  const xVarCell = document.createElement("div");
  xVarCell.contentEditable = "true";
  xVarCell.className = "plot-input plot-xvar plot-cell";
  xVarCell.dataset.placeholder = "x";
  xVarCell.dataset.raw = cfg.xVar;
  xVarCell.title = "Sweep variable name";
  const xMinInput = mkNumInput(cfg.xMin, "4.5rem");
  const xMaxInput = mkNumInput(cfg.xMax, "4.5rem");
  rangeRow.appendChild(mkLabel("x:"));
  rangeRow.appendChild(xVarCell);
  rangeRow.appendChild(mkLabel("from"));
  rangeRow.appendChild(xMinInput);
  rangeRow.appendChild(mkLabel("to"));
  rangeRow.appendChild(xMaxInput);
  controls.appendChild(rangeRow);
  el.appendChild(controls);
  const svgWrap = document.createElement("div");
  svgWrap.className = "plot-svg-wrap";
  el.appendChild(svgWrap);
  const errEl = document.createElement("div");
  errEl.className = "plot-err";
  el.appendChild(errEl);
  function render() {
    const { points, yMin, yMax, markerData, error } = evalPlotData(block);
    if (error) {
      errEl.textContent = "\u26A0 " + error;
      svgWrap.innerHTML = "";
      return;
    }
    errEl.textContent = "";
    let cfgNow;
    try {
      cfgNow = {
        ...DEFAULT_PLOT,
        ...JSON.parse(block.content || "{}")
      };
    } catch {
      cfgNow = {
        ...DEFAULT_PLOT
      };
    }
    svgWrap.innerHTML = buildPlotSVG(points, cfgNow, yMin, yMax, isDark(), markerData);
    attachPlotHover(svgWrap, points, cfgNow, yMin, yMax, () => {
      block.content = JSON.stringify(cfgNow);
      render();
    });
  }
  function syncAndRender() {
    cfg.expr = exprCell.dataset.raw ?? "";
    cfg.xVar = xVarCell.dataset.raw?.trim() || "x";
    cfg.xMin = parseFloat(xMinInput.value);
    cfg.xMax = parseFloat(xMaxInput.value);
    if (!isFinite(cfg.xMin)) cfg.xMin = 0;
    if (!isFinite(cfg.xMax) || cfg.xMax <= cfg.xMin) cfg.xMax = cfg.xMin + 1;
    block.content = JSON.stringify(cfg);
    render();
  }
  function renderExprMath() {
    const html = prettifyExpr(exprCell.dataset.raw ?? "");
    if (html) exprCell.innerHTML = html;
    else exprCell.textContent = exprCell.dataset.raw ?? "";
  }
  function renderXVarMath() {
    const html = prettifyExpr(xVarCell.dataset.raw ?? "");
    if (html) xVarCell.innerHTML = html;
    else xVarCell.textContent = xVarCell.dataset.raw ?? "";
  }
  function bindCell(cell, renderMath) {
    cell.addEventListener("focus", () => {
      cell.textContent = cell.dataset.raw ?? "";
      const range = document.createRange();
      range.selectNodeContents(cell);
      range.collapse(false);
      globalThis.getSelection()?.removeAllRanges();
      globalThis.getSelection()?.addRange(range);
    });
    cell.addEventListener("input", () => {
      cell.dataset.raw = cell.textContent ?? "";
    });
    cell.addEventListener("blur", () => {
      cell.dataset.raw = cell.textContent?.trim() ?? "";
      syncAndRender();
      renderMath();
    });
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });
  }
  bindCell(exprCell, renderExprMath);
  bindCell(xVarCell, renderXVarMath);
  for (const inp of [
    xMinInput,
    xMaxInput
  ]) {
    inp.addEventListener("blur", syncAndRender);
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.target.blur();
    });
  }
  renderExprMath();
  renderXVarMath();
  el.__plotRerender = render;
  render();
}

// src/blocks/_math-block-helpers.ts
function numInput(label, unit, defaultVal) {
  const wrap = document.createElement("label");
  wrap.className = "math-row";
  const lbl = document.createElement("span");
  lbl.className = "math-label";
  lbl.textContent = label;
  wrap.appendChild(lbl);
  const inp = document.createElement("input");
  inp.type = "number";
  inp.className = "block-input";
  inp.value = String(defaultVal);
  inp.step = "any";
  wrap.appendChild(inp);
  if (unit) {
    const u = document.createElement("span");
    u.className = "math-unit";
    u.textContent = unit;
    wrap.appendChild(u);
  }
  return wrap;
}
function resultRow(label, unit) {
  const row = document.createElement("div");
  row.className = "math-result-row";
  const lbl = document.createElement("span");
  lbl.className = "math-label";
  lbl.textContent = label;
  row.appendChild(lbl);
  const value = document.createElement("span");
  value.className = "math-result-value";
  value.textContent = "\u2014";
  row.appendChild(value);
  if (unit) {
    const u = document.createElement("span");
    u.className = "math-unit";
    u.textContent = unit;
    row.appendChild(u);
  }
  return {
    row,
    value
  };
}

// src/blocks/sect-prop.ts
function buildSectPropBlock(el) {
  const title = document.createElement("div");
  title.className = "math-title";
  title.textContent = "Section Properties";
  el.appendChild(title);
  const bRow = numInput("b", "mm", 100);
  const hRow = numInput("h", "mm", 200);
  const bInp = bRow.querySelector("input");
  const hInp = hRow.querySelector("input");
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  const { row: aRow, value: aVal } = resultRow("Area", "mm\xB2");
  const { row: ixRow, value: ixVal } = resultRow("I\u2093", "mm\u2074");
  function calc() {
    const b = parseFloat(bInp.value);
    const h = parseFloat(hInp.value);
    if (!isNaN(b) && !isNaN(h)) {
      aVal.textContent = rect_area(b, h).toFixed(2);
      ixVal.textContent = rect_ix(b, h).toFixed(2);
    }
  }
  bInp.addEventListener("input", calc);
  hInp.addEventListener("input", calc);
  el.appendChild(bRow);
  el.appendChild(hRow);
  el.appendChild(divider);
  el.appendChild(aRow);
  el.appendChild(ixRow);
  calc();
}

// src/blocks/beam-def.ts
function buildBeamDefBlock(el, E_default) {
  const title = document.createElement("div");
  title.className = "math-title";
  title.textContent = "Beam Deflection";
  const pRow = numInput("P", "kN", 10);
  const lRow = numInput("L", "mm", 3e3);
  const eRow = numInput("E", "MPa", E_default);
  const iRow = numInput("I\u2093", "mm\u2074", 8333333);
  const pInp = pRow.querySelector("input");
  const lInp = lRow.querySelector("input");
  const eInp = eRow.querySelector("input");
  const iInp = iRow.querySelector("input");
  const divider = document.createElement("hr");
  divider.className = "math-divider";
  const { row: dRow, value: dVal } = resultRow("\u03B4\u2098\u2090\u2093", "mm");
  function calc() {
    const p = parseFloat(pInp.value) * 1e3;
    const l = parseFloat(lInp.value);
    const e = parseFloat(eInp.value);
    const i = parseFloat(iInp.value);
    if (![
      p,
      l,
      e,
      i
    ].some(isNaN)) {
      dVal.textContent = solve_beam_deflection(p, l, e, i).toFixed(4);
    }
  }
  pInp.addEventListener("input", calc);
  lInp.addEventListener("input", calc);
  eInp.addEventListener("input", calc);
  iInp.addEventListener("input", calc);
  el.appendChild(title);
  el.appendChild(pRow);
  el.appendChild(lRow);
  el.appendChild(eRow);
  el.appendChild(iRow);
  el.appendChild(divider);
  el.appendChild(dRow);
  calc();
}

// src/blocks/text.ts
function buildTextBlock(el, block) {
  el.classList.add("text-block");
  const DEFAULT_W = 240;
  el.style.width = `${block.w ?? DEFAULT_W}px`;
  const viewDiv = document.createElement("div");
  viewDiv.className = "md-view";
  const toolbar = document.createElement("div");
  toolbar.className = "md-toolbar";
  toolbar.style.display = "none";
  const editArea = document.createElement("textarea");
  editArea.className = "md-edit";
  editArea.placeholder = "Markdown text\u2026\n\n# Heading\n**bold**  *italic*  `code`\n- list item\n  - sub-item\n- [ ] task\n> blockquote\n[link](url)  ![alt](url)\n$a = x^2$\n$$E = mc^2$$";
  editArea.spellcheck = true;
  function syncHeight() {
    editArea.style.height = "auto";
    const snapH = (v) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(editArea.scrollHeight, 60))}px`;
  }
  function saveContent() {
    block.content = editArea.value;
  }
  function insertAt(text, cursorOffset) {
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    editArea.setRangeText(text, start2, end, "end");
    if (cursorOffset !== void 0) {
      const pos = start2 + cursorOffset;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function wrapSelection(prefix, suffix = prefix) {
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const selected = editArea.value.slice(start2, end);
    const newText = prefix + selected + suffix;
    editArea.setRangeText(newText, start2, end, "end");
    if (!selected) {
      const pos = start2 + prefix.length;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function prefixLines(prefix) {
    const val = editArea.value;
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
    const rawEnd = val.indexOf("\n", end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split("\n");
    const newText = lines.map((l) => prefix + l).join("\n");
    editArea.setRangeText(newText, lineStart, lineEnd, "end");
    const cursorPos = lineStart + prefix.length;
    editArea.setSelectionRange(cursorPos, cursorPos);
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function dedentLines(n) {
    const val = editArea.value;
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
    const rawEnd = val.indexOf("\n", end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split("\n");
    const newText = lines.map((l) => l.replace(new RegExp(`^ {1,${n}}`), "")).join("\n");
    editArea.setRangeText(newText, lineStart, lineEnd, "preserve");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptLink() {
    const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
    const url = window.prompt("URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const label = sel || window.prompt("Link text:", "link") || "link";
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `[${label}](${url})`;
    editArea.setRangeText(md, start2, end, "end");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  function promptImage() {
    const url = window.prompt("Image URL:", "https://");
    if (url == null) {
      editArea.focus();
      return;
    }
    const alt = window.prompt("Alt text:", "") || "";
    const start2 = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `![${alt}](${url})`;
    editArea.setRangeText(md, start2, end, "end");
    saveContent();
    syncHeight();
    editArea.focus();
  }
  const buttons = [
    {
      label: "B",
      title: "Bold",
      action: () => wrapSelection("**")
    },
    {
      label: "I",
      title: "Italic",
      action: () => wrapSelection("*")
    },
    {
      label: "`",
      title: "Inline code",
      action: () => wrapSelection("`")
    },
    "sep",
    {
      label: "H1",
      title: "Heading 1",
      action: () => prefixLines("# ")
    },
    {
      label: "H2",
      title: "Heading 2",
      action: () => prefixLines("## ")
    },
    "sep",
    {
      label: "\u2022",
      title: "Bullet list",
      action: () => prefixLines("- ")
    },
    {
      label: "1.",
      title: "Numbered list",
      action: () => prefixLines("1. ")
    },
    {
      label: "\u2611",
      title: "Task list",
      action: () => prefixLines("- [ ] ")
    },
    "sep",
    {
      label: "\u275D",
      title: "Blockquote",
      action: () => prefixLines("> ")
    },
    "sep",
    {
      label: "\u{1F517}",
      title: "Insert link",
      action: promptLink
    },
    {
      label: "img",
      title: "Insert image",
      action: promptImage
    },
    "sep",
    {
      label: "$",
      title: "Inline math",
      action: () => wrapSelection("$")
    },
    {
      label: "$$",
      title: "Block math",
      action: () => {
        const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
        if (sel) {
          wrapSelection("$$\n", "\n$$");
        } else {
          const start2 = editArea.selectionStart;
          const ins = "$$\n\n$$";
          editArea.setRangeText(ins, start2, start2, "end");
          const pos = start2 + 3;
          editArea.setSelectionRange(pos, pos);
          saveContent();
          syncHeight();
          editArea.focus();
        }
      }
    }
  ];
  for (const def of buttons) {
    if (def === "sep") {
      const sep = document.createElement("span");
      sep.className = "tb-sep";
      toolbar.appendChild(sep);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = def.label;
      btn.title = def.title;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        def.action();
      });
      toolbar.appendChild(btn);
    }
  }
  function showView() {
    const html = renderMarkdown(block.content || "");
    viewDiv.innerHTML = html || '<span class="md-placeholder">Click to add text\u2026</span>';
    viewDiv.style.display = "";
    editArea.style.display = "none";
    toolbar.style.display = "none";
    viewDiv.querySelectorAll("input[data-task-line]").forEach((cb) => {
      cb.addEventListener("click", (e) => e.stopPropagation());
      cb.addEventListener("change", () => {
        const idx = parseInt(cb.dataset.taskLine);
        const srcLines = (block.content || "").split("\n");
        if (idx < srcLines.length) {
          srcLines[idx] = cb.checked ? srcLines[idx].replace(/\[ \]/, "[x]") : srcLines[idx].replace(/\[x\]/i, "[ ]");
          block.content = srcLines.join("\n");
          showView();
        }
      });
    });
  }
  function enterEdit() {
    const h = viewDiv.offsetHeight;
    editArea.value = block.content || "";
    editArea.style.display = "block";
    toolbar.style.display = "flex";
    viewDiv.style.display = "none";
    const snapH = (v) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(h, 60))}px`;
    if (editArea.scrollHeight > h) editArea.style.height = `${snapH(editArea.scrollHeight)}px`;
    editArea.focus();
  }
  editArea.addEventListener("input", () => {
    saveContent();
    syncHeight();
  });
  editArea.addEventListener("blur", () => {
    saveContent();
    showView();
  });
  editArea.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Enter" && e.altKey) {
      e.preventDefault();
      editArea.blur();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      const val = editArea.value;
      const start2 = editArea.selectionStart;
      const end = editArea.selectionEnd;
      const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
      const lineRawEnd = val.indexOf("\n", start2);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);
      const nextLetter = (c) => c === "z" ? "a" : c === "Z" ? "A" : String.fromCharCode(c.charCodeAt(0) + 1);
      let newPrefix = null;
      let prefixLen = 0;
      const taskM = lineText.match(/^(\s*)([-*+])\s+\[[ xX]\]\s*/);
      if (taskM) {
        newPrefix = `${taskM[1]}${taskM[2]} [ ] `;
        prefixLen = taskM[0].length;
      }
      if (!newPrefix) {
        const bulletM = lineText.match(/^(\s*)([-*+])\s+/);
        if (bulletM) {
          newPrefix = `${bulletM[1]}${bulletM[2]} `;
          prefixLen = bulletM[0].length;
        }
      }
      if (!newPrefix) {
        const numM = lineText.match(/^(\s*)(\d+)\.\s+/);
        if (numM) {
          newPrefix = `${numM[1]}${parseInt(numM[2]) + 1}. `;
          prefixLen = numM[0].length;
        }
      }
      if (!newPrefix) {
        const letM = lineText.match(/^(\s*)([a-zA-Z])\.\s+/);
        if (letM) {
          newPrefix = `${letM[1]}${nextLetter(letM[2])}. `;
          prefixLen = letM[0].length;
        }
      }
      if (newPrefix !== null) {
        e.preventDefault();
        const hasContent = val.slice(lineStart + prefixLen, lineEnd).trim().length > 0;
        if (!hasContent) {
          editArea.setRangeText("", lineStart, lineEnd, "end");
          editArea.setSelectionRange(lineStart, lineStart);
        } else {
          editArea.setRangeText("\n" + newPrefix, start2, end, "end");
        }
        saveContent();
        syncHeight();
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const val = editArea.value;
      const start2 = editArea.selectionStart;
      const lineStart = val.lastIndexOf("\n", start2 - 1) + 1;
      const lineRawEnd = val.indexOf("\n", start2);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);
      const isList = /^\s*([-*+]|\d+\.|[a-zA-Z]\.)\s/.test(lineText);
      if (isList) {
        const m = lineText.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(\[[ xX]\]\s+)?(.*)/);
        if (m) {
          const [, curIndent, marker, taskPart = "", content] = m;
          let newIndent;
          let newMarker;
          if (!e.shiftKey) {
            newIndent = curIndent + "  ";
            if (/^\d+\.$/.test(marker)) newMarker = "a.";
            else if (/^[a-zA-Z]\.$/.test(marker)) newMarker = "1.";
            else newMarker = marker;
          } else {
            if (curIndent.length < 2) return;
            newIndent = curIndent.slice(2);
            if (/^[a-zA-Z]\.$/.test(marker)) newMarker = "1.";
            else if (/^\d+\.$/.test(marker)) newMarker = "a.";
            else newMarker = marker;
          }
          const newLine = `${newIndent}${newMarker} ${taskPart}${content}`;
          editArea.setRangeText(newLine, lineStart, lineEnd, "end");
          const newPos = lineStart + newIndent.length + newMarker.length + 1 + taskPart.length;
          editArea.setSelectionRange(newPos, newPos);
          saveContent();
          syncHeight();
          editArea.focus();
        }
      } else {
        editArea.setRangeText("  ", start2, editArea.selectionEnd, "end");
        saveContent();
        syncHeight();
      }
    }
  });
  const handle = document.createElement("div");
  handle.className = "text-resize-handle";
  handle.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    handle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    function onMove(ev) {
      const newW = Math.min(Math.max(DEFAULT_W, startW + (ev.clientX - startX)), maxW);
      el.style.width = `${newW}px`;
      block.w = newW;
    }
    function onUp() {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.classList.remove("handle-active");
      document.body.style.cursor = "";
    }
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "ew-resize";
  });
  viewDiv.addEventListener("mousedown", (e) => e.stopPropagation());
  editArea.addEventListener("mousedown", (e) => e.stopPropagation());
  toolbar.addEventListener("mousedown", (e) => e.stopPropagation());
  viewDiv.addEventListener("click", enterEdit);
  el.appendChild(toolbar);
  el.appendChild(viewDiv);
  el.appendChild(editArea);
  el.appendChild(handle);
  showView();
}

// src/blocks/figure.ts
function nextFigureNum() {
  let max = 0;
  for (const b of state.blocks) {
    if (b.type === "figure" && b.label) {
      const m = b.label.match(/^Fig\s+(\d+)$/i);
      if (m) max = Math.max(max, parseInt(m[1]));
    }
  }
  return max + 1;
}
function buildFigureBlock(el, block) {
  el.classList.add("figure-block");
  const DEFAULT_W = 240;
  const DEFAULT_H = 200;
  el.style.width = `${block.w ?? DEFAULT_W}px`;
  el.style.height = `${block.h ?? DEFAULT_H}px`;
  let data;
  try {
    data = JSON.parse(block.content || "{}");
  } catch {
    data = {
      src: "",
      caption: ""
    };
  }
  const header = document.createElement("div");
  header.className = "figure-label";
  header.textContent = block.label ?? "Figure";
  el.appendChild(header);
  const imgWrap = document.createElement("div");
  imgWrap.className = "figure-img-wrap";
  const img = document.createElement("img");
  img.className = "figure-img";
  img.draggable = false;
  img.alt = "";
  const placeholder = document.createElement("div");
  placeholder.className = "figure-placeholder";
  placeholder.innerHTML = "<span>Paste image (Ctrl+V)<br>or click to upload</span>";
  function loadSrc(src) {
    data.src = src;
    block.content = JSON.stringify(data);
    img.src = src;
    img.style.display = "";
    placeholder.style.display = "none";
    const applyAspect = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const w = el.offsetWidth;
      const chromeH = header.offsetHeight + caption.offsetHeight;
      const imgH = Math.round(w / (img.naturalWidth / img.naturalHeight) / GRID_SIZE) * GRID_SIZE;
      block.h = Math.max(GRID_SIZE * 2, imgH) + chromeH;
      el.style.height = `${block.h}px`;
    };
    if (img.complete && img.naturalWidth) applyAspect();
    else img.onload = applyAspect;
  }
  if (data.src) {
    img.src = data.src;
    img.style.display = "";
    placeholder.style.display = "none";
  } else {
    img.style.display = "none";
  }
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadSrc(reader.result);
    reader.readAsDataURL(file);
  });
  placeholder.addEventListener("click", () => fileInput.click());
  imgWrap.appendChild(img);
  imgWrap.appendChild(placeholder);
  el.appendChild(imgWrap);
  const caption = document.createElement("div");
  caption.className = "figure-caption";
  caption.contentEditable = "true";
  caption.dataset.placeholder = "Caption\u2026";
  caption.textContent = data.caption || "";
  caption.addEventListener("mousedown", (e) => e.stopPropagation());
  caption.addEventListener("blur", () => {
    data.caption = caption.textContent ?? "";
    block.content = JSON.stringify(data);
  });
  el.appendChild(caption);
  el.appendChild(fileInput);
  el.tabIndex = 0;
  el.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => loadSrc(reader.result);
        reader.readAsDataURL(file);
        return;
      }
    }
  });
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "figure-resize-handle";
  resizeHandle.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.stopPropagation();
    e.preventDefault();
    resizeHandle.setPointerCapture(e.pointerId);
    resizeHandle.classList.add("handle-active");
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;
    const imgAR = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : null;
    const blockAR = startW / startH;
    const onMove = (mv) => {
      const dX = mv.clientX - startX;
      const newW = Math.max(80, Math.round((startW + dX) / GRID_SIZE) * GRID_SIZE);
      let newH;
      if (imgAR) {
        const chromeH = header.offsetHeight + caption.offsetHeight;
        const imgH = Math.round(newW / imgAR / GRID_SIZE) * GRID_SIZE;
        newH = Math.max(GRID_SIZE * 2, imgH) + chromeH;
      } else {
        newH = Math.max(60, Math.round(newW / blockAR / GRID_SIZE) * GRID_SIZE);
      }
      block.w = newW;
      block.h = newH;
      el.style.width = `${newW}px`;
      el.style.height = `${newH}px`;
    };
    const onUp = () => {
      resizeHandle.removeEventListener("pointermove", onMove);
      resizeHandle.removeEventListener("pointerup", onUp);
      resizeHandle.classList.remove("handle-active");
      document.body.style.cursor = "";
    };
    resizeHandle.addEventListener("pointermove", onMove);
    resizeHandle.addEventListener("pointerup", onUp);
    document.body.style.cursor = "se-resize";
  });
  el.appendChild(resizeHandle);
  imgWrap.addEventListener("mousedown", (e) => {
    if (e.target !== resizeHandle) e.stopPropagation();
  });
}

// src/canvas.ts
var Canvas = class {
  element;
  guide;
  cursor;
  constructor(id) {
    this.element = document.getElementById(id);
    this.element.style.width = `${CANVAS_W}px`;
    this.element.style.height = `${CANVAS_H}px`;
    this.element.addEventListener("dragover", (e) => e.preventDefault());
    this.guide = document.createElement("div");
    this.guide.id = "margin-guide";
    this.guide.classList.add("engineering-grid");
    this.element.appendChild(this.guide);
    this.cursor = document.getElementById("grid-cursor");
    this.cursor.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" style="position:absolute;top:-5px;left:-5px;display:block"><line x1="0" y1="5" x2="10" y2="5" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/><line x1="5" y1="0" x2="5" y2="10" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    this.updateMarginGuide();
  }
  moveGhost(canvasX, canvasY) {
    this.cursor.style.transform = `translate(${canvasX}px, ${canvasY}px)`;
  }
  get domElement() {
    return this.element;
  }
  snap(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }
  updateMarginGuide() {
    const guideH = PAGE_H - margins.top - margins.bottom;
    this.guide.style.top = `${margins.top}px`;
    this.guide.style.left = `${margins.left}px`;
    this.guide.style.right = `${margins.right}px`;
    this.guide.style.height = `${guideH}px`;
    this.guide.style.bottom = "auto";
    this.guide.style.backgroundPosition = "0 0";
    this.element.querySelectorAll(".page-num").forEach((pn, i) => {
      pn.style.top = `${(i + 1) * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
    });
    this.element.querySelectorAll(".page-guide").forEach((g, i) => {
      const pageIdx = i + 1;
      g.style.top = `${pageIdx * PAGE_H + margins.top}px`;
      g.style.left = `${margins.left}px`;
      g.style.right = `${margins.right}px`;
      g.style.height = `${guideH}px`;
      g.style.bottom = "auto";
      g.style.backgroundPosition = "0 0";
    });
    this.element.querySelectorAll(".block").forEach((el) => {
      if (childToSection.has(el.id)) return;
      const block = state.blocks.find((b) => b.id === el.id);
      if (!block) return;
      if (block.type === "section") {
        block.x = 0;
        el.style.left = `${margins.left}px`;
        el.style.top = `${clamp(margins.top + titleBlockH() + block.y, margins.top + titleBlockH(), CANVAS_H - el.offsetHeight)}px`;
        el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
        el.style.maxWidth = "";
        return;
      }
      const tbH = titleBlockH();
      const absLeft = clamp(margins.left + block.x, margins.left, CANVAS_W - margins.right - el.offsetWidth);
      const absTop = clamp(margins.top + block.y, margins.top + tbH, CANVAS_H - el.offsetHeight);
      el.style.left = `${absLeft}px`;
      el.style.top = `${absTop}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - absLeft}px`;
    });
    this.element.querySelectorAll(".title-block-overlay").forEach((el, i) => {
      el.style.left = `${margins.left}px`;
      el.style.top = `${i * PAGE_H + margins.top}px`;
      el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    });
  }
  addBlock(block) {
    const el = document.createElement("div");
    el.id = block.id;
    el.className = "block";
    if (!block.parentSectionId) {
      const initLeft = margins.left + this.snap(block.x);
      el.style.left = `${initLeft}px`;
      el.style.top = `${margins.top + this.snap(block.y)}px`;
      el.style.maxWidth = `${CANVAS_W - margins.right - initLeft}px`;
    } else {
      el.style.left = `${this.snap(block.x)}px`;
      el.style.top = `${this.snap(block.y)}px`;
    }
    if (block.type === "section") {
      block.x = 0;
      const sectionW = CANVAS_W - margins.left - margins.right;
      el.style.left = `${margins.left}px`;
      el.style.width = `${sectionW}px`;
      el.style.maxWidth = "";
      buildSectionBlock(el, block);
    } else if (block.type === "plot") {
      buildPlotBlock(el, block);
    } else if (block.type === "header") {
      const h2 = document.createElement("h2");
      h2.contentEditable = "true";
      h2.textContent = block.content || "";
      h2.dataset.placeholder = "Heading\u2026";
      h2.addEventListener("blur", () => {
        block.content = h2.textContent ?? "";
      });
      el.appendChild(h2);
    } else if (block.type === "formula") {
      buildFormulaBlock(el, block);
    } else if (block.type === "math" && block.subtype === "sect-prop") {
      buildSectPropBlock(el);
    } else if (block.type === "math" && block.subtype === "beam-def") {
      buildBeamDefBlock(el, state.constants.E ?? 2e5);
    } else if (block.type === "summary") {
      buildFormulaBlock(el, block);
      el.classList.add("summary-block");
    } else if (block.type === "text") {
      buildTextBlock(el, block);
    } else if (block.type === "figure") {
      buildFigureBlock(el, block);
    } else {
      const div = document.createElement("div");
      div.contentEditable = "true";
      div.className = "block-text";
      div.textContent = block.content || "";
      div.dataset.placeholder = `New ${block.type} block`;
      div.addEventListener("blur", () => {
        block.content = div.textContent ?? "";
      });
      el.appendChild(div);
    }
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target;
      if (target.tagName === "INPUT" || target.isContentEditable) return;
      if (block.type === "section") return;
      e.stopPropagation();
      if (e.shiftKey) {
        onAddToSelection?.(el);
      } else if (!selectedEls.has(el)) {
        onSelectBlock?.(el);
      }
      setMultiDragState({
        startX: e.clientX,
        startY: e.clientY,
        origPositions: new Map([
          ...selectedEls
        ].map((s) => [
          s,
          {
            left: parseInt(s.style.left),
            top: parseInt(s.style.top)
          }
        ]))
      });
      document.body.style.cursor = "grabbing";
      e.preventDefault();
    });
    const LONG_PRESS_MS = 500;
    const CANCEL_PX = 8;
    const EDGE_PX = 24;
    let lpTimer = null;
    let lpStartX = 0, lpStartY = 0, lpId = -1;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      lpStartX = e.clientX;
      lpStartY = e.clientY;
      lpId = e.pointerId;
      if (lpTimer !== null) {
        clearTimeout(lpTimer);
        lpTimer = null;
      }
      lpTimer = setTimeout(() => {
        lpTimer = null;
        const rect = el.getBoundingClientRect();
        const rx = lpStartX - rect.left;
        const ry = lpStartY - rect.top;
        const onEdge = rx < EDGE_PX || rx > rect.width - EDGE_PX || ry < EDGE_PX || ry > rect.height - EDGE_PX;
        if (onEdge) {
          onSelectBlock?.(el);
        } else {
          setMultiDragState(null);
          document.body.style.cursor = "";
          const hit = document.elementFromPoint(lpStartX, lpStartY) ?? el;
          hit.dispatchEvent(new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: lpStartX,
            clientY: lpStartY,
            view: window
          }));
        }
      }, LONG_PRESS_MS);
    });
    const lpCancel = (e) => {
      if (e.pointerType !== "touch" || e.pointerId !== lpId || lpTimer === null) return;
      if (e.type === "pointermove") {
        if (Math.hypot(e.clientX - lpStartX, e.clientY - lpStartY) > CANCEL_PX) {
          clearTimeout(lpTimer);
          lpTimer = null;
        }
      } else {
        clearTimeout(lpTimer);
        lpTimer = null;
      }
    };
    el.addEventListener("pointermove", lpCancel);
    el.addEventListener("pointerup", lpCancel);
    el.addEventListener("pointercancel", lpCancel);
    this.element.appendChild(el);
  }
};

// src/dnd.ts
function showCursor() {
  document.getElementById("grid-cursor").style.zIndex = "9999";
}
function hideCursor() {
  document.getElementById("grid-cursor").style.zIndex = "-1";
}
function selectBlock(el) {
  for (const s of selectedEls) s.classList.remove("selected");
  selectedEls.clear();
  setSelectedEl(el);
  selectedEls.add(el);
  el.classList.add("selected");
  hideCursor();
}
function addToSelection(el) {
  if (selectedEls.has(el)) {
    el.classList.remove("selected");
    selectedEls.delete(el);
    if (selectedEl === el) setSelectedEl(selectedEls.size > 0 ? [
      ...selectedEls
    ].at(-1) : null);
    if (selectedEls.size === 0) showCursor();
  } else {
    el.classList.add("selected");
    selectedEls.add(el);
    setSelectedEl(el);
    hideCursor();
  }
}
function clearSelection() {
  for (const s of selectedEls) s.classList.remove("selected");
  selectedEls.clear();
  setSelectedEl(null);
  showCursor();
}
function deleteBlock(el) {
  const idx = state.blocks.findIndex((b) => b.id === el.id);
  if (idx !== -1) {
    const block = state.blocks[idx];
    deletionStack.push({
      ...block
    });
    if (block.type === "section") {
      const content = el.querySelector(".section-content");
      if (content) {
        for (const child of Array.from(content.querySelectorAll(".block"))) {
          const childBlock = state.blocks.find((b) => b.id === child.id);
          if (childBlock) {
            unparentFromSection(child, el);
          }
        }
      }
    } else if (block.parentSectionId) {
      childToSection.delete(block.id);
      delete block.parentSectionId;
    }
    state.blocks.splice(idx, 1);
  }
  el.remove();
  selectedEls.delete(el);
  if (selectedEl === el) {
    setSelectedEl(selectedEls.size > 0 ? [
      ...selectedEls
    ].at(-1) : null);
    if (selectedEls.size === 0) showCursor();
  }
  reEvalAllFormulas();
  updatePageCount();
}
function shiftBlocksVertical(thresholdY, delta) {
  for (const el of canvas.domElement.querySelectorAll(".block")) {
    const top = parseInt(el.style.top);
    if (top >= thresholdY) {
      const newTop = clamp(top + delta, margins.top, CANVAS_H + PAGE_H);
      placeBlock(el, parseInt(el.style.left), newTop);
    }
  }
  updatePageCount();
}
function syncTitleBlocks() {
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
  if (!titleBlockEnabled) return;
  if (!state.titleBlock) state.titleBlock = {
    project: "",
    by: "",
    sheetNo: "",
    subject: "",
    subject2: "",
    subject3: "",
    date: "",
    jobNo: ""
  };
  const w = CANVAS_W - margins.left - margins.right;
  for (let i = 0; i < numPages; i++) {
    const el = document.createElement("div");
    el.className = "block title-block title-block-overlay";
    el.style.left = `${margins.left}px`;
    el.style.top = `${i * PAGE_H + margins.top}px`;
    el.style.width = `${w}px`;
    el.style.maxWidth = "";
    el.style.zIndex = "2";
    buildTitleBlockOverlay(el, i);
    canvas.domElement.appendChild(el);
  }
}
function syncPageSeparators() {
  canvas.domElement.querySelectorAll(".page-sep, .page-guide, .page-num").forEach((e) => e.remove());
  const isGridOn = document.getElementById("margin-guide").classList.contains("engineering-grid");
  for (let i = 1; i < numPages; i++) {
    const guide = document.createElement("div");
    guide.className = "page-guide";
    if (isGridOn) guide.classList.add("engineering-grid");
    canvas.domElement.appendChild(guide);
    const sep = document.createElement("div");
    sep.className = "page-sep";
    sep.style.top = `${i * PAGE_H}px`;
    const label = document.createElement("span");
    label.textContent = `Page ${i + 1}`;
    sep.appendChild(label);
    canvas.domElement.appendChild(sep);
  }
  if (!titleBlockEnabled) {
    for (let i = 1; i <= numPages; i++) {
      const pn = document.createElement("div");
      pn.className = "page-num";
      pn.textContent = `Page ${i} of ${numPages}`;
      pn.style.top = `${i * PAGE_H - margins.bottom}px`;
      pn.style.right = `${margins.right}px`;
      canvas.domElement.appendChild(pn);
    }
  }
  canvas.updateMarginGuide();
  syncTitleBlocks();
}
function updatePageCount() {
  const blockEls = canvas.domElement.querySelectorAll(".block");
  let maxBottom = 0;
  for (const el of blockEls) {
    if (childToSection.has(el.id)) continue;
    const bot = parseInt(el.style.top) + el.offsetHeight;
    if (bot > maxBottom) maxBottom = bot;
  }
  const needed = Math.max(1, Math.ceil((maxBottom + margins.bottom) / PAGE_H));
  if (needed === numPages) return;
  setNumPages(needed);
  setCANVAS_H(numPages * PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
}
function buildTitleBlockOverlay(el, pageIdx = 0) {
  el.innerHTML = "";
  el.classList.add("title-block", "title-block-overlay");
  el.style.padding = "0";
  el.style.cursor = "default";
  el.style.zIndex = "2";
  const data = state.titleBlock ?? {
    project: "",
    by: "",
    sheetNo: "",
    subject: "",
    subject2: "",
    subject3: "",
    date: "",
    jobNo: ""
  };
  if (!state.titleBlock) state.titleBlock = data;
  function save() {
    canvas.domElement.querySelectorAll(".title-block-overlay").forEach((other) => {
      if (other === el) return;
      other.querySelectorAll("[data-tb-field]").forEach((cell) => {
        const f = cell.dataset.tbField;
        if (!cell.contains(document.activeElement)) {
          cell.textContent = data[f] ?? "";
        }
      });
    });
  }
  const table = document.createElement("table");
  table.className = "title-block-table";
  function makeLabel(text) {
    const td = document.createElement("td");
    td.className = "tb-label";
    td.textContent = text;
    return td;
  }
  function makeValue(key, cls = "") {
    const td = document.createElement("td");
    td.className = `tb-value${cls ? " " + cls : ""}`;
    td.dataset.tbField = key;
    td.contentEditable = "true";
    td.textContent = data[key] ?? "";
    td.addEventListener("mousedown", (ev) => ev.stopPropagation());
    td.addEventListener("blur", () => {
      data[key] = td.textContent ?? "";
      save();
    });
    td.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        td.blur();
      }
    });
    return td;
  }
  const logoTd = document.createElement("td");
  logoTd.className = "tb-logo";
  logoTd.rowSpan = 4;
  const logoImg = document.createElement("img");
  logoImg.className = "tb-logo-img";
  if (data.logo) {
    logoImg.src = data.logo;
    logoImg.style.display = "";
  } else logoImg.style.display = "none";
  const logoPh = document.createElement("div");
  logoPh.className = "tb-logo-ph";
  logoPh.textContent = "+ Logo";
  if (data.logo) logoPh.style.display = "none";
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result;
      data.logo = url;
      canvas.domElement.querySelectorAll(".title-block-overlay").forEach((o) => {
        const img = o.querySelector(".tb-logo-img");
        const ph = o.querySelector(".tb-logo-ph");
        if (img) {
          img.src = url;
          img.style.display = "";
        }
        if (ph) {
          ph.style.display = "none";
        }
      });
    };
    reader.readAsDataURL(file);
  });
  logoTd.appendChild(logoImg);
  logoTd.appendChild(logoPh);
  logoTd.appendChild(fileInput);
  logoTd.addEventListener("click", (ev) => {
    ev.stopPropagation();
    fileInput.click();
  });
  logoTd.addEventListener("mousedown", (ev) => ev.stopPropagation());
  const lbProject = makeLabel("Project");
  lbProject.style.width = "68px";
  const lbBy = makeLabel("By");
  lbBy.style.width = "68px";
  const lbSheetNo = makeLabel("Sheet No.");
  lbSheetNo.style.width = "68px";
  const ROW_H = "28px";
  const row1 = document.createElement("tr");
  row1.style.height = ROW_H;
  row1.appendChild(logoTd);
  row1.appendChild(lbProject);
  row1.appendChild(makeValue("project", "tb-wide"));
  row1.appendChild(lbBy);
  row1.appendChild(lbSheetNo);
  table.appendChild(row1);
  const sheetNoTd = document.createElement("td");
  sheetNoTd.className = "tb-value tb-narrow tb-sheet-num";
  sheetNoTd.textContent = `${pageIdx + 1} of ${numPages}`;
  const row2 = document.createElement("tr");
  row2.style.height = ROW_H;
  row2.appendChild(makeLabel("Subject"));
  row2.appendChild(makeValue("subject", "tb-wide"));
  row2.appendChild(makeValue("by"));
  row2.appendChild(sheetNoTd);
  table.appendChild(row2);
  const row3 = document.createElement("tr");
  row3.style.height = ROW_H;
  const blank3 = document.createElement("td");
  blank3.className = "tb-blank";
  row3.appendChild(blank3);
  row3.appendChild(makeValue("subject2", "tb-wide"));
  row3.appendChild(makeLabel("Date"));
  row3.appendChild(makeLabel("Job No."));
  table.appendChild(row3);
  const row4 = document.createElement("tr");
  row4.style.height = ROW_H;
  const blank4 = document.createElement("td");
  blank4.className = "tb-blank";
  row4.appendChild(blank4);
  row4.appendChild(makeValue("subject3", "tb-wide"));
  row4.appendChild(makeValue("date"));
  row4.appendChild(makeValue("jobNo", "tb-narrow"));
  table.appendChild(row4);
  el.appendChild(table);
}
function placeBlock(el, newLeft, newTop) {
  const b = state.blocks.find((blk) => blk.id === el.id);
  if (b?.type === "section") {
    el.style.left = `${margins.left}px`;
    el.style.top = `${newTop}px`;
    el.style.width = `${CANVAS_W - margins.left - margins.right}px`;
    el.style.maxWidth = "";
    b.x = 0;
    b.y = newTop - margins.top - titleBlockH();
    return;
  }
  el.style.left = `${newLeft}px`;
  el.style.top = `${newTop}px`;
  el.style.maxWidth = `${CANVAS_W - margins.right - newLeft}px`;
  if (b) {
    b.x = newLeft - margins.left;
    b.y = newTop - margins.top;
  }
}
function blocksOverlap(a, b) {
  const aL = parseInt(a.style.left), aT = parseInt(a.style.top);
  const aR = aL + a.offsetWidth, aB = aT + a.offsetHeight;
  const bL = parseInt(b.style.left), bT = parseInt(b.style.top);
  const bR = bL + b.offsetWidth, bB = bT + b.offsetHeight;
  return aR > bL && aL < bR && aB > bT && aT < bB;
}
function resolveOverlapsRight(movedEl) {
  if (movedEl.classList.contains("title-block") || movedEl.classList.contains("section-block")) return;
  const movedLeft = parseInt(movedEl.style.left);
  const movedTop = parseInt(movedEl.style.top);
  const movedBottom = movedTop + movedEl.offsetHeight;
  const wrapY = margins.top + Math.ceil((movedBottom - margins.top) / GRID_SIZE) * GRID_SIZE;
  function inRegion(el) {
    if (el.classList.contains("title-block")) return false;
    if (el.classList.contains("section-block")) return false;
    if (childToSection.has(el.id)) return false;
    const elLeft = parseInt(el.style.left);
    const elTop = parseInt(el.style.top);
    if (elLeft < movedLeft) return false;
    if (elTop < movedTop) return false;
    if (elTop >= movedBottom) return false;
    return true;
  }
  for (let iter = 0; iter < 100; iter++) {
    const els = [
      movedEl,
      ...Array.from(canvas.domElement.querySelectorAll(".block")).filter((el) => el !== movedEl && inRegion(el))
    ].sort((a, b) => parseInt(a.style.left) - parseInt(b.style.left));
    let didMove = false;
    outer: for (let i = 0; i < els.length; i++) {
      for (let j = i + 1; j < els.length; j++) {
        const a = els[i], b = els[j];
        if (!blocksOverlap(a, b)) continue;
        const aRight = parseInt(a.style.left) + a.offsetWidth;
        const needed = margins.left + Math.round((aRight - margins.left) / GRID_SIZE) * GRID_SIZE;
        const maxLeft = CANVAS_W - margins.right - b.offsetWidth;
        if (needed > maxLeft) {
          const bH = b.offsetHeight;
          for (const other of canvas.domElement.querySelectorAll(".block")) {
            if (other === movedEl || other === b) continue;
            if (other.classList.contains("title-block")) continue;
            if (childToSection.has(other.id)) continue;
            const otherTop = parseInt(other.style.top);
            if (otherTop >= wrapY) {
              placeBlock(other, parseInt(other.style.left), otherTop + bH + GRID_SIZE);
            }
          }
          placeBlock(b, margins.left, wrapY);
        } else {
          placeBlock(b, needed, parseInt(b.style.top));
        }
        didMove = true;
        break outer;
      }
    }
    if (!didMove) break;
  }
}
function blockAtCursor(canvasX, canvasY) {
  for (const el of canvas.domElement.querySelectorAll(".block:not(.section-block)")) {
    const left = parseInt(el.style.left);
    const top = parseInt(el.style.top);
    if (canvasX >= left && canvasX <= left + el.offsetWidth && canvasY >= top && canvasY <= top + el.offsetHeight) {
      return el;
    }
  }
  return null;
}
function moveGridCursor(canvasX, canvasY) {
  const tbH = titleBlockH();
  const snappedX = margins.left + Math.round((canvasX - margins.left) / GRID_SIZE) * GRID_SIZE;
  gridCursor.x = clamp(snappedX, margins.left, CANVAS_W - margins.right);
  const gridOrigin = (pi) => pi * PAGE_H + margins.top;
  const pageEffTop = (pi) => pi * PAGE_H + margins.top + tbH;
  const pageEffBot = (pi) => pi * PAGE_H + PAGE_H - margins.bottom;
  const firstGridY = (pi) => {
    const go = gridOrigin(pi);
    return go + Math.ceil((pageEffTop(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };
  const lastGridY = (pi) => {
    const go = gridOrigin(pi);
    return go + Math.floor((pageEffBot(pi) - go) / GRID_SIZE) * GRID_SIZE;
  };
  const rawPageIdx = Math.max(0, Math.floor(canvasY / PAGE_H));
  let finalY;
  if (canvasY < pageEffTop(rawPageIdx)) {
    finalY = rawPageIdx > 0 ? lastGridY(rawPageIdx - 1) : firstGridY(0);
  } else if (canvasY > pageEffBot(rawPageIdx)) {
    const next = rawPageIdx + 1;
    finalY = next * PAGE_H < CANVAS_H ? firstGridY(next) : lastGridY(rawPageIdx);
  } else {
    const go = gridOrigin(rawPageIdx);
    finalY = go + Math.round((canvasY - go) / GRID_SIZE) * GRID_SIZE;
    finalY = clamp(finalY, firstGridY(rawPageIdx), lastGridY(rawPageIdx));
  }
  gridCursor.y = finalY;
  canvas.moveGhost(gridCursor.x, gridCursor.y);
  const el = document.getElementById("cursor-coords");
  if (el) el.textContent = `x: ${gridCursor.x}px  y: ${gridCursor.y}px`;
  const hit = blockAtCursor(gridCursor.x, gridCursor.y);
  if (hit) {
    selectBlock(hit);
    const editable = hit.querySelector('input, [contenteditable="true"]');
    editable?.focus();
  } else {
    clearSelection();
  }
}
function renderBlock(block) {
  canvas.addBlock(block);
}
function dropBlock(type, subtype, canvasX, canvasY) {
  if (type === "summary" && !sectionAtPoint(canvasX, canvasY)) return;
  const customMod = type === "formula" && subtype ? customModules.find((m) => m.id === subtype) : void 0;
  if (customMod?.blocks) {
    clearSelection();
    const baseX = canvasX - margins.left;
    const baseY = canvasY - margins.top;
    const targetSection = sectionAtPoint(canvasX, canvasY);
    for (const b of customMod.blocks) {
      const block2 = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: b.type,
        subtype: b.subtype,
        x: baseX + b.dx,
        y: baseY + b.dy,
        w: b.w,
        content: b.content,
        label: b.label
      };
      state.blocks.push(block2);
      renderBlock(block2);
      const el2 = document.getElementById(block2.id);
      if (el2) {
        if (targetSection) reparentToSection(el2, targetSection);
        selectedEls.add(el2);
        el2.classList.add("selected");
        setSelectedEl(el2);
      }
    }
    reEvalAllFormulas();
    updatePageCount();
    return;
  }
  const block = {
    id: `block-${Date.now()}`,
    type,
    subtype,
    x: canvasX - margins.left,
    y: canvasY - margins.top,
    content: customMod ? customMod.content : type === "formula" ? "x = " : type === "summary" ? "x = " : "",
    label: customMod ? customMod.label : type === "formula" ? "Formula" : type === "summary" ? "Summary" : type === "figure" ? `Fig ${nextFigureNum()}` : void 0,
    w: type === "figure" ? 240 : void 0,
    h: type === "figure" ? 200 : void 0,
    sectionName: type === "section" ? nextSectionName() : void 0
  };
  state.blocks.push(block);
  renderBlock(block);
  const el = document.getElementById(block.id);
  if (el) {
    if (type !== "section") {
      const targetSection = sectionAtPoint(canvasX, canvasY);
      if (targetSection) reparentToSection(el, targetSection);
    }
    selectBlock(el);
  }
  reEvalAllFormulas();
  updatePageCount();
}

// src/persistence.ts
function showImportToolsDialog(tools) {
  const overlay = document.createElement("div");
  overlay.className = "import-modal-overlay";
  const dialog = document.createElement("div");
  dialog.className = "import-modal";
  const title = document.createElement("h3");
  title.textContent = "Import Custom Tools";
  dialog.appendChild(title);
  const subtitle = document.createElement("p");
  subtitle.className = "import-modal-sub";
  subtitle.textContent = "Select tools to add to this project:";
  dialog.appendChild(subtitle);
  const listEl = document.createElement("div");
  listEl.className = "import-modal-list";
  const checkboxes = [];
  for (const mod of tools) {
    const alreadyExists = customModules.some((m) => m.name === mod.name);
    const row = document.createElement("label");
    row.className = "import-tool-row";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !alreadyExists;
    cb.disabled = alreadyExists;
    row.appendChild(cb);
    const nameSpan = document.createElement("span");
    nameSpan.textContent = mod.name;
    row.appendChild(nameSpan);
    if (alreadyExists) {
      const note = document.createElement("span");
      note.className = "import-tool-exists";
      note.textContent = "(already exists)";
      row.appendChild(note);
    }
    listEl.appendChild(row);
    checkboxes.push({
      cb,
      mod
    });
  }
  dialog.appendChild(listEl);
  const btnRow = document.createElement("div");
  btnRow.className = "import-modal-btns";
  const selectAllBtn = document.createElement("button");
  selectAllBtn.textContent = "Select All";
  selectAllBtn.addEventListener("click", () => {
    checkboxes.forEach(({ cb }) => {
      if (!cb.disabled) cb.checked = true;
    });
  });
  btnRow.appendChild(selectAllBtn);
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => overlay.remove());
  btnRow.appendChild(cancelBtn);
  const importBtn = document.createElement("button");
  importBtn.className = "import-confirm-btn";
  importBtn.textContent = "Import Selected";
  importBtn.addEventListener("click", () => {
    const selected = checkboxes.filter(({ cb }) => cb.checked && !cb.disabled).map(({ mod }) => mod);
    for (const mod of selected) {
      const newMod = {
        ...mod,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`
      };
      customModules.push(newMod);
      onAppendCustomModuleToSidebar?.(newMod);
    }
    if (selected.length > 0) saveCustomModules();
    overlay.remove();
  });
  btnRow.appendChild(importBtn);
  dialog.appendChild(btnRow);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}
async function importToolsFromFile() {
  try {
    const hasPicker = typeof window.showOpenFilePicker === "function";
    if (hasPicker) {
      let pickerHandles;
      try {
        pickerHandles = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        });
      } catch (e) {
        if (e.name !== "AbortError") throw e;
        return;
      }
      const handle = pickerHandles[0];
      const text = await (await handle.getFile()).text();
      const proj = JSON.parse(text);
      const tools = proj.custom_tools;
      if (!tools || !Array.isArray(tools) || tools.length === 0) {
        alert("No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.");
        return;
      }
      showImportToolsDialog(tools);
    } else {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = ".json";
      inp.addEventListener("change", async () => {
        const file = inp.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const proj = JSON.parse(text);
          const tools = proj.custom_tools;
          if (!tools || !Array.isArray(tools) || tools.length === 0) {
            alert("No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.");
            return;
          }
          showImportToolsDialog(tools);
        } catch {
          alert("Invalid project file.");
        }
      });
      inp.click();
    }
  } catch (e) {
    alert("Failed to open file: " + e.message);
  }
}
function showSavePromptDialog() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "import-modal-overlay";
    const dialog = document.createElement("div");
    dialog.className = "import-modal";
    const title = document.createElement("h3");
    title.textContent = "Unsaved Changes";
    dialog.appendChild(title);
    const msg = document.createElement("p");
    msg.textContent = "Do you want to save your changes before continuing?";
    dialog.appendChild(msg);
    const btns = document.createElement("div");
    btns.className = "import-modal-btns";
    const saveBtn = document.createElement("button");
    saveBtn.className = "import-confirm-btn";
    saveBtn.textContent = "Save";
    saveBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("save");
    });
    const discardBtn = document.createElement("button");
    discardBtn.textContent = "Don't Save";
    discardBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("discard");
    });
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      resolve("cancel");
    });
    btns.appendChild(saveBtn);
    btns.appendChild(discardBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}
function clearProjectState() {
  canvas.domElement.querySelectorAll(".block").forEach((el) => el.remove());
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((el) => el.remove());
  state.blocks = [];
  delete state.titleBlock;
  setTitleBlockEnabled(false);
  const tbToggle = document.getElementById("title-block-toggle");
  if (tbToggle) tbToggle.checked = false;
  state.projectName = "Untitled Project";
  state.constants = {
    E: 2e5
  };
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  clearSelection();
  deletionStack.length = 0;
  childToSection.clear();
  setFileHandle(null);
  setNumPages(1);
  setCANVAS_H(PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();
  setCustomModules([]);
  saveCustomModules();
  const list = document.getElementById("custom-modules-list");
  if (list) list.innerHTML = "";
}
async function newProject() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === "cancel") return;
    if (choice === "save") await saveProject(false);
  }
  clearProjectState();
}
async function newFromTemplate() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === "cancel") return;
    if (choice === "save") await saveProject(false);
  }
  const hasPicker = typeof window.showOpenFilePicker === "function";
  if (hasPicker) {
    let pickerHandles;
    try {
      pickerHandles = await window.showOpenFilePicker({
        types: [
          {
            description: "JSON Project",
            accept: {
              "application/json": [
                ".json"
              ]
            }
          }
        ]
      });
    } catch (e) {
      if (e.name !== "AbortError") alert("Failed to open template: " + e.message);
      return;
    }
    const handle = pickerHandles[0];
    try {
      loadProject(JSON.parse(await (await handle.getFile()).text()));
    } catch {
      alert("Invalid template file.");
      return;
    }
    setFileHandle(null);
  } else {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        loadProject(JSON.parse(await file.text()));
        setFileHandle(null);
      } catch {
        alert("Invalid template file.");
      }
    });
    inp.click();
  }
}
function loadProject(proj) {
  canvas.domElement.querySelectorAll(".block").forEach((el) => el.remove());
  canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
  state.blocks = [];
  setTitleBlockEnabled(false);
  const rawTb = proj.title_block;
  if (rawTb) {
    state.titleBlock = rawTb;
    setTitleBlockEnabled(true);
    const tbToggle = document.getElementById("title-block-toggle");
    if (tbToggle) tbToggle.checked = true;
    const pnCheckbox = document.getElementById("page-numbering-toggle");
    if (pnCheckbox) {
      pnCheckbox.checked = false;
      pnCheckbox.disabled = true;
      const pnLabel = pnCheckbox.parentElement;
      if (pnLabel) {
        pnLabel.style.opacity = "0.4";
        pnLabel.style.pointerEvents = "none";
      }
    }
    setPageNumberingEnabled(false);
  } else {
    setTitleBlockEnabled(false);
    const tbToggle = document.getElementById("title-block-toggle");
    if (tbToggle) tbToggle.checked = false;
    const pnCheckbox = document.getElementById("page-numbering-toggle");
    if (pnCheckbox) {
      pnCheckbox.disabled = false;
      const pnLabel = pnCheckbox.parentElement;
      if (pnLabel) {
        pnLabel.style.opacity = "1";
        pnLabel.style.pointerEvents = "";
      }
    }
  }
  const consts = proj.global_constants;
  if (consts) Object.assign(state.constants, consts);
  const rawBlocks = proj.blocks ?? [];
  for (const raw of rawBlocks) {
    const rawType = raw.type;
    if (rawType === "title-block") {
      if (!state.titleBlock && raw.content) {
        try {
          state.titleBlock = JSON.parse(raw.content);
        } catch {
        }
      }
      continue;
    }
    const type = rawType === "math" && raw.content && !raw.subtype ? "formula" : rawType;
    const block = {
      id: raw.id ?? `block-${Date.now()}`,
      type,
      subtype: raw.subtype,
      x: raw.x ?? 0,
      y: raw.y ?? 0,
      w: raw.w,
      content: raw.content ?? "",
      label: raw.label,
      sectionName: raw.sectionName,
      collapsed: raw.collapsed,
      sectionColor: raw.sectionColor,
      parentSectionId: raw.parentSectionId,
      h: raw.h
    };
    state.blocks.push(block);
    if (!block.parentSectionId) {
      renderBlock(block);
    }
  }
  for (const block of state.blocks) {
    if (!block.parentSectionId) continue;
    const sectionEl = document.getElementById(block.parentSectionId);
    const content = sectionEl?.querySelector(".section-content");
    if (!content) continue;
    renderBlock(block);
    const childEl = document.getElementById(block.id);
    if (!childEl) continue;
    content.appendChild(childEl);
    childEl.style.left = `${block.x}px`;
    childEl.style.top = `${block.y}px`;
    childEl.style.maxWidth = "";
    childToSection.set(block.id, block.parentSectionId);
    refreshSectionHeight(sectionEl);
  }
  reEvalAllFormulas();
  updatePageCount();
  syncTitleBlocks();
  canvas.updateMarginGuide();
  moveGridCursor(margins.left, margins.top + titleBlockH());
  const savedTools = proj.custom_tools;
  if (savedTools && Array.isArray(savedTools)) {
    setCustomModules(savedTools);
    saveCustomModules();
    onRefreshCustomModulesList?.();
  }
}
function serializeProject() {
  const blocks = state.blocks.map((b) => {
    const out2 = {
      id: b.id,
      type: b.type,
      x: b.x,
      y: b.y
    };
    if (b.content) out2.content = b.content;
    if (b.subtype) out2.subtype = b.subtype;
    if (b.label) out2.label = b.label;
    if (b.w) out2.w = b.w;
    if (b.sectionName) out2.sectionName = b.sectionName;
    if (b.collapsed) out2.collapsed = b.collapsed;
    if (b.sectionColor) out2.sectionColor = b.sectionColor;
    if (b.parentSectionId) out2.parentSectionId = b.parentSectionId;
    if (b.h) out2.h = b.h;
    return out2;
  });
  const out = {
    project_metadata: {
      name: state.projectName,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      units: "SI"
    },
    blocks,
    global_constants: state.constants,
    custom_tools: customModules
  };
  if (state.titleBlock) out.title_block = state.titleBlock;
  return JSON.stringify(out, null, 2);
}
async function saveProject(saveAs = false) {
  const hasPicker = typeof window.showSaveFilePicker === "function";
  if (hasPicker) {
    try {
      if (!fileHandle || saveAs) {
        setFileHandle(await window.showSaveFilePicker({
          suggestedName: state.projectName.replace(/[^\w-]/g, "_") + ".json",
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        }));
      }
      const writable = await fileHandle.createWritable();
      await writable.write(serializeProject());
      await writable.close();
      return;
    } catch (e) {
      if (e.name === "AbortError") return;
    }
  }
  const blob = new Blob([
    serializeProject()
  ], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = state.projectName.replace(/[^\w-]/g, "_") + ".json";
  a.click();
  URL.revokeObjectURL(url);
}

// src/main.ts
var MODULES = [
  {
    id: "formula",
    name: "Formula Block",
    icon: "\u03A3",
    type: "formula"
  },
  {
    id: "summary",
    name: "Summary Block",
    icon: "\u03A3\u0332",
    type: "summary",
    sectionOnly: true
  },
  {
    id: "section",
    name: "Section",
    icon: "\u29C5",
    type: "section"
  },
  {
    id: "beam-def",
    name: "Beam Deflection",
    icon: "\u{1F4CF}",
    type: "math"
  },
  {
    id: "sect-prop",
    name: "Section Properties",
    icon: "\u{1F3D7}\uFE0F",
    type: "math"
  },
  {
    id: "plot",
    name: "Plot",
    icon: "\u{1F4C8}",
    type: "plot"
  },
  {
    id: "figure",
    name: "Figure",
    icon: "\u{1F5BC}\uFE0F",
    type: "figure"
  },
  {
    id: "text",
    name: "Text Block",
    icon: "\u{1F4DD}",
    type: "text"
  }
];
function renderCustomModuleItem(mod) {
  const item = document.createElement("div");
  item.className = "module-item custom";
  item.draggable = true;
  item.dataset.moduleType = "formula";
  item.dataset.moduleId = mod.id;
  const iconEl = document.createElement("span");
  iconEl.textContent = mod.blocks ? "\u229E" : "\u03A3";
  if (mod.blocks) item.title = `${mod.blocks.length} block group`;
  const nameEl = document.createElement("span");
  nameEl.textContent = mod.name;
  nameEl.style.flex = "1";
  const delBtn = document.createElement("button");
  delBtn.className = "mod-delete";
  delBtn.title = "Remove from toolbar";
  delBtn.textContent = "\xD7";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setCustomModules(customModules.filter((m) => m.id !== mod.id));
    saveCustomModules();
    item.remove();
  });
  item.appendChild(iconEl);
  item.appendChild(nameEl);
  item.appendChild(delBtn);
  return item;
}
function renderSidebar() {
  const container = document.getElementById("sidebar-left");
  const logoImg = document.createElement("img");
  logoImg.src = "/LeptonPadLogo.png";
  logoImg.alt = "LeptonPad";
  logoImg.className = "sidebar-logo";
  container.appendChild(logoImg);
  const licenseLink = document.createElement("a");
  licenseLink.href = "https://github.com/jrmarcum/LeptonPad/blob/main/LICENSE";
  licenseLink.target = "_blank";
  licenseLink.rel = "noopener noreferrer";
  licenseLink.textContent = "\xA9 2026 LeptonPad \u2014 Proprietary License";
  licenseLink.className = "sidebar-license";
  container.appendChild(licenseLink);
  const posHeading = document.createElement("h2");
  posHeading.textContent = "Cursor";
  container.appendChild(posHeading);
  const posDisplay = document.createElement("div");
  posDisplay.id = "cursor-coords";
  posDisplay.textContent = "x: \u2014 y: \u2014";
  container.appendChild(posDisplay);
  const viewHeading = document.createElement("h2");
  viewHeading.textContent = "View";
  container.appendChild(viewHeading);
  const printBtn = document.createElement("button");
  printBtn.className = "view-toggle";
  printBtn.textContent = "\u2399 Print Sheet";
  printBtn.addEventListener("click", () => globalThis.print());
  container.appendChild(printBtn);
  globalThis.addEventListener("beforeprint", () => {
    if (!canvas) return;
    canvas.domElement.style.width = `${CANVAS_W / PX_PER_IN}in`;
    canvas.domElement.style.height = `${CANVAS_H / PX_PER_IN}in`;
  });
  globalThis.addEventListener("afterprint", () => {
    if (!canvas) return;
    canvas.domElement.style.width = `${CANVAS_W}px`;
    canvas.domElement.style.height = `${CANVAS_H}px`;
  });
  const newBtn = document.createElement("button");
  newBtn.className = "view-toggle";
  newBtn.textContent = "\u2726 New Project";
  newBtn.addEventListener("click", () => newProject());
  container.appendChild(newBtn);
  const templateBtn = document.createElement("button");
  templateBtn.className = "view-toggle";
  templateBtn.textContent = "\u229E New from Template";
  templateBtn.addEventListener("click", () => newFromTemplate());
  container.appendChild(templateBtn);
  const loadBtn = document.createElement("button");
  loadBtn.className = "view-toggle";
  loadBtn.textContent = "\u2B06 Load Project";
  loadBtn.addEventListener("click", async () => {
    const hasPicker = typeof window.showOpenFilePicker === "function";
    if (hasPicker) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [
            {
              description: "JSON Project",
              accept: {
                "application/json": [
                  ".json"
                ]
              }
            }
          ]
        });
        setFileHandle(handle);
        const file = await handle.getFile();
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        if (e.name !== "AbortError") {
          alert("Failed to load: " + e.message);
        }
      }
      return;
    }
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = ".json";
    inp.addEventListener("change", async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        setFileHandle(null);
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        alert("Failed to load: " + e.message);
      }
    });
    inp.click();
  });
  container.appendChild(loadBtn);
  const saveBtn = document.createElement("button");
  saveBtn.className = "view-toggle";
  saveBtn.textContent = "\u{1F4BE} Save";
  saveBtn.addEventListener("click", () => saveProject(false));
  container.appendChild(saveBtn);
  const saveAsBtn = document.createElement("button");
  saveAsBtn.className = "view-toggle";
  saveAsBtn.textContent = "\u2193 Save As";
  saveAsBtn.addEventListener("click", () => saveProject(true));
  container.appendChild(saveAsBtn);
  const gridBtn = document.createElement("button");
  gridBtn.id = "grid-toggle";
  gridBtn.className = "view-toggle active";
  gridBtn.textContent = "# Grid";
  container.appendChild(gridBtn);
  const densityWrap = document.createElement("div");
  densityWrap.className = "grid-density";
  const densityLabel = document.createElement("span");
  densityLabel.textContent = "Dark";
  const densitySlider = document.createElement("input");
  densitySlider.id = "grid-opacity";
  densitySlider.type = "range";
  densitySlider.min = "0.1";
  densitySlider.max = "1";
  densitySlider.step = "0.05";
  densitySlider.value = "0.45";
  densityWrap.appendChild(densityLabel);
  densityWrap.appendChild(densitySlider);
  container.appendChild(densityWrap);
  const pageHeading = document.createElement("h2");
  pageHeading.textContent = "Page";
  container.appendChild(pageHeading);
  const pageControls = document.createElement("div");
  pageControls.className = "page-controls";
  const pageSel = document.createElement("select");
  pageSel.id = "page-size";
  pageSel.className = "page-size-select";
  for (const [key, size] of Object.entries(PAGE_SIZES)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = size.label;
    if (key === "letter") opt.selected = true;
    pageSel.appendChild(opt);
  }
  pageControls.appendChild(pageSel);
  container.appendChild(pageControls);
  const tbToggleLabel = document.createElement("label");
  tbToggleLabel.className = "view-toggle";
  tbToggleLabel.style.cursor = "pointer";
  const tbCheckbox = document.createElement("input");
  tbCheckbox.type = "checkbox";
  tbCheckbox.id = "title-block-toggle";
  tbCheckbox.style.marginRight = "0.4rem";
  tbCheckbox.checked = titleBlockEnabled;
  tbCheckbox.addEventListener("change", () => {
    setTitleBlockEnabled(tbCheckbox.checked);
    if (!titleBlockEnabled) {
      canvas.domElement.querySelectorAll(".title-block-overlay").forEach((e) => e.remove());
      pnCheckbox.disabled = false;
      pnToggleLabel.style.opacity = "1";
      pnToggleLabel.style.pointerEvents = "";
    } else {
      syncTitleBlocks();
      pnCheckbox.checked = false;
      setPageNumberingEnabled(false);
      pnCheckbox.disabled = true;
      pnToggleLabel.style.opacity = "0.4";
      pnToggleLabel.style.pointerEvents = "none";
    }
    syncPageSeparators();
    canvas.updateMarginGuide();
    moveGridCursor(margins.left, margins.top + titleBlockH());
  });
  tbToggleLabel.appendChild(tbCheckbox);
  tbToggleLabel.appendChild(document.createTextNode("Title Block"));
  container.appendChild(tbToggleLabel);
  const pnToggleLabel = document.createElement("label");
  pnToggleLabel.className = "view-toggle";
  pnToggleLabel.style.cursor = "pointer";
  const pnCheckbox = document.createElement("input");
  pnCheckbox.type = "checkbox";
  pnCheckbox.id = "page-numbering-toggle";
  pnCheckbox.style.marginRight = "0.4rem";
  pnCheckbox.checked = pageNumberingEnabled;
  pnCheckbox.disabled = titleBlockEnabled;
  if (titleBlockEnabled) {
    pnToggleLabel.style.opacity = "0.4";
    pnToggleLabel.style.pointerEvents = "none";
  }
  pnCheckbox.addEventListener("change", () => {
    setPageNumberingEnabled(pnCheckbox.checked);
    syncPageSeparators();
  });
  pnToggleLabel.appendChild(pnCheckbox);
  pnToggleLabel.appendChild(document.createTextNode("Page Numbering"));
  container.appendChild(pnToggleLabel);
  const marginRow = document.createElement("div");
  marginRow.className = "margin-heading-row";
  const marginHeading = document.createElement("h2");
  marginHeading.textContent = "Margins";
  const unitBtn = document.createElement("button");
  unitBtn.id = "unit-toggle";
  unitBtn.className = "unit-toggle";
  unitBtn.textContent = "in";
  marginRow.appendChild(marginHeading);
  marginRow.appendChild(unitBtn);
  container.appendChild(marginRow);
  const marginGrid = document.createElement("div");
  marginGrid.className = "margin-inputs";
  const marginDefs = [
    {
      id: "margin-top",
      label: "Top",
      side: "top"
    },
    {
      id: "margin-right",
      label: "Right",
      side: "right"
    },
    {
      id: "margin-bottom",
      label: "Bottom",
      side: "bottom"
    },
    {
      id: "margin-left",
      label: "Left",
      side: "left"
    }
  ];
  for (const def of marginDefs) {
    const wrap = document.createElement("label");
    wrap.className = "margin-field";
    const lbl = document.createElement("span");
    lbl.textContent = def.label;
    const inp = document.createElement("input");
    inp.id = def.id;
    inp.type = "number";
    inp.min = "0";
    inp.step = "1";
    inp.value = String(pxToUnit(margins[def.side]));
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    marginGrid.appendChild(wrap);
  }
  container.appendChild(marginGrid);
  const modulesHeading = document.createElement("h2");
  modulesHeading.textContent = "Modules";
  container.appendChild(modulesHeading);
  MODULES.forEach((mod) => {
    const item = document.createElement("div");
    item.className = "module-item";
    item.draggable = true;
    item.dataset.moduleType = mod.type;
    item.dataset.moduleId = mod.id;
    item.innerHTML = `<span>${mod.icon}</span><span>${mod.name}</span>`;
    if (mod.sectionOnly) {
      const badge = document.createElement("span");
      badge.className = "module-section-badge";
      badge.textContent = "\xA7";
      badge.title = "Can only be placed inside a Section";
      item.appendChild(badge);
    }
    container.appendChild(item);
  });
  const customHeading = document.createElement("h2");
  customHeading.className = "custom-tools-heading";
  const customHeadingText = document.createElement("span");
  customHeadingText.textContent = "Custom Tools";
  customHeading.appendChild(customHeadingText);
  const importToolsBtn = document.createElement("button");
  importToolsBtn.className = "import-tools-btn";
  importToolsBtn.textContent = "\u2B06 Import\u2026";
  importToolsBtn.title = "Import custom tools from a saved project file";
  importToolsBtn.addEventListener("click", importToolsFromFile);
  customHeading.appendChild(importToolsBtn);
  container.appendChild(customHeading);
  const customList = document.createElement("div");
  customList.id = "custom-modules-list";
  container.appendChild(customList);
  customModules.forEach((mod) => customList.appendChild(renderCustomModuleItem(mod)));
}
async function start() {
  try {
    await init();
    console.log("MathWasm Engine Ready");
    renderSidebar();
    setCanvas(new Canvas("canvas"));
    setOnSectionSummaryUpdate(updateSectionSummary);
    setOnRefreshAllSectionHeights(refreshAllSectionHeights);
    setOnSelectBlock(selectBlock);
    setOnAddToSelection(addToSelection);
    setOnMoveGridCursor(moveGridCursor);
    setOnUpdatePageCount(updatePageCount);
    setOnSyncPageSeparators(syncPageSeparators);
    setOnClearSelection(clearSelection);
    setOnRefreshCustomModulesList(() => {
      const list = document.getElementById("custom-modules-list");
      if (!list) return;
      list.innerHTML = "";
      customModules.forEach((mod) => list.appendChild(renderCustomModuleItem(mod)));
    });
    setOnAppendCustomModuleToSidebar((mod) => {
      const list = document.getElementById("custom-modules-list");
      if (list) list.appendChild(renderCustomModuleItem(mod));
    });
    syncPageSeparators();
    moveGridCursor(margins.left, margins.top + titleBlockH());
    setBandEl(document.createElement("div"));
    bandEl.id = "selection-band";
    canvas.domElement.appendChild(bandEl);
    const BAND_LONG_PRESS_MS = 500;
    const BAND_CANCEL_PX = 10;
    canvas.domElement.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (e.target.closest(".block")) return;
      const rect = canvas.domElement.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;
      const startBand = () => {
        const bs = {
          startX,
          startY,
          moved: false
        };
        setBandState(bs);
        bandEl.style.left = `${startX}px`;
        bandEl.style.top = `${startY}px`;
        bandEl.style.width = "0";
        bandEl.style.height = "0";
        bandEl.classList.add("active");
      };
      if (e.pointerType !== "touch") {
        startBand();
        return;
      }
      let lpTimer = setTimeout(() => {
        lpTimer = null;
        startBand();
      }, BAND_LONG_PRESS_MS);
      const cancelBandLp = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        if (lpTimer !== null) {
          if (ev.type === "pointermove") {
            const dx = ev.clientX - e.clientX;
            const dy = ev.clientY - e.clientY;
            if (Math.hypot(dx, dy) <= BAND_CANCEL_PX) return;
          }
          clearTimeout(lpTimer);
          lpTimer = null;
        }
        canvas.domElement.removeEventListener("pointermove", cancelBandLp);
        canvas.domElement.removeEventListener("pointerup", cancelBandLp);
        canvas.domElement.removeEventListener("pointercancel", cancelBandLp);
      };
      canvas.domElement.addEventListener("pointermove", cancelBandLp);
      canvas.domElement.addEventListener("pointerup", cancelBandLp);
      canvas.domElement.addEventListener("pointercancel", cancelBandLp);
    });
    document.addEventListener("pointermove", (e) => {
      if (multiDragState) {
        const dx = e.clientX - multiDragState.startX;
        const dy = e.clientY - multiDragState.startY;
        for (const [el, orig] of multiDragState.origPositions) {
          const blk = state.blocks.find((b) => b.id === el.id);
          const tbH = titleBlockH();
          const dragTopMin = margins.top + tbH;
          const sectionContent = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
          if (sectionContent) {
            const maxLeft = Math.max(0, sectionContent.offsetWidth - el.offsetWidth);
            const maxTop = Math.max(0, sectionContent.offsetHeight - el.offsetHeight);
            const newLeft = clamp(orig.left + dx, 0, maxLeft);
            const newTop = clamp(orig.top + dy, 0, maxTop);
            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;
            el.style.maxWidth = `${sectionContent.offsetWidth - newLeft}px`;
          } else if (blk?.type === "section") {
            el.style.top = `${clamp(orig.top + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
          } else {
            const dragLeft = clamp(orig.left + dx, margins.left, CANVAS_W - margins.right - el.offsetWidth);
            el.style.left = `${dragLeft}px`;
            el.style.top = `${clamp(orig.top + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
            el.style.maxWidth = `${CANVAS_W - margins.right - dragLeft}px`;
          }
        }
      }
      if (bandState) {
        const rect = canvas.domElement.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const x = Math.min(bandState.startX, cx);
        const y = Math.min(bandState.startY, cy);
        const w = Math.abs(cx - bandState.startX);
        const h = Math.abs(cy - bandState.startY);
        bandEl.style.left = `${x}px`;
        bandEl.style.top = `${y}px`;
        bandEl.style.width = `${w}px`;
        bandEl.style.height = `${h}px`;
        if (w > 4 || h > 4) bandState.moved = true;
      }
    });
    const mSnapX = (absX) => margins.left + canvas.snap(absX - margins.left);
    const mSnapY = (absY) => {
      const pi = Math.max(0, Math.floor(absY / PAGE_H));
      const orig = pi * PAGE_H + margins.top;
      return orig + canvas.snap(absY - orig);
    };
    document.addEventListener("pointerup", (e) => {
      if (multiDragState) {
        for (const [el] of multiDragState.origPositions) {
          const block = state.blocks.find((b) => b.id === el.id);
          if (!block || block.type === "section") {
            const snappedTop = clamp(mSnapY(parseInt(el.style.top)), margins.top + titleBlockH(), CANVAS_H + PAGE_H);
            placeBlock(el, margins.left, snappedTop);
            continue;
          }
          const snapContent = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
          const snapSectionEl = snapContent?.parentElement;
          if (snapContent && snapSectionEl) {
            const maxLeft = Math.max(0, snapContent.offsetWidth - el.offsetWidth);
            const maxTop = Math.max(0, snapContent.offsetHeight - el.offsetHeight);
            const canvasRect2 = canvas.domElement.getBoundingClientRect();
            const contentRect = snapContent.getBoundingClientRect();
            const contentLeft = Math.round(contentRect.left - canvasRect2.left);
            const contentTop = Math.round(contentRect.top - canvasRect2.top);
            const rawLeft = parseInt(el.style.left);
            const rawTop = parseInt(el.style.top);
            const snappedLeft = clamp(mSnapX(contentLeft + rawLeft) - contentLeft, 0, maxLeft);
            const snappedTop = clamp(mSnapY(contentTop + rawTop) - contentTop, 0, maxTop);
            el.style.left = `${snappedLeft}px`;
            el.style.top = `${snappedTop}px`;
            el.style.maxWidth = `${snapContent.offsetWidth - snappedLeft}px`;
            block.x = snappedLeft;
            block.y = snappedTop;
            refreshSectionHeight(snapSectionEl);
          } else {
            const canvasRect = canvas.domElement.getBoundingClientRect();
            const cx = e.clientX - canvasRect.left;
            const cy = e.clientY - canvasRect.top;
            const targetSection = sectionAtPoint(cx, cy);
            if (targetSection && targetSection.id !== el.id) {
              reparentToSection(el, targetSection);
            } else {
              const snappedLeft = clamp(mSnapX(parseInt(el.style.left)), margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const snappedTop = clamp(mSnapY(parseInt(el.style.top)), margins.top, CANVAS_H + PAGE_H);
              placeBlock(el, snappedLeft, snappedTop);
            }
          }
        }
        document.body.style.cursor = "";
        setMultiDragState(null);
        reEvalAllFormulas();
        updatePageCount();
      }
      if (bandState) {
        bandEl.classList.remove("active");
        if (bandState.moved) {
          setSkipNextCanvasClick(true);
          const rect = canvas.domElement.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const x = Math.min(bandState.startX, cx);
          const y = Math.min(bandState.startY, cy);
          const w = Math.abs(cx - bandState.startX);
          const h = Math.abs(cy - bandState.startY);
          clearSelection();
          for (const bl of canvas.domElement.querySelectorAll(".block")) {
            const bL = parseInt(bl.style.left), bT = parseInt(bl.style.top);
            if (bL + bl.offsetWidth > x && bL < x + w && bT + bl.offsetHeight > y && bT < y + h) {
              bl.classList.add("selected");
              selectedEls.add(bl);
              setSelectedEl(bl);
            }
          }
          if (selectedEls.size > 0) hideCursor();
        }
        setBandState(null);
      }
    });
    document.addEventListener("keydown", (e) => {
      if (document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "Enter" && e.shiftKey && !e.altKey) {
        e.preventDefault();
        shiftBlocksVertical(gridCursor.y, e.ctrlKey ? -GRID_SIZE : GRID_SIZE);
        return;
      }
      if (e.key === "Enter" && e.altKey && !e.ctrlKey) {
        const blockEl = selectedEl ?? document.activeElement?.closest(".block");
        if (!blockEl) return;
        e.preventDefault();
        document.activeElement?.blur();
        clearSelection();
        blockEl.classList.remove("selected");
        const blockRight = parseInt(blockEl.style.left) + blockEl.offsetWidth;
        const exitX = margins.left + (Math.floor((blockRight - margins.left) / GRID_SIZE) + 1) * GRID_SIZE;
        const exitY = parseInt(blockEl.style.top);
        moveGridCursor(exitX, exitY);
        return;
      }
      if (e.ctrlKey && selectedEls.size > 0) {
        if (e.key === "Delete") {
          e.preventDefault();
          const toDelete = [
            ...selectedEls
          ];
          for (const el of toDelete) deleteBlock(el);
          return;
        }
        const delta2 = {
          ArrowLeft: [
            -GRID_SIZE,
            0
          ],
          ArrowRight: [
            GRID_SIZE,
            0
          ],
          ArrowUp: [
            0,
            -GRID_SIZE
          ],
          ArrowDown: [
            0,
            GRID_SIZE
          ]
        };
        const d2 = delta2[e.key];
        if (d2) {
          e.preventDefault();
          let movedIsChild = false;
          for (const el of selectedEls) {
            const sc = el.parentElement?.classList.contains("section-content") ? el.parentElement : null;
            if (sc) {
              movedIsChild = true;
              const maxLeft = Math.max(0, sc.offsetWidth - el.offsetWidth);
              const maxTop = Math.max(0, sc.offsetHeight - el.offsetHeight);
              const newLeft = clamp(parseInt(el.style.left) + d2[0], 0, maxLeft);
              const newTop = clamp(parseInt(el.style.top) + d2[1], 0, maxTop);
              el.style.left = `${newLeft}px`;
              el.style.top = `${newTop}px`;
              el.style.maxWidth = `${sc.offsetWidth - newLeft}px`;
              const blk = state.blocks.find((b) => b.id === el.id);
              if (blk) {
                blk.x = newLeft;
                blk.y = newTop;
              }
              refreshSectionHeight(sc.parentElement);
            } else {
              const newLeft = clamp(parseInt(el.style.left) + d2[0], margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const newTop = clamp(parseInt(el.style.top) + d2[1], margins.top, CANVAS_H + PAGE_H);
              placeBlock(el, newLeft, newTop);
            }
          }
          if (e.key === "ArrowRight" && selectedEl && !movedIsChild) resolveOverlapsRight(selectedEl);
          updatePageCount();
          return;
        }
      }
      const active = document.activeElement;
      if (active?.tagName === "INPUT" || active?.isContentEditable) return;
      if (e.ctrlKey && e.key === "z" && !e.shiftKey && !e.altKey) {
        const block = deletionStack.pop();
        if (!block) return;
        e.preventDefault();
        state.blocks.push(block);
        renderBlock(block);
        reEvalAllFormulas();
        updatePageCount();
        const restored = document.getElementById(block.id);
        if (restored) selectBlock(restored);
        return;
      }
      const delta = {
        ArrowLeft: [
          -GRID_SIZE,
          0
        ],
        ArrowRight: [
          GRID_SIZE,
          0
        ],
        ArrowUp: [
          0,
          -GRID_SIZE
        ],
        ArrowDown: [
          0,
          GRID_SIZE
        ]
      };
      const d = delta[e.key];
      if (!d) return;
      e.preventDefault();
      moveGridCursor(gridCursor.x + d[0], gridCursor.y + d[1]);
    });
    document.getElementById("grid-toggle").addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const guide = document.getElementById("margin-guide");
      const on = guide.classList.toggle("engineering-grid");
      canvas.domElement.querySelectorAll(".page-guide").forEach((g) => {
        g.classList.toggle("engineering-grid", on);
      });
      btn.classList.toggle("active", on);
    });
    document.getElementById("grid-opacity").addEventListener("input", (e) => {
      const a = parseFloat(e.target.value);
      canvas.domElement.style.setProperty("--grid-line", isDark() ? `rgba(212, 212, 216, ${a})` : `rgba(55, 65, 81, ${a})`);
    });
    document.getElementById("page-size").addEventListener("change", (e) => {
      const key = e.target.value;
      const size = PAGE_SIZES[key];
      setCANVAS_W(size.w);
      setPAGE_H(size.h);
      setCANVAS_H(numPages * PAGE_H);
      canvas.domElement.style.width = `${size.w}px`;
      canvas.domElement.style.height = `${CANVAS_H}px`;
      syncPageSeparators();
      updatePageCount();
    });
    const marginSides = [
      {
        id: "margin-top",
        side: "top"
      },
      {
        id: "margin-right",
        side: "right"
      },
      {
        id: "margin-bottom",
        side: "bottom"
      },
      {
        id: "margin-left",
        side: "left"
      }
    ];
    const refreshMarginInputs = () => {
      for (const { id, side } of marginSides) {
        const inp = document.getElementById(id);
        inp.value = String(pxToUnit(margins[side]));
        inp.step = marginUnit === "mm" ? "1" : "0.125";
      }
    };
    document.getElementById("unit-toggle").addEventListener("click", (e) => {
      setMarginUnit(marginUnit === "mm" ? "in" : "mm");
      e.currentTarget.textContent = marginUnit;
      refreshMarginInputs();
    });
    for (const { id, side } of marginSides) {
      document.getElementById(id).addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          margins[side] = unitToPx(val);
          canvas.updateMarginGuide();
        }
      });
    }
    canvas.domElement.addEventListener("click", (e) => {
      if (skipNextCanvasClick) {
        setSkipNextCanvasClick(false);
        return;
      }
      if (e.target.closest(".block")) return;
      const rect = canvas.domElement.getBoundingClientRect();
      moveGridCursor(e.clientX - rect.left, e.clientY - rect.top);
      if (e.target === canvas.domElement) clearSelection();
    });
    document.getElementById("sidebar-left").addEventListener("dblclick", (e) => {
      const el = e.target.closest("[data-module-type]");
      if (!el?.dataset.moduleType) return;
      dropBlock(el.dataset.moduleType, el.dataset.moduleId ?? "", gridCursor.x, gridCursor.y);
    });
    document.getElementById("sidebar-left").addEventListener("dragstart", (e) => {
      const el = e.target.closest("[data-module-type]");
      if (el?.dataset.moduleType) {
        e.dataTransfer.setData("module-type", el.dataset.moduleType);
        e.dataTransfer.setData("module-id", el.dataset.moduleId ?? "");
      }
    });
    canvas.domElement.addEventListener("drop", (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("module-type");
      const subtype = e.dataTransfer.getData("module-id");
      if (type) {
        const rect = canvas.domElement.getBoundingClientRect();
        dropBlock(type, subtype, e.clientX - rect.left, e.clientY - rect.top);
      }
    });
    const ctxMenu = document.createElement("div");
    ctxMenu.id = "ctx-menu";
    const ctxFormulaGroup = document.createElement("div");
    ctxFormulaGroup.className = "ctx-formula-group";
    ctxFormulaGroup.style.display = "none";
    const ctxFormulaHeader = document.createElement("div");
    ctxFormulaHeader.className = "ctx-section-header";
    ctxFormulaHeader.textContent = "Formula row";
    ctxFormulaGroup.appendChild(ctxFormulaHeader);
    const ctxAddRowBtn = document.createElement("button");
    const ctxAddIfBtn = document.createElement("button");
    const ctxAddElseifBtn = document.createElement("button");
    const ctxAddElseBtn = document.createElement("button");
    const ctxAddForBtn = document.createElement("button");
    const ctxAddDescBtn = document.createElement("button");
    const ctxAddRefBtn = document.createElement("button");
    const ctxDelBranchBtn = document.createElement("button");
    const ctxDelRowBtn = document.createElement("button");
    ctxAddRowBtn.className = "ctx-neutral-btn";
    ctxAddRowBtn.textContent = "+ row";
    ctxAddIfBtn.className = "ctx-neutral-btn";
    ctxAddIfBtn.textContent = "+ if";
    ctxAddElseifBtn.className = "ctx-neutral-btn";
    ctxAddElseifBtn.textContent = "+ elseif";
    ctxAddElseBtn.className = "ctx-neutral-btn";
    ctxAddElseBtn.textContent = "+ else";
    ctxAddForBtn.className = "ctx-neutral-btn";
    ctxAddForBtn.textContent = "+ for";
    ctxAddDescBtn.className = "ctx-neutral-btn";
    ctxAddDescBtn.textContent = "+ description";
    ctxAddRefBtn.className = "ctx-neutral-btn";
    ctxAddRefBtn.textContent = "+ reference";
    ctxDelBranchBtn.textContent = "\xD7 branch";
    ctxDelRowBtn.textContent = "\xD7 delete row";
    ctxAddRowBtn.title = "Insert blank row after this row (Ctrl+Enter)";
    ctxAddIfBtn.title = "Insert if/end block after this row (Ctrl+I)";
    ctxAddElseifBtn.title = "Add elseif branch to enclosing if (Ctrl+E)";
    ctxAddElseBtn.title = "Add else branch to enclosing if (Ctrl+Shift+E)";
    ctxAddForBtn.title = "Insert for/end block after this row (Ctrl+L)";
    ctxAddDescBtn.title = "Add a text description to this row (left column)";
    ctxAddRefBtn.title = "Add a reference annotation to this row (right column)";
    ctxDelBranchBtn.title = "Delete this branch (elseif/else/for) and its body (Ctrl+-)";
    ctxDelRowBtn.title = "Delete this row or block (Ctrl+-)";
    [
      ctxAddRowBtn,
      ctxAddIfBtn,
      ctxAddElseifBtn,
      ctxAddElseBtn,
      ctxAddForBtn,
      ctxAddDescBtn,
      ctxAddRefBtn,
      ctxDelBranchBtn,
      ctxDelRowBtn
    ].forEach((b) => ctxFormulaGroup.appendChild(b));
    const ctxFormulaSep = document.createElement("hr");
    ctxFormulaSep.className = "ctx-sep";
    ctxMenu.appendChild(ctxFormulaGroup);
    ctxMenu.appendChild(ctxFormulaSep);
    const ctxSaveToolBtn = document.createElement("button");
    ctxSaveToolBtn.className = "ctx-save-btn";
    ctxSaveToolBtn.textContent = "\u2B50 Save as Tool";
    ctxSaveToolBtn.title = "Save this formula block as a reusable toolbar item";
    ctxMenu.appendChild(ctxSaveToolBtn);
    const ctxDeleteBtn = document.createElement("button");
    ctxDeleteBtn.textContent = "Delete Block";
    ctxMenu.appendChild(ctxDeleteBtn);
    document.body.appendChild(ctxMenu);
    let ctxTarget = null;
    let ctxFormulaRowEl = null;
    let ctxFormulaActions = null;
    const hideCtxMenu = () => {
      ctxMenu.style.display = "none";
      ctxTarget = null;
      ctxFormulaRowEl = null;
      ctxFormulaActions = null;
    };
    ctxSaveToolBtn.addEventListener("click", () => {
      if (!ctxTarget) return;
      const name = prompt("Name for this tool:")?.trim();
      if (!name) return;
      const els = selectedEls.size > 1 ? [
        ...selectedEls
      ] : [
        ctxTarget
      ];
      let originX = Infinity, originY = Infinity;
      for (const el of els) {
        originX = Math.min(originX, parseInt(el.style.left));
        originY = Math.min(originY, parseInt(el.style.top));
      }
      const toolBlocks = els.flatMap((el) => {
        const block = state.blocks.find((b) => b.id === el.id);
        if (!block) return [];
        return [
          {
            type: block.type,
            subtype: block.subtype,
            content: block.content,
            label: block.label,
            w: block.w,
            dx: parseInt(el.style.left) - originX,
            dy: parseInt(el.style.top) - originY
          }
        ];
      });
      const mod = {
        id: `custom-${Date.now()}`,
        name,
        content: toolBlocks[0]?.content ?? "",
        label: toolBlocks[0]?.label ?? "",
        blocks: toolBlocks
      };
      customModules.push(mod);
      saveCustomModules();
      const list = document.getElementById("custom-modules-list");
      if (list) list.appendChild(renderCustomModuleItem(mod));
      hideCtxMenu();
    });
    ctxDeleteBtn.addEventListener("click", () => {
      if (ctxTarget) deleteBlock(ctxTarget);
      hideCtxMenu();
    });
    ctxAddRowBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertRowAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddIfBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertIfAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddElseifBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertElseifFor(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddElseBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertElseFor(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddForBtn.addEventListener("click", () => {
      ctxFormulaActions?.insertForAfter(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddDescBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addDescription(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddRefBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addReference(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelBranchBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelRowBtn.addEventListener("click", () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });
    document.addEventListener("mousedown", (e) => {
      if (!ctxMenu.contains(e.target)) hideCtxMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideCtxMenu();
    });
    document.addEventListener("contextmenu", (e) => {
      const target = e.target.closest(".block");
      if (!target) return;
      e.preventDefault();
      if (!selectedEls.has(target)) selectBlock(target);
      ctxTarget = target;
      const multi = selectedEls.size > 1;
      ctxSaveToolBtn.textContent = multi ? "\u2B50 Save Selection as Tool" : "\u2B50 Save as Tool";
      ctxSaveToolBtn.style.display = "";
      const rowsEl = e.target.closest(".formula-rows");
      const rowEl = e.target.closest(".formula-row");
      const actions = rowsEl ? rowsEl._formulaCtxActions : null;
      if (actions) {
        ctxFormulaRowEl = rowEl;
        ctxFormulaActions = actions;
        const { rowType, hasIf, hasElse, canDelBranch } = actions.getRowState(rowEl);
        const isRegular = actions.isRegularRow(rowEl);
        const hasDesc = actions.hasDescription(rowEl);
        const hasRef = actions.hasReference(rowEl);
        ctxAddElseifBtn.style.display = hasIf ? "" : "none";
        ctxAddElseBtn.style.display = hasIf ? "" : "none";
        ctxAddElseifBtn.disabled = hasElse;
        ctxAddElseBtn.disabled = hasElse;
        ctxAddElseifBtn.title = hasElse ? "+ elseif (else branch already exists)" : "Add elseif branch to enclosing if (Ctrl+E)";
        ctxAddElseBtn.title = hasElse ? "+ else (else branch already exists)" : "Add else branch to enclosing if (Ctrl+Shift+E)";
        const isInsideGroup = !!rowEl?.closest(".formula-block-group");
        const canHaveDescRef = isRegular && !isInsideGroup || rowType === "if" || rowType === "for";
        ctxAddDescBtn.style.display = canHaveDescRef && !hasDesc ? "" : "none";
        ctxAddRefBtn.style.display = canHaveDescRef && !hasRef ? "" : "none";
        ctxDelBranchBtn.style.display = canDelBranch ? "" : "none";
        const typeLabel = rowType ? ` (${rowType})` : "";
        ctxDelRowBtn.title = `Delete this row${typeLabel} (Ctrl+-)`;
        ctxFormulaGroup.style.display = "";
        ctxFormulaSep.style.display = "";
      } else {
        ctxFormulaRowEl = null;
        ctxFormulaActions = null;
        ctxFormulaGroup.style.display = "none";
        ctxFormulaSep.style.display = "none";
      }
      ctxMenu.style.left = `${e.clientX}px`;
      ctxMenu.style.top = `${e.clientY}px`;
      ctxMenu.style.display = "block";
    });
    state.blocks.forEach(renderBlock);
  } catch (e) {
    console.error("Wasm Load Error:", e);
  }
}
start();
