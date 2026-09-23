// ---------------------------------------------------------------------------
// Persistence — project serialization, load/save, and import/export dialogs
// ---------------------------------------------------------------------------

import {
  type Block,
  PROJECT_ACCEPT_ATTR,
  PROJECT_EXT,
  PROJECT_PICKER_TYPES,
  type TitleBlockData,
} from './types.ts';
import { getPackKey, hasPack } from './auth.ts';
import { decryptTemplate } from './crypto.ts';
import {
  canvas,
  CANVAS_H,
  childToSection,
  customModules,
  deletionStack,
  fileHandle,
  globalFnScope,
  globalScope,
  margins,
  onAppendCustomModuleToSidebar,
  onRefreshCustomModulesList,
  PAGE_H,
  pageNumberingEnabled,
  saveCustomModules,
  setCANVAS_H,
  setCustomModules,
  setFileHandle,
  setNumPages,
  setPageNumberingEnabled,
  setTitleBlockEnabled,
  state,
  titleBlockH,
} from './state.ts';
import {
  clearSelection,
  moveGridCursor,
  renderBlock,
  syncPageNumberingToggle,
  syncPageSeparators,
  syncTitleBlocks,
  updatePageCount,
} from './dnd.ts';
import { refreshSectionHeight } from './blocks/pro/section.ts';
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
    checkboxes.forEach(({ cb }) => {
      if (!cb.disabled) cb.checked = true;
    });
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
    const selected = checkboxes.filter(({ cb }) => cb.checked && !cb.disabled).map(({ mod }) =>
      mod
    );
    for (const mod of selected) {
      const newMod: import('./types.ts').CustomModule = {
        ...mod,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
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

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
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
          types: PROJECT_PICKER_TYPES,
        });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') throw e;
        return;
      }
      // deno-lint-ignore no-explicit-any
      const handle = pickerHandles[0] as any;
      const text = await (await handle.getFile()).text();
      const proj = parseProjectJson(text);
      const tools = proj.custom_tools as import('./types.ts').CustomModule[] | undefined;
      if (!tools || !Array.isArray(tools) || tools.length === 0) {
        alert(
          'No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.',
        );
        return;
      }
      showImportToolsDialog(tools);
    } else {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = PROJECT_ACCEPT_ATTR;
      inp.addEventListener('change', async () => {
        const file = inp.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const proj = parseProjectJson(text);
          const tools = proj.custom_tools as import('./types.ts').CustomModule[] | undefined;
          if (!tools || !Array.isArray(tools) || tools.length === 0) {
            alert(
              'No custom tools found in this project file.\n\nMake sure the file was saved after creating custom tools in it.',
            );
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
    saveBtn.addEventListener('click', () => {
      overlay.remove();
      resolve('save');
    });

    const discardBtn = document.createElement('button');
    discardBtn.textContent = "Don't Save";
    discardBtn.addEventListener('click', () => {
      overlay.remove();
      resolve('discard');
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      overlay.remove();
      resolve('cancel');
    });

    btns.appendChild(saveBtn);
    btns.appendChild(discardBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  });
}

/**
 * Parse a project file. Hand-written and AI-generated files often carry a bare backslash —
 * `\phiM_n` in a formula, `$\phi P_n$` in text — which JSON rejects ("Bad escaped character").
 * On that failure only, retry with every backslash that is not a valid JSON escape doubled,
 * so `\p` loads as the literal `\p` the author meant. A file that already parses is never
 * touched. Valid-escape collisions (`\beta` = backspace + "eta", `\nu`, `\theta`, `\rho`,
 * `\tau`) cannot be told apart from intent and are left alone.
 */
export function parseProjectJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text);
  } catch (e) {
    // A \u not followed by 4 hex digits (\upsilon) is as invalid as \p and is repaired too.
    const repaired = text.replace(
      /\\(u[0-9A-Fa-f]{4}|[\s\S])/g,
      (m, c: string) => ('"\\/bfnrt'.includes(c) || c.length === 5 ? m : '\\\\' + c),
    );
    if (repaired === text) throw e;
    try {
      return JSON.parse(repaired);
    } catch {
      throw e; // report the original position, not one in the repaired text
    }
  }
}

// ---------------------------------------------------------------------------
// Project state management
// ---------------------------------------------------------------------------

/**
 * Put the grid cursor on the first page and scroll the canvas back to the top — what every "this is
 * a different sheet now" moment needs: New Project, New from Template, and loading a file. Without
 * it the cursor keeps the previous project's position, which may be several pages below a shorter
 * new sheet (reported 2026-09-23).
 */
function resetViewToFirstPage() {
  moveGridCursor(margins.left, margins.top + titleBlockH());
  document.querySelector('main')?.scrollTo({ top: 0, left: 0 });
}

export function clearProjectState() {
  canvas.domElement.querySelectorAll('.block').forEach((el) => el.remove());
  canvas.domElement.querySelectorAll('.title-block-overlay').forEach((el) => el.remove());
  state.blocks = [];
  delete state.titleBlock;
  setTitleBlockEnabled(false);
  const tbToggle = document.getElementById('title-block-toggle') as HTMLInputElement | null;
  if (tbToggle) tbToggle.checked = false;
  state.projectName = 'Untitled Project';
  state.constants = {}; // no implicit E — see state.ts
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
  // The new sheet has one page; a cursor left on page 8 of the previous project would sit far off
  // it. Put it back on the first page — same reset loadProject does.
  resetViewToFirstPage();

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
        types: PROJECT_PICKER_TYPES,
      });
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        alert('Failed to open template: ' + (e as Error).message);
      }
      return;
    }
    // deno-lint-ignore no-explicit-any
    const handle = pickerHandles[0] as any;
    try {
      loadProject(parseProjectJson(await (await handle.getFile()).text()));
    } catch {
      alert('Invalid template file.');
      return;
    }
    setFileHandle(null);
  } else {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = PROJECT_ACCEPT_ATTR;
    inp.addEventListener('change', async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        loadProject(parseProjectJson(await file.text()));
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
  if (rawTb) state.titleBlock = rawTb;
  setTitleBlockEnabled(!!rawTb);
  const tbToggle = document.getElementById('title-block-toggle') as HTMLInputElement | null;
  if (tbToggle) tbToggle.checked = !!rawTb;
  // Loading a project with a title block used to also set pageNumberingEnabled = false — it
  // overwrote a preference the file says nothing about, and the user then found Page Numbering
  // off for no visible reason. The title block suppresses the display in syncPageSeparators;
  // this only reflects state in the sidebar.
  syncPageNumberingToggle();

  // The preference the user chose for THIS project, when the file records one. Older files do
  // not, so the current setting stands rather than being reset to a default.
  if (typeof proj.page_numbering === 'boolean') {
    setPageNumberingEnabled(proj.page_numbering);
    syncPageNumberingToggle();
  }

  // REPLACE, not merge. `Object.assign` left the previous project's constants in scope, so
  // opening project B after project A let a name B never defined resolve to A's leftover value
  // instead of erroring — cross-project contamination of the calculation scope.
  //
  // A bare `E` is dropped on the way in. Every file saved before 2026-09-23 carries
  // `global_constants: { E: 200000 }` from the old hardcoded seed, and keeping it would
  // re-inject steel's Young's modulus (in MPa) into that sheet's scope forever. E belongs to a
  // material, so it must be defined on the sheet; an undefined E is now an error, as it should
  // always have been. A user-defined constant that happens to be named E is indistinguishable
  // here — but there has never been a UI for defining one, so in practice this only ever
  // matches the old seed.
  const consts = { ...(proj.global_constants as Record<string, number> | undefined ?? {}) };
  delete consts.E;
  state.constants = consts;

  const rawBlocks = proj.blocks as Record<string, unknown>[] | undefined ?? [];
  for (const raw of rawBlocks) {
    const rawType = raw.type as string;
    if (rawType === 'title-block') {
      if (!state.titleBlock && raw.content) {
        try {
          state.titleBlock = JSON.parse(raw.content as string);
        } catch { /* ignore */ }
      }
      continue;
    }
    const type: Block['type'] = (rawType === 'math' && raw.content && !raw.subtype)
      ? 'formula'
      : rawType as Block['type'];

    const block: Block = {
      // A file whose blocks carry no ids would otherwise get the SAME id for every block, since
      // they are all created within one millisecond — they would then all resolve to the first
      // element. Same random suffix as dropBlock.
      id: (raw.id as string) ?? `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      subtype: raw.subtype as string | undefined,
      x: (raw.x as number) ?? 0,
      y: (raw.y as number) ?? 0,
      w: raw.w as number | undefined,
      content: (raw.content as string) ?? '',
      label: raw.label as string | undefined,
      sectionName: raw.sectionName as string | undefined,
      collapsed: raw.collapsed as boolean | undefined,
      sectionColor: raw.sectionColor as string | undefined,
      parentSectionId: raw.parentSectionId as string | undefined,
      h: raw.h as number | undefined,
      // `lineSpacing` was written by serializeProject but never read back here, so a block's
      // spacing silently reverted to single on every reload — the setting looked like it had
      // been forgotten when in fact it was in the file all along. Found 2026-09-23.
      lineSpacing: raw.lineSpacing as number | undefined,
      inputs: raw.inputs as Record<string, string> | undefined,
      packId: raw.packId as string | undefined,
      packAuthorId: raw.packAuthorId as string | undefined,
      encrypted: raw.encrypted as boolean | undefined,
      encIv: raw.encIv as string | undefined,
      encContent: raw.encContent as string | undefined,
    };

    // Decrypt purchased template section blocks if the user owns the pack
    if (block.encrypted && block.packId && block.encIv && block.encContent) {
      if (hasPack(block.packId)) {
        // Decrypt asynchronously; block renders as locked placeholder until resolved
        // Every exit from this chain must leave something on screen. `if (!key) return` and a
        // missing `else` on the decrypt used to end it silently, and because serializeProject
        // deliberately omits the plaintext the block's content is '' — so the section rendered
        // BLANK and normal-looking: no lock badge, no error. A blank section in a stamped calc
        // package reads as "nothing required here". There was no .catch() either, so a throw
        // became an unhandled rejection.
        const rerender = () => {
          const el = document.getElementById(block.id);
          if (el) {
            el.remove();
            renderBlock(block);
            reEvalAllFormulas();
          }
        };
        const unavailable = (why: string) => {
          // encIv/encContent are untouched, so the serializer still writes the ciphertext and
          // nothing is lost — this only changes what is shown until the next successful load.
          block.content = `[Unavailable: "${block.packId}" — ${why}]`;
          rerender();
        };
        getPackKey(block.packId).then(async (key) => {
          if (!key) {
            unavailable('the pack key could not be retrieved (offline, or access changed)');
            return;
          }
          const plain = await decryptTemplate(block.encIv!, block.encContent!, key);
          if (plain === null) {
            unavailable('its contents could not be decrypted');
            return;
          }
          block.content = plain;
          block.encrypted = false; // mark as decrypted in memory
          rerender();
        }).catch((e) => {
          console.error('Pack decrypt failed', block.packId, e);
          unavailable('an error occurred while unlocking it');
        });
      } else {
        // User doesn't own the pack — render as a locked placeholder
        block.content = `[Locked: "${block.packId}" pack required]`;
      }
    }

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
    childEl.style.top = `${block.y}px`;
    childEl.style.maxWidth = '';
    childToSection.set(block.id, block.parentSectionId);
    refreshSectionHeight(sectionEl!);
  }

  reEvalAllFormulas();
  updatePageCount();
  syncTitleBlocks();
  canvas.updateMarginGuide();
  resetViewToFirstPage();

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
    if (b.subtype) out.subtype = b.subtype;
    if (b.label) out.label = b.label;
    if (b.w) out.w = b.w;
    if (b.sectionName) out.sectionName = b.sectionName;
    if (b.collapsed) out.collapsed = b.collapsed;
    if (b.sectionColor) out.sectionColor = b.sectionColor;
    if (b.parentSectionId) out.parentSectionId = b.parentSectionId;
    if (b.h) out.h = b.h;
    if (b.lineSpacing && b.lineSpacing !== 1) out.lineSpacing = b.lineSpacing;
    // Saved for every block, INCLUDING a pack block whose content is withheld below. These are the
    // user's own entries, not the template, so writing them breaks no invariant — and it is the
    // whole reason a licensed template is usable at all.
    if (b.inputs && Object.keys(b.inputs).length) out.inputs = b.inputs;

    if (b.packId && b.encIv && b.encContent) {
      // Purchased template block — always save the ciphertext, NEVER the plaintext
      out.packId = b.packId;
      if (b.packAuthorId) out.packAuthorId = b.packAuthorId;
      out.encrypted = true;
      out.encIv = b.encIv;
      out.encContent = b.encContent;
      // content intentionally omitted
    } else {
      if (b.content) out.content = b.content;
    }

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
  // Saved so the choice survives a reload. It was previously not persisted at all, which is part
  // of why silently flipping it went unnoticed — there was nothing to compare against.
  out.page_numbering = pageNumberingEnabled;
  return JSON.stringify(out, null, 2);
}

export async function saveProject(saveAs = false) {
  // deno-lint-ignore no-explicit-any
  const hasPicker = typeof (globalThis as any).showSaveFilePicker === 'function';
  if (hasPicker) {
    try {
      if (!fileHandle || saveAs) {
        setFileHandle(
          // deno-lint-ignore no-explicit-any
          await (globalThis as any).showSaveFilePicker({
            suggestedName: state.projectName.replace(/[^\w-]/g, '_') + PROJECT_EXT,
            types: PROJECT_PICKER_TYPES,
          }),
        );
      }
      const writable = await fileHandle.createWritable();
      await writable.write(serializeProject());
      await writable.close();
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      // Anything else — permission revoked, disk full, a failed write — falls through to the
      // download path below. That is a reasonable rescue, but it used to happen SILENTLY: the
      // user believed the .json on disk had been updated when it had not, and only a stray file
      // in Downloads said otherwise. Say what happened before doing something different.
      console.error('Save to the chosen file failed; falling back to a download.', e);
      setFileHandle(null); // the handle is no longer trustworthy — re-prompt next save
      alert(
        `Could not save to the file on disk: ${
          (e as Error).message || 'unknown error'
        }\n\nDownloading a copy instead — your work is in your Downloads folder, not the original file.`,
      );
    }
  }
  const blob = new Blob([serializeProject()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = state.projectName.replace(/[^\w-]/g, '_') + PROJECT_EXT;
  a.click();
  URL.revokeObjectURL(url);
}
