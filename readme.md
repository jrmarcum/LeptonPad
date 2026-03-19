# LeptonPad

![LeptonPad Logo](public/LeptonPadLogo.png)

A high-performance, web-native engineering workbench — WebAssembly-powered solver, drag-and-drop canvas, offline-first PWA.

**[Launch LeptonPad](https://leptonpad.jrmarcum.deno.net/)**

---

## What is LeptonPad?

LeptonPad is a browser-based engineering calculation pad. It gives structural and mechanical engineers a live, programmable workspace where formulas evaluate in real time, beam deflection and section properties are solved at native speed, and results can be assembled into a paginated, printable report — all without installing software or connecting to a server.

Key characteristics:

- **No cloud required.** The app runs fully offline — everything is cached locally by the service worker.
- **Mathematically rigorous.** The expression evaluator tracks units and propagates dimensional analysis through every formula row.
- **Composable.** Results from one block are automatically available as variables in every block below it on the same canvas.
- **Report-ready.** The canvas follows an A4/Letter page grid so that your layout matches a printed or exported document.

---

## User Guide

### The Canvas

When LeptonPad opens you see a two-panel layout:

| Panel          | Purpose                                                     |
| -------------- | ----------------------------------------------------------- |
| Sidebar (left) | Block palette — click any module to place it on the canvas  |
| Canvas (right) | The working surface — blocks live here on a 20 px snap grid |

Each canvas page is A4-sized (or Letter, A3, etc. depending on your project settings). The canvas grows downward automatically as you add content.

---

### Block Types

#### Formula Block

The core calculation block. Each row is an independent expression:

```text
b = 150          → assigns variable b = 150
h = 300          → assigns variable h = 300
A = b * h        → evaluates to 45000
Ix = b*h^3/12    → evaluates to 337500000
```

- Assign variables with `=` — they become available to all blocks below.
- Reference variables by name anywhere on the canvas (within the same scope).
- Supports inline units: `F = 10 kN`, `L = 6000 mm`.
- Control flow: `if(cond, then, else)` and `clamp(x, min, max)` are built-in.
- Define reusable functions: `f(x) = 2*x^2 + 3`.
- Results display to the right of each row with their computed units.

**Supported operators:** `+ - * / ^ ( ) == != < > <= >= and or xor`

**Built-in functions:** `sin cos tan sqrt cbrt abs exp log floor ceil round sign min max atan2 mod pow hypot if clamp factorial gamma lgamma erf comb perm`

**Constants:** `pi e tau`

---

#### Beam Deflection Block

Computes mid-span deflection for a simply-supported beam with a central point load.

| Input                 | Symbol | Unit |
| --------------------- | ------ | ---- |
| Point load            | P      | kN   |
| Span                  | L      | mm   |
| Elastic modulus       | E      | MPa  |
| Second moment of area | I      | mm⁴  |

**Output:** δmax (mm) — computed using δ = PL³ / (48EI).

---

#### Section Properties Block

Computes properties for a rectangular cross-section.

| Input  | Symbol | Unit |
| ------ | ------ | ---- |
| Width  | b      | mm   |
| Height | h      | mm   |

**Outputs:** Area (mm²), Ix (mm⁴).

---

#### Plot Block

Renders an SVG curve from a math expression over a variable range.

- Enter any expression using variables defined above (e.g. `sin(x * pi / L) * delta`).
- Set the `x` range, number of evaluation points, and axis labels.
- Add permanent markers at specific x-values with custom labels.
- Plot colors adapt automatically to dark/light mode.

---

#### Section Block

A collapsible container that groups related blocks under a shared namespace.

- Blocks inside a Section prefix their variables with the section name (e.g. `Beam.Ix`).
- Collapse the section to hide detail and show only a summary line.
- The summary line shows user-configured output variables and pass/fail comparisons.
- Sections can be colour-coded for quick visual reference.

---

#### Text Block

A freeform Markdown text block for notes, assumptions, and narrative.

- Supports bold, italic, headings, lists, and inline code via a formatting toolbar.
- Greek letters are entered as their English name and rendered as the symbol (e.g. `alpha` → α).
- Math expressions inside `$...$` or `$$...$$` delimiters are rendered as formatted math.
- Toggle between edit and preview mode with a single click.

---

#### Figure Block

An image block with an auto-numbered caption.

- Click the placeholder or paste an image to embed it.
- Captions are editable; figure numbers increment automatically across the canvas.
- Images are stored as Base64 data URLs inside the project file.

---

### Canvas Interactions

| Action          | How                                             |
| --------------- | ----------------------------------------------- |
| Place a block   | Click a module in the sidebar                   |
| Move a block    | Drag it to a new position (snaps to 20 px grid) |
| Select a block  | Click it (blue border indicates selection)      |
| Multi-select    | Hold Shift or Ctrl while clicking               |
| Delete selected | Press Delete or Backspace                       |
| Undo deletion   | Press Ctrl+Z                                    |
| Deselect        | Press Escape or click empty canvas              |
| Resize a block  | Drag the right edge of blocks that support it   |

---

### Projects

#### Saving and Loading

- **Save project:** Click **Save** in the toolbar — uses the browser File System Access API to write a `.json` file to your chosen location.
- **Load project:** Click **Open** and select a previously saved `.json` file.
- **New project:** Click **New** — you will be prompted before unsaved changes are discarded.

#### Exporting

- **Export JSON:** Downloads the full project state as a portable `.json` file.
- **Import custom modules:** Use the custom module import dialog to share reusable block groups between projects.

#### Project File Format

Projects are stored as human-readable JSON containing the block list, global constants, and project metadata (name, date, units, title block fields). They can be version-controlled alongside design documents.

---

### Title Block

Each page has an optional title block at the bottom — a standard engineering drawing title panel with editable fields:

`Project` · `Subject` · `Drawn by` · `Date` · `Job No.` · `Sheet No.` · `Logo`

Click any field to edit it. Upload a company logo by clicking the logo placeholder in the title block.

---

### Custom Modules

Frequently used block groups (e.g. a standard material properties section) can be saved as a **Custom Module** and reloaded in any project from the sidebar. Custom modules are exported and imported as JSON, making them easy to share with a team.

---

## License

LeptonPad source code, compiled binaries, and brand assets (including the LeptonPad name and logo) are proprietary.
See [LICENSE](LICENSE) for the full terms.

Copyright © 2026 LeptonPad. All rights reserved.
