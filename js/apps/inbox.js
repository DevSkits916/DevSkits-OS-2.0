(() => {
  const { state, setInboxMessages, setInboxDrafts, addActivity } = window.DevSkitsState;
  const folders = ["Inbox", "Sent", "Drafts", "Archive", "System"];

  function byFolder(folder) {
    return state.inboxMessages.filter((m) => m.folder === folder);
  }

  function render(container) {
    let activeFolder = "Inbox";
    let activeMessage = byFolder(activeFolder)[0]?.id;

    container.innerHTML = `
      <div class="inbox-shell">
        <aside class="inbox-folders"></aside>
        <section class="inbox-list-pane"><div class="inbox-controls"><button class="link-btn" id="compose-btn">Compose</button></div><div class="inbox-list"></div></section>
        <section class="inbox-detail"><div class="inbox-placeholder">Select a message.</div></section>
      </div>`;

    const folderEl = container.querySelector(".inbox-folders");
    const listEl = container.querySelector(".inbox-list");
    const detailEl = container.querySelector(".inbox-detail");

    function drawFolders() {
      folderEl.innerHTML = folders.map((folder) => `<button class="task-btn ${folder === activeFolder ? "active" : ""}" data-folder="${folder}">${folder} <small>(${byFolder(folder).length})</small></button>`).join("");
    }

    function drawList() {
      const items = byFolder(activeFolder);
      if (!items.length) {
        listEl.innerHTML = '<p class="inbox-empty">No messages.</p>';
        detailEl.innerHTML = '<div class="inbox-placeholder">Folder is empty.</div>';
        return;
      }
      if (!items.some((m) => m.id === activeMessage)) activeMessage = items[0].id;
      listEl.innerHTML = items.map((msg) => `<button class="inbox-item ${msg.id === activeMessage ? "active" : ""}" data-id="${msg.id}"><b>${msg.subject}</b><small>${msg.from}</small><small>${msg.timestamp}</small></button>`).join("");
      drawDetail();
    }

    function drawDetail() {
      const msg = state.inboxMessages.find((item) => item.id === activeMessage);
      if (!msg) return;
      detailEl.innerHTML = `
        <article>
          <h3>${msg.subject}</h3>
          <p><b>From:</b> ${msg.from}<br/><b>Folder:</b> ${msg.folder}<br/><b>Time:</b> ${msg.timestamp}</p>
          <pre class="mail-body">${msg.body}</pre>
          <div class="badges">${(msg.links || []).map((l) => `<button class="link-btn" data-link="${l}">${l}</button>`).join("")}</div>
        </article>`;
      addActivity("mail-open", `${msg.folder}: ${msg.subject}`);
    }

    function saveDraft() {
      const subject = prompt("Draft subject", "Draft note");
      if (!subject) return;
      const body = prompt("Draft body", "");
      const draft = {
        id: `draft-${Date.now()}`,
        folder: "Drafts",
        from: "you@devskits.os",
        subject,
        body: body || "",
        timestamp: new Date().toLocaleString(),
        links: []
      };
      const messages = [draft, ...state.inboxMessages];
      setInboxMessages(messages);
      setInboxDrafts([draft, ...state.inboxDrafts].slice(0, 20));
      activeFolder = "Drafts";
      activeMessage = draft.id;
      drawFolders();
      drawList();
      window.DevSkitsDesktop.notify("Draft saved in Inbox");
      addActivity("mail-draft", subject);
    }

    folderEl.addEventListener("click", (e) => {
      const folder = e.target.closest("[data-folder]")?.dataset.folder;
      if (!folder) return;
      activeFolder = folder;
      activeMessage = byFolder(folder)[0]?.id;
      drawFolders();
      drawList();
    });

    listEl.addEventListener("click", (e) => {
      const id = e.target.closest("[data-id]")?.dataset.id;
      if (!id) return;
      activeMessage = id;
      drawList();
    });

    detailEl.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]")?.dataset.link;
      if (!link) return;
      if (link.startsWith("devskits://")) window.DevSkitsWindowManager.openApp("browser", { url: link });
      if (link.startsWith("app:")) window.DevSkitsWindowManager.openApp(link.replace("app:", ""));
    });

    container.querySelector("#compose-btn").addEventListener("click", saveDraft);
    drawFolders();
    drawList();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.inbox = render;
})();
