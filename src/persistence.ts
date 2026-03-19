// ---------------------------------------------------------------------------
// Persistence — project serialization, load/save, and import/export dialogs
// ---------------------------------------------------------------------------

import { type Block, type TitleBlockData } from './types.ts';
import {
  state, canvas,
  setTitleBlockEnabled, setPageNumberingEnabled, setFileHandle, fileHandle,
  customModules, setCustomModules, saveCustomModules,
  globalScope, globalFnScope, deletionStack, childToSection,
  PAGE_H, CANVAS_H, numPages, setNumPages, setCANVAS_H, margins, titleBlockH,
  onRefreshCustomModulesList, onAppendCustomModuleToSidebar,
} from './state.ts';
import { syncPageSeparators, syncTitleBlocks, updatePageCount, moveGridCursor, clearSelection, renderBlock } from './dnd.ts';
import { refreshSectionHeight } from './blocks/section.ts';
import { reEvalAllFormulas } from './blocks/formula.ts';

// ---------------------------------------------------------------------------
// Import tools dialog
// ---------------------------------------------------------------------------

export function showImportToolsDialog(tools: import('./types.ts').CustomModule[]) {
  const overlay = document.createElement('div');
  overlay.className = 'import-modal-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'import-modal';

  const title = document.createElement('h3');
  title.textContent = 'Import Custom Tools';
  dialog.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'import-modal-sub';
  subtitle.textContent = 'Select tools to add to this project:';
  dialog.appendChild(subtitle);

  const listEl = document.createElement('div');
  listEl.className = 'import-modal-list';

  const checkboxes: { cb: HTMLInputElement; mod: import('./types.ts').CustomModule }[] = [];
  for (const mod of tools) {
    const alreadyExists = customModules.some((m) => m.name === mod.name);
    const row = document.createElement('label');
    row.className = 'import-tool-row';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !alreadyExists;
    cb.disabled = alreadyExists;
    row.appendChild(cb);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = mod.name;
    row.appendChild(nameSpan);

    if (alreadyExists) {
      const note = document.createElement('span');
      note.className = 'import-tool-exists';
      note.textContent = '(already exists)';
      row.appendChild(note);
    }

    listEl.appendChild(row);
    checkboxes.push({ cb, mod });
  }
  dialog.appendChild(listEl);

  const btnRow = document.createElement('div');
  btnRow.className = 'import-modal-btns';

  const selectAllBtn = document.createElement('button');
  selectAllBtn.textContent = 'Select All';
  selectAllBtn.addEventListener('click', () => {
    checkboxes.forEach(({ cb }) => { if (!cb.disabled) cb.checked = true; });
  });
  btnRow.appendChild(selectAllBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => overlay.remove());
  btnRow.appendChild(cancelBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'import-confirm-btn';
  importBtn.textContent = 'Import Selected';
  importBtn.addEventListener('click', () => {
    const selected = checkboxes.filter(({ cb }) => cb.checked && !cb.disabled).map(({ mod }) => mod);
    for (const mod of selected) {
      const newMod: import('./types.ts').CustomModule = { ...mod, id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}` };
      customModules.push(newMod);
      onAppendCustomModuleToSidebar?.(newMod);
    }
    if (selected.length > 0) saveCustomModules();
    overlay.remove();
  });
  btnRow.appendChild(importBtn);

  dialog.appendChild(btnRow);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ---------------------------------------------------------------------------
// Import tools from file
// ---------------------------------------------------------------------------

export async function importToolsFromFile() {
  try {
    // deno-lint-ignore no-explicit-any
    const hasPicker = typeof (window as any).showOpenFilePicker === 'function';

    if (hasPicker) {
      let pickerHandles: unknown[];
      try {
        // deno-lint-ignore no-explicit-any
        pickerHandles = await (window as any).showOpenFilePicker({
          types: [{ description: 'JSON Project', accept: { 'application/json': ['.json'] } }],
        });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') throw e;
        return;
      }
      // deno-lint-ignore no-explicit-any
      const handle = pickerHandles[0] as any;
      const text = await (await handle.getFile()).text();
      const proj = JSON.parse(text) as Record<string, unknown>;
      const tools = proj.custom_tools as import('./types.ts').CustomModule[] | undefined;
      if (!tools || !Array.isArray(tools) || tools.length === 0) {
        alert('No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.');
        return;
      }
      showImportToolsDialog(tools);
    } else {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.json';
      inp.addEventListener('change', async () => {
        const file = inp.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const proj = JSON.parse(text) as Record<string, unknown>;
          const tools = proj.custom_tools as import('./types.ts').CustomModule[] | undefined;
          if (!tools || !Array.isArray(tools) || tools.length === 0) {
            alert('No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.');
            return;
          }
          showImportToolsDialog(tools);
        } catch {
          alert('Invalid project file.');
        }
      });
      inp.click();
    }
  } catch (e) {
    alert('Failed to open file: ' + (e as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Save prompt dialog
// ---------------------------------------------------------------------------

/** Prompt "Save / Don't Save / Cancel" before a destructive action. */
export function showSavePromptDialog(): Promise<'save' | 'discard' | 'cancel'> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'import-modal-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'import-modal';

    const title = document.createElement('h3');
    title.textContent = 'Unsaved Changes';
    dialog.appendChild(title);

    const msg = document.createElement('p');
    msg.textContent = 'Do you want to save your changes before continuing?';
    dialog.appendChild(msg);

    const btns = document.createElement('div');
    btns.className = 'import-modal-btns';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'import-confirm-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => { overlay.remove(); resolve('save'); });

    const discardBtn = document.createElement('button');
    discardBtn.textContent = "Don't Save";
    discardBtn.addEventListener('click', () => { overlay.remove(); resolve('discard'); });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => { overlay.remove(); resolve('cancel'); });

    btns.appendChild(saveBtn);
    btns.appendChild(discardBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

// ---------------------------------------------------------------------------
// Project state management
// ---------------------------------------------------------------------------

export function clearProjectState() {
  canvas.domElement.querySelectorAll('.block').forEach((el) => el.remove());
  canvas.domElement.querySelectorAll('.title-block-overlay').forEach((el) => el.remove());
  state.blocks = [];
  delete state.titleBlock;
  setTitleBlockEnabled(false);
  const tbToggle = document.getElementById('title-block-toggle') as HTMLInputElement | null;
  if (tbToggle) tbToggle.checked = false;
  state.projectName = 'Untitled Project';
  state.constants = { E: 200000 };
  for (const k in globalScope) delete globalScope[k];
  for (const k in globalFnScope) delete globalFnScope[k];
  clearSelection();
  deletionStack.length = 0;
  childToSection.clear();
  setFileHandle(null);
  setNumPages(1);
  setCANVAS_H(PAGE_H);
  canvas.domElement.style.height = `${CANVAS_H}px`;
  syncPageSeparators();

  setCustomModules([]);
  saveCustomModules();
  const list = document.getElementById('custom-modules-list');
  if (list) list.innerHTML = '';
}

export async function newProject() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === 'cancel') return;
    if (choice === 'save') await saveProject(false);
  }
  clearProjectState();
}

export async function newFromTemplate() {
  if (state.blocks.length > 0) {
    const choice = await showSavePromptDialog();
    if (choice === 'cancel') return;
    if (choice === 'save') await saveProject(false);
  }

  // deno-lint-ignore no-explicit-any
  const hasPicker = typeof (window as any).showOpenFilePicker === 'function';

  if (hasPicker) {
    let pickerHandles: unknown[];
    try {
      // deno-lint-ignore no-explicit-any
      pickerHandles = await (window as any).showOpenFilePicker({
        types: [{ description: 'JSON Project', accept: { 'application/json': ['.json'] } }],
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') alert('Failed to open template: ' + (e as Error).message);
      return;
    }
    // deno-lint-ignore no-explicit-any
    const handle = pickerHandles[0] as any;
    try {
      loadProject(JSON.parse(await (await handle.getFile()).text()));
    } catch {
      alert('Invalid template file.');
      return;
    }
    setFileHandle(null);
  } else {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.addEventListener('change', async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        loadProject(JSON.parse(await file.text()));
        setFileHandle(null);
      } catch {
        alert('Invalid template file.');
      }
    });
    inp.click();
  }
}

export function loadProject(proj: Record<string, unknown>) {
  canvas.domElement.querySelectorAll('.block').forEach((el) => el.remove());
  canvas.domElement.querySelectorAll('.title-block-overlay').forEach((e) => e.remove());
  state.blocks = [];
  setTitleBlockEnabled(false);

  const rawTb = proj.title_block as TitleBlockData | undefined;
  if (rawTb) {
    state.titleBlock = rawTb;
    setTitleBlockEnabled(true);
    const tbToggle = document.getElementById('title-block-toggle') as HTMLInputElement | null;
    if (tbToggle) tbToggle.checked = true;
    const pnCheckbox = document.getElementById('page-numbering-toggle') as HTMLInputElement | null;
    if (pnCheckbox) {
      pnCheckbox.checked = false;
      pnCheckbox.disabled = true;
      const pnLabel = pnCheckbox.parentElement as HTMLElement | null;
      if (pnLabel) { pnLabel.style.opacity = '0.4'; pnLabel.style.pointerEvents = 'none'; }
    }
    setPageNumberingEnabled(false);
  } else {
    setTitleBlockEnabled(false);
    const tbToggle = document.getElementById('title-block-toggle') as HTMLInputElement | null;
    if (tbToggle) tbToggle.checked = false;
    const pnCheckbox = document.getElementById('page-numbering-toggle') as HTMLInputElement | null;
    if (pnCheckbox) {
      pnCheckbox.disabled = false;
      const pnLabel = pnCheckbox.parentElement as HTMLElement | null;
      if (pnLabel) { pnLabel.style.opacity = '1'; pnLabel.style.pointerEvents = ''; }
    }
  }

  const consts = proj.global_constants as Record<string, number> | undefined;
  if (consts) Object.assign(state.constants, consts);

  const rawBlocks = proj.blocks as Record<string, unknown>[] | undefined ?? [];
  for (const raw of rawBlocks) {
    const rawType = raw.type as string;
    if (rawType === 'title-block') {
      if (!state.titleBlock && raw.content) {
        try { state.titleBlock = JSON.parse(raw.content as string); } catch { /* ignore */ }
      }
      continue;
    }
    const type: Block['type'] = (rawType === 'math' && raw.content && !raw.subtype)
      ? 'formula'
      : rawType as Block['type'];

    const block: Block = {
      id: (raw.id as string) ?? `block-${Date.now()}`,
      type,
      subtype: raw.subtype as string | undefined,
      x: (raw.x as number) ?? 0,
      y: (raw.y as number) ?? 0,
      w: raw.w as number | undefined,
      content: (raw.content as string) ?? '',
      label: raw.label as string | undefined,
      sectionName:     raw.sectionName     as string  | undefined,
      collapsed:       raw.collapsed       as boolean | undefined,
      sectionColor:    raw.sectionColor    as string  | undefined,
      parentSectionId: raw.parentSectionId as string  | undefined,
      h:               raw.h               as number  | undefined,
    };
    state.blocks.push(block);
    if (!block.parentSectionId) {
      renderBlock(block);
    }
  }

  for (const block of state.blocks) {
    if (!block.parentSectionId) continue;
    const sectionEl = document.getElementById(block.parentSectionId);
    const content = sectionEl?.querySelector<HTMLElement>('.section-content');
    if (!content) continue;
    renderBlock(block);
    const childEl = document.getElementById(block.id);
    if (!childEl) continue;
    content.appendChild(childEl);
    childEl.style.left = `${block.x}px`;
    childEl.style.top  = `${block.y}px`;
    childEl.style.maxWidth = '';
    childToSection.set(block.id, block.parentSectionId);
    refreshSectionHeight(sectionEl!);
  }

  reEvalAllFormulas();
  updatePageCount();
  syncTitleBlocks();
  canvas.updateMarginGuide();
  moveGridCursor(margins.left, margins.top + titleBlockH());

  const savedTools = proj.custom_tools as import('./types.ts').CustomModule[] | undefined;
  if (savedTools && Array.isArray(savedTools)) {
    setCustomModules(savedTools);
    saveCustomModules();
    onRefreshCustomModulesList?.();
  }
}

export function serializeProject(): string {
  const blocks = state.blocks.map((b) => {
    const out: Record<string, unknown> = { id: b.id, type: b.type, x: b.x, y: b.y };
    if (b.content)         out.content         = b.content;
    if (b.subtype)         out.subtype         = b.subtype;
    if (b.label)           out.label           = b.label;
    if (b.w)               out.w               = b.w;
    if (b.sectionName)     out.sectionName     = b.sectionName;
    if (b.collapsed)       out.collapsed       = b.collapsed;
    if (b.sectionColor)    out.sectionColor    = b.sectionColor;
    if (b.parentSectionId) out.parentSectionId = b.parentSectionId;
    if (b.h)               out.h               = b.h;
    return out;
  });
  const out: Record<string, unknown> = {
    project_metadata: {
      name: state.projectName,
      date: new Date().toISOString().slice(0, 10),
      units: 'SI',
    },
    blocks,
    global_constants: state.constants,
    custom_tools: customModules,
  };
  if (state.titleBlock) out.title_block = state.titleBlock;
  return JSON.stringify(out, null, 2);
}

export async function saveProject(saveAs = false) {
  // deno-lint-ignore no-explicit-any
  const hasPicker = typeof (window as any).showSaveFilePicker === 'function';
  if (hasPicker) {
    try {
      if (!fileHandle || saveAs) {
        // deno-lint-ignore no-explicit-any
        setFileHandle(await (window as any).showSaveFilePicker({
          suggestedName: state.projectName.replace(/[^\w-]/g, '_') + '.json',
          types: [{ description: 'JSON Project', accept: { 'application/json': ['.json'] } }],
        }));
      }
      const writable = await fileHandle.createWritable();
      await writable.write(serializeProject());
      await writable.close();
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const blob = new Blob([serializeProject()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.projectName.replace(/[^\w-]/g, '_') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
