(() => {
  const W = window.DevSkitsWorld;
  const APPS = window.DevSkitsState.APPS;

  function addShortcut(label, type, target, icon = "◫") {
    const rows = W.getShortcuts();
    rows.push({ id: `sc-${Date.now()}`, label, type, target, icon });
    W.setShortcuts(rows);
    window.DevSkitsDesktop.buildDesktopIcons();
    window.DevSkitsDesktop.notify(`Shortcut created: ${label}`);
  }

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

    container.innerHTML = `<div class="navigator-shell"><div class="navigator-bar"><button id="nav-back">◀</button><button id="nav-forward">▶</button><button id="nav-reload">↺</button><input id="nav-url" value="${initial}" aria-label="Navigator URL"/><button id="nav-go">Go</button></div><article id="nav-page" class="browser-page"></article></div>`;
    const page = container.querySelector("#nav-page");
    const url = container.querySelector("#nav-url");

    function openRoute(route, push = true) {
      if (/^https?:\/\//i.test(route)) {
        window.open(route, "_blank", "noopener");
        return;
      }
      page.innerHTML = routePage(route);
      url.value = route;
      if (push) {
        history = history.slice(0, pointer + 1);
        history.push(route);
        pointer = history.length - 1;
      }
      W.pushBrowserHistory(route);
    }

    container.addEventListener("click", (e) => {
      const route = e.target.dataset.route;
      const openApp = e.target.dataset.openApp;
      if (route) openRoute(route);
      if (openApp) window.DevSkitsWindowManager.openApp(openApp);
    });

    container.querySelector("#nav-go").addEventListener("click", () => openRoute(url.value.trim()));
    container.querySelector("#nav-back").addEventListener("click", () => {
      if (pointer <= 0) return;
      pointer -= 1;
      openRoute(history[pointer], false);
    });
    container.querySelector("#nav-forward").addEventListener("click", () => {
      if (pointer >= history.length - 1) return;
      pointer += 1;
      openRoute(history[pointer], false);
    });
    container.querySelector("#nav-reload").addEventListener("click", () => openRoute(url.value.trim(), false));
    url.addEventListener("keydown", (e) => e.key === "Enter" && openRoute(url.value.trim()));
    openRoute(initial);
  }

  function renderInbox(container) {
    const folders = ["Inbox", "Sent", "Drafts", "Archive", "System"];
    let activeFolder = "Inbox";
    let messages = W.getInbox();
    let selected = messages.find((m) => m.folder === activeFolder)?.id;

    container.innerHTML = `<div class="inbox-shell"><aside class="inbox-folders"></aside><section><div class="badges"><button class="link-btn" id="compose-msg">Compose</button><button class="link-btn" id="save-draft">Save Draft</button></div><div class="inbox-main"><div class="inbox-list"></div><article class="inbox-detail"></article></div></section></div>`;
    const fWrap = container.querySelector(".inbox-folders");
    const list = container.querySelector(".inbox-list");
    const detail = container.querySelector(".inbox-detail");

    function drawFolders() {
      fWrap.innerHTML = folders.map((f) => `<button class="task-btn ${f === activeFolder ? "active" : ""}" data-folder="${f}">${f}</button>`).join("");
    }

    function drawList() {
      const rows = messages.filter((m) => m.folder === activeFolder);
      if (!rows.length) list.innerHTML = "<em>No messages.</em>";
      else list.innerHTML = rows.map((m) => `<button class="task-btn ${m.id === selected ? "active" : ""}" data-id="${m.id}"><strong>${m.subject}</strong><small>${m.from}</small></button>`).join("");
      drawDetail();
    }

    function drawDetail() {
      const msg = messages.find((m) => m.id === selected);
      if (!msg) {
        detail.innerHTML = "<h4>Select a message</h4>";
        return;
      }
      detail.innerHTML = `<h4>${msg.subject}</h4><p><strong>From:</strong> ${msg.from}</p><pre>${msg.body || ""}</pre>${msg.link ? `<button class="link-btn" data-link="${msg.link}">Open linked route</button>` : ""}`;
    }

    fWrap.addEventListener("click", (e) => {
      const folder = e.target.dataset.folder;
      if (!folder) return;
      activeFolder = folder;
      selected = messages.find((m) => m.folder === activeFolder)?.id;
      drawFolders();
      drawList();
    });

    list.addEventListener("click", (e) => {
      const id = e.target.closest("button")?.dataset.id;
      if (!id) return;
      selected = id;
      drawList();
    });

    detail.addEventListener("click", (e) => {
      if (!e.target.dataset.link) return;
      window.DevSkitsWindowManager.openApp("browser", { route: e.target.dataset.link });
    });

    container.querySelector("#compose-msg").addEventListener("click", () => {
      detail.innerHTML = `<h4>Compose Draft</h4><input id="draft-subject" placeholder="Subject"/><textarea id="draft-body" class="notes-editor" style="height:180px"></textarea>`;
      activeFolder = "Drafts";
      drawFolders();
    });

    container.querySelector("#save-draft").addEventListener("click", () => {
      const subject = detail.querySelector("#draft-subject")?.value?.trim() || "Untitled draft";
      const body = detail.querySelector("#draft-body")?.value?.trim() || "";
      if (!detail.querySelector("#draft-subject")) return window.DevSkitsDesktop.notify("Open Compose first");
      const msg = { id: `msg-${Date.now()}`, folder: "Drafts", from: "me@devskits.os", subject, body, createdAt: Date.now() };
      messages.unshift(msg);
      W.setInbox(messages);
      W.trackActivity("draft", `saved ${subject}`);
      window.DevSkitsDesktop.notify("Draft saved to Inbox");
      selected = msg.id;
      drawList();
    });

    drawFolders();
    drawList();
  }

  function renderBuildLog(container) {
    let mode = "timeline";
    const entries = W.getChangelog();
    container.innerHTML = `<div class="badges"><button class="link-btn" data-mode="timeline">Timeline</button><button class="link-btn" data-mode="list">List</button></div><div id="buildlog-body"></div>`;
    const body = container.querySelector("#buildlog-body");
    function draw() {
      body.innerHTML = entries.map((e) => `<article class="project-card ${mode === "timeline" ? "timeline-card" : ""}"><h4>${e.version} :: ${e.title}</h4><p>${e.build} | ${e.timestamp}</p><div class="badges">${e.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div><p>${e.body}</p></article>`).join("");
    }
    container.addEventListener("click", (e) => {
      if (!e.target.dataset.mode) return;
      mode = e.target.dataset.mode;
      draw();
    });
    draw();
  }

  function renderPackages(container) {
    container.innerHTML = `<h3>Install Center / DevPkg</h3><div id="pkg-list"></div>`;
    const list = container.querySelector("#pkg-list");
    function draw() {
      const installed = W.getPackages();
      list.innerHTML = Object.entries(W.packageDefs).map(([id, pkg]) => `<div class="note-row"><strong>${pkg.title}</strong><small>${pkg.unlocks.join(", ")}</small><button class="link-btn" data-id="${id}">${installed[id] ? "Installed" : "Install"}</button></div>`).join("");
    }
    list.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id || W.isInstalled(id)) return;
      W.installPackage(id);
      window.DevSkitsDesktop.notify(`Package installed: ${W.packageDefs[id].title}`);
      draw();
    });
    draw();
  }

  function renderMediaDeck(container) {
    const rows = W.getMediaLibrary();
    let selected = rows[0]?.id;
    container.innerHTML = `<div class="media-shell"><div class="files-list" id="media-list"></div><section class="project-card" id="media-preview"></section></div>`;
    const list = container.querySelector("#media-list");
    const preview = container.querySelector("#media-preview");
    function draw() {
      list.innerHTML = rows.map((r) => `<button class="task-btn ${r.id === selected ? "active" : ""}" data-id="${r.id}">${r.type} :: ${r.title}</button>`).join("");
      const item = rows.find((r) => r.id === selected);
      if (!item) return;
      preview.innerHTML = `<h4>${item.title}</h4><p>${item.details}</p><div class="media-canvas">PREVIEW</div><p>${item.preview}</p><div class="badges"><button class="link-btn">⏮</button><button class="link-btn">▶</button><button class="link-btn">⏭</button></div>`;
    }
    list.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (!id) return;
      selected = id;
      draw();
    });
    draw();
  }

  function renderAchievements(container) {
    const defs = W.achievementDefs;
    const hits = W.getAchievements();
    container.innerHTML = `<h3>Discovery Log</h3>${Object.entries(defs).map(([id, label]) => `<div class="note-row">${hits[id] ? "[✓]" : "[ ]"} ${label}</div>`).join("")}`;
  }

  function renderRecycle(container) {
    container.innerHTML = `<div class="badges"><button class="link-btn" id="bin-empty">Empty Bin</button></div><div id="bin-list"></div>`;
    function draw() {
      const rows = W.getRecycle();
      container.querySelector("#bin-list").innerHTML = rows.map((r, i) => `<div class="note-row"><strong>${r.name}</strong> <small>${r.source}</small> <button class="link-btn" data-restore="${i}">Restore</button></div>`).join("") || "<em>Recycle Bin is empty.</em>";
    }
    container.addEventListener("click", (e) => {
      if (e.target.id === "bin-empty") { W.setRecycle([]); draw(); }
      if (e.target.dataset.restore) {
        const idx = Number(e.target.dataset.restore);
        const rows = W.getRecycle();
        const item = rows[idx];
        if (item?.source === "notes") {
          const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]");
          notes.push(item.payload); localStorage.setItem("devskits-notes-v2", JSON.stringify(notes));
        }
        rows.splice(idx, 1); W.setRecycle(rows); W.award("restore_op"); draw();
      }
    });
    draw();
  }

  function renderNetworkMap(container) {
    const pkgs = W.getPackages();
    container.innerHTML = `<h3>Network Map</h3><div class="files-list">${Object.keys(W.pages).map((r) => `<button class="task-btn" data-open="${r}">${W.canAccessRoute(r) ? "●" : "○"} ${r}</button>`).join("")}</div><h4>Installed Packages</h4><pre>${Object.keys(pkgs).filter((k) => pkgs[k]).join("\n") || "none"}</pre>`;
    container.addEventListener("click", (e) => { if (e.target.dataset.open) window.DevSkitsWindowManager.openApp("browser", { route: e.target.dataset.open }); });
  }

  function getSearchIndex() {
    const apps = Object.entries(APPS).map(([id, app]) => ({ type: "app", label: app.title, target: id }));
    const pages = Object.keys(W.pages).map((route) => ({ type: "page", label: route, target: route }));
    const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").map((n) => ({ type: "note", label: n.name, target: n.id }));
    const projects = (window.DevSkitsProjects || []).map((p) => ({ type: "project", label: p.name, target: p.name }));
    return [...apps, ...pages, ...notes, ...projects];
  }

  function renderSearch(container) {
    container.innerHTML = `<div class="badges"><input id="search-everywhere" placeholder="Search apps, pages, notes, projects..."/></div><div class="files-list" id="search-results"></div>`;
    const input = container.querySelector("#search-everywhere");
    const list = container.querySelector("#search-results");
    const index = getSearchIndex();
    function draw(q = "") {
      const hits = index.filter((row) => `${row.type} ${row.label}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
      list.innerHTML = hits.map((h) => `<button class="task-btn" data-type="${h.type}" data-target="${h.target}">[${h.type}] ${h.label}</button>`).join("") || "<em>No matches.</em>";
    }
    input.addEventListener("input", () => draw(input.value));
    list.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-type]"); if (!b) return;
      const t = b.dataset.type; const target = b.dataset.target;
      if (t === "app") window.DevSkitsWindowManager.openApp(target);
      else if (t === "page") window.DevSkitsWindowManager.openApp("browser", { route: target });
      else if (t === "project") window.DevSkitsWindowManager.openApp("projects", { focusProject: target });
      else if (t === "note") window.DevSkitsWindowManager.openApp("notes");
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
