// ---------------------------------------------------------------------------
// Markdown and math-expression rendering utilities
// All functions are pure (string in → string out), no state access — TS-only.
// ---------------------------------------------------------------------------

// Greek and letter-like symbols render ONLY when written with a backslash: \phi → φ, \Delta → Δ,
// \ell → ℓ. A bare `phi` displays as typed. The backslash is display-only — the evaluator strips it
// (stripGreekMarks), so \phiM_n and phiM_n are the same variable.
//
// \var forms give the OTHER shape of the letter (Jon's decision, 2026-09-22). LeptonPad's \phi and
// \epsilon already draw curly φ and ε — the glyphs real LaTeX calls \varphi/\varepsilon — so here
// \varphi → ϕ and \varepsilon → ϵ, the reverse of LaTeX for those two, keeping the AISC-style φ on \phi.
const GREEK_SYM = new Map<string, string>([
  ['e', 'e'], // \e — Euler's number; shown as a plain e (the backslash only tells the calculator)
  ['ell', 'ℓ'],
  ['varphi', 'ϕ'],
  ['varepsilon', 'ϵ'],
  ['vartheta', 'ϑ'],
  ['varsigma', 'ς'],
  ['varrho', 'ϱ'],
  ['varpi', 'ϖ'],
  ['varkappa', 'ϰ'],
  ['alpha', 'α'],
  ['Alpha', 'Α'],
  ['beta', 'β'],
  ['Beta', 'Β'],
  ['gamma', 'γ'],
  ['Gamma', 'Γ'],
  ['delta', 'δ'],
  ['Delta', 'Δ'],
  ['epsilon', 'ε'],
  ['Epsilon', 'Ε'],
  ['zeta', 'ζ'],
  ['Zeta', 'Ζ'],
  ['eta', 'η'],
  ['Eta', 'Η'],
  ['theta', 'θ'],
  ['Theta', 'Θ'],
  ['iota', 'ι'],
  ['Iota', 'Ι'],
  ['kappa', 'κ'],
  ['Kappa', 'Κ'],
  ['lambda', 'λ'],
  ['Lambda', 'Λ'],
  ['mu', 'μ'],
  ['Mu', 'Μ'],
  ['nu', 'ν'],
  ['Nu', 'Ν'],
  ['xi', 'ξ'],
  ['Xi', 'Ξ'],
  ['omicron', 'ο'],
  ['Omicron', 'Ο'],
  ['pi', 'π'],
  ['Pi', 'Π'],
  ['rho', 'ρ'],
  ['Rho', 'Ρ'],
  ['sigma', 'σ'],
  ['Sigma', 'Σ'],
  ['tau', 'τ'],
  ['Tau', 'Τ'],
  ['upsilon', 'υ'],
  ['Upsilon', 'Υ'],
  ['phi', 'φ'],
  ['Phi', 'Φ'],
  ['chi', 'χ'],
  ['Chi', 'Χ'],
  ['psi', 'ψ'],
  ['Psi', 'Ψ'],
  ['omega', 'ω'],
  ['Omega', 'Ω'],
]);
// `\name` — longest names first so \epsilon never matches as \eps…, \beta never as \eta.
const GREEK_MARK_RE = new RegExp(
  '\\\\(' + [...GREEK_SYM.keys()].sort((a, b) => b.length - a.length).join('|') + ')',
  'g',
);
// Letters a subscript base/subscript may contain: Latin, Greek block (incl. ϕ ϵ ϑ ϰ ϱ ϖ ς), ℓ — plus
// combining marks (U+0300–036F), so an overbar from \bar{} does not break `\bar{y}_c`.
const SUB_LETTER = 'A-Za-z\\u0370-\\u03FF\\u2113';
const SUB_MARK = '\\u0300-\\u036F';
const GREEK_SUB_RE = new RegExp(
  `(?<![${SUB_LETTER}${SUB_MARK}0-9_])([${SUB_LETTER}][${SUB_LETTER}${SUB_MARK}0-9]*)` +
    `((?:_[${SUB_LETTER}${SUB_MARK}0-9]+)+)`,
  'g',
);
// \bar{x} → x̄. Braces hold one name, optionally a symbol name: \bar{\sigma} → σ̄. The evaluator
// rewrites it to the variable `xbar` / `sigmabar` (stripGreekMarks in expr.ts).
const BAR_RE = /\\bar\{\s*(\\?[A-Za-z][A-Za-z0-9]*)\s*\}/g;

/** Reject javascript: URLs to prevent XSS. */
function sanitizeUrl(url: string): string {
  const t = url.trim();
  return /^javascript:/i.test(t) ? '#' : t;
}

/** Find index of ch at parenthesis depth 0; returns -1 if not found. */
export function topLevelIdx(s: string, ch: string): number {
  let depth = 0;
  for (let i = 0; i <= s.length - ch.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0 && s.slice(i, i + ch.length) === ch) return i;
  }
  return -1;
}

/** Strip one layer of outer matching parens if the whole string is wrapped. */
export function stripOuter(s: string): string {
  s = s.trim();
  if (!s.startsWith('(') || !s.endsWith(')')) return s;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') {
      depth--;
      if (depth === 0 && i < s.length - 1) return s;
    }
  }
  return s.slice(1, -1).trim();
}

/**
 * Find the index of a top-level assignment '=' that is NOT part of <=, >=, !=, ==.
 * Returns -1 if none found.
 */
function findAssignmentIdx(s: string): number {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0 && s[i] === '=') {
      if (i > 0 && /[<>!=]/.test(s[i - 1])) continue;
      if (i + 1 < s.length && s[i + 1] === '=') continue;
      return i;
    }
  }
  return -1;
}

/**
 * Render a unit string for display — HTML-escapes, converts ^N to superscripts,
 * and replaces * with ·, but deliberately skips Greek-letter substitution so that
 * unit abbreviations like "psi" (lb/in²) are never converted to Greek symbols.
 */
export function transformUnit(raw: string): string {
  let s = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\^(\d+)/g, '<sup>$1</sup>');
  s = s.replace(/\^([A-Za-z])\b/g, '<sup>$1</sup>');
  s = s.replace(/\s*\*\s*/g, ' · ');
  return s;
}

/** Apply Greek/superscript/subscript/sqrt/× transforms to a raw text piece. */
export function transformPiece(raw: string): string {
  // Inline [unit] tags render as units — never Greek-substituted (psi stays psi).
  if (raw.includes('[')) {
    return raw.split(/(\[[^\]]+\])/).map((part) =>
      /^\[[^\]]+\]$/.test(part)
        ? `<span class="fp-unit">${transformUnit(part.slice(1, -1))}</span>`
        : transformPiece(part)
    ).join(' ').replace(/\s+/g, ' ').trim();
  }
  let s = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Comparisons nested inside a call (`if(x >= 0, 1, 0)`) — top-level ones are split by renderExpr.
  s = s.replace(/&lt;&gt;|!=/g, '≠').replace(/&gt;=/g, '≥').replace(/&lt;=/g, '≤').replace(
    /==/g,
    '=',
  );
  // Symbols require the backslash, LaTeX-style: \sqrt( → √(, \phi → φ. Bare sqrt / phi display
  // as typed. The name after \ converts whatever follows it: \phiM_n, \phin, \phi2, M_\phi.
  s = s.replace(/\\sqrt\s*\(/g, '√(');
  // Overbar: one character takes a combining macron (x̄); several take a combining overline each so
  // the bar runs continuously across them (A̅B̅).
  s = s.replace(BAR_RE, (_m, inner: string) => {
    const chars = [...inner.replace(GREEK_MARK_RE, (_g, name) => GREEK_SYM.get(name)!)];
    return chars.length === 1 ? chars[0] + '̄' : chars.map((c) => c + '̅').join('');
  });
  s = s.replace(GREEK_MARK_RE, (_m, name) => GREEK_SYM.get(name)!);
  // Multiple underscores become comma-separated subscripts:
  //   \delta_1 → δ<sub>1</sub>,  \delta_1_2 → δ<sub>1,2</sub>
  // Bases and subscripts may contain Greek letters produced by the marker pass above.
  s = s.replace(GREEK_SUB_RE, (_m, base, subs) => {
    const subParts = subs.split('_').filter(Boolean).join(',');
    return `${base}<sub>${subParts}</sub>`;
  });
  s = s.replace(/\^(\d+)/g, '<sup>$1</sup>');
  s = s.replace(/\^([A-Za-z])\b/g, '<sup>$1</sup>');
  s = s.replace(/\s*\.\*\s*/g, ' × '); // matrix product (nested in a call; top level is split above)
  s = s.replace(/\s*\*\s*/g, ' · ');
  return s;
}

/** Split `s` at top-level commas (outside () and []). */
function splitTopLevelCommas(s: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0 && s[i] === ',') {
      out.push(s.slice(start, i));
      start = i + 1;
    }
  }
  out.push(s.slice(start));
  return out.map((p) => p.trim());
}

/** True when `s` is one `{…}` group — its opening brace closes at the very end. */
function isBraceGroup(s: string): boolean {
  if (!s.startsWith('{') || !s.endsWith('}')) return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0 && i !== s.length - 1) return false;
  }
  return true;
}

/**
 * A matrix literal as a bracketed grid: `{{a, b}, {c, d}}` → 2×2, a flat `{a, b, c}` → a column
 * (same shapes as the evaluator's matrixLiteral). Returns null if `s` is not a well-formed literal,
 * so malformed input falls through to plain text rather than a misleading grid.
 */
function renderMatrixLiteral(s: string): string | null {
  if (!isBraceGroup(s)) return null;
  const items = splitTopLevelCommas(s.slice(1, -1));
  if (items.some((x) => !x)) return null;
  let rows: string[][];
  if (items.every(isBraceGroup)) {
    rows = items.map((r) => splitTopLevelCommas(r.slice(1, -1)));
    if (rows.some((r) => r.length !== rows[0].length || r.some((x) => !x))) return null;
  } else if (items.some(isBraceGroup)) {
    return null;
  } else {
    rows = items.map((x) => [x]);
  }
  const cells = rows.flat().map((x) => `<span>${renderExpr(x)}</span>`).join('');
  return `<span class="mat" style="grid-template-columns: repeat(${
    rows[0].length
  }, auto)">${cells}</span>`;
}

// Matrix functions typed by name, displayed in textbook notation: transpose(A) → Aᵀ.
const POSTFIX_FN_SUP: Record<string, string> = { transpose: 'T', inv: '−1' };

/**
 * `transpose(X)` → Xᵀ, `inv(X)` → X⁻¹. X is shown bare when it is a plain name or a matrix literal,
 * otherwise in parentheses — (A × B)ᵀ — so the superscript clearly applies to the whole argument.
 * Returns null unless `s` is exactly one such call with one argument.
 */
function renderPostfixFn(s: string): string | null {
  const m = s.match(/^\\?(transpose|inv)\s*\(/);
  if (!m || !s.endsWith(')')) return null;
  let depth = 0;
  for (let i = m[0].length - 1; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0 && i !== s.length - 1) return null;
  }
  const args = splitTopLevelCommas(s.slice(m[0].length, -1));
  if (args.length !== 1 || !args[0]) return null;
  const arg = args[0];
  const simple = /^\\?[A-Za-z][A-Za-z0-9_\\]*$/.test(arg) || isBraceGroup(arg);
  const body = simple ? renderExpr(arg) : `(${renderExpr(arg)})`;
  return `${body}<sup>${POSTFIX_FN_SUP[m[1]]}</sup>`;
}

const BIG_OP_SYM: Record<string, string> = { sum: 'Σ', prod: 'Π', integral: '∫' };

// Comparison operators and their display glyphs. Two-character operators are tried first so `>=`
// is never read as `>` followed by `=`.
const CMP_DISPLAY: [string, string][] = [
  ['>=', '≥'],
  ['<=', '≤'],
  ['!=', '≠'],
  ['<>', '≠'],
  ['==', '='],
  ['<', '&lt;'],
  ['>', '&gt;'],
];

/** First top-level (outside () and []) comparison operator in `s`, or null. */
function findTopLevelCmp(s: string): { idx: number; op: string; sym: string } | null {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0) {
      for (const [op, sym] of CMP_DISPLAY) {
        if (s.startsWith(op, i)) return { idx: i, op, sym };
      }
    }
  }
  return null;
}

/**
 * `sum(expr, i, a, b)` → Σ with i = a below and b above, then the expression; `prod` → Π;
 * `integral(expr, x, a, b)` → ∫ with a below and b above, the expression, then `dx`. Returns null
 * unless `s` is exactly one such call (its opening paren closes at the very end).
 */
function renderBigOp(s: string): string | null {
  const m = s.match(/^\\?(sum|prod|integral)\s*\(/);
  if (!m || !s.endsWith(')')) return null;
  let depth = 0;
  for (let i = m[0].length - 1; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0 && i !== s.length - 1) return null;
  }
  const args = splitTopLevelCommas(s.slice(m[0].length, -1));
  if (args.length !== 4 || args.some((a) => !a)) return null;
  const [body, v, from, to] = args;
  const op = m[1];
  const vHtml = transformPiece(v);
  const lower = op === 'integral' ? renderExpr(from) : `${vHtml}=${renderExpr(from)}`;
  // Σ(a + b) needs parentheses to read correctly; Σ a·b does not.
  let hasAddSub = false;
  for (let i = 1, depth = 0; i < body.length; i++) {
    if (body[i] === '(' || body[i] === '[' || body[i] === '{') depth++;
    else if (body[i] === ')' || body[i] === ']' || body[i] === '}') depth--;
    else if (depth === 0 && (body[i] === '+' || body[i] === '-')) hasAddSub = true;
  }
  const bodyHtml = hasAddSub ? `(${renderExpr(body)})` : renderExpr(body);
  return `<span class="bigop"><span class="bigop-lim">${renderExpr(to)}</span>` +
    `<span class="bigop-sym">${
      BIG_OP_SYM[op]
    }</span><span class="bigop-lim">${lower}</span></span>` +
    bodyHtml + (op === 'integral' ? ` d${vHtml}` : '');
}

/**
 * Recursively render an expression to HTML.
 * - Splits at top-level + / - first (so each additive term is handled independently)
 * - Then splits each term at top-level / to render as a stacked fraction
 * - Leaf nodes go through transformPiece for Greek/super/subscript/sqrt/× transforms
 *
 * This prevents `a/b + c/d` from being misread as `a / (b + c/d)`.
 */
export function renderExpr(raw: string): string {
  const s = stripOuter(raw.trim());
  if (!s) return '';
  const bigOp = renderBigOp(s) ?? renderMatrixLiteral(s) ?? renderPostfixFn(s);
  if (bigOp !== null) return bigOp;

  // A comparison splits first, so each side renders on its own: `a/b >= c` is a fraction ≥ c, not
  // a over "b >= c". Shown as ≥ ≤ ≠; `==` shows as =.
  const cmp = findTopLevelCmp(s);
  if (cmp) {
    return `${renderExpr(s.slice(0, cmp.idx))} <span class="fp-cmp">${cmp.sym}</span> ${
      renderExpr(s.slice(cmp.idx + cmp.op.length))
    }`;
  }

  // Find top-level + and - (unary minus at position 0 is not a split point)
  const addSplits: number[] = [];
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0 && i > 0 && (s[i] === '+' || s[i] === '-')) addSplits.push(i);
  }

  if (addSplits.length > 0) {
    let html = '';
    let start = 0;
    for (const idx of addSplits) {
      html += renderExpr(s.slice(start, idx));
      html += ` ${s[idx]} `;
      start = idx + 1;
    }
    html += renderExpr(s.slice(start));
    return html;
  }

  // No top-level additive op — check for a top-level /
  const divIdx = topLevelIdx(s, '/');
  if (divIdx >= 0) {
    const numStr = s.slice(0, divIdx).trim();
    const denStr = s.slice(divIdx + 1).trim();
    const num = stripOuter(numStr);
    const mulIdx = topLevelIdx(denStr, '*');

    if (mulIdx < 0) {
      // Simple denominator — show as stacked fraction.
      const den = stripOuter(denStr);
      return `<span class="frac"><span>${renderExpr(num)}</span><span>${
        renderExpr(den)
      }</span></span>`;
    }

    // Denominator has a top-level *: split at the first * so that `P/2 * x` renders
    // as [P/2 fraction] · x rather than P over 2·x (which would read as P/(2·x)).
    const pureDen = stripOuter(denStr.slice(0, mulIdx).trim());
    if (pureDen) {
      const trailing = denStr.slice(mulIdx + 1).trim();
      const fracHtml = `<span class="frac"><span>${renderExpr(num)}</span><span>${
        renderExpr(pureDen)
      }</span></span>`;
      return fracHtml + (trailing ? ' · ' + renderExpr(trailing) : '');
    }
  }

  // No top-level / — split at top-level * and recurse into (groups) so that
  // sub-expressions like (w*x/2)*(l-x) render their inner fractions correctly.
  // `*` shows as ·; `.*` (matrix product) as × (Jon's choice) so the two are never confused.
  const mulSplits: { idx: number; len: number; sym: string }[] = [];
  depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(' || s[i] === '[' || s[i] === '{') depth++;
    else if (s[i] === ')' || s[i] === ']' || s[i] === '}') depth--;
    else if (depth === 0 && s[i] === '*') {
      const dot = i > 0 && s[i - 1] === '.';
      mulSplits.push(dot ? { idx: i - 1, len: 2, sym: '×' } : { idx: i, len: 1, sym: '·' });
    }
  }

  if (mulSplits.length > 0) {
    const renderPiece = (piece: string) => {
      const stripped = stripOuter(piece);
      if (stripped !== piece) return '(' + renderExpr(stripped) + ')';
      return renderBigOp(piece) ?? renderMatrixLiteral(piece) ?? renderPostfixFn(piece) ??
        transformPiece(piece);
    };
    let html = '';
    let start = 0;
    for (const { idx, len, sym } of mulSplits) {
      html += renderPiece(s.slice(start, idx).trim()) + ` ${sym} `;
      start = idx + len;
    }
    return html + renderPiece(s.slice(start).trim());
  }

  return transformPiece(s);
}

/**
 * Convert a raw formula statement to a math-preview HTML string.
 * Handles: assignment (name = expr), top-level division → stacked fraction,
 * Greek letters, superscripts, subscripts, sqrt → √, * → ×.
 */
export function prettifyExpr(src: string): string {
  const raw = src.trim();
  if (!raw) return '';

  // Strip [[targetUnit]] first, then [sourceUnit], for display
  let targetUnitHtml = '';
  const targetMatch = raw.match(/\[\[([^\]]+)\]\]\s*$/);
  const afterTarget = targetMatch ? raw.slice(0, targetMatch.index!).trim() : raw;
  if (targetMatch) {
    targetUnitHtml = ` <span class="fp-unit fp-unit-target">→ ${
      transformUnit(targetMatch[1])
    }</span>`;
  }

  let unitHtml = '';
  // Same rule as evalStatements: a trailing [unit] is peeled off only when it is the sole tag.
  let unitMatch = afterTarget.match(/\[([^\]]+)\]\s*$/);
  if (unitMatch && afterTarget.slice(0, unitMatch.index!).includes('[')) unitMatch = null;
  const body = unitMatch ? afterTarget.slice(0, unitMatch.index!).trim() : afterTarget;
  if (unitMatch) {
    unitHtml = ` <span class="fp-unit">${transformUnit(unitMatch[1])}</span>`;
  }

  // Split assignment: "Ix = expr" → lhs "Ix", rhs "expr"
  // Uses findAssignmentIdx so that <= >= != == are never mistaken for an assignment.
  let lhsHtml = '';
  let rhsRaw = body;
  const eqIdx = findAssignmentIdx(body);
  if (eqIdx > 0) {
    const lhs = body.slice(0, eqIdx).trim();
    rhsRaw = body.slice(eqIdx + 1).trim();
    // Plain identifier → compact transformPiece; complex LHS (e.g. f(x)) → renderExpr.
    // Either way rhsRaw is always the part after '=', so the LHS can never end up inside a fraction.
    lhsHtml = (/^[A-Za-z_]\w*$/.test(lhs) ? transformPiece(lhs) : renderExpr(lhs)) +
      ' <span class="fp-eq">=</span> ';
  }

  const rhsHtml = renderExpr(rhsRaw);
  return lhsHtml + rhsHtml + unitHtml + targetUnitHtml;
}

/**
 * Render inline markdown within a single line of text.
 * Handles: images, links, `code`, $math$, ***bold italic***, **bold**, *italic*, _italic_.
 */
export function renderInlineMd(src: string): string {
  if (!src) return '';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const spans: string[] = [];
  const p = src
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
      return `\x00${spans.length - 1}\x00`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      spans.push(
        `<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`,
      );
      return `\x00${spans.length - 1}\x00`;
    })
    .replace(/`([^`]+)`/g, (_, c) => {
      spans.push(`<code>${esc(c)}</code>`);
      return `\x00${spans.length - 1}\x00`;
    })
    .replace(/\$([^$\n]+?)\$/g, (_, m) => {
      const html = prettifyExpr(m);
      spans.push(`<span class="md-math">${html || esc(m)}</span>`);
      return `\x00${spans.length - 1}\x00`;
    });
  const r = esc(p)
    .replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
    .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
    .replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+?)_/g, '<em>$1</em>');
  // deno-lint-ignore no-control-regex
  return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]).replace(/\n/g, '<br>');
}

/** Parse a tag at the end of an equation line.
 *  Syntax: #label  |  #label:display  |  #:display  (label optional when display given)
 *  Returns { label, display } where either may be null. */
function parseEqTag(
  line: string,
): { label: string | null; display: string | null; exprEnd: number } {
  const m = line.match(/#([\w-]*)(?::([\w. +-]+))?\s*$/);
  if (!m) return { label: null, display: null, exprEnd: line.length };
  const label = m[1] || null;
  const display = m[2]?.trim() || null;
  return { label, display, exprEnd: m.index! };
}

/** Build the label → display-string map for all $$ block equations (pre-pass). */
function collectEqLabels(src: string): Map<string, string> {
  const map = new Map<string, string>();
  let counter = 0;
  let inMath = false;
  for (const line of src.split('\n')) {
    const isSingle = /^\$\$.+\$\$\s*$/.test(line);
    if (!isSingle && line.trim() === '$$') {
      inMath = !inMath;
      continue;
    }
    if (!isSingle && !inMath) continue;
    const raw = isSingle ? line.replace(/^\$\$/, '').replace(/\$\$$/, '') : line;
    if (!raw.trim()) continue;
    const { label, display } = parseEqTag(raw);
    const displayStr = display ?? String(++counter);
    if (label) map.set(label, displayStr);
    else if (!display) counter++; // unlabeled auto-number still increments
  }
  return map;
}

/** Render a CommonMark subset to HTML. */
export function renderMarkdown(src: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Pre-pass: build label → display-string map
  const eqLabels = collectEqLabels(src);
  let eqCounter = 0;

  /** Render one equation line into a 3-column grid row. */
  function eqRow(raw: string): string {
    const { label, display, exprEnd } = parseEqTag(raw.trim());
    const expr = raw.trim().slice(0, exprEnd).trim();
    // Custom display number is used as-is; auto-numbered equations increment the counter.
    const displayStr = display !== null ? display : String(++eqCounter);
    const numCell = `<span class="eq-num">[eq ${esc(displayStr)}]</span>`;
    const html = prettifyExpr(expr);
    const idAttr = label ? ` id="eq-${esc(label)}"` : '';
    return `<div class="eq-row"><span></span><span class="md-math"${idAttr}>${
      html || esc(expr)
    }</span>${numCell}</div>`;
  }

  // Inline renderer: images, links, code, math, eq-refs, bold/italic
  function inline(s: string): string {
    const spans: string[] = [];
    const p = s
      .replace(/\(#([\w-]+)\)/g, (_, label) => {
        const n = eqLabels.get(label);
        const inner = n !== undefined
          ? `<a class="eq-ref" href="#eq-${esc(label)}">[eq ${esc(n)}]</a>`
          : `<span class="eq-ref eq-ref-missing">[eq ?]</span>`;
        spans.push(inner);
        return `\x00${spans.length - 1}\x00`;
      })
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
        spans.push(`<img src="${sanitizeUrl(url)}" alt="${esc(alt)}" class="md-img">`);
        return `\x00${spans.length - 1}\x00`;
      })
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
        spans.push(
          `<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${
            esc(text)
          }</a>`,
        );
        return `\x00${spans.length - 1}\x00`;
      })
      .replace(/`([^`]+)`/g, (_, c) => {
        spans.push(`<code>${esc(c)}</code>`);
        return `\x00${spans.length - 1}\x00`;
      })
      .replace(/\$([^$\n]+?)\$/g, (_, m) => {
        const html = prettifyExpr(m);
        spans.push(`<span class="md-math">${html || esc(m)}</span>`);
        return `\x00${spans.length - 1}\x00`;
      });
    const r = esc(p)
      .replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>')
      .replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>')
      .replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
      .replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    // deno-lint-ignore no-control-regex
    return r.replace(/\x00(\d+)\x00/g, (_, i) => spans[parseInt(i)]);
  }

  const lines = src.split('\n');
  const out: string[] = [];
  let inPre = false, preLang = '';
  let inMath = false;
  let lineIdx = -1;
  const mathLines: string[] = [];

  // Nested list stack: each entry tracks type, opening tag, and indent level
  type ListEntry = { type: 'ul' | 'ol'; tag: string; indent: number };
  const listStack: ListEntry[] = [];

  const para: string[] = [];
  const bqLines: string[] = [];

  function flushPara() {
    if (!para.length) return;
    out.push(`<p>${para.map(inline).join('<br>')}</p>`);
    para.length = 0;
  }

  function flushBq() {
    if (!bqLines.length) return;
    out.push(`<blockquote>${bqLines.map((l) => `<p>${inline(l)}</p>`).join('\n')}</blockquote>`);
    bqLines.length = 0;
  }

  function closeListsToIndent(targetIndent: number) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent >= targetIndent) {
      const top = listStack.pop()!;
      out.push(top.type === 'ul' ? '</ul>' : '</ol>');
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

  for (const line of lines) {
    lineIdx++;
    // ── Code fence ────────────────────────────────────────────────────────────
    if (!inMath && line.startsWith('```')) {
      if (inPre) {
        out.push('</code></pre>');
        inPre = false;
        preLang = '';
      } else {
        flushAll();
        preLang = line.slice(3).trim();
        out.push(`<pre><code${preLang ? ` class="lang-${esc(preLang)}"` : ''}>`);
        inPre = true;
      }
      continue;
    }
    if (inPre) {
      out.push(esc(line));
      continue;
    }

    // ── Block math $$...$$ ────────────────────────────────────────────────────
    // Single-line: $$expr$$
    const singleMath = line.match(/^\$\$(.+)\$\$\s*$/);
    if (singleMath) {
      flushAll();
      out.push(`<div class="md-math-block">${eqRow(singleMath[1].trim())}</div>`);
      continue;
    }
    // Multi-line: $$ on its own line toggles block-math mode
    if (line.trim() === '$$') {
      if (inMath) {
        const rows = mathLines.filter((l) => l.trim()).map(eqRow).join('');
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

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (line.startsWith('> ') || line === '>') {
      flushPara();
      closeAllLists();
      bqLines.push(line.startsWith('> ') ? line.slice(2) : '');
      continue;
    }

    // Any non-blockquote line flushes the blockquote buffer
    flushBq();

    // ── Heading ───────────────────────────────────────────────────────────────
    const hm = line.match(/^(#{1,4})\s+(.+)$/);
    if (hm) {
      flushPara();
      closeAllLists();
      out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
      continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^[-*=_]{3,}\s*$/.test(line)) {
      flushPara();
      closeAllLists();
      out.push('<hr>');
      continue;
    }

    // ── Lists (unordered, ordered, lettered, nested, task) ───────────────────
    const listMatch = line.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(.*)$/);
    if (listMatch) {
      flushPara();
      const indent = listMatch[1].length;
      const marker = listMatch[2];
      const content = listMatch[3];
      let listType: 'ul' | 'ol';
      let listTag: string;
      if (/^[-*+]$/.test(marker)) {
        listType = 'ul';
        listTag = '<ul>';
      } else if (/^\d+\.$/.test(marker)) {
        listType = 'ol';
        listTag = '<ol>';
      } else if (/^[a-z]\.$/.test(marker)) {
        listType = 'ol';
        listTag = '<ol type="a">';
      } else {
        listType = 'ol';
        listTag = '<ol type="A">';
      }

      // Close lists deeper than current indent
      closeListsToIndent(indent + 1);

      if (listStack.length === 0 || listStack[listStack.length - 1].indent < indent) {
        // Open a new nested list
        out.push(listTag);
        listStack.push({ type: listType, tag: listTag, indent });
      } else if (listStack[listStack.length - 1].tag !== listTag) {
        // Same depth but list kind changed — close and reopen
        const top = listStack.pop()!;
        out.push(top.type === 'ul' ? '</ul>' : '</ol>');
        out.push(listTag);
        listStack.push({ type: listType, tag: listTag, indent });
      }
      // else: same kind at same depth — just add <li>

      // Task list item: - [ ] text  or  - [x] text
      const taskMatch = listType === 'ul' && content.match(/^\[([ xX])\]\s+(.*)$/);
      if (taskMatch) {
        const checked = taskMatch[1].toLowerCase() === 'x';
        out.push(
          `<li class="task-item"><input type="checkbox" data-task-line="${lineIdx}"${
            checked ? ' checked' : ''
          }> ${inline(taskMatch[2])}</li>`,
        );
      } else {
        out.push(`<li>${inline(content)}</li>`);
      }
      continue;
    }

    // ── Empty line ────────────────────────────────────────────────────────────
    if (line.trim() === '') {
      flushPara();
      closeAllLists();
      continue;
    }

    // ── Paragraph ─────────────────────────────────────────────────────────────
    closeAllLists();
    para.push(line);
  }

  flushPara();
  flushBq();
  // Close unclosed block math
  if (inMath) {
    const rows = mathLines.filter((l) => l.trim()).map(eqRow).join('');
    out.push(`<div class="md-math-block">${rows}</div>`);
  }
  if (inPre) out.push('</code></pre>');
  closeAllLists();
  return out.join('\n');
}
