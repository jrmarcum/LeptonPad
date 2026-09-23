// ---------------------------------------------------------------------------
// Shared DOM helpers for numeric-input math blocks (sect-prop, beam-def).
// Not intended for use outside of src/blocks/.
// ---------------------------------------------------------------------------

/** Build a labelled number input row. */
/**
 * The saved inputs of a `math` block (Beam Deflection, Section Properties), as strings.
 *
 * These blocks stored nothing at all until 2026-09-23 — `buildSectPropBlock`/`buildBeamDefBlock`
 * never received the `Block`, so `serializeProject()` had nothing to write and reopening a
 * project reset them to their defaults while still showing a formatted result. Values are kept
 * as strings so a part-typed entry survives a round trip unchanged.
 */
export function readMathBlockInputs(
  block: { content?: string },
): Record<string, string | undefined> {
  try {
    const parsed = JSON.parse(block.content || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string | undefined>;
    }
  } catch { /* not JSON — an older block, or empty. Defaults apply. */ }
  return {};
}

export function numInput(
  label: string,
  unit: string,
  defaultVal: number | string,
): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = 'math-row';
  const lbl = document.createElement('span');
  lbl.className = 'math-label';
  lbl.textContent = label;
  wrap.appendChild(lbl);
  const inp = document.createElement('input');
  inp.type = 'number';
  inp.className = 'block-input';
  inp.value = String(defaultVal);
  inp.step = 'any';
  wrap.appendChild(inp);
  if (unit) {
    const u = document.createElement('span');
    u.className = 'math-unit';
    u.textContent = unit;
    wrap.appendChild(u);
  }
  return wrap;
}

/** Build a labelled result-value display row. */
export function resultRow(label: string, unit: string): { row: HTMLElement; value: HTMLElement } {
  const row = document.createElement('div');
  row.className = 'math-result-row';
  const lbl = document.createElement('span');
  lbl.className = 'math-label';
  lbl.textContent = label;
  row.appendChild(lbl);
  const value = document.createElement('span');
  value.className = 'math-result-value';
  value.textContent = '—';
  row.appendChild(value);
  if (unit) {
    const u = document.createElement('span');
    u.className = 'math-unit';
    u.textContent = unit;
    row.appendChild(u);
  }
  return { row, value };
}
