(() => {
  const STORAGE_KEY = 'devskits-notepad-state-v1';
  const AUTOSAVE_DELAY = 450;
  const HISTORY_LIMIT = 120;
  const TAB_SPACES = '    ';

  const { downloadText, escapeHtml, formatTimestamp } = window.DevSkitsAppHelpers;

  function defaultState() {
    return {
      text: '',
      fileName: 'devskits-note.txt',
      draftUpdatedAt: 0,
      lastSavedAt: 0,
      wrap: true,
      darkTheme: false,
      monospace: true,
      restored: false
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (parsed) return { ...defaultState(), ...parsed, restored: Boolean(parsed.text) };
      const fromVfs = window.DevSkitsVFS?.readText?.("This PC/Documents", "devskits-note.txt");
      return fromVfs ? { ...defaultState(), text: fromVfs, restored: true } : defaultState();
    } catch (error) {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      text: state.text,
      fileName: state.fileName,
      draftUpdatedAt: state.draftUpdatedAt,
      lastSavedAt: state.lastSavedAt,
      wrap: state.wrap,
      darkTheme: state.darkTheme,
      monospace: state.monospace
    }));
    window.DevSkitsVFS?.writeText?.("This PC/Documents", "devskits-note.txt", state.text || "");
  }

  function countsForText(text) {
    const normalized = text.replace(/\r/g, '');
    const words = normalized.trim() ? normalized.trim().split(/\s+/).length : 0;
    const lines = normalized.length ? normalized.split('\n').length : 1;
    return {
      characters: text.length,
      words,
      lines
    };
  }

  function lineColumnFromPosition(text, position) {
    const head = text.slice(0, position);
    const parts = head.split('\n');
    return {
      line: parts.length,
      column: parts[parts.length - 1].length + 1
    };
  }

  function promptBeforeClearing(message) {
    return window.confirm(message);
  }

  function render(container) {
    const state = loadState();
    const history = [{ text: state.text, selectionStart: 0, selectionEnd: 0 }];
    let historyIndex = 0;
    let ignoreHistory = false;
    let autosaveTimer = null;
    let fileInput = null;

    container.innerHTML = `
      <div class="notepad-shell${state.darkTheme ? ' is-dark' : ''}${state.wrap ? ' wrap-on' : ' wrap-off'}${state.monospace ? ' monospace-on' : ' monospace-off'}">
        <div class="notepad-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>View</span>
          <span>Help</span>
        </div>

        <div class="notepad-toolbar">
          <button class="link-btn" data-action="new">New</button>
          <button class="link-btn" data-action="open">Open</button>
          <button class="link-btn" data-action="save">Save As</button>
          <button class="link-btn" data-action="clear">Clear</button>
          <button class="link-btn" data-action="undo">Undo</button>
          <button class="link-btn" data-action="redo">Redo</button>
          <button class="link-btn" data-action="select-all">Select All</button>
          <button class="link-btn" data-action="wrap">Word Wrap: <span class="notepad-wrap-label"></span></button>
          <button class="link-btn" data-action="theme">Theme: <span class="notepad-theme-label"></span></button>
          <button class="link-btn" data-action="font">Font: <span class="notepad-font-label"></span></button>
        </div>

        <div class="notepad-title-row">
          <div>
            <strong class="notepad-file-label">${escapeHtml(state.fileName)}</strong>
            <small class="notepad-status-text"></small>
          </div>
          <div class="notepad-counts"></div>
        </div>

        <div class="notepad-editor-wrap">
          <textarea class="notes-editor notepad-editor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Notepad editor"></textarea>
        </div>

        <div class="notepad-statusbar">
          <span class="notepad-position">Ln 1, Col 1</span>
          <span class="notepad-meta">Draft ready</span>
        </div>
      </div>`;

    const shell = container.querySelector('.notepad-shell');
    const editor = container.querySelector('.notepad-editor');
    const fileLabel = container.querySelector('.notepad-file-label');
    const statusText = container.querySelector('.notepad-status-text');
    const counts = container.querySelector('.notepad-counts');
    const position = container.querySelector('.notepad-position');
    const meta = container.querySelector('.notepad-meta');
    const wrapLabel = container.querySelector('.notepad-wrap-label');
    const themeLabel = container.querySelector('.notepad-theme-label');
    const fontLabel = container.querySelector('.notepad-font-label');

    function syncShellFlags() {
      shell.classList.toggle('is-dark', state.darkTheme);
      shell.classList.toggle('wrap-on', state.wrap);
      shell.classList.toggle('wrap-off', !state.wrap);
      shell.classList.toggle('monospace-on', state.monospace);
      shell.classList.toggle('monospace-off', !state.monospace);
      wrapLabel.textContent = state.wrap ? 'On' : 'Off';
      themeLabel.textContent = state.darkTheme ? 'Night' : 'Classic';
      fontLabel.textContent = state.monospace ? 'Mono' : 'UI';
    }

    function updateStatus(reason = '') {
      const stats = countsForText(state.text);
      const cursor = lineColumnFromPosition(state.text, editor.selectionStart || 0);
      fileLabel.textContent = state.fileName;
      counts.textContent = `${stats.characters} chars · ${stats.words} words · ${stats.lines} lines`;
      position.textContent = `Ln ${cursor.line}, Col ${cursor.column}`;
      if (reason) meta.textContent = reason;
      const stateBits = [];
      if (state.restored) stateBits.push(`Draft restored ${formatTimestamp(state.draftUpdatedAt)}`);
      if (state.lastSavedAt) stateBits.push(`Last saved ${formatTimestamp(state.lastSavedAt)}`);
      if (!stateBits.length) stateBits.push('Draft ready');
      statusText.textContent = stateBits.join(' · ');
      syncShellFlags();
    }

    function pushHistorySnapshot(nextText = state.text) {
      if (ignoreHistory) return;
      const current = history[historyIndex];
      if (current && current.text === nextText) return;
      history.splice(historyIndex + 1);
      history.push({ text: nextText, selectionStart: editor.selectionStart || 0, selectionEnd: editor.selectionEnd || 0 });
      if (history.length > HISTORY_LIMIT) history.shift();
      historyIndex = history.length - 1;
    }

    function applySnapshot(snapshot, reason) {
      if (!snapshot) return;
      ignoreHistory = true;
      state.text = snapshot.text;
      editor.value = snapshot.text;
      editor.selectionStart = snapshot.selectionStart || 0;
      editor.selectionEnd = snapshot.selectionEnd || editor.selectionStart;
      state.draftUpdatedAt = Date.now();
      saveState(state);
      updateStatus(reason);
      ignoreHistory = false;
    }

    function scheduleAutosave(reason = 'Draft autosaved') {
      window.clearTimeout(autosaveTimer);
      autosaveTimer = window.setTimeout(() => {
        state.text = editor.value;
        state.draftUpdatedAt = Date.now();
        state.restored = false;
        saveState(state);
        updateStatus(reason);
      }, AUTOSAVE_DELAY);
    }

    function setText(nextText, reason) {
      state.text = nextText;
      editor.value = nextText;
      pushHistorySnapshot(nextText);
      scheduleAutosave(reason);
      updateStatus(reason);
    }

    function saveAsFile() {
      const baseName = (state.fileName || 'devskits-note').replace(/\s+/g, '-');
      const fileName = baseName.toLowerCase().endsWith('.txt') ? baseName : `${baseName}.txt`;
      state.fileName = fileName;
      state.lastSavedAt = Date.now();
      state.draftUpdatedAt = state.lastSavedAt;
      downloadText(fileName, editor.value, 'text/plain;charset=utf-8');
      saveState(state);
      updateStatus('File saved.');
    }

    function openPicker() {
      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,text/plain';
        fileInput.className = 'hidden';
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files?.[0];
          if (!file) return;
          const text = await file.text();
          state.fileName = file.name || state.fileName;
          state.text = text;
          state.draftUpdatedAt = Date.now();
          state.restored = false;
          editor.value = text;
          history.splice(0, history.length, { text, selectionStart: 0, selectionEnd: 0 });
          historyIndex = 0;
          saveState(state);
          updateStatus(`Opened ${file.name}.`);
          editor.focus();
          fileInput.value = '';
        });
        container.appendChild(fileInput);
      }
      fileInput.click();
    }

    function clearEditor() {
      if (editor.value && !promptBeforeClearing('Clear the current note? Unsaved text will be removed from the editor.')) return;
      setText('', 'Editor cleared.');
      editor.focus();
    }

    function newDocument() {
      if (editor.value && !promptBeforeClearing('Start a new note? Current unsaved text will be replaced.')) return;
      state.fileName = 'devskits-note.txt';
      setText('', 'New note created.');
      editor.focus();
    }

    function selectAllText() {
      editor.focus();
      editor.select();
      updateStatus('Selected all text.');
    }

    function toggleWrap() {
      state.wrap = !state.wrap;
      saveState(state);
      updateStatus(`Word wrap ${state.wrap ? 'enabled' : 'disabled'}.`);
      editor.focus();
    }

    function toggleTheme() {
      state.darkTheme = !state.darkTheme;
      saveState(state);
      updateStatus(`Theme set to ${state.darkTheme ? 'Night' : 'Classic'}.`);
    }

    function toggleFont() {
      state.monospace = !state.monospace;
      saveState(state);
      updateStatus(`Font set to ${state.monospace ? 'Monospace' : 'System UI'}.`);
      editor.focus();
    }

    function undo() {
      if (historyIndex <= 0) {
        updateStatus('Nothing to undo.');
        return;
      }
      historyIndex -= 1;
      applySnapshot(history[historyIndex], 'Undo complete.');
      editor.focus();
    }

    function redo() {
      if (historyIndex >= history.length - 1) {
        updateStatus('Nothing to redo.');
        return;
      }
      historyIndex += 1;
      applySnapshot(history[historyIndex], 'Redo complete.');
      editor.focus();
    }

    function runAction(action) {
      if (action === 'new') return newDocument();
      if (action === 'open') return openPicker();
      if (action === 'save') return saveAsFile();
      if (action === 'clear') return clearEditor();
      if (action === 'undo') return undo();
      if (action === 'redo') return redo();
      if (action === 'select-all') return selectAllText();
      if (action === 'wrap') return toggleWrap();
      if (action === 'theme') return toggleTheme();
      if (action === 'font') return toggleFont();
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      runAction(button.dataset.action);
    });

    editor.addEventListener('input', () => {
      state.text = editor.value;
      pushHistorySnapshot(editor.value);
      scheduleAutosave('Draft autosaved.');
      updateStatus('Editing draft...');
    });

    editor.addEventListener('click', () => updateStatus());
    editor.addEventListener('keyup', () => updateStatus());
    editor.addEventListener('select', () => updateStatus());

    editor.addEventListener('keydown', (event) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveAsFile();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        openPicker();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        selectAllText();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }
      if ((modifier && event.key.toLowerCase() === 'y') || (modifier && event.shiftKey && event.key.toLowerCase() === 'z')) {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.setRangeText(TAB_SPACES, start, end, 'end');
        state.text = editor.value;
        pushHistorySnapshot(editor.value);
        scheduleAutosave('Inserted tab spacing.');
        updateStatus('Inserted tab spacing.');
      }
    });

    window.addEventListener('devskits:new-note', newDocument);

    const openImportedNote = (event) => {
      const detail = event.detail || {};
      state.fileName = detail.name || state.fileName;
      state.text = detail.content || '';
      state.draftUpdatedAt = Date.now();
      state.restored = false;
      editor.value = state.text;
      history.splice(0, history.length, { text: state.text, selectionStart: 0, selectionEnd: 0 });
      historyIndex = 0;
      saveState(state);
      updateStatus(`Opened ${state.fileName}.`);
      editor.focus();
    };

    window.addEventListener('devskits:open-note-file', openImportedNote);

    container.addEventListener('DOMNodeRemoved', () => {
      if (!container.isConnected) {
        window.clearTimeout(autosaveTimer);
        window.removeEventListener('devskits:new-note', newDocument);
        window.removeEventListener('devskits:open-note-file', openImportedNote);
      }
    });

    editor.value = state.text;
    syncShellFlags();
    updateStatus(state.restored ? 'Draft restored from local storage.' : 'Draft ready.');
    editor.focus();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.notes = render;
})();
