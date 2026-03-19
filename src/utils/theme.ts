// ---------------------------------------------------------------------------
// Theme detection utility
// ---------------------------------------------------------------------------

/** Returns true when the OS/browser prefers dark color scheme. */
export function isDark(): boolean {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
}
