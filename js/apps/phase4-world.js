(() => {
  const W = window.DevSkitsWorld;
  const APPS = window.DevSkitsState.APPS;

  function routePage(route) {
    const node = W.pages[route];
    if (!node) return "<h3>404 // route not found</h3>";
    if (!W.canAccessRoute(route)) return `<h3>LOCKED NODE</h3><p>Install package: ${node.lock}</p>`;
    const links = (node.links || []).map((l) => `<a href="#" data-route="${l}">${l}</a>`).join("<br>");
    return `<div class="retro-web"><h3>${node.title}</h3><p>${node.body}</p>${node.appLink ? `<p><button class="link-btn" data-open-app="${node.appLink}">Open ${APPS[node.appLink]?.title || node.appLink}</button></p>` : ""}${links ? `<div class="retro-links"><strong>Local links</strong><br>${links}</div>` : ""}</div>`;
  }

  function renderBrowser(container, options = {}) {
    let history = [];
    let pointer = -1;
    const initial = options.route || "devskits://home";
    container.innerHTML = `<div class="navigator-shell"><div class="navigator-bar"><button id="nav-back">◀</button><button id="nav-forward">▶</button><button id="nav-reload">↺</button><input id="nav-url" value="${initial}"/><button id="nav-go">Go</button></div><article id="nav-page" class="browser-page"></article></div>`;
    const page = container.querySelector("#nav-page");
    const url = container.querySelector("#nav-url");

    function openRoute(route, push = true) {
      if (/^https?:\/\//i.test(route)) return window.open(route, "_blank", "noopener");
      page.innerHTML = routePage(route);
      url.value = route;
      if (push) {
        history = history.slice(0, pointer + 1);
        history.push(route);
        pointer = history.length - 1;
      }
      W.pushBrowserHistory(route);
      if (route.includes("hidden")) {
        const p = W.getProfile();
        p.hiddenPagesFound += 1;
        W.setProfile(p);
      }
    }

    container.addEventListener("click", (e) => {
      const route = e.target.dataset.route;
      const openApp = e.target.dataset.openApp;
      if (route) openRoute(route);
      if (openApp) window.DevSkitsWindowManager.openApp(openApp);
    });
    container.querySelector("#nav-go").addEventListener("click", () => openRoute(url.value.trim()));
    container.querySelector("#nav-back").addEventListener("click", () => { if (pointer > 0) openRoute(history[--pointer], false); });
    container.querySelector("#nav-forward").addEventListener("click", () => { if (pointer < history.length - 1) openRoute(history[++pointer], false); });
    container.querySelector("#nav-reload").addEventListener("click", () => openRoute(url.value.trim(), false));
    url.addEventListener("keydown", (e) => e.key === "Enter" && openRoute(url.value.trim()));
    openRoute(initial);
  }

  function renderInbox(container) {
    const folders = ["Inbox", "Sent", "Drafts", "Archive", "System", "Alerts"];
    let activeFolder = "Inbox";
    let search = "";
    let messages = W.getInbox();
    let selected = messages.find((m) => m.folder === activeFolder)?.id;

    container.innerHTML = `<div class="inbox-shell"><aside class="inbox-folders"></aside><section><div class="badges"><button class="link-btn" id="compose-msg">Compose</button><button class="link-btn" id="save-draft">Save Draft</button><input id="msg-search" class="start-search" placeholder="Search messages"/></div><div class="inbox-main"><div class="inbox-list"></div><article class="inbox-detail"></article></div></section></div>`;
    const fWrap = container.querySelector(".inbox-folders");
    const list = container.querySelector(".inbox-list");
    const detail = container.querySelector(".inbox-detail");

    function rowsForFolder() {
      return messages.filter((m) => m.folder === activeFolder && (`${m.subject} ${m.from} ${m.body}`).toLowerCase().includes(search));
    }

    function drawFolders() {
      fWrap.innerHTML = folders.map((f) => `<button class="task-btn ${f === activeFolder ? "active" : ""}" data-folder="${f}">${f}</button>`).join("");
    }

    function drawList() {
      const rows = rowsForFolder();
      list.innerHTML = rows.map((m) => `<button class="task-btn ${m.id === selected ? "active" : ""}" data-id="${m.id}"><strong>${m.subject}</strong><small>${m.from}${m.read ? "" : " · new"}</small></button>`).join("") || "<em>No messages.</em>";
      drawDetail();
    }

    function drawDetail() {
      const msg = messages.find((m) => m.id === selected);
      if (!msg) return void (detail.innerHTML = "<h4>Select a message</h4>");
      msg.read = true;
      W.setInbox(messages);
      const thread = messages.filter((m) => m.threadId === msg.threadId).sort((a, b) => a.createdAt - b.createdAt);
      detail.innerHTML = `<h4>${msg.subject}</h4><p><strong>Thread:</strong> ${msg.threadId}</p>${thread.map((t) => `<div class="note-row"><span>${new Date(t.createdAt).toLocaleString()} ${t.from}</span></div><pre>${t.body || ""}</pre>`).join("")}<div class="badges"><button class="link-btn" data-reply="${msg.threadId}">Reply</button>${msg.link ? `<button class="link-btn" data-link="${msg.link}">Open linked route</button>` : ""}</div>`;
    }

    fWrap.addEventListener("click", (e) => {
      if (!e.target.dataset.folder) return;
      activeFolder = e.target.dataset.folder;
      selected = rowsForFolder()[0]?.id;
      drawFolders();
      drawList();
    });
    list.addEventListener("click", (e) => { const id = e.target.closest("button")?.dataset.id; if (id) { selected = id; drawList(); W.trackActivity("message", `read ${id}`); } });
    container.querySelector("#msg-search").addEventListener("input", (e) => { search = e.target.value.toLowerCase(); drawList(); });
    detail.addEventListener("click", (e) => {
      if (e.target.dataset.link) window.DevSkitsWindowManager.openApp("browser", { route: e.target.dataset.link });
      if (e.target.dataset.reply) {
        const base = messages.find((m) => m.threadId === e.target.dataset.reply);
        W.pushInbox({ folder: "Sent", threadId: e.target.dataset.reply, from: "operator@local", to: base?.from || "system", subject: `RE: ${base?.subject || "thread"}`, body: "Acknowledged. Keeping systems online." });
        messages = W.getInbox();
        drawList();
      }
    });

    container.querySelector("#compose-msg").addEventListener("click", () => {
      detail.innerHTML = `<h4>Compose Draft</h4><input id="draft-subject" class="start-search" placeholder="Subject"/><textarea id="draft-body" class="notes-editor" style="height:150px"></textarea>`;
      activeFolder = "Drafts";
      drawFolders();
    });
    container.querySelector("#save-draft").addEventListener("click", () => {
      const subject = detail.querySelector("#draft-subject")?.value?.trim();
      if (!subject) return;
      W.pushInbox({ folder: "Drafts", threadId: `th-draft-${Date.now()}`, from: "operator@local", subject, body: detail.querySelector("#draft-body")?.value || "" });
      messages = W.getInbox();
      selected = messages[0]?.id;
      drawList();
      W.pushNotification("Draft saved", "info");
    });

    drawFolders();
    drawList();
  }

  function renderBuildLog(container) {
    const rows = W.getChangelog();
    container.innerHTML = `<h3>Build Timeline</h3>${rows.map((r) => `<section class="project-card timeline-card"><div><strong>${r.version}</strong> / ${r.build} <small>${r.timestamp}</small></div><h4>${r.title}</h4><p>${r.body}</p><div class="badges">${(r.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}</div></section>`).join("")}`;
  }

  function renderPackages(container) {
    const defs = W.packageDefs;
    container.innerHTML = `<h3>Install Center</h3><div id="pkg-list" class="app-grid"></div>`;
    const list = container.querySelector("#pkg-list");
    function draw() {
      const installed = W.getPackages();
      list.innerHTML = Object.entries(defs).map(([id, p]) => `<div class="project-card"><strong>${p.title}</strong><p>${p.unlocks.join(", ")}</p><button class="link-btn" data-install="${id}" ${installed[id] ? "disabled" : ""}>${installed[id] ? "Installed" : "Install"}</button></div>`).join("");
    }
    list.addEventListener("click", (e) => {
      if (!e.target.dataset.install) return;
      W.installPackage(e.target.dataset.install);
      draw();
    });
    draw();
  }

  function renderMediaDeck(container) {
    const rows = W.getMediaLibrary();
    container.innerHTML = `<div class="media-shell"><div class="files-list">${rows.map((r) => `<div class="note-row">${r.title}</div>`).join("") || "<em>Media archive empty</em>"}</div><section class="project-card"><h4>Media Deck</h4><p>No audio/video payload included in static build. This is a placeholder archive panel.</p></section></div>`;
  }

  function renderAchievements(container) {
    const hits = W.getAchievements();
    container.innerHTML = `<h3>Discovery Log</h3>${Object.entries(hits).map(([id, row]) => `<div class="note-row">[✓] ${id} <small>${new Date(row.at).toLocaleString()}</small></div>`).join("") || "<em>No discoveries yet.</em>"}`;
  }

  function renderRecycle(container) {
    container.innerHTML = `<div class="badges"><button class="link-btn" id="bin-empty">Empty Bin</button></div><div id="bin-list"></div>`;
    function draw() {
      const rows = W.getRecycle();
      container.querySelector("#bin-list").innerHTML = rows.map((r, i) => `<div class="note-row"><strong>${r.name}</strong><button class="link-btn" data-restore="${i}">Restore</button></div>`).join("") || "<em>Recycle Bin is empty.</em>";
    }
    container.addEventListener("click", (e) => {
      if (e.target.id === "bin-empty") { W.setRecycle([]); draw(); }
      if (e.target.dataset.restore) {
        const rows = W.getRecycle();
        rows.splice(Number(e.target.dataset.restore), 1);
        W.setRecycle(rows);
        draw();
      }
    });
    draw();
  }

  function renderNetworkMap(container) {
    const services = W.getServices();
    container.innerHTML = `<h3>Network Map</h3><div class="files-list">${Object.keys(W.pages).map((r) => `<button class="task-btn" data-open="${r}">${W.canAccessRoute(r) ? "●" : "○"} ${r}</button>`).join("")}</div><h4>Presence</h4><pre>${Object.keys(services).map((id) => `${services[id] ? "online" : "offline"} :: ${id}`).join("\n")}</pre>`;
    container.addEventListener("click", (e) => { if (e.target.dataset.open) window.DevSkitsWindowManager.openApp("browser", { route: e.target.dataset.open }); });
  }

  function renderSearch(container) {
    container.innerHTML = `<div class="badges"><input id="search-everywhere" class="start-search" placeholder="Search apps, files, notes, messages, logs..."/><button class="link-btn" id="reindex">Reindex</button></div><div id="index-meta"></div><div class="files-list" id="search-results"></div>`;
    const input = container.querySelector("#search-everywhere");
    const list = container.querySelector("#search-results");
    const meta = container.querySelector("#index-meta");
    function draw(q = "") {
      const status = W.getIndexStatus();
      meta.innerHTML = `<small>Indexed: apps ${status.counts.apps || 0}, notes ${status.counts.notes || 0}, messages ${status.counts.messages || 0}, logs ${status.counts.logs || 0}</small>`;
      const hits = W.searchEverything(q);
      list.innerHTML = hits.map((h) => `<button class="task-btn" data-type="${h.type}" data-target="${h.target}">[${h.type}] ${h.label.slice(0, 80)}</button>`).join("") || "<em>No matches.</em>";
    }
    input.addEventListener("input", () => draw(input.value));
    container.querySelector("#reindex").addEventListener("click", () => { W.reindex(); draw(input.value); });
    list.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-type]"); if (!b) return;
      if (b.dataset.type === "app") window.DevSkitsWindowManager.openApp(b.dataset.target);
      if (b.dataset.type === "page") window.DevSkitsWindowManager.openApp("browser", { route: b.dataset.target });
      if (b.dataset.type === "note") window.DevSkitsWindowManager.openApp("notes");
      if (b.dataset.type === "message") window.DevSkitsWindowManager.openApp("inbox");
      if (b.dataset.type === "log") window.DevSkitsWindowManager.openApp("syslogs");
    });
    draw();
  }

  function renderLokiGame(container) {
    let score = 0;
    container.innerHTML = `<p>Find Loki's hidden treat. Score: <span id="loki-score">0</span></p><div class="loki-grid"></div>`;
    const grid = container.querySelector(".loki-grid");
    const scoreEl = container.querySelector("#loki-score");
    function round() {
      const hit = Math.floor(Math.random() * 9);
      grid.innerHTML = Array.from({ length: 9 }).map((_, i) => `<button class="task-btn" data-i="${i}">${i === hit ? "?" : "·"}</button>`).join("");
      grid.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
        if (Number(b.dataset.i) === hit) score += 1;
        scoreEl.textContent = String(score);
        round();
      }));
    }
    round();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  Object.assign(window.DevSkitsAppRegistry, {
    browser: renderBrowser,
    inbox: renderInbox,
    buildlog: renderBuildLog,
    mediadeck: renderMediaDeck,
    packages: renderPackages,
    achievements: renderAchievements,
    recycle: renderRecycle,
    networkmap: renderNetworkMap,
    lokigame: renderLokiGame,
    search: renderSearch
  });
})();
