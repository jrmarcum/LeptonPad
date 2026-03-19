use wasm_bindgen::prelude::*;
use plotters::prelude::*;
use plotters::backend::SVGBackend;

#[wasm_bindgen]
pub fn generate_plot(is_dark: bool) -> String {
    let mut buffer = String::new();
    let root = SVGBackend::with_string(&mut buffer, (400, 200)).into_drawing_area();
    let color = if is_dark { &CYAN } else { &BLUE };
    let bg_color = if is_dark { &BLACK } else { &WHITE };
    root.fill(bg_color).unwrap();
    root.draw(&PathElement::new(vec![(0, 100), (400, 100)], color)).unwrap();
    drop(root);
    buffer
}

#[wasm_bindgen]
pub fn rect_area(b: f64, h: f64) -> f64 {
    b * h
}

#[wasm_bindgen]
pub fn rect_ix(b: f64, h: f64) -> f64 {
    (b * h.powi(3)) / 12.0
}

#[wasm_bindgen]
pub fn solve_beam_deflection(p: f64, l: f64, e: f64, i: f64) -> f64 {
    (p * l.powi(3)) / (48.0 * e * i)
}
