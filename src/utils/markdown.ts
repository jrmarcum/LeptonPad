// ---------------------------------------------------------------------------
// Markdown and math-expression rendering utilities
// All functions are pure (string in → string out), no state access — TS-only.
// ---------------------------------------------------------------------------

const GREEK_TABLE: [RegExp, string][] = [
  [/\bepsilon\b/g, 'ε'], [/\bEpsilon\b/g, 'ε'],
  [/\blambda\b/g,  'λ'], [/\bLambda\b/g,  'Λ'],
  [/\balpha\b/g,   'α'], [/\bAlpha\b/g,   'α'],
  [/\btheta\b/g,   'θ'], [/\bTheta\b/g,   'Θ'],
  [/\bdelta\b/g,   'δ'], [/\bDelta\b/g,   'Δ'],
  [/\bgamma\b/g,   'γ'], [/\bGamma\b/g,   'Γ'],
  [/\bomega\b/g,   'ω'], [/\bOmega\b/g,   'Ω'],
  [/\bsigma\b/g,   'σ'], [/\bSigma\b/g,   'Σ'],
  [/\bbeta\b/g,    'β'], [/\bBeta\b/g,    'Β'],
  [/\bphi\b/g,     'φ'], [/\bPhi\b/g,     'Φ'],
  [/\bpsi\b/g,     'ψ'], [/\bPsi\b/g,     'Ψ'],
  [/\bchi\b/g,     'χ'], [/\bChi\b/g,     'Χ'],
  [/\bxi\b/g,      'ξ'], [/\bXi\b/g,      'Ξ'],
  [/\beta\b/g,     'η'], [/\bEta\b/g,     'Η'],
  [/\bmu\b/g,      'μ'], [/\bMu\b/g,      'Μ'],
  [/\bnu\b/g,      'ν'], [/\bNu\b/g,      'Ν'],
  [/\brho\b/g,     'ρ'], [/\bRho\b/g,     'Ρ'],
  [/\btau\b/g,     'τ'], [/\bTau\b/g,     'Τ'],
  [/\bpi\b/g,      'π'], [/\bPi\b/g,      'Π'],
];

/** Reject javascript: URLs to prevent XSS. */
function sanitizeUrl(url: string): string {
  const t = url.trim();
  return /^javascript:/i.test(t) ? '#' : t;
}

/** Find index of ch at parenthesis depth 0; returns -1 if not found. */
export function topLevelIdx(s: string, ch: string): number {
  let depth = 0;
  for (let i = 0; i <= s.length - ch.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
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
    else if (s[i] === ')') { depth--; if (depth === 0 && i < s.length - 1) return s; }
  }
  return s.slice(1, -1).trim();
}

/** Apply Greek/superscript/subscript/sqrt/× transforms to a raw text piece. */
export function transformPiece(raw: string): string {
  let s = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/\bsqrt\s*\(/g, '√(');
  // Subscripted identifiers first (before Greek) so full base name is captured.
  // Multiple underscores become comma-separated subscripts:
  //   delta_1 → δ<sub>1</sub>,  delta_1_2 → δ<sub>1,2</sub>
  s = s.replace(/\b([A-Za-z][A-Za-z0-9]*)((?:_[A-Za-z0-9]+)+)\b/g, (_m, base, subs) => {
    let baseHtml = base;
    for (const [re, sym] of GREEK_TABLE) baseHtml = baseHtml.replace(re, sym);
    const subParts = subs.split('_').filter(Boolean).join(',');
    return `${baseHtml}<sub>${subParts}</sub>`;
  });
  // Greek substitution on remaining plain identifiers
  for (const [re, sym] of GREEK_TABLE) s = s.replace(re, sym);
  s = s.replace(/\^(\d+)/g, '<sup>$1</sup>');
  s = s.replace(/\^([A-Za-z])\b/g, '<sup>$1</sup>');
  s = s.replace(/\s*\*\s*/g, ' · ');
  return s;
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
  const s = raw.trim();
  if (!s) return '';

  // Find top-level + and - (unary minus at position 0 is not a split point)
  const addSplits: number[] = [];
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')') depth--;
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
    const num = stripOuter(s.slice(0, divIdx).trim());
    const den = stripOuter(s.slice(divIdx + 1).trim());
    return `<span class="frac"><span>${renderExpr(num)}</span><span>${renderExpr(den)}</span></span>`;
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

  // Strip optional unit annotation [unit] from end for display
  let unitHtml = '';
  const unitMatch = raw.match(/\[([^\]]+)\]\s*$/);
  const body = unitMatch ? raw.slice(0, unitMatch.index!).trim() : raw;
  if (unitMatch) {
    unitHtml = ` <span class="fp-unit">${transformPiece(unitMatch[1])}</span>`;
  }

  // Split assignment: "Ix = expr" → lhs "Ix", rhs "expr"
  let lhsHtml = '';
  let rhsRaw = body;
  const eqIdx = topLevelIdx(body, '=');
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
      spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
      return `\x00${spans.length - 1}\x00`;
    })
    .replace(/`([^`]+)`/g, (_, c) => { spans.push(`<code>${esc(c)}</code>`); return `\x00${spans.length - 1}\x00`; })
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
function parseEqTag(line: string): { label: string | null; display: string | null; exprEnd: number } {
  const m = line.match(/#([\w-]*)(?::([\w. +-]+))?\s*$/);
  if (!m) return { label: null, display: null, exprEnd: line.length };
  const label   = m[1] || null;
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
    if (!isSingle && line.trim() === '$$') { inMath = !inMath; continue; }
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
    return `<div class="eq-row"><span></span><span class="md-math"${idAttr}>${html || esc(expr)}</span>${numCell}</div>`;
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
        spans.push(`<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`);
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
    out.push(`<blockquote>${bqLines.map(l => `<p>${inline(l)}</p>`).join('\n')}</blockquote>`);
    bqLines.length = 0;
  }

  function closeListsToIndent(targetIndent: number) {
    while (listStack.length > 0 && listStack[listStack.length - 1].indent >= targetIndent) {
      const top = listStack.pop()!;
      out.push(top.type === 'ul' ? '</ul>' : '</ol>');
    }
  }

  function closeAllLists() { closeListsToIndent(-1); }

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
    // ── Code fence ────────────────────────────────────────────────────────────
    if (!inMath && line.startsWith('```')) {
      if (inPre) { out.push('</code></pre>'); inPre = false; preLang = ''; }
      else {
        flushAll();
        preLang = line.slice(3).trim();
        out.push(`<pre><code${preLang ? ` class="lang-${esc(preLang)}"` : ''}>`);
        inPre = true;
      }
      continue;
    }
    if (inPre) { out.push(esc(line)); continue; }

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
        const rows = mathLines.filter(l => l.trim()).map(eqRow).join('');
        out.push(`<div class="md-math-block">${rows}</div>`);
        mathLines.length = 0;
        inMath = false;
      } else {
        flushAll();
        inMath = true;
      }
      continue;
    }
    if (inMath) { mathLines.push(line); continue; }

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
      flushPara(); closeAllLists();
      out.push(`<h${hm[1].length}>${inline(hm[2])}</h${hm[1].length}>`);
      continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^[-*=_]{3,}\s*$/.test(line)) {
      flushPara(); closeAllLists();
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
      if (/^[-*+]$/.test(marker))       { listType = 'ul'; listTag = '<ul>'; }
      else if (/^\d+\.$/.test(marker))  { listType = 'ol'; listTag = '<ol>'; }
      else if (/^[a-z]\.$/.test(marker)){ listType = 'ol'; listTag = '<ol type="a">'; }
      else                               { listType = 'ol'; listTag = '<ol type="A">'; }

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
        out.push(`<li class="task-item"><input type="checkbox" data-task-line="${lineIdx}"${checked ? ' checked' : ''}> ${inline(taskMatch[2])}</li>`);
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
    const rows = mathLines.filter(l => l.trim()).map(eqRow).join('');
    out.push(`<div class="md-math-block">${rows}</div>`);
  }
  if (inPre) out.push('</code></pre>');
  closeAllLists();
  return out.join('\n');
}
