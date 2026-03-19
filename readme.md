# MathWasm PWA // Engineering Suite

A high-performance, web-native engineering workbench. MathWasm utilizes a Rust-powered kernel (via WebAssembly) to provide mathematically rigorous structural analysis within a modern, offline-first Progressive Web App.

---

## Build Steps

### 1. Prerequisites

Install the following tools before building:

| Tool | Install |
| ---- | ------- |
| [Deno](https://deno.com/manual/getting_started/installation) | `irm https://deno.land/install.ps1 \| iex` (Windows) |
| Rust | [rustup.rs](https://rustup.rs) |
| wasm-pack | `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh` |

Add the WASM compilation target to Rust:

```sh
rustup target add wasm32-unknown-unknown
```

### 2. Compile the Rust WASM Kernel

For development (faster compile, unoptimized):

```sh
deno task build:wasm
```

For production (optimized release build):

```sh
deno task build:wasm:release
```

Both commands run `wasm-pack build --target web` inside `/solver` and output the compiled package to `solver/pkg/`. This step must be run at least once before starting the dev server or building the frontend.

### 3. (Optional) Optimize the WASM Binary

Reduces the `.wasm` file size using [binaryen](https://github.com/WebAssembly/binaryen). Requires `wasm-opt` on your PATH (e.g. `scoop install binaryen`):

```sh
deno task opt:wasm
```

> **Windows note:** `wasm-opt` is disabled automatically during `build:wasm:release` (see `Cargo.toml`). Run this task manually after a release build.

### 4. Start the Dev Server

Copies static assets to `dist/`, starts `deno bundle --watch` on `src/main.ts`, and serves `dist/` at `http://localhost:5173`:

```sh
deno task dev
```

Changes to `src/main.ts` are re-bundled automatically. CSS and WASM changes require restarting `dev` to re-copy those files.

### 5. Production Build

Compiles a release WASM kernel and produces a minified, flat `dist/` ready to deploy:

```sh
deno task build
```

This runs `build:wasm:release` followed by `build.ts`, which bundles `src/main.ts` into `dist/main.js` and copies all other assets alongside it.

### 6. Lint & Format

```sh
deno task check
```

Runs `deno fmt` and `deno lint`. The `solver/pkg/` and `dist/` directories are excluded.

---

## Architecture

* **Kernel** (`/solver`): Written in Rust using wasm-bindgen and plotters. Exports `generate_plot`, `rect_area`, `rect_ix`, and `solve_beam_deflection` to the browser via WASM.
* **Frontend** (`/src`): All TypeScript lives in a single `src/main.ts` — types, Canvas class, sidebar, and app logic. Bundled with `deno bundle --platform browser` into one `main.js`.
* **Styles** (`/src/styles/main.css`): Plain CSS — no Tailwind, no PostCSS. Dark/light mode driven entirely by `@media (prefers-color-scheme: dark)`.
* **PWA**: Hand-written `public/sw.js` (cache-first) and `public/manifest.json` — no Vite, no vite-plugin-pwa.
* **Build scripts**: `build.ts` (production) and `dev.ts` (watch + file server) — pure Deno, no npm, no node_modules.

---

## Key Features

* High-Contrast UI: Adaptive dark/light modes driven by system preference (CSS only).
* Drag-and-Drop Canvas: A4-sized grid canvas; sidebar modules dropped onto canvas become live blocks.
* WASM Solver: Beam deflection, section properties (rect area, moment of inertia), and SVG plot generation run in Rust.
* Vector Reporting: Export engineering reports as PDFs via svg2pdf.js (in progress).
* Offline-First: Service worker pre-caches JS, CSS, and the WASM binary.

---

## Project Structure

```text
mathwasm-pwa/
├── solver/                     # Rust WASM Kernel
│   ├── src/
│   │   └── lib.rs              # Math logic: beam deflection, section props, SVG plots
│   └── Cargo.toml              # wasm-bindgen + plotters; wasm-opt disabled (Windows workaround)
├── src/                        # TypeScript Frontend (single file)
│   ├── main.ts                 # All app logic: types, Canvas, sidebar, WASM init, drag-drop
│   └── styles/
│       └── main.css            # Plain CSS: layout, #canvas A4, .block, dark mode
├── public/
│   ├── sw.js                   # Cache-first service worker
│   └── manifest.json           # PWA manifest
├── .env.example                # Supabase credentials template
├── build.ts                    # Production build: deno bundle + copy assets → dist/
├── dev.ts                      # Dev: copy assets + deno bundle --watch + file server
├── deno.json                   # Import map, tasks, fmt/lint config
└── index.html                  # PWA shell; links /main.css and /main.js
```

### dist/ output (flat, no subdirectories)

```text
dist/
├── index.html
├── manifest.json
├── sw.js
├── main.js           ← bundled + minified
├── main.css
└── solver_bg.wasm
```

---

## Windows Notes

* **wasm-opt disabled** in `Cargo.toml` (`wasm-opt = false`) to avoid a Scoop nodejs-lts shim conflict ("Access is denied"). Run `deno task opt:wasm` manually after installing binaryen via `scoop install binaryen`.
* **`nodeModulesDir: "none"`** in `deno.json` prevents Deno from reading any leftover `node_modules` directory, which previously caused a Deno panic.

---

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for details.
