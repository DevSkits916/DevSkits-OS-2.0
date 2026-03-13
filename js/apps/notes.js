(() => {
  const KEY = "devskits-notes-v2";
  function loadNotes() {
    return JSON.parse(localStorage.getItem(KEY) || '[{"id":"note-1","name":"notes.txt","content":""}]');
  }

  function saveNotes(notes) {
    localStorage.setItem(KEY, JSON.stringify(notes));
  }

  function render(container) {
    let notes = loadNotes();
    let active = notes[0]?.id;

    container.innerHTML = `<div class="notes-shell"><aside class="notes-list"></aside><section><div class="badges"><button class="link-btn" id="new-note">New</button><button class="link-btn" id="rename-note">Rename</button><button class="link-btn" id="delete-note">Delete</button></div><textarea class="notes-editor"></textarea></section></div>`;
    const list = container.querySelector(".notes-list");
    const editor = container.querySelector(".notes-editor");

    function drawList() {
      list.innerHTML = notes.map((n) => `<button class="task-btn ${n.id === active ? "active" : ""}" data-id="${n.id}">${n.name}</button>`).join("");
      const current = notes.find((n) => n.id === active);
      editor.value = current?.content || "";
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
    });

    container.querySelector("#new-note").addEventListener("click", () => {
      const name = `note-${notes.length + 1}.txt`;
      const id = `note-${Date.now()}`;
      notes.push({ id, name, content: "" });
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
      notes = notes.filter((n) => n.id !== active);
      active = notes[0].id;
      saveNotes(notes);
      drawList();
    });

    window.addEventListener("devskits:new-note", () => container.querySelector("#new-note").click());

    drawList();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.notes = render;
})();
