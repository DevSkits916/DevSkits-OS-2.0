(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    let drafts = W().getDrafts();
    let activeId = drafts[0]?.id || null;

    container.innerHTML = `
      <div class="badges">
        <button class="link-btn" id="draft-new">New Draft</button>
        <button class="link-btn" id="draft-to-notes">Send To Notes</button>
      </div>
      <textarea class="notes-editor"></textarea>
      <div class="files-list" id="draft-list"></div>
    `;

    const editor = container.querySelector("textarea");
    const list = container.querySelector("#draft-list");

    function persist() {
      W().setDrafts(drafts);
    }

    function draw() {
      list.innerHTML = drafts.map((draft) => `<button class="task-btn" data-id="${draft.id}">${draft.title}</button>`).join("") || "<em>No drafts saved.</em>";
      const activeDraft = drafts.find((draft) => draft.id === activeId);
      editor.value = activeDraft?.body || "";
    }

    container.querySelector("#draft-new").addEventListener("click", () => {
      const draft = { id: `d-${Date.now()}`, title: `draft-${drafts.length + 1}`, body: "" };
      drafts.unshift(draft);
      activeId = draft.id;
      persist();
      draw();
    });

    list.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      if (!id) return;
      activeId = id;
      draw();
    });

    editor.addEventListener("input", () => {
      const activeDraft = drafts.find((draft) => draft.id === activeId);
      if (!activeDraft) return;
      activeDraft.body = editor.value;
      persist();
    });

    container.querySelector("#draft-to-notes").addEventListener("click", () => {
      const activeDraft = drafts.find((draft) => draft.id === activeId);
      if (!activeDraft) return;
      const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]");
      notes.push({ id: `note-${Date.now()}`, name: `${activeDraft.title}.txt`, content: activeDraft.body });
      localStorage.setItem("devskits-notes-v2", JSON.stringify(notes));
      window.DevSkitsDesktop.notify("Draft sent to Notes");
    });

    draw();
  }

  registerApp("draftpad", render, ["draft-pad"]);
})();
