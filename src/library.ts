// ---------------------------------------------------------------------------
// The project library and the autosave net
// ---------------------------------------------------------------------------
// The app-side half of `project-store.ts`: when to write, what to show, and what to promise.
//
// ⚠️ **What this is allowed to claim.** The store lives in this browser's private storage for
// this origin, on this device — see the header of `project-store.ts`. Clearing site data takes
// it. So nothing here says "safe" or "backed up"; the sidebar says where it lives, and Export
// stays the durable copy.

import { libraryId, setLibraryId, state } from './state.ts';
import {
  clearAutosave,
  deleteProject,
  listProjects,
  newProjectId,
  readAutosave,
  readProject,
  requestPersistence,
  storeAvailable,
  StoredProject,
  writeAutosave,
  writeProject,
} from './project-store.ts';
import {
  loadProject,
  markProjectSaved,
  parseProjectJson,
  serializeProject,
} from './persistence.ts';
import { showToast } from './utils/toast.ts';

/** How often the autosave slot is refreshed while work is going on. */
const AUTOSAVE_MS = 15_000;

/**
 * The last text written to the autosave slot.
 *
 * Compared against a fresh `serializeProject()` so an idle sheet writes nothing. This is the same
 * derive-don't-flag approach `projectFingerprint()` uses, and for the same reason: there are
 * dozens of mutation sites and a `markDirty()` missing from one of them is invisible.
 */
let lastAutosaved = '';

export function startAutosave(): void {
  if (!storeAvailable()) return;
  // Asked for once, at the point the store first matters. Refusal is normal and ignored.
  void requestPersistence();
  setInterval(() => {
    let json: string;
    try {
      json = serializeProject();
    } catch {
      return; // a sheet mid-edit that will not serialize is not worth reporting every 15s
    }
    if (json === lastAutosaved) return;
    lastAutosaved = json;
    void writeAutosave(state.projectName, json);
  }, AUTOSAVE_MS);
}

/**
 * Offer to bring back work from the autosave slot, if there is any.
 *
 * ⚠️ Only offered when the sheet now open is **empty**. Restoring over a project the user has
 * already opened would destroy the thing they came back for, and "there is newer work elsewhere"
 * is not a judgement a startup path should be making on its own.
 */
export async function offerAutosaveRestore(): Promise<void> {
  const slot = await readAutosave();
  if (!slot || !slot.json) return;
  if (state.blocks.length > 0) return;

  const when = new Date(slot.updatedAt).toLocaleString();
  const ok = confirm(
    `LeptonPad has unsaved work from ${when}:\n\n    ${slot.name}\n\n` +
      `Restore it?\n\nChoosing Cancel discards it.`,
  );
  if (!ok) {
    await clearAutosave();
    return;
  }
  try {
    loadProject(parseProjectJson(slot.json));
    markProjectSaved();
    lastAutosaved = slot.json;
    showToast(`Restored ${slot.name}`);
  } catch {
    alert('That autosaved work could not be read, so it has been left in place untouched.');
  }
}

/**
 * Save the open project into the library, replacing its own entry when it has one.
 *
 * The id is held in module state rather than in the file — see `setLibraryId`. A project opened
 * from the library keeps its id, so this overwrites; a project opened from a file does not, so
 * the first save adds an entry and later ones replace it.
 */
export async function saveToLibrary(): Promise<void> {
  if (!storeAvailable()) {
    alert(
      'This browser has no storage available for the library.\n\n' +
        'Use Save to write the project to a file instead.',
    );
    return;
  }
  const id = libraryId ?? newProjectId();
  try {
    const json = serializeProject();
    await writeProject(id, state.projectName, json);
    setLibraryId(id);
    markProjectSaved();
    lastAutosaved = json;
    showToast(`Kept ${state.projectName} in this browser`);
    await refreshLibraryList();
  } catch (e) {
    alert(`Could not keep the project: ${(e as Error).message || 'unknown error'}`);
  }
}

async function openFromLibrary(rec: StoredProject): Promise<void> {
  const fresh = await readProject(rec.id);
  if (!fresh) {
    showToast('That project is no longer in the library');
    await refreshLibraryList();
    return;
  }
  try {
    loadProject(parseProjectJson(fresh.json));
    setLibraryId(fresh.id);
    markProjectSaved();
    lastAutosaved = fresh.json;
    showToast(`Opened ${fresh.name}`);
  } catch {
    alert('That project could not be read.');
  }
}

// ── The sidebar list ───────────────────────────────────────────────────────

let listEl: HTMLElement | null = null;

/** Build the library section. Returns null when the browser has no storage to list. */
export function buildLibrarySection(container: HTMLElement): void {
  if (!storeAvailable()) return;

  const heading = document.createElement('h2');
  heading.textContent = 'In this browser';
  container.appendChild(heading);

  const keepBtn = document.createElement('button');
  keepBtn.className = 'view-toggle';
  keepBtn.textContent = 'Keep in browser';
  keepBtn.title = 'Store this project inside LeptonPad on this device, replacing its earlier copy';
  keepBtn.addEventListener('click', () => void saveToLibrary());
  container.appendChild(keepBtn);

  listEl = document.createElement('div');
  listEl.id = 'library-list';
  container.appendChild(listEl);

  // ⚠️ Said plainly, every time. A user who believes this is a backup will eventually clear
  // their browsing data and lose a project — and the browsers that most need this store are the
  // ones whose whole pitch is burning site data.
  const note = document.createElement('div');
  note.className = 'library-note';
  note.textContent =
    'Stored on this device only. Clearing browser data erases it — use Save for a file you keep.';
  container.appendChild(note);

  void refreshLibraryList();
}

export async function refreshLibraryList(): Promise<void> {
  if (!listEl) return;
  const items = await listProjects();
  listEl.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'library-empty';
    empty.textContent = 'Nothing kept yet.';
    listEl.appendChild(empty);
    return;
  }

  for (const rec of items) {
    const row = document.createElement('div');
    row.className = 'library-row';
    if (rec.id === libraryId) row.classList.add('current');

    const open = document.createElement('button');
    open.className = 'library-open';
    open.textContent = rec.name || 'Untitled Project';
    open.title = `Opened last ${new Date(rec.updatedAt).toLocaleString()}`;
    open.addEventListener('click', () => void openFromLibrary(rec));

    const del = document.createElement('button');
    del.className = 'library-del';
    del.textContent = '×';
    del.title = `Remove ${rec.name} from this browser`;
    del.setAttribute('aria-label', del.title);
    del.addEventListener('click', async () => {
      if (
        !confirm(`Remove "${rec.name}" from this browser?\n\nAny file you exported is untouched.`)
      ) {
        return;
      }
      await deleteProject(rec.id);
      if (libraryId === rec.id) setLibraryId(null);
      await refreshLibraryList();
    });

    row.append(open, del);
    listEl.appendChild(row);
  }
}

/**
 * Called after New Project so the open sheet stops claiming a library entry.
 *
 * Without it the next "Keep in browser" would overwrite the project the user had just closed —
 * the same trap `setFileHandle(null)` exists to avoid on the file system side.
 */
export function detachFromLibrary(): void {
  setLibraryId(null);
  lastAutosaved = '';
  void refreshLibraryList();
}
