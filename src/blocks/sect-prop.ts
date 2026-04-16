// ---------------------------------------------------------------------------
// Section Properties block — rectangular cross-section area & moment of inertia
// Computation is handled by the TypeScript solver.
// ---------------------------------------------------------------------------

import { rect_area, rect_ix } from 'solver';
import { numInput, resultRow } from './_math-block-helpers.ts';

export function buildSectPropBlock(el: HTMLElement) {
  const title = document.createElement('div');
  title.className = 'math-title';
  title.textContent = 'Section Properties';
  el.appendChild(title);

  const bRow = numInput('b', 'mm', 100);
  const hRow = numInput('h', 'mm', 200);
  const bInp = bRow.querySelector('input')!;
  const hInp = hRow.querySelector('input')!;

  const divider = document.createElement('hr');
  divider.className = 'math-divider';

  const { row: aRow, value: aVal } = resultRow('Area', 'mm²');
  const { row: ixRow, value: ixVal } = resultRow('I\u2093', 'mm\u2074');

  function calc() {
    const b = parseFloat(bInp.value);
    const h = parseFloat(hInp.value);
    if (!isNaN(b) && !isNaN(h)) {
      aVal.textContent = rect_area(b, h).toFixed(2);
      ixVal.textContent = rect_ix(b, h).toFixed(2);
    }
  }

  bInp.addEventListener('input', calc);
  hInp.addEventListener('input', calc);

  el.appendChild(bRow);
  el.appendChild(hRow);
  el.appendChild(divider);
  el.appendChild(aRow);
  el.appendChild(ixRow);
  calc();
}
