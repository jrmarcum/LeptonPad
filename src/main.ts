import init, { rect_area, rect_ix, solve_beam_deflection } from 'solver';
import { initAuth, login, logout, signup, currentUser, currentRole, roleLabel, onAuthChange, canCreateSection } from './auth.ts';
import { showRedeemCodeDialog, accessSummary } from './license.ts';
import { evalExpr, evalFormulaRows, formatUnit, type Scope, type FnScope, type FormulaRow } from './expr.ts';
import { type PlotConfig, type FigureData, type PageSizeKey, DEFAULT_PLOT, GRID_SIZE, PX_PER_IN, PX_PER_MM, PAGE_SIZES } from './types.ts';
import { mmToPx, inToPx, pxToMm, pxToIn, pxToUnit, unitToPx, clamp } from './utils/units.ts';
import { isDark } from './utils/theme.ts';
import { transformPiece, prettifyExpr, renderInlineMd, renderMarkdown } from './utils/markdown.ts';
import { buildSectPropBlock } from './blocks/sect-prop.ts';
import { buildBeamDefBlock } from './blocks/beam-def.ts';
import { buildFigureBlock, nextFigureNum } from './blocks/figure.ts';
import { buildFormulaBlock, reEvalAllFormulas, fmtNum, applyEvalResults, parseFormulaRows, expandDotNotation } from './blocks/formula.ts';
import { buildTextBlock } from './blocks/text.ts';
import { buildPlotBlock } from './blocks/plot.ts';
import { buildSectionBlock, refreshAllSectionHeights, refreshSectionHeight, updateSectionSummary, reparentToSection, unparentFromSection, sectionAtPoint, nextSectionName, nextSectionColor } from './blocks/pro/section.ts';
import { Canvas } from './canvas.ts';
import { showCursor, hideCursor, selectBlock, addToSelection, clearSelection, deleteBlock, shiftBlocksVertical, syncPageSeparators, syncTitleBlocks, updatePageCount, buildTitleBlockOverlay, placeBlock, blocksOverlap, resolveOverlapsRight, blockAtCursor, moveGridCursor, renderBlock, dropBlock } from './dnd.ts';
import { showImportToolsDialog, importToolsFromFile, showSavePromptDialog, clearProjectState, newProject, newFromTemplate, loadProject, serializeProject, saveProject } from './persistence.ts';
import {
  type Block, type WorkspaceState, type CustomModule, type TitleBlockData,
  type CanvasLike,
  CANVAS_W, PAGE_H, numPages, CANVAS_H, marginUnit, margins, titleBlockEnabled, pageNumberingEnabled,
  setCANVAS_W, setPAGE_H, setNumPages, setCANVAS_H, setMarginUnit, setTitleBlockEnabled, setPageNumberingEnabled,
  state, globalScope, globalFnScope,
  sectionSummaryVarNames, sectionSummaryComparisons, childToSection,
  deletionStack,
  CUSTOM_MODULES_KEY, customModules, saveCustomModules, setCustomModules,
  fileHandle, setFileHandle,
  canvas, setCanvas,
  selectedEl, setSelectedEl, selectedEls,
  multiDragState, setMultiDragState,
  bandState, setBandState,
  skipNextCanvasClick, setSkipNextCanvasClick,
  bandEl, setBandEl,
  gridCursor,
  setOnSectionSummaryUpdate, setOnRefreshAllSectionHeights,
  setOnSelectBlock, setOnMoveGridCursor,
  setOnUpdatePageCount, setOnSyncPageSeparators, setOnClearSelection,
  setOnAddToSelection, setOnRefreshCustomModulesList, setOnAppendCustomModuleToSidebar,
  setOnAuthStateChange,
  titleBlockH, TITLE_BLOCK_H,
} from './state.ts';


// --- Sidebar ---

const MODULES: {
  id: string;
  name: string;
  icon: string;
  type: Block['type'];
  sectionOnly?: boolean;
  requiresPro?: boolean;  // section creation is a pro+ feature
}[] = [
  { id: 'formula',    name: 'Formula Block',      icon: '\u03a3',        type: 'formula'              },
  { id: 'summary',    name: 'Summary Block',      icon: '\u03a3\u0332',  type: 'summary', sectionOnly: true },
  { id: 'section',    name: 'Section',            icon: '\u29c5',        type: 'section', requiresPro: true },
  { id: 'beam-def',   name: 'Beam Deflection',    icon: '\u{1F4CF}',     type: 'math'                 },
  { id: 'sect-prop',  name: 'Section Properties', icon: '\u{1F3D7}',     type: 'math'                 },
  { id: 'plot',       name: 'Plot',               icon: '\u{1F4C8}',     type: 'plot'                 },
  { id: 'figure',     name: 'Figure',             icon: '\u{1F5BC}',     type: 'figure'               },
  { id: 'text',       name: 'Text Block',         icon: '\u{1F4DD}',     type: 'text'                 },
];

function renderCustomModuleItem(mod: CustomModule): HTMLElement {
  const item = document.createElement('div');
  item.className = 'module-item custom';
  item.draggable = true;
  item.dataset.moduleType = 'formula';
  item.dataset.moduleId = mod.id;

  const iconEl = document.createElement('span');
  iconEl.textContent = mod.blocks ? '⊞' : 'Σ';
  if (mod.blocks) item.title = `${mod.blocks.length} block group`;

  const nameEl = document.createElement('span');
  nameEl.textContent = mod.name;
  nameEl.style.flex = '1';

  const delBtn = document.createElement('button');
  delBtn.className = 'mod-delete';
  delBtn.title = 'Remove from toolbar';
  delBtn.textContent = '×';
  delBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setCustomModules(customModules.filter((m) => m.id !== mod.id));
    saveCustomModules();
    item.remove();
  });

  item.appendChild(iconEl);
  item.appendChild(nameEl);
  item.appendChild(delBtn);
  return item;
}

// ---------------------------------------------------------------------------
// Auth / login UI
// ---------------------------------------------------------------------------

/** Show a login/signup modal. Resolves when the user dismisses it. */
function showLoginModal(): Promise<void> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'import-modal-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'import-modal';
    dialog.style.maxWidth = '340px';

    const title = document.createElement('h3');
    title.textContent = 'Sign in to LeptonPad';
    dialog.appendChild(title);

    // Mode toggle
    let isSignup = false;

    const modeNote = document.createElement('p');
    modeNote.style.cssText = 'font-size:0.8rem;margin:0 0 0.5rem;color:var(--muted,#888);';
    modeNote.textContent = 'Pro and purchased template packs require an account.';
    dialog.appendChild(modeNote);

    const mkInput = (type: string, placeholder: string) => {
      const inp = document.createElement('input');
      inp.type        = type;
      inp.placeholder = placeholder;
      inp.style.cssText = 'width:100%;margin:0.3rem 0;padding:0.45rem 0.6rem;' +
                          'font-size:0.95rem;border:1px solid var(--border);' +
                          'border-radius:4px;background:var(--bg-input,#fff);color:var(--text);box-sizing:border-box;';
      return inp;
    };

    const emailInp = mkInput('email', 'Email address');
    const passInp  = mkInput('password', 'Password');
    dialog.appendChild(emailInp);
    dialog.appendChild(passInp);

    const errorEl = document.createElement('p');
    errorEl.style.cssText = 'color:#e55;font-size:0.8rem;min-height:1rem;margin:0.2rem 0;';
    dialog.appendChild(errorEl);

    const successEl = document.createElement('p');
    successEl.style.cssText = 'color:#3a3;font-size:0.8rem;min-height:1rem;margin:0.2rem 0;display:none;';
    dialog.appendChild(successEl);

    const btns = document.createElement('div');
    btns.className = 'import-modal-btns';
    btns.style.flexDirection = 'column';
    btns.style.gap = '0.4rem';

    const submitBtn = document.createElement('button');
    submitBtn.className   = 'import-confirm-btn';
    submitBtn.textContent = 'Sign In';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Create account instead';
    toggleBtn.style.cssText = 'background:none;border:none;color:var(--link,#4a9);cursor:pointer;font-size:0.85rem;padding:0;';
    toggleBtn.addEventListener('click', () => {
      isSignup = !isSignup;
      submitBtn.textContent  = isSignup ? 'Create Account' : 'Sign In';
      title.textContent      = isSignup ? 'Create LeptonPad Account' : 'Sign in to LeptonPad';
      toggleBtn.textContent  = isSignup ? 'Back to sign in' : 'Create account instead';
      errorEl.textContent    = '';
      successEl.style.display = 'none';
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(); });

    submitBtn.addEventListener('click', async () => {
      const email    = emailInp.value.trim();
      const password = passInp.value;
      errorEl.textContent = '';
      successEl.style.display = 'none';

      if (!email || !password) {
        errorEl.textContent = 'Email and password are required.';
        return;
      }

      submitBtn.disabled    = true;
      submitBtn.textContent = isSignup ? 'Creating…' : 'Signing in…';

      const fn = isSignup ? signup : login;
      const { error } = await fn(email, password);

      if (error) {
        errorEl.textContent   = error;
        submitBtn.disabled    = false;
        submitBtn.textContent = isSignup ? 'Create Account' : 'Sign In';
      } else if (isSignup) {
        successEl.textContent   = 'Account created — check your email to confirm, then sign in.';
        successEl.style.display = '';
        submitBtn.disabled      = false;
        submitBtn.textContent   = 'Create Account';
        isSignup = false;
        title.textContent     = 'Sign in to LeptonPad';
        submitBtn.textContent = 'Sign In';
        toggleBtn.textContent = 'Create account instead';
      } else {
        overlay.remove();
        resolve();
      }
    });

    btns.appendChild(submitBtn);
    btns.appendChild(toggleBtn);
    btns.appendChild(cancelBtn);
    dialog.appendChild(btns);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    [emailInp, passInp].forEach((inp) => inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  submitBtn.click();
      if (e.key === 'Escape') { overlay.remove(); resolve(); }
    }));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(); } });
    setTimeout(() => emailInp.focus(), 50);
  });
}

/**
 * Build (or rebuild) the auth panel at the top of the sidebar.
 * Called once at init and again whenever auth state changes.
 */
function renderAuthPanel(container: HTMLElement) {
  const existing = container.querySelector('.auth-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.className = 'auth-panel';
  panel.style.cssText = 'padding:0.4rem 0.5rem 0.5rem;border-bottom:1px solid var(--border);margin-bottom:0.4rem;';

  if (currentUser) {
    // Signed-in state
    const emailEl = document.createElement('div');
    emailEl.style.cssText = 'font-size:0.75rem;color:var(--muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    emailEl.textContent = currentUser.email ?? '';
    panel.appendChild(emailEl);

    const roleRow = document.createElement('div');
    roleRow.style.cssText = 'display:flex;align-items:center;gap:0.4rem;margin:0.25rem 0;';

    const roleBadge = document.createElement('span');
    const roleColors: Record<string, string> = {
      super: '#7c3aed', pro: '#0284c7', demo: '#d97706', free: '#6b7280',
    };
    roleBadge.style.cssText = `font-size:0.7rem;padding:0.1rem 0.4rem;border-radius:3px;` +
      `background:${roleColors[currentRole] ?? '#6b7280'};color:#fff;font-weight:600;`;
    roleBadge.textContent = roleLabel();
    roleRow.appendChild(roleBadge);

    const accessEl = document.createElement('span');
    accessEl.style.cssText = 'font-size:0.72rem;color:var(--muted,#888);';
    accessEl.textContent = accessSummary();
    roleRow.appendChild(accessEl);
    panel.appendChild(roleRow);

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:0.35rem;';

    const redeemBtn = document.createElement('button');
    redeemBtn.className   = 'view-toggle';
    redeemBtn.textContent = 'Redeem Code';
    redeemBtn.style.cssText = 'font-size:0.75rem;padding:0.2rem 0.5rem;flex:1;';
    redeemBtn.addEventListener('click', async () => {
      const result = await showRedeemCodeDialog();
      if (result?.success) {
        // Reload auth state so role/packs update immediately
        await initAuth();
        renderAuthPanel(container);
        _refreshProBadges(container);
        alert(result.message);
      }
    });

    const signOutBtn = document.createElement('button');
    signOutBtn.className   = 'view-toggle';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.style.cssText = 'font-size:0.75rem;padding:0.2rem 0.5rem;';
    signOutBtn.addEventListener('click', async () => {
      await logout();
      renderAuthPanel(container);
      _refreshProBadges(container);
    });

    btnRow.appendChild(redeemBtn);
    btnRow.appendChild(signOutBtn);
    panel.appendChild(btnRow);
  } else {
    // Signed-out state
    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'font-size:0.75rem;color:var(--muted,#888);margin-bottom:0.3rem;';
    msgEl.textContent = 'Sign in for Pro features and template packs.';
    panel.appendChild(msgEl);

    const signInBtn = document.createElement('button');
    signInBtn.className   = 'view-toggle';
    signInBtn.textContent = 'Sign In / Create Account';
    signInBtn.style.cssText = 'width:100%;font-size:0.8rem;';
    signInBtn.addEventListener('click', async () => {
      await showLoginModal();
      renderAuthPanel(container);
      _refreshProBadges(container);
    });
    panel.appendChild(signInBtn);
  }

  // Insert after license link, before the first h2
  const firstH2 = container.querySelector('h2');
  if (firstH2) {
    container.insertBefore(panel, firstH2);
  } else {
    container.appendChild(panel);
  }
}

/** Update the locked/unlocked appearance of module items that require pro. */
function _refreshProBadges(container: HTMLElement) {
  const locked = !canCreateSection();
  container.querySelectorAll<HTMLElement>('[data-requires-pro]').forEach((el) => {
    el.classList.toggle('module-locked', locked);
    const badge = el.querySelector<HTMLElement>('.module-pro-badge');
    if (badge) badge.style.display = locked ? '' : 'none';
  });
}

/** Show a non-blocking upgrade prompt when a locked feature is attempted. */
function _showProRequiredDialog() {
  const overlay = document.createElement('div');
  overlay.className = 'import-modal-overlay';
  const dialog = document.createElement('div');
  dialog.className = 'import-modal';
  dialog.style.maxWidth = '320px';

  const title = document.createElement('h3');
  title.textContent = 'Pro Feature';
  dialog.appendChild(title);

  const msg = document.createElement('p');
  msg.textContent = 'Creating Section blocks requires a Pro subscription or active Demo trial. ' +
    'Sign in and redeem a license code to unlock.';
  msg.style.fontSize = '0.9rem';
  dialog.appendChild(msg);

  const btns = document.createElement('div');
  btns.className = 'import-modal-btns';

  const closeBtn = document.createElement('button');
  closeBtn.className   = 'import-confirm-btn';
  closeBtn.textContent = 'OK';
  closeBtn.addEventListener('click', () => overlay.remove());
  btns.appendChild(closeBtn);

  dialog.appendChild(btns);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

function renderSidebar() {
  const container = document.getElementById('sidebar-left')!;

  const logoImg = document.createElement('img');
  logoImg.src = '/LeptonPadLogo.png';
  logoImg.alt = 'LeptonPad';
  logoImg.className = 'sidebar-logo';
  container.appendChild(logoImg);

  const licenseLink = document.createElement('a');
  licenseLink.href = 'https://github.com/jrmarcum/LeptonPad/blob/main/LICENSE';
  licenseLink.target = '_blank';
  licenseLink.rel = 'noopener noreferrer';
  licenseLink.textContent = '© 2026 LeptonPad — Proprietary License';
  licenseLink.className = 'sidebar-license';
  container.appendChild(licenseLink);

  // Auth panel (login status, redeem code, sign-out)
  renderAuthPanel(container);

  const posHeading = document.createElement('h2');
  posHeading.textContent = 'Cursor';
  container.appendChild(posHeading);
  const posDisplay = document.createElement('div');
  posDisplay.id = 'cursor-coords';
  posDisplay.textContent = 'x: — y: —';
  container.appendChild(posDisplay);

  const viewHeading = document.createElement('h2');
  viewHeading.textContent = 'View';
  container.appendChild(viewHeading);

  const printBtn = document.createElement('button');
  printBtn.className = 'view-toggle';
  printBtn.textContent = '⎙ Print Sheet';
  printBtn.addEventListener('click', () => globalThis.print());
  container.appendChild(printBtn);

  // Convert canvas px dimensions to physical inches before printing so the browser
  // maps CSS pixels correctly onto paper regardless of print DPI or zoom level.
  // Restore px values after so screen layout is unaffected.
  globalThis.addEventListener('beforeprint', () => {
    if (!canvas) return;
    canvas.domElement.style.width  = `${CANVAS_W / PX_PER_IN}in`;
    canvas.domElement.style.height = `${CANVAS_H / PX_PER_IN}in`;
  });
  globalThis.addEventListener('afterprint', () => {
    if (!canvas) return;
    canvas.domElement.style.width  = `${CANVAS_W}px`;
    canvas.domElement.style.height = `${CANVAS_H}px`;
  });

  const newBtn = document.createElement('button');
  newBtn.className = 'view-toggle';
  newBtn.textContent = '✦ New Project';
  newBtn.addEventListener('click', () => newProject());
  container.appendChild(newBtn);

  const templateBtn = document.createElement('button');
  templateBtn.className = 'view-toggle';
  templateBtn.textContent = '⊞ New from Template';
  templateBtn.addEventListener('click', () => newFromTemplate());
  container.appendChild(templateBtn);

  const loadBtn = document.createElement('button');
  loadBtn.className = 'view-toggle';
  loadBtn.textContent = '⬆ Load Project';
  loadBtn.addEventListener('click', async () => {
    // deno-lint-ignore no-explicit-any
    const hasPicker = typeof (window as any).showOpenFilePicker === 'function';
    if (hasPicker) {
      try {
        // deno-lint-ignore no-explicit-any
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'JSON Project', accept: { 'application/json': ['.json'] } }],
        });
        setFileHandle(handle);
        const file = await handle.getFile();
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          alert('Failed to load: ' + (e as Error).message);
        }
      }
      return;
    }
    // Fallback: <input type="file"> (no reusable handle)
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.addEventListener('change', async () => {
      const file = inp.files?.[0];
      if (!file) return;
      try {
        setFileHandle(null);
        loadProject(JSON.parse(await file.text()));
      } catch (e) {
        alert('Failed to load: ' + (e as Error).message);
      }
    });
    inp.click();
  });
  container.appendChild(loadBtn);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'view-toggle';
  saveBtn.textContent = '💾 Save';
  saveBtn.addEventListener('click', () => saveProject(false));
  container.appendChild(saveBtn);

  const saveAsBtn = document.createElement('button');
  saveAsBtn.className = 'view-toggle';
  saveAsBtn.textContent = '↓ Save As';
  saveAsBtn.addEventListener('click', () => saveProject(true));
  container.appendChild(saveAsBtn);

  const gridBtn = document.createElement('button');
  gridBtn.id = 'grid-toggle';
  gridBtn.className = 'view-toggle active';
  gridBtn.textContent = '# Grid';
  container.appendChild(gridBtn);

  const densityWrap = document.createElement('div');
  densityWrap.className = 'grid-density';
  const densityLabel = document.createElement('span');
  densityLabel.textContent = 'Dark';
  const densitySlider = document.createElement('input');
  densitySlider.id = 'grid-opacity';
  densitySlider.type = 'range';
  densitySlider.min = '0.1';
  densitySlider.max = '1';
  densitySlider.step = '0.05';
  densitySlider.value = '0.45';
  densityWrap.appendChild(densityLabel);
  densityWrap.appendChild(densitySlider);
  container.appendChild(densityWrap);

  // Page size
  const pageHeading = document.createElement('h2');
  pageHeading.textContent = 'Page';
  container.appendChild(pageHeading);

  const pageControls = document.createElement('div');
  pageControls.className = 'page-controls';

  const pageSel = document.createElement('select');
  pageSel.id = 'page-size';
  pageSel.className = 'page-size-select';
  for (const [key, size] of Object.entries(PAGE_SIZES)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = size.label;
    if (key === 'letter') opt.selected = true;
    pageSel.appendChild(opt);
  }
  pageControls.appendChild(pageSel);
  container.appendChild(pageControls);

  // Title block toggle
  const tbToggleLabel = document.createElement('label');
  tbToggleLabel.className = 'view-toggle';
  tbToggleLabel.style.cursor = 'pointer';
  const tbCheckbox = document.createElement('input');
  tbCheckbox.type = 'checkbox';
  tbCheckbox.id = 'title-block-toggle';
  tbCheckbox.style.marginRight = '0.4rem';
  tbCheckbox.checked = titleBlockEnabled;
  tbCheckbox.addEventListener('change', () => {
    setTitleBlockEnabled(tbCheckbox.checked);
    if (!titleBlockEnabled) {
      // Only remove the DOM overlays — keep state.titleBlock so settings survive toggle off/on
      canvas.domElement.querySelectorAll('.title-block-overlay').forEach((e) => e.remove());
      pnCheckbox.disabled = false;
      pnToggleLabel.style.opacity = '1';
      pnToggleLabel.style.pointerEvents = '';
    } else {
      syncTitleBlocks();
      pnCheckbox.checked = false;
      setPageNumberingEnabled(false);
      pnCheckbox.disabled = true;
      pnToggleLabel.style.opacity = '0.4';
      pnToggleLabel.style.pointerEvents = 'none';
    }
    syncPageSeparators();
    canvas.updateMarginGuide();
    // Reset grid cursor to effective content top
    moveGridCursor(margins.left, margins.top + titleBlockH());
  });
  tbToggleLabel.appendChild(tbCheckbox);
  tbToggleLabel.appendChild(document.createTextNode('Title Block'));
  container.appendChild(tbToggleLabel);

  // Page numbering toggle (disabled when title block is active)
  const pnToggleLabel = document.createElement('label');
  pnToggleLabel.className = 'view-toggle';
  pnToggleLabel.style.cursor = 'pointer';
  const pnCheckbox = document.createElement('input');
  pnCheckbox.type = 'checkbox';
  pnCheckbox.id = 'page-numbering-toggle';
  pnCheckbox.style.marginRight = '0.4rem';
  pnCheckbox.checked = pageNumberingEnabled;
  pnCheckbox.disabled = titleBlockEnabled;
  if (titleBlockEnabled) {
    pnToggleLabel.style.opacity = '0.4';
    pnToggleLabel.style.pointerEvents = 'none';
  }
  pnCheckbox.addEventListener('change', () => {
    setPageNumberingEnabled(pnCheckbox.checked);
    syncPageSeparators();
  });
  pnToggleLabel.appendChild(pnCheckbox);
  pnToggleLabel.appendChild(document.createTextNode('Page Numbering'));
  container.appendChild(pnToggleLabel);

  // Margins heading with unit toggle
  const marginRow = document.createElement('div');
  marginRow.className = 'margin-heading-row';
  const marginHeading = document.createElement('h2');
  marginHeading.textContent = 'Margins';
  const unitBtn = document.createElement('button');
  unitBtn.id = 'unit-toggle';
  unitBtn.className = 'unit-toggle';
  unitBtn.textContent = 'in';
  marginRow.appendChild(marginHeading);
  marginRow.appendChild(unitBtn);
  container.appendChild(marginRow);

  const marginGrid = document.createElement('div');
  marginGrid.className = 'margin-inputs';
  const marginDefs: { id: string; label: string; side: keyof typeof margins }[] = [
    { id: 'margin-top',    label: 'Top',    side: 'top'    },
    { id: 'margin-right',  label: 'Right',  side: 'right'  },
    { id: 'margin-bottom', label: 'Bottom', side: 'bottom' },
    { id: 'margin-left',   label: 'Left',   side: 'left'   },
  ];
  for (const def of marginDefs) {
    const wrap = document.createElement('label');
    wrap.className = 'margin-field';
    const lbl = document.createElement('span');
    lbl.textContent = def.label;
    const inp = document.createElement('input');
    inp.id = def.id;
    inp.type = 'number';
    inp.min = '0';
    inp.step = '1';
    inp.value = String(pxToUnit(margins[def.side]));
    wrap.appendChild(lbl);
    wrap.appendChild(inp);
    marginGrid.appendChild(wrap);
  }
  container.appendChild(marginGrid);

  const modulesHeading = document.createElement('h2');
  modulesHeading.textContent = 'Modules';
  container.appendChild(modulesHeading);

  MODULES.forEach((mod) => {
    const item = document.createElement('div');
    item.className = 'module-item';
    item.draggable = true;
    item.dataset.moduleType = mod.type;
    item.dataset.moduleId = mod.id;
    item.innerHTML = `<span>${mod.icon}</span><span>${mod.name}</span>`;
    if (mod.sectionOnly) {
      const badge = document.createElement('span');
      badge.className = 'module-section-badge';
      badge.textContent = '§';
      badge.title = 'Can only be placed inside a Section';
      item.appendChild(badge);
    }
    if (mod.requiresPro) {
      item.dataset.requiresPro = '1';
      const proBadge = document.createElement('span');
      proBadge.className = 'module-pro-badge';
      proBadge.textContent = 'PRO';
      proBadge.title = 'Requires Pro or higher to create sections';
      proBadge.style.display = canCreateSection() ? 'none' : '';
      item.appendChild(proBadge);
      if (!canCreateSection()) item.classList.add('module-locked');
    }
    container.appendChild(item);
  });

  const customHeading = document.createElement('h2');
  customHeading.className = 'custom-tools-heading';
  const customHeadingText = document.createElement('span');
  customHeadingText.textContent = 'Custom Tools';
  customHeading.appendChild(customHeadingText);
  const importToolsBtn = document.createElement('button');
  importToolsBtn.className = 'import-tools-btn';
  importToolsBtn.textContent = '⬆ Import…';
  importToolsBtn.title = 'Import custom tools from a saved project file';
  importToolsBtn.addEventListener('click', importToolsFromFile);
  customHeading.appendChild(importToolsBtn);
  container.appendChild(customHeading);

  const customList = document.createElement('div');
  customList.id = 'custom-modules-list';
  container.appendChild(customList);

  customModules.forEach((mod) => customList.appendChild(renderCustomModuleItem(mod)));
}


async function start() {
  try {
    await init();
    console.log('MathWasm Engine Ready');

    // Initialise auth before rendering sidebar so role is known immediately
    await initAuth();

    renderSidebar();
    setCanvas(new Canvas('canvas'));

    // Re-render auth panel whenever login state changes
    onAuthChange(() => {
      const container = document.getElementById('sidebar-left');
      if (container) {
        renderAuthPanel(container);
        _refreshProBadges(container);
      }
    });
    setOnAuthStateChange(() => {
      const container = document.getElementById('sidebar-left');
      if (container) {
        renderAuthPanel(container);
        _refreshProBadges(container);
      }
    });

    // Wire callback slots — breaks circular deps between modules
    setOnSectionSummaryUpdate(updateSectionSummary);
    setOnRefreshAllSectionHeights(refreshAllSectionHeights);
    setOnSelectBlock(selectBlock);
    setOnAddToSelection(addToSelection);
    setOnMoveGridCursor(moveGridCursor);
    setOnUpdatePageCount(updatePageCount);
    setOnSyncPageSeparators(syncPageSeparators);
    setOnClearSelection(clearSelection);
    setOnRefreshCustomModulesList(() => {
      const list = document.getElementById('custom-modules-list');
      if (!list) return;
      list.innerHTML = '';
      customModules.forEach((mod) => list.appendChild(renderCustomModuleItem(mod)));
    });
    setOnAppendCustomModuleToSidebar((mod) => {
      const list = document.getElementById('custom-modules-list');
      if (list) list.appendChild(renderCustomModuleItem(mod));
    });

    syncPageSeparators(); // seed page-num elements on first load
    moveGridCursor(margins.left, margins.top + titleBlockH()); // start at first valid grid row (below title block)

    // Rubber-band selection rectangle
    setBandEl(document.createElement('div'));
    bandEl.id = 'selection-band';
    canvas.domElement.appendChild(bandEl);

    // Canvas pointerdown on empty area → start rubber-band
    // Mouse: starts immediately. Touch: requires a 500ms long-hold (prevents
    // conflicting with quick taps that move the grid cursor).
    const BAND_LONG_PRESS_MS = 500;
    const BAND_CANCEL_PX     = 10;
    canvas.domElement.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if ((e.target as HTMLElement).closest('.block')) return;
      const rect   = canvas.domElement.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      const startBand = () => {
        const bs = { startX, startY, moved: false };
        setBandState(bs);
        bandEl.style.left   = `${startX}px`;
        bandEl.style.top    = `${startY}px`;
        bandEl.style.width  = '0';
        bandEl.style.height = '0';
        bandEl.classList.add('active');
      };

      if (e.pointerType !== 'touch') {
        startBand();
        return;
      }

      // Touch: wait for long-hold before arming rubber-band
      let lpTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        lpTimer = null;
        startBand();
      }, BAND_LONG_PRESS_MS);

      const cancelBandLp = (ev: PointerEvent) => {
        if (ev.pointerId !== e.pointerId) return;
        if (lpTimer !== null) {
          if (ev.type === 'pointermove') {
            const dx = ev.clientX - e.clientX;
            const dy = ev.clientY - e.clientY;
            if (Math.hypot(dx, dy) <= BAND_CANCEL_PX) return; // tiny movement, keep waiting
          }
          clearTimeout(lpTimer);
          lpTimer = null;
        }
        canvas.domElement.removeEventListener('pointermove',   cancelBandLp);
        canvas.domElement.removeEventListener('pointerup',     cancelBandLp);
        canvas.domElement.removeEventListener('pointercancel', cancelBandLp);
      };
      canvas.domElement.addEventListener('pointermove',   cancelBandLp);
      canvas.domElement.addEventListener('pointerup',     cancelBandLp);
      canvas.domElement.addEventListener('pointercancel', cancelBandLp);
    });

    // Block move: drag selected blocks; rubber-band: track selection rect
    document.addEventListener('pointermove', (e) => {
      if (multiDragState) {
        const dx = e.clientX - multiDragState.startX;
        const dy = e.clientY - multiDragState.startY;
        for (const [el, orig] of multiDragState.origPositions) {
          const blk = state.blocks.find((b) => b.id === el.id);
          const tbH = titleBlockH();
          const dragTopMin = margins.top + tbH;
          const sectionContent = el.parentElement?.classList.contains('section-content')
            ? el.parentElement as HTMLElement : null;
          if (sectionContent) {
            // Child block — clamp within its parent section's content area
            const maxLeft = Math.max(0, sectionContent.offsetWidth - el.offsetWidth);
            const maxTop  = Math.max(0, sectionContent.offsetHeight - el.offsetHeight);
            const newLeft = clamp(orig.left + dx, 0, maxLeft);
            const newTop  = clamp(orig.top  + dy, 0, maxTop);
            el.style.left = `${newLeft}px`;
            el.style.top  = `${newTop}px`;
            el.style.maxWidth = `${sectionContent.offsetWidth - newLeft}px`;
          } else if (blk?.type === 'section') {
            // Full-width blocks: X locked, vertical drag only
            el.style.top = `${clamp(orig.top + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
          } else {
            const dragLeft = clamp(orig.left + dx, margins.left, CANVAS_W - margins.right - el.offsetWidth);
            el.style.left = `${dragLeft}px`;
            el.style.top  = `${clamp(orig.top  + dy, dragTopMin, CANVAS_H + PAGE_H)}px`;
            el.style.maxWidth = `${CANVAS_W - margins.right - dragLeft}px`;
          }
        }
      }
      if (bandState) {
        const rect = canvas.domElement.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const x = Math.min(bandState.startX, cx);
        const y = Math.min(bandState.startY, cy);
        const w = Math.abs(cx - bandState.startX);
        const h = Math.abs(cy - bandState.startY);
        bandEl.style.left   = `${x}px`;
        bandEl.style.top    = `${y}px`;
        bandEl.style.width  = `${w}px`;
        bandEl.style.height = `${h}px`;
        if (w > 4 || h > 4) bandState.moved = true;
      }
    });

    // Margin-relative snap helpers — keep blocks on the same grid the crosshair uses
    const mSnapX = (absX: number) => margins.left + canvas.snap(absX - margins.left);
    const mSnapY = (absY: number) => {
      const pi   = Math.max(0, Math.floor(absY / PAGE_H));
      const orig = pi * PAGE_H + margins.top;
      return orig + canvas.snap(absY - orig);
    };

    document.addEventListener('pointerup', (e) => {
      if (multiDragState) {
        for (const [el] of multiDragState.origPositions) {
          const block = state.blocks.find((b) => b.id === el.id);
          if (!block || block.type === 'section') {
            // Full-width blocks: snap vertically only
            const snappedTop = clamp(mSnapY(parseInt(el.style.top)), margins.top + titleBlockH(), CANVAS_H + PAGE_H);
            placeBlock(el, margins.left, snappedTop);
            continue;
          }
          const snapContent = el.parentElement?.classList.contains('section-content')
            ? el.parentElement as HTMLElement : null;
          const snapSectionEl = snapContent?.parentElement as HTMLElement | null;

          if (snapContent && snapSectionEl) {
            // Block is inside a section — always keep it there, snap within section bounds
            const maxLeft = Math.max(0, snapContent.offsetWidth - el.offsetWidth);
            const maxTop  = Math.max(0, snapContent.offsetHeight - el.offsetHeight);
            // Convert section-relative coords to canvas coords, apply margin-aligned snap, convert back
            const canvasRect2  = canvas.domElement.getBoundingClientRect();
            const contentRect  = snapContent.getBoundingClientRect();
            const contentLeft  = Math.round(contentRect.left - canvasRect2.left);
            const contentTop   = Math.round(contentRect.top  - canvasRect2.top);
            const rawLeft = parseInt(el.style.left);
            const rawTop  = parseInt(el.style.top);
            const snappedLeft = clamp(mSnapX(contentLeft + rawLeft) - contentLeft, 0, maxLeft);
            const snappedTop  = clamp(mSnapY(contentTop  + rawTop)  - contentTop,  0, maxTop);
            el.style.left = `${snappedLeft}px`;
            el.style.top  = `${snappedTop}px`;
            el.style.maxWidth = `${snapContent.offsetWidth - snappedLeft}px`;
            block.x = snappedLeft;
            block.y = snappedTop;
            refreshSectionHeight(snapSectionEl);
          } else {
            // Block is on the canvas — check if dropped onto a section
            const canvasRect = canvas.domElement.getBoundingClientRect();
            const cx = e.clientX - canvasRect.left;
            const cy = e.clientY - canvasRect.top;
            const targetSection = sectionAtPoint(cx, cy);
            if (targetSection && targetSection.id !== el.id) {
              // Dropped onto a section from canvas — reparent into it
              reparentToSection(el, targetSection);
            } else {
              // Normal canvas block — snap as usual
              const snappedLeft = clamp(mSnapX(parseInt(el.style.left)), margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const snappedTop  = clamp(mSnapY(parseInt(el.style.top)),  margins.top,  CANVAS_H + PAGE_H);
              placeBlock(el, snappedLeft, snappedTop);
            }
          }
        }
        document.body.style.cursor = '';
        setMultiDragState(null);
        reEvalAllFormulas();
        updatePageCount();
      }
      if (bandState) {
        bandEl.classList.remove('active');
        if (bandState.moved) {
          setSkipNextCanvasClick(true);
          const rect = canvas.domElement.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          const x = Math.min(bandState.startX, cx);
          const y = Math.min(bandState.startY, cy);
          const w = Math.abs(cx - bandState.startX);
          const h = Math.abs(cy - bandState.startY);
          clearSelection();
          for (const bl of canvas.domElement.querySelectorAll<HTMLElement>('.block')) {
            const bL = parseInt(bl.style.left), bT = parseInt(bl.style.top);
            if (bL + bl.offsetWidth > x && bL < x + w && bT + bl.offsetHeight > y && bT < y + h) {
              bl.classList.add('selected');
              selectedEls.add(bl);
              setSelectedEl(bl);
            }
          }
          if (selectedEls.size > 0) hideCursor();
        }
        setBandState(null);
      }
    });

    // Keyboard: cursor movement, block manipulation, row-shift
    document.addEventListener('keydown', (e) => {
      // Let textarea handle all its own keys natively
      if ((document.activeElement as HTMLElement)?.tagName === 'TEXTAREA') return;
      // Shift+Enter / Ctrl+Shift+Enter: push/pull blocks below cursor Y
      if (e.key === 'Enter' && e.shiftKey && !e.altKey) {
        e.preventDefault();
        shiftBlocksVertical(gridCursor.y, e.ctrlKey ? -GRID_SIZE : GRID_SIZE);
        return;
      }
      // Alt+Enter: blur active field, move cursor to first grid intersection right of block
      if (e.key === 'Enter' && e.altKey && !e.ctrlKey) {
        const blockEl = selectedEl ?? (document.activeElement as HTMLElement)?.closest<HTMLElement>('.block');
        if (!blockEl) return;
        e.preventDefault();
        (document.activeElement as HTMLElement)?.blur();
        clearSelection();
        blockEl.classList.remove('selected');
        const blockRight = parseInt(blockEl.style.left) + blockEl.offsetWidth;
        const exitX = margins.left + (Math.floor((blockRight - margins.left) / GRID_SIZE) + 1) * GRID_SIZE;
        const exitY = parseInt(blockEl.style.top);
        moveGridCursor(exitX, exitY);
        return;
      }
      // Ctrl+Arrow / Ctrl+Delete — before input guard so they work in edit mode
      if (e.ctrlKey && selectedEls.size > 0) {
        if (e.key === 'Delete') {
          e.preventDefault();
          const toDelete = [...selectedEls];
          for (const el of toDelete) deleteBlock(el);
          return;
        }
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-GRID_SIZE, 0], ArrowRight: [GRID_SIZE, 0],
          ArrowUp: [0, -GRID_SIZE], ArrowDown: [0, GRID_SIZE],
        };
        const d = delta[e.key];
        if (d) {
          e.preventDefault();
          let movedIsChild = false;
          for (const el of selectedEls) {
            const sc = el.parentElement?.classList.contains('section-content')
              ? el.parentElement as HTMLElement : null;
            if (sc) {
              movedIsChild = true;
              const maxLeft = Math.max(0, sc.offsetWidth - el.offsetWidth);
              const maxTop  = Math.max(0, sc.offsetHeight - el.offsetHeight);
              const newLeft = clamp(parseInt(el.style.left) + d[0], 0, maxLeft);
              const newTop  = clamp(parseInt(el.style.top)  + d[1], 0, maxTop);
              el.style.left = `${newLeft}px`;
              el.style.top  = `${newTop}px`;
              el.style.maxWidth = `${sc.offsetWidth - newLeft}px`;
              const blk = state.blocks.find((b) => b.id === el.id);
              if (blk) { blk.x = newLeft; blk.y = newTop; }
              refreshSectionHeight(sc.parentElement as HTMLElement);
            } else {
              const newLeft = clamp(parseInt(el.style.left) + d[0], margins.left, CANVAS_W - margins.right - el.offsetWidth);
              const newTop  = clamp(parseInt(el.style.top)  + d[1], margins.top,  CANVAS_H + PAGE_H);
              placeBlock(el, newLeft, newTop);
            }
          }
          if (e.key === 'ArrowRight' && selectedEl && !movedIsChild) resolveOverlapsRight(selectedEl);
          updatePageCount();
          return;
        }
      }
      const active = document.activeElement as HTMLElement;
      if (active?.tagName === 'INPUT' || active?.isContentEditable) return;

      // Ctrl+Z: undo last block deletion
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey && !e.altKey) {
        const block = deletionStack.pop();
        if (!block) return;
        e.preventDefault();
        state.blocks.push(block);
        renderBlock(block);
        reEvalAllFormulas();
        updatePageCount();
        const restored = document.getElementById(block.id);
        if (restored) selectBlock(restored);
        return;
      }

      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-GRID_SIZE, 0], ArrowRight: [GRID_SIZE, 0],
        ArrowUp: [0, -GRID_SIZE], ArrowDown: [0, GRID_SIZE],
      };
      const d = delta[e.key];
      if (!d) return;
      e.preventDefault();
      moveGridCursor(gridCursor.x + d[0], gridCursor.y + d[1]);
    });

    // Grid toggle — apply to both page 1 guide and all extra page guides
    document.getElementById('grid-toggle')!.addEventListener('click', (e) => {
      const btn = e.currentTarget as HTMLElement;
      const guide = document.getElementById('margin-guide')!;
      const on = guide.classList.toggle('engineering-grid');
      canvas.domElement.querySelectorAll<HTMLElement>('.page-guide').forEach((g) => {
        g.classList.toggle('engineering-grid', on);
      });
      btn.classList.toggle('active', on);
    });

    // Grid darkness slider
    document.getElementById('grid-opacity')!.addEventListener('input', (e) => {
      const a = parseFloat((e.target as HTMLInputElement).value);
      canvas.domElement.style.setProperty('--grid-line',
        isDark() ? `rgba(212, 212, 216, ${a})` : `rgba(55, 65, 81, ${a})`);
    });

    // Page size dropdown
    document.getElementById('page-size')!.addEventListener('change', (e) => {
      const key = (e.target as HTMLSelectElement).value as PageSizeKey;
      const size = PAGE_SIZES[key];
      setCANVAS_W(size.w);
      setPAGE_H(size.h);
      setCANVAS_H(numPages * PAGE_H);
      canvas.domElement.style.width  = `${size.w}px`;
      canvas.domElement.style.height = `${CANVAS_H}px`;
      syncPageSeparators();   // rebuild guides/separators with new PAGE_H
      updatePageCount();      // may further adjust numPages based on block positions
    });

    // Unit toggle (mm ↔ in)
    const marginSides: { id: string; side: keyof typeof margins }[] = [
      { id: 'margin-top',    side: 'top'    },
      { id: 'margin-right',  side: 'right'  },
      { id: 'margin-bottom', side: 'bottom' },
      { id: 'margin-left',   side: 'left'   },
    ];
    const refreshMarginInputs = () => {
      for (const { id, side } of marginSides) {
        const inp = document.getElementById(id) as HTMLInputElement;
        inp.value = String(pxToUnit(margins[side]));
        inp.step = marginUnit === 'mm' ? '1' : '0.125';
      }
    };
    document.getElementById('unit-toggle')!.addEventListener('click', (e) => {
      setMarginUnit(marginUnit === 'mm' ? 'in' : 'mm');
      (e.currentTarget as HTMLElement).textContent = marginUnit;
      refreshMarginInputs();
    });

    // Margin inputs
    for (const { id, side } of marginSides) {
      document.getElementById(id)!.addEventListener('input', (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        if (!isNaN(val)) {
          margins[side] = unitToPx(val);
          canvas.updateMarginGuide();
        }
      });
    }

    // Click canvas: move grid cursor; deselect if bare canvas clicked
    canvas.domElement.addEventListener('click', (e) => {
      // Skip if this click immediately followed a rubber-band selection
      if (skipNextCanvasClick) { setSkipNextCanvasClick(false); return; }
      // Clicks inside a block are handled by the block — don't move the cursor
      if ((e.target as HTMLElement).closest('.block')) return;
      const rect = canvas.domElement.getBoundingClientRect();
      moveGridCursor(e.clientX - rect.left, e.clientY - rect.top);
      if (e.target === canvas.domElement) clearSelection();
    });

    // Sidebar dblclick → place block immediately at current cursor position
    document.getElementById('sidebar-left')!.addEventListener('dblclick', (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-module-type]');
      if (!el?.dataset.moduleType) return;
      if (el.dataset.requiresPro && !canCreateSection()) {
        _showProRequiredDialog();
        return;
      }
      dropBlock(el.dataset.moduleType as Block['type'], el.dataset.moduleId ?? '', gridCursor.x, gridCursor.y);
    });

    // Sidebar drag → canvas drop
    document.getElementById('sidebar-left')!.addEventListener('dragstart', (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-module-type]');
      if (!el?.dataset.moduleType) return;
      if (el.dataset.requiresPro && !canCreateSection()) {
        e.preventDefault();
        _showProRequiredDialog();
        return;
      }
      e.dataTransfer!.setData('module-type', el.dataset.moduleType);
      e.dataTransfer!.setData('module-id', el.dataset.moduleId ?? '');
    });

    canvas.domElement.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer!.getData('module-type') as Block['type'];
      const subtype = e.dataTransfer!.getData('module-id');
      if (type) {
        const rect = canvas.domElement.getBoundingClientRect();
        dropBlock(type, subtype, e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    // Right-click context menu
    const ctxMenu = document.createElement('div');
    ctxMenu.id = 'ctx-menu';

    // ── Formula-row section (shown only when right-clicking inside a formula block) ──
    const ctxFormulaGroup = document.createElement('div');
    ctxFormulaGroup.className = 'ctx-formula-group';
    ctxFormulaGroup.style.display = 'none';

    const ctxFormulaHeader = document.createElement('div');
    ctxFormulaHeader.className = 'ctx-section-header';
    ctxFormulaHeader.textContent = 'Formula row';
    ctxFormulaGroup.appendChild(ctxFormulaHeader);

    const ctxAddRowBtn    = document.createElement('button');
    const ctxAddIfBtn     = document.createElement('button');
    const ctxAddElseifBtn = document.createElement('button');
    const ctxAddElseBtn   = document.createElement('button');
    const ctxAddForBtn    = document.createElement('button');
    const ctxAddDescBtn   = document.createElement('button');
    const ctxAddRefBtn    = document.createElement('button');
    const ctxDelBranchBtn = document.createElement('button');
    const ctxDelRowBtn    = document.createElement('button');

    ctxAddRowBtn.className    = 'ctx-neutral-btn';  ctxAddRowBtn.textContent    = '+ row';
    ctxAddIfBtn.className     = 'ctx-neutral-btn';  ctxAddIfBtn.textContent     = '+ if';
    ctxAddElseifBtn.className = 'ctx-neutral-btn';  ctxAddElseifBtn.textContent = '+ elseif';
    ctxAddElseBtn.className   = 'ctx-neutral-btn';  ctxAddElseBtn.textContent   = '+ else';
    ctxAddForBtn.className    = 'ctx-neutral-btn';  ctxAddForBtn.textContent    = '+ for';
    ctxAddDescBtn.className   = 'ctx-neutral-btn';  ctxAddDescBtn.textContent   = '+ description';
    ctxAddRefBtn.className    = 'ctx-neutral-btn';  ctxAddRefBtn.textContent    = '+ reference';
    ctxDelBranchBtn.textContent = '× branch';
    ctxDelRowBtn.textContent    = '× delete row';

    ctxAddRowBtn.title    = 'Insert blank row after this row (Ctrl+Enter)';
    ctxAddIfBtn.title     = 'Insert if/end block after this row (Ctrl+I)';
    ctxAddElseifBtn.title = 'Add elseif branch to enclosing if (Ctrl+E)';
    ctxAddElseBtn.title   = 'Add else branch to enclosing if (Ctrl+Shift+E)';
    ctxAddForBtn.title    = 'Insert for/end block after this row (Ctrl+L)';
    ctxAddDescBtn.title   = 'Add a text description to this row (left column)';
    ctxAddRefBtn.title    = 'Add a reference annotation to this row (right column)';
    ctxDelBranchBtn.title = 'Delete this branch (elseif/else/for) and its body (Ctrl+-)';
    ctxDelRowBtn.title    = 'Delete this row or block (Ctrl+-)';

    [ctxAddRowBtn, ctxAddIfBtn, ctxAddElseifBtn, ctxAddElseBtn, ctxAddForBtn,
     ctxAddDescBtn, ctxAddRefBtn, ctxDelBranchBtn, ctxDelRowBtn].forEach((b) => ctxFormulaGroup.appendChild(b));

    const ctxFormulaSep = document.createElement('hr');
    ctxFormulaSep.className = 'ctx-sep';

    ctxMenu.appendChild(ctxFormulaGroup);
    ctxMenu.appendChild(ctxFormulaSep);

    const ctxSaveToolBtn = document.createElement('button');
    ctxSaveToolBtn.className = 'ctx-save-btn';
    ctxSaveToolBtn.textContent = '⭐ Save as Tool';
    ctxSaveToolBtn.title = 'Save this formula block as a reusable toolbar item';
    ctxMenu.appendChild(ctxSaveToolBtn);
    const ctxDeleteBtn = document.createElement('button');
    ctxDeleteBtn.textContent = 'Delete Block';
    ctxMenu.appendChild(ctxDeleteBtn);
    document.body.appendChild(ctxMenu);

    let ctxTarget: HTMLElement | null = null;
    // Formula-specific context tracked each time menu opens
    let ctxFormulaRowEl: HTMLElement | null = null;
    // deno-lint-ignore no-explicit-any
    let ctxFormulaActions: Record<string, (...args: any[]) => any> | null = null;

    const hideCtxMenu = () => {
      ctxMenu.style.display = 'none';
      ctxTarget = null;
      ctxFormulaRowEl = null;
      ctxFormulaActions = null;
    };

    ctxSaveToolBtn.addEventListener('click', () => {
      if (!ctxTarget) return;
      const name = prompt('Name for this tool:')?.trim();
      if (!name) return;

      // Collect the blocks to save: all selected if multi-select, else just the target
      const els = selectedEls.size > 1 ? [...selectedEls] : [ctxTarget];

      // Find the top-left origin across all selected block elements
      let originX = Infinity, originY = Infinity;
      for (const el of els) {
        originX = Math.min(originX, parseInt(el.style.left));
        originY = Math.min(originY, parseInt(el.style.top));
      }

      const toolBlocks = els.flatMap((el) => {
        const block = state.blocks.find((b) => b.id === el.id);
        if (!block) return [];
        return [{
          type: block.type,
          subtype: block.subtype,
          content: block.content,
          label: block.label,
          w: block.w,
          dx: parseInt(el.style.left) - originX,
          dy: parseInt(el.style.top) - originY,
        }];
      });

      const mod: CustomModule = {
        id: `custom-${Date.now()}`,
        name,
        content: toolBlocks[0]?.content ?? '',
        label: toolBlocks[0]?.label ?? '',
        blocks: toolBlocks,
      };
      customModules.push(mod);
      saveCustomModules();
      const list = document.getElementById('custom-modules-list');
      if (list) list.appendChild(renderCustomModuleItem(mod));
      hideCtxMenu();
    });

    ctxDeleteBtn.addEventListener('click', () => {
      if (ctxTarget) deleteBlock(ctxTarget);
      hideCtxMenu();
    });

    // Formula action button handlers — delegate to ctxFormulaActions captured at menu-open time
    ctxAddRowBtn.addEventListener('click', () => {
      ctxFormulaActions?.insertRowAfter(ctxFormulaRowEl); hideCtxMenu();
    });
    ctxAddIfBtn.addEventListener('click', () => {
      ctxFormulaActions?.insertIfAfter(ctxFormulaRowEl); hideCtxMenu();
    });
    ctxAddElseifBtn.addEventListener('click', () => {
      ctxFormulaActions?.insertElseifFor(ctxFormulaRowEl); hideCtxMenu();
    });
    ctxAddElseBtn.addEventListener('click', () => {
      ctxFormulaActions?.insertElseFor(ctxFormulaRowEl); hideCtxMenu();
    });
    ctxAddForBtn.addEventListener('click', () => {
      ctxFormulaActions?.insertForAfter(ctxFormulaRowEl); hideCtxMenu();
    });
    ctxAddDescBtn.addEventListener('click', () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addDescription(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxAddRefBtn.addEventListener('click', () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.addReference(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelBranchBtn.addEventListener('click', () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });
    ctxDelRowBtn.addEventListener('click', () => {
      if (ctxFormulaRowEl) ctxFormulaActions?.smartDeleteRow(ctxFormulaRowEl);
      hideCtxMenu();
    });

    document.addEventListener('mousedown', (e) => { if (!ctxMenu.contains(e.target as Node)) hideCtxMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideCtxMenu(); });

    document.addEventListener('contextmenu', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.block');
      if (!target) return;
      e.preventDefault();
      // Keep existing multi-selection; only select the target if it's not already in the set
      if (!selectedEls.has(target)) selectBlock(target);
      ctxTarget = target;
      const multi = selectedEls.size > 1;
      ctxSaveToolBtn.textContent = multi ? '⭐ Save Selection as Tool' : '⭐ Save as Tool';
      ctxSaveToolBtn.style.display = '';

      // ── Formula-row context detection ──────────────────────────────────
      const rowsEl = (e.target as HTMLElement).closest<HTMLElement>('.formula-rows');
      const rowEl  = (e.target as HTMLElement).closest<HTMLElement>('.formula-row');
      // deno-lint-ignore no-explicit-any
      const actions = rowsEl ? (rowsEl as any)._formulaCtxActions : null;

      if (actions) {
        ctxFormulaRowEl  = rowEl;
        ctxFormulaActions = actions;
        const { rowType, hasIf, hasElse, canDelBranch } = actions.getRowState(rowEl);
        const isRegular = actions.isRegularRow(rowEl);
        const hasDesc   = actions.hasDescription(rowEl);
        const hasRef    = actions.hasReference(rowEl);

        // Show/hide add-branch items based on context
        ctxAddElseifBtn.style.display = hasIf ? '' : 'none';
        ctxAddElseBtn.style.display   = hasIf ? '' : 'none';
        ctxAddElseifBtn.disabled      = hasElse;
        ctxAddElseBtn.disabled        = hasElse;
        ctxAddElseifBtn.title = hasElse ? '+ elseif (else branch already exists)' : 'Add elseif branch to enclosing if (Ctrl+E)';
        ctxAddElseBtn.title   = hasElse ? '+ else (else branch already exists)'   : 'Add else branch to enclosing if (Ctrl+Shift+E)';

        // + description/reference: regular rows outside groups, and if/for block headers
        const isInsideGroup = !!rowEl?.closest('.formula-block-group');
        const canHaveDescRef = (isRegular && !isInsideGroup) || rowType === 'if' || rowType === 'for';
        ctxAddDescBtn.style.display = (canHaveDescRef && !hasDesc) ? '' : 'none';
        ctxAddRefBtn.style.display  = (canHaveDescRef && !hasRef)  ? '' : 'none';

        // × branch: only on elseif / else / for rows
        ctxDelBranchBtn.style.display = canDelBranch ? '' : 'none';

        // Label the delete row button with what it will do
        const typeLabel = rowType ? ` (${rowType})` : '';
        ctxDelRowBtn.title = `Delete this row${typeLabel} (Ctrl+-)`;

        ctxFormulaGroup.style.display = '';
        ctxFormulaSep.style.display   = '';
      } else {
        ctxFormulaRowEl   = null;
        ctxFormulaActions = null;
        ctxFormulaGroup.style.display = 'none';
        ctxFormulaSep.style.display   = 'none';
      }

      ctxMenu.style.left = `${e.clientX}px`;
      ctxMenu.style.top = `${e.clientY}px`;
      ctxMenu.style.display = 'block';
    });

    // Render any pre-loaded blocks
    state.blocks.forEach(renderBlock);
  } catch (e) {
    console.error('Wasm Load Error:', e);
  }
}

start();
