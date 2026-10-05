// ---------------------------------------------------------------------------
// The in-app project store — IndexedDB
// ---------------------------------------------------------------------------
// Built because **no Android browser implements the File System Access API**, so on a phone
// nothing can write back over the file that was opened: every save is a new copy, and in
// locked-down browsers (Norton, DuckDuckGo) the file picker and share sheet may be refused
// outright, leaving no way to save or reopen at all (Jon, 2026-10-05).
//
// Storing inside the origin needs no picker, no download and no share target, so it works where
// those do not — and it gives the overwrite semantics the file system cannot.
//
// ⚠️ **WHERE THIS LIVES, and why it is not an archive.** The browser's private storage for
// leptonpad.com, on that one device. Not a server, not the user's Files app, not synced. It is
// per-browser as well as per-device, so Chrome's library and DuckDuckGo's library are different
// libraries. And it can be **wiped**: "clear browsing data" takes it, DuckDuckGo's fire button is
// exactly that, and iOS evicts storage for sites unvisited for 7 days unless the PWA is installed
// to the home screen. The browsers most likely to need this store are the ones most likely to
// burn it.
//
// 🔑 **So this is a working store and a crash net. Export to a file is the durable copy**, and
// every piece of UI around this has to say so rather than implying a safety it cannot provide.
//
// IndexedDB rather than OPFS: a project is JSON text of modest size, IDB is supported everywhere
// including the older WebViews these browsers are built on, and OPFS buys nothing at this size.

const DB_NAME = 'leptonpad';
const DB_VERSION = 1;
/** Named projects the user chose to keep. */
const STORE_PROJECTS = 'projects';
/** The single rolling autosave slot — the crash net, independent of the library. */
const STORE_AUTOSAVE = 'autosave';
const AUTOSAVE_KEY = 'current';

export interface StoredProject {
  id: string;
  name: string;
  /** The same text `serializeProject()` writes to a file. */
  json: string;
  updatedAt: number;
}

export interface AutosaveSlot {
  name: string;
  json: string;
  updatedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Whether the store can be used at all.
 *
 * ⚠️ `indexedDB` is not merely absent in some contexts — **accessing it throws** where site data
 * is blocked, the same trap `auth.ts` documents for `localStorage`. Every entry point here is
 * guarded, and every failure degrades to "no store" rather than to an exception, because none of
 * this is allowed to stop a sheet from opening.
 */
export function storeAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (e) {
      reject(e);
      return;
    }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUTOSAVE)) {
        db.createObjectStore(STORE_AUTOSAVE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    // Private mode in some browsers never settles either handler. Without this the first await
    // would hang forever and the caller would never fall back.
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
  return dbPromise;
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then((db) =>
    new Promise<T>((resolve, reject) => {
      const t = db.transaction(store, mode);
      const req = run(t.objectStore(store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      t.onabort = () => reject(t.error);
    })
  );
}

/**
 * Ask the browser to exempt this origin from eviction under storage pressure.
 *
 * Granted on engagement or installation rather than on asking, and refusing is normal — so the
 * result is reported, never relied on. It does **not** protect against the user clearing site
 * data, which is the likelier way this store is lost.
 */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

// ── The autosave slot ──────────────────────────────────────────────────────

export async function writeAutosave(name: string, json: string): Promise<void> {
  if (!storeAvailable()) return;
  try {
    const slot: AutosaveSlot = { name, json, updatedAt: Date.now() };
    await tx(STORE_AUTOSAVE, 'readwrite', (s) => s.put(slot, AUTOSAVE_KEY));
  } catch { /* a failed autosave must never surface as an error mid-edit */ }
}

export async function readAutosave(): Promise<AutosaveSlot | null> {
  if (!storeAvailable()) return null;
  try {
    return (await tx<AutosaveSlot | undefined>(
      STORE_AUTOSAVE,
      'readonly',
      (s) => s.get(AUTOSAVE_KEY),
    )) ?? null;
  } catch {
    return null;
  }
}

export async function clearAutosave(): Promise<void> {
  if (!storeAvailable()) return;
  try {
    await tx(STORE_AUTOSAVE, 'readwrite', (s) => s.delete(AUTOSAVE_KEY));
  } catch { /* nothing to recover from */ }
}

// ── The named library ──────────────────────────────────────────────────────

export async function listProjects(): Promise<StoredProject[]> {
  if (!storeAvailable()) return [];
  try {
    const all = await tx<StoredProject[]>(STORE_PROJECTS, 'readonly', (s) => s.getAll());
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function readProject(id: string): Promise<StoredProject | null> {
  if (!storeAvailable()) return null;
  try {
    return (await tx<StoredProject | undefined>(STORE_PROJECTS, 'readonly', (s) => s.get(id))) ??
      null;
  } catch {
    return null;
  }
}

/**
 * Write a project into the library, replacing the entry with the same id.
 *
 * 🔑 **The id is the overwrite.** Keeping it on the open project is what makes a second save
 * replace the first rather than add a copy — the whole point of the store, and the thing the
 * file system cannot do on a phone.
 *
 * Throws on failure rather than swallowing it, unlike the autosave: this one the user asked for
 * and must be told about.
 */
export async function writeProject(id: string, name: string, json: string): Promise<void> {
  if (!storeAvailable()) throw new Error('This browser has no storage available for the library.');
  const rec: StoredProject = { id, name, json, updatedAt: Date.now() };
  await tx(STORE_PROJECTS, 'readwrite', (s) => s.put(rec));
}

export async function deleteProject(id: string): Promise<void> {
  if (!storeAvailable()) return;
  await tx(STORE_PROJECTS, 'readwrite', (s) => s.delete(id));
}

/** A short, stable id for a new library entry. */
export function newProjectId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
