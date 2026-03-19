// ---------------------------------------------------------------------------
// Beam Deflection block — simply-supported beam with mid-point load.
// Computation is handled by the Rust WASM solver.
// ---------------------------------------------------------------------------

import { solve_beam_deflection } from 'solver';
import { numInput, resultRow } from './_math-block-helpers.ts';

export function buildBeamDefBlock(el: HTMLElement, E_default: number) {
  const title = document.createElement('div');
  title.className = 'math-title';
  title.textContent = 'Beam Deflection';

  const pRow = numInput('P', 'kN', 10);
  const lRow = numInput('L', 'mm', 3000);
  const eRow = numInput('E', 'MPa', E_default);
  const iRow = numInput('I\u2093', 'mm\u2074', 8333333);

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
    }
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
