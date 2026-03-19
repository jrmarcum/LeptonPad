// ---------------------------------------------------------------------------
// Markdown text block — editable view/edit with toolbar and right-edge resize
// ---------------------------------------------------------------------------

import { type Block, GRID_SIZE } from '../types.ts';
import { CANVAS_W, margins } from '../state.ts';
import { renderMarkdown } from '../utils/markdown.ts';

export function buildTextBlock(el: HTMLElement, block: Block) {
  el.classList.add('text-block');

  const DEFAULT_W = 240;
  el.style.width = `${block.w ?? DEFAULT_W}px`;

  const viewDiv = document.createElement('div');
  viewDiv.className = 'md-view';

  // ── Toolbar ──────────────────────────────────────────────────────────────
  const toolbar = document.createElement('div');
  toolbar.className = 'md-toolbar';
  toolbar.style.display = 'none';

  const editArea = document.createElement('textarea');
  editArea.className = 'md-edit';
  editArea.placeholder = 'Markdown text…\n\n# Heading\n**bold**  *italic*  `code`\n- list item\n  - sub-item\n- [ ] task\n> blockquote\n[link](url)  ![alt](url)\n$a = x^2$\n$$E = mc^2$$';
  editArea.spellcheck = true;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function syncHeight() {
    editArea.style.height = 'auto';
    const snapH = (v: number) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(editArea.scrollHeight, 60))}px`;
  }

  function saveContent() {
    block.content = editArea.value;
  }

  /** Insert text at cursor, replacing any selection. */
  function insertAt(text: string, cursorOffset?: number) {
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    editArea.setRangeText(text, start, end, 'end');
    if (cursorOffset !== undefined) {
      const pos = start + cursorOffset;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
  }

  /** Wrap the current selection with prefix/suffix, or insert prefix+suffix with cursor inside. */
  function wrapSelection(prefix: string, suffix: string = prefix) {
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const selected = editArea.value.slice(start, end);
    const newText = prefix + selected + suffix;
    editArea.setRangeText(newText, start, end, 'end');
    if (!selected) {
      // Place cursor between prefix and suffix
      const pos = start + prefix.length;
      editArea.setSelectionRange(pos, pos);
    }
    saveContent();
    syncHeight();
    editArea.focus();
  }

  /** Prefix every selected line (or current line if no selection) with a string.
   *  Cursor is placed right after the prefix on the first affected line. */
  function prefixLines(prefix: string) {
    const val = editArea.value;
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const rawEnd = val.indexOf('\n', end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split('\n');
    const newText = lines.map(l => prefix + l).join('\n');
    editArea.setRangeText(newText, lineStart, lineEnd, 'end');
    // Place cursor right after the prefix on the first line
    const cursorPos = lineStart + prefix.length;
    editArea.setSelectionRange(cursorPos, cursorPos);
    saveContent();
    syncHeight();
    editArea.focus();
  }

  /** Remove up to `n` leading spaces from each selected line (for dedent). */
  function dedentLines(n: number) {
    const val = editArea.value;
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const rawEnd = val.indexOf('\n', end);
    const lineEnd = rawEnd === -1 ? val.length : rawEnd;
    const lines = val.slice(lineStart, lineEnd).split('\n');
    const newText = lines.map(l => l.replace(new RegExp(`^ {1,${n}}`), '')).join('\n');
    editArea.setRangeText(newText, lineStart, lineEnd, 'preserve');
    saveContent();
    syncHeight();
    editArea.focus();
  }

  function promptLink() {
    const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
    const url = window.prompt('URL:', 'https://');
    if (url == null) { editArea.focus(); return; }
    const label = sel || window.prompt('Link text:', 'link') || 'link';
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `[${label}](${url})`;
    editArea.setRangeText(md, start, end, 'end');
    saveContent();
    syncHeight();
    editArea.focus();
  }

  function promptImage() {
    const url = window.prompt('Image URL:', 'https://');
    if (url == null) { editArea.focus(); return; }
    const alt = window.prompt('Alt text:', '') || '';
    const start = editArea.selectionStart;
    const end = editArea.selectionEnd;
    const md = `![${alt}](${url})`;
    editArea.setRangeText(md, start, end, 'end');
    saveContent();
    syncHeight();
    editArea.focus();
  }

  // ── Toolbar buttons ───────────────────────────────────────────────────────

  type BtnDef = { label: string; title: string; action: () => void } | 'sep';

  const buttons: BtnDef[] = [
    { label: 'B',   title: 'Bold',          action: () => wrapSelection('**') },
    { label: 'I',   title: 'Italic',        action: () => wrapSelection('*') },
    { label: '`',   title: 'Inline code',   action: () => wrapSelection('`') },
    'sep',
    { label: 'H1',  title: 'Heading 1',     action: () => prefixLines('# ') },
    { label: 'H2',  title: 'Heading 2',     action: () => prefixLines('## ') },
    'sep',
    { label: '•',   title: 'Bullet list',   action: () => prefixLines('- ') },
    { label: '1.',  title: 'Numbered list', action: () => prefixLines('1. ') },
    { label: '☑',   title: 'Task list',     action: () => prefixLines('- [ ] ') },
    'sep',
    { label: '❝',   title: 'Blockquote',    action: () => prefixLines('> ') },
    'sep',
    { label: '🔗',  title: 'Insert link',   action: promptLink },
    { label: 'img', title: 'Insert image',  action: promptImage },
    'sep',
    { label: '$',   title: 'Inline math',   action: () => wrapSelection('$') },
    { label: '$$',  title: 'Block math',    action: () => {
      const sel = editArea.value.slice(editArea.selectionStart, editArea.selectionEnd);
      if (sel) {
        wrapSelection('$$\n', '\n$$');
      } else {
        const start = editArea.selectionStart;
        const ins = '$$\n\n$$';
        editArea.setRangeText(ins, start, start, 'end');
        // Place cursor on the blank line between the $$
        const pos = start + 3;
        editArea.setSelectionRange(pos, pos);
        saveContent();
        syncHeight();
        editArea.focus();
      }
    }},
  ];

  for (const def of buttons) {
    if (def === 'sep') {
      const sep = document.createElement('span');
      sep.className = 'tb-sep';
      toolbar.appendChild(sep);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = def.label;
      btn.title = def.title;
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // keep focus in textarea
        def.action();
      });
      toolbar.appendChild(btn);
    }
  }

  // ── Show / hide ───────────────────────────────────────────────────────────

  function showView() {
    const html = renderMarkdown(block.content || '');
    viewDiv.innerHTML = html || '<span class="md-placeholder">Click to add text…</span>';
    viewDiv.style.display = '';
    editArea.style.display = 'none';
    toolbar.style.display = 'none';

    // Wire task-list checkboxes: clicking toggles [ ]/[x] in the source and re-renders.
    // Must stop propagation on 'click' to prevent viewDiv's click → enterEdit() from firing.
    viewDiv.querySelectorAll<HTMLInputElement>('input[data-task-line]').forEach(cb => {
      cb.addEventListener('click', (e) => e.stopPropagation());
      cb.addEventListener('change', () => {
        const idx = parseInt(cb.dataset.taskLine!);
        const srcLines = (block.content || '').split('\n');
        if (idx < srcLines.length) {
          srcLines[idx] = cb.checked
            ? srcLines[idx].replace(/\[ \]/, '[x]')
            : srcLines[idx].replace(/\[x\]/i, '[ ]');
          block.content = srcLines.join('\n');
          showView();
        }
      });
    });
  }

  function enterEdit() {
    const h = viewDiv.offsetHeight;
    editArea.value = block.content || '';
    editArea.style.display = 'block';
    toolbar.style.display = 'flex';
    viewDiv.style.display = 'none';
    const snapH = (v: number) => Math.ceil(v / GRID_SIZE) * GRID_SIZE;
    editArea.style.height = `${snapH(Math.max(h, 60))}px`;
    if (editArea.scrollHeight > h) editArea.style.height = `${snapH(editArea.scrollHeight)}px`;
    editArea.focus();
  }

  // ── Event listeners ───────────────────────────────────────────────────────

  editArea.addEventListener('input', () => {
    saveContent();
    syncHeight();
  });

  editArea.addEventListener('blur', () => { saveContent(); showView(); });

  editArea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || (e.key === 'Enter' && e.altKey)) {
      e.preventDefault();
      editArea.blur();
      return;
    }

    // Enter: continue list format on the next line
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
      const val = editArea.value;
      const start = editArea.selectionStart;
      const end = editArea.selectionEnd;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineRawEnd = val.indexOf('\n', start);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);

      const nextLetter = (c: string) =>
        c === 'z' ? 'a' : c === 'Z' ? 'A' : String.fromCharCode(c.charCodeAt(0) + 1);

      // Detect list format — task first, then bullet, numbered, lettered
      let newPrefix: string | null = null;
      let prefixLen = 0;

      const taskM = lineText.match(/^(\s*)([-*+])\s+\[[ xX]\]\s*/);
      if (taskM) {
        newPrefix = `${taskM[1]}${taskM[2]} [ ] `;
        prefixLen = taskM[0].length;
      }
      if (!newPrefix) {
        const bulletM = lineText.match(/^(\s*)([-*+])\s+/);
        if (bulletM) { newPrefix = `${bulletM[1]}${bulletM[2]} `; prefixLen = bulletM[0].length; }
      }
      if (!newPrefix) {
        const numM = lineText.match(/^(\s*)(\d+)\.\s+/);
        if (numM) { newPrefix = `${numM[1]}${parseInt(numM[2]) + 1}. `; prefixLen = numM[0].length; }
      }
      if (!newPrefix) {
        const letM = lineText.match(/^(\s*)([a-zA-Z])\.\s+/);
        if (letM) { newPrefix = `${letM[1]}${nextLetter(letM[2])}. `; prefixLen = letM[0].length; }
      }

      if (newPrefix !== null) {
        e.preventDefault();
        const hasContent = val.slice(lineStart + prefixLen, lineEnd).trim().length > 0;
        if (!hasContent) {
          // Empty list item — exit the list: clear prefix, leave blank line
          editArea.setRangeText('', lineStart, lineEnd, 'end');
          editArea.setSelectionRange(lineStart, lineStart);
        } else {
          // Insert newline + continuation prefix at cursor
          editArea.setRangeText('\n' + newPrefix, start, end, 'end');
        }
        saveContent();
        syncHeight();
      }
    }

    // Tab: indent/dedent list items, or insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = editArea.value;
      const start = editArea.selectionStart;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineRawEnd = val.indexOf('\n', start);
      const lineEnd = lineRawEnd === -1 ? val.length : lineRawEnd;
      const lineText = val.slice(lineStart, lineEnd);
      const isList = /^\s*([-*+]|\d+\.|[a-zA-Z]\.)\s/.test(lineText);

      if (isList) {
        // Parse: existing-indent  marker  space  optional-task  content
        const m = lineText.match(/^(\s*)([-*+]|\d+\.|[a-zA-Z]\.)\s+(\[[ xX]\]\s+)?(.*)/);
        if (m) {
          const [, curIndent, marker, taskPart = '', content] = m;

          // Determine new indent and new marker based on direction
          let newIndent: string;
          let newMarker: string;

          if (!e.shiftKey) {
            // Indent: add 2 spaces and switch numbered↔lettered
            newIndent = curIndent + '  ';
            if (/^\d+\.$/.test(marker))        newMarker = 'a.'; // numbered → lettered
            else if (/^[a-zA-Z]\.$/.test(marker)) newMarker = '1.'; // lettered → numbered
            else                                newMarker = marker; // bullet unchanged
          } else {
            // Dedent: remove 2 spaces and reverse the switch
            if (curIndent.length < 2) return; // already at root
            newIndent = curIndent.slice(2);
            if (/^[a-zA-Z]\.$/.test(marker))  newMarker = '1.'; // lettered → numbered
            else if (/^\d+\.$/.test(marker))   newMarker = 'a.'; // numbered → lettered
            else                               newMarker = marker; // bullet unchanged
          }

          const newLine = `${newIndent}${newMarker} ${taskPart}${content}`;
          editArea.setRangeText(newLine, lineStart, lineEnd, 'end');
          // Cursor after the new prefix (indent + marker + space + task bracket)
          const newPos = lineStart + newIndent.length + newMarker.length + 1 + taskPart.length;
          editArea.setSelectionRange(newPos, newPos);
          saveContent();
          syncHeight();
          editArea.focus();
        }
      } else {
        // Insert 2 spaces at cursor (replace selection if any)
        editArea.setRangeText('  ', start, editArea.selectionEnd, 'end');
        saveContent();
        syncHeight();
      }
    }
  });

  // ── Right-edge resize handle ──────────────────────────────────────────────
  const handle = document.createElement('div');
  handle.className = 'text-resize-handle';
  handle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = el.offsetWidth;
    const blockLeft = parseInt(el.style.left);
    const maxW = CANVAS_W - margins.right - blockLeft;
    function onMove(ev: MouseEvent) {
      const newW = Math.min(Math.max(DEFAULT_W, startW + (ev.clientX - startX)), maxW);
      el.style.width = `${newW}px`;
      block.w = newW;
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'ew-resize';
  });

  // Prevent mousedown on content from starting a block drag
  viewDiv.addEventListener('mousedown', (e) => e.stopPropagation());
  editArea.addEventListener('mousedown', (e) => e.stopPropagation());
  toolbar.addEventListener('mousedown', (e) => e.stopPropagation());
  viewDiv.addEventListener('click', enterEdit);

  el.appendChild(toolbar);
  el.appendChild(viewDiv);
  el.appendChild(editArea);
  el.appendChild(handle);
  showView();
}
