export function rect_area(b: f64, h: f64): f64 {
  return b * h;
}

export function rect_ix(b: f64, h: f64): f64 {
  return (b * h * h * h) / 12.0;
}

export function solve_beam_deflection(p: f64, l: f64, e: f64, i: f64): f64 {
  return (p * l * l * l) / (48.0 * e * i);
}
