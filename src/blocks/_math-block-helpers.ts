// ---------------------------------------------------------------------------
// Shared DOM helpers for numeric-input math blocks (sect-prop, beam-def).
// Not intended for use outside of src/blocks/.
// ---------------------------------------------------------------------------

/** Build a labelled number input row. */
export function numInput(label: string, unit: string, defaultVal: number): HTMLElement {
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
