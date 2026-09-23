// ---------------------------------------------------------------------------
// Section Properties block — rectangular cross-section area & moment of inertia
// Computation is handled by the TypeScript solver.
// ---------------------------------------------------------------------------

import { rect_area, rect_ix } from 'solver';
import { type Block } from '../types.ts';
import { numInput, readMathBlockInputs, resultRow } from './_math-block-helpers.ts';

export function buildSectPropBlock(el: HTMLElement, block: Block) {
  const title = document.createElement('div');
  title.className = 'math-title';
  title.textContent = 'Section Properties';
  el.appendChild(title);

  // Restore what the user typed. This block took no `block` at all before 2026-09-23, so nothing
  // it contained was ever saved: reopening a project silently reset it to the defaults below
  // while still displaying a confidently formatted result for a section that was no longer there.
  const saved = readMathBlockInputs(block);
  const bRow = numInput('b', 'mm', saved.b ?? 100);
  const hRow = numInput('h', 'mm', saved.h ?? 200);
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
    } else {
      // Blank it. The `if` used to simply not run, leaving the PREVIOUS result on screen beside
      // the new inputs — a printed sheet then showed a number that did not come from the values
      // next to it.
      aVal.textContent = '—';
      ixVal.textContent = '—';
    }
    block.content = JSON.stringify({ b: bInp.value, h: hInp.value });
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
