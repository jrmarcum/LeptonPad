// ---------------------------------------------------------------------------
// Beam Deflection block — simply-supported beam with mid-point load.
// Computation is handled by the TypeScript solver.
// ---------------------------------------------------------------------------

import { solve_beam_deflection } from 'solver';
import { type Block } from '../types.ts';
import { numInput, readMathBlockInputs, resultRow } from './_math-block-helpers.ts';

export function buildBeamDefBlock(el: HTMLElement, E_default: number, block: Block) {
  const title = document.createElement('div');
  title.className = 'math-title';
  title.textContent = 'Beam Deflection';

  // Restore the user's inputs \u2014 see readMathBlockInputs. `E_default` is only the prefill for a
  // NEW block; it is steel in MPa and the user overwrites it for any other material.
  const saved = readMathBlockInputs(block);
  const pRow = numInput('P', 'kN', saved.P ?? 10);
  const lRow = numInput('L', 'mm', saved.L ?? 3000);
  const eRow = numInput('E', 'MPa', saved.E ?? E_default);
  const iRow = numInput('I\u2093', 'mm\u2074', saved.I ?? 8333333);

  const pInp = pRow.querySelector('input')!;
  const lInp = lRow.querySelector('input')!;
  const eInp = eRow.querySelector('input')!;
  const iInp = iRow.querySelector('input')!;

  const divider = document.createElement('hr');
  divider.className = 'math-divider';

  const { row: dRow, value: dVal } = resultRow('\u03b4\u2098\u2090\u2093', 'mm');

  function calc() {
    const p = parseFloat(pInp.value) * 1000; // kN → N
    const l = parseFloat(lInp.value);
    const e = parseFloat(eInp.value);
    const i = parseFloat(iInp.value);
    if (![p, l, e, i].some(isNaN)) {
      dVal.textContent = solve_beam_deflection(p, l, e, i).toFixed(4);
    } else {
      // Blank rather than leave the previous δmax next to inputs it did not come from.
      dVal.textContent = '—';
    }
    block.content = JSON.stringify({
      P: pInp.value,
      L: lInp.value,
      E: eInp.value,
      I: iInp.value,
    });
  }

  pInp.addEventListener('input', calc);
  lInp.addEventListener('input', calc);
  eInp.addEventListener('input', calc);
  iInp.addEventListener('input', calc);

  el.appendChild(title);
  el.appendChild(pRow);
  el.appendChild(lRow);
  el.appendChild(eRow);
  el.appendChild(iRow);
  el.appendChild(divider);
  el.appendChild(dRow);
  calc();
}
