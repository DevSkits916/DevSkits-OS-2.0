(() => {
  const KEY = "devskits-notes-v2";
  const defaultNotes = [
    { id: "quick-notes", name: "quick-notes.txt", content: "Quick capture...", updatedAt: Date.now() },
    { id: "draft-pad", name: "draft-pad.txt", content: "Draft ideas here.", updatedAt: Date.now() },
    { id: "scratchpad", name: "scratchpad.txt", content: "Persistent scratchpad.", updatedAt: Date.now() }
  ];

  function loadNotes() {
    return JSON.parse(localStorage.getItem(KEY) || JSON.stringify(defaultNotes));
  }

  function saveNotes(notes) {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }

  function render(container) {
    let notes = loadNotes();
    let active = notes[0]?.id;
    let externalNoteHandler;

    container.innerHTML = `<div class="notes-shell"><aside class="notes-list"></aside><section><div class="badges"><button class="link-btn" id="new-note">New</button><button class="link-btn" id="rename-note">Rename</button><button class="link-btn" id="delete-note">Delete</button><button class="link-btn" id="copy-note">Copy</button><button class="link-btn" id="export-note">Export</button><button class="link-btn" id="fmt-bold"><b>B</b></button><button class="link-btn" id="fmt-italic"><i>I</i></button><button class="link-btn" id="fmt-upper">UP</button></div><div class="start-section-label" id="note-status">Last saved: never</div><textarea class="notes-editor"></textarea></section></div>`;
    const list = container.querySelector(".notes-list");
    const editor = container.querySelector(".notes-editor");
    const status = container.querySelector("#note-status");

    function drawList() {
      list.innerHTML = notes.map((n) => `<button class="task-btn ${n.id === active ? "active" : ""}" data-id="${n.id}">${n.name}</button>`).join("");
      const current = notes.find((n) => n.id === active);
      editor.value = current?.content || "";
      status.textContent = `Last saved: ${current?.updatedAt ? new Date(current.updatedAt).toLocaleString() : "never"}`;
    }


    function wrapSelection(prefix, suffix = prefix) {
      const start = editor.selectionStart || 0;
      const end = editor.selectionEnd || 0;
      const selected = editor.value.slice(start, end);
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      note.content = `${editor.value.slice(0, start)}${prefix}${selected}${suffix}${editor.value.slice(end)}`;
      note.updatedAt = Date.now();
      editor.value = note.content;
      saveNotes(notes);
      status.textContent = `Last saved: ${new Date(note.updatedAt).toLocaleString()}`;
    }

    list.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id) return;
      active = id;
      drawList();
    });

    editor.addEventListener("input", () => {
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      note.content = editor.value;
      note.updatedAt = Date.now();
      saveNotes(notes);
      status.textContent = `Last saved: ${new Date(note.updatedAt).toLocaleString()}`;
    });

    container.querySelector("#new-note").addEventListener("click", () => {
      const name = `note-${notes.length + 1}.txt`;
      const id = `note-${Date.now()}`;
      notes.push({ id, name, content: "", updatedAt: Date.now() });
      active = id;
      saveNotes(notes);
      drawList();
    });

    container.querySelector("#rename-note").addEventListener("click", () => {
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      const name = prompt("Rename note", note.name);
      if (!name) return;
      note.name = name;
      saveNotes(notes);
      drawList();
    });

    container.querySelector("#delete-note").addEventListener("click", () => {
      if (notes.length === 1) return;
      const removed = notes.find((n) => n.id === active);
      if (removed) window.DevSkitsWorld.pushRecycle({ name: removed.name, source: "notes", payload: removed });
      notes = notes.filter((n) => n.id !== active);
      active = notes[0].id;
      saveNotes(notes);
      drawList();
      window.DevSkitsDesktop.notify("Note moved to Recycle Bin");
    });

    container.querySelector("#copy-note").addEventListener("click", async () => {
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      await navigator.clipboard.writeText(note.content || "").catch(() => {});
      window.DevSkitsDesktop.notify("Copied note to clipboard", "ok");
    });


    container.querySelector("#fmt-bold").addEventListener("click", () => wrapSelection("**"));
    container.querySelector("#fmt-italic").addEventListener("click", () => wrapSelection("*"));
    container.querySelector("#fmt-upper").addEventListener("click", () => {
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      note.content = editor.value.toUpperCase();
      note.updatedAt = Date.now();
      editor.value = note.content;
      saveNotes(notes);
      status.textContent = `Last saved: ${new Date(note.updatedAt).toLocaleString()}`;
    });

    container.querySelector("#export-note").addEventListener("click", () => {
      const note = notes.find((n) => n.id === active);
      if (!note) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([note.content || ""], { type: "text/plain" }));
      a.download = note.name;
      a.click();
    });

    window.addEventListener("devskits:new-note", () => container.querySelector("#new-note").click());

    externalNoteHandler = (event) => {
      const detail = event.detail || {};
      if (!detail.name) return;
      const existing = notes.find((n) => n.sourcePath && n.sourcePath === detail.sourcePath);
      if (existing) {
        existing.content = detail.content || "";
        existing.updatedAt = Date.now();
        active = existing.id;
      } else {
        const id = `import-${Date.now()}`;
        notes.push({
          id,
          name: detail.name,
          content: detail.content || "",
          sourcePath: detail.sourcePath || "",
          updatedAt: Date.now()
        });
        active = id;
      }
      saveNotes(notes);
      drawList();
      editor.focus();
      window.DevSkitsDesktop.notify(`Opened ${detail.name} in Notes`, "ok");
    };

    window.addEventListener("devskits:open-note-file", externalNoteHandler);

    container.addEventListener("DOMNodeRemoved", () => {
      if (!container.isConnected && externalNoteHandler) {
        window.removeEventListener("devskits:open-note-file", externalNoteHandler);
      }
    });

    drawList();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.notes = render;
})();
