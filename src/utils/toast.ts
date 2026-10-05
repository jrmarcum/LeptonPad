// ---------------------------------------------------------------------------
// Transient confirmation messages
// ---------------------------------------------------------------------------
// Built because a save on a phone is otherwise SILENT (Jon, 2026-10-05: "I can't tell if it is
// actually doing either"). On a desktop the browser shows a download shelf and the file picker
// closes, so the save announces itself; on Android and iOS the file goes away into a share sheet
// or a Downloads folder with no visible trace, and the user is left guessing.
//
// Deliberately NOT `alert()`: a modal for a routine success would have to be dismissed on every
// save, and the thing being confirmed is not worth a tap.
//
// This module imports nothing. That is what lets `persistence.ts` call it without the callback
// slot every other cross-module call in this app needs.

let host: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

/** Show a short confirmation. A second call replaces the first rather than queueing behind it. */
export function showToast(message: string, ms = 2600): void {
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast';
    host.setAttribute('role', 'status');
    // Announced politely: a save confirmation should not interrupt a screen reader mid-sentence.
    host.setAttribute('aria-live', 'polite');
    document.body.appendChild(host);
  }
  host.textContent = message;
  host.classList.add('visible');
  if (hideTimer !== null) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    host?.classList.remove('visible');
    hideTimer = null;
  }, ms);
}
