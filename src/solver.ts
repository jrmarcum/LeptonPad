let exp: Record<string, (...args: number[]) => number>;

export default async function init(): Promise<void> {
  const { instance } = await WebAssembly.instantiateStreaming(fetch('./solver.wasm'));
  exp = instance.exports as Record<string, (...args: number[]) => number>;
}

export const rect_area = (b: number, h: number): number => exp.rect_area(b, h);
export const rect_ix = (b: number, h: number): number => exp.rect_ix(b, h);
export const solve_beam_deflection = (p: number, l: number, e: number, i: number): number =>
  exp.solve_beam_deflection(p, l, e, i);
