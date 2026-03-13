(() => {
  const W = window.DevSkitsWorld;

  function addShortcut(label, type, target, icon = "◫") {
    const rows = W.getShortcuts();
    rows.push({ id: `sc-${Date.now()}`, label, type, target, icon });
    W.setShortcuts(rows);
    window.DevSkitsDesktop.buildDesktopIcons();
  }

  function renderBrowser(container, options = {}) {
    const routes = Object.keys(W.pages);
    const initial = options.route || "devskits://home";
    container.innerHTML = `<div class="badges"><input id="browser-url" value="${initial}"/><button class="link-btn" id="browser-go">Go</button><button class="link-btn" id="browser-shortcut">Create Shortcut</button></div><div class="files-list" id="browser-nav">${routes.map((r) => `<button class="task-btn" data-route="${r}">${r}</button>`).join("")}</div><article class="browser-page" id="browser-page"></article>`;
    const url = container.querySelector("#browser-url");
    const page = container.querySelector("#browser-page");
    function openRoute(route) {
      const node = W.pages[route];
      if (!node) { page.innerHTML = "<h3>404 node missing</h3>"; return; }
      if (!W.canAccessRoute(route)) { page.innerHTML = `<h3>LOCKED</h3><p>Install ${node.lock}</p>`; return; }
      if (route.includes("secrets")) W.award("first_secret");
      if (route.includes("loki")) W.award("loki_hunter");
      page.innerHTML = `<h3>${node.title}</h3><p>${node.body}</p>`;
      url.value = route;
    }
    container.querySelector("#browser-go").addEventListener("click", () => openRoute(url.value.trim()));
    container.querySelector("#browser-nav").addEventListener("click", (e) => e.target.dataset.route && openRoute(e.target.dataset.route));
    container.querySelector("#browser-shortcut").addEventListener("click", () => addShortcut(url.value, "route", url.value, "⌂"));
    openRoute(initial);
  }

  function renderPackages(container) {
    const defs = W.packageDefs;
    container.innerHTML = `<h3>Install Center</h3><div id="pkg-list"></div>`;
    function draw() {
      const installed = W.getPackages();
      container.querySelector("#pkg-list").innerHTML = Object.entries(defs).map(([id, pkg]) => `<div class="note-row"><strong>${pkg.title}</strong> <small>${pkg.unlocks.join(", ")}</small> <button class="link-btn" data-id="${id}">${installed[id] ? "Installed" : "Install"}</button></div>`).join("");
    }
    container.addEventListener("click", (e) => {
      const id = e.target.dataset.id; if (!id || W.isInstalled(id)) return;
      W.installPackage(id);
      window.DevSkitsDesktop.notify(`Installed ${defs[id].title}`);
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
    const apps = Object.entries(window.DevSkitsState.APPS).map(([id, app]) => ({ type: "app", label: app.title, target: id }));
    const pages = Object.keys(W.pages).map((route) => ({ type: "page", label: route, target: route }));
    const files = ["C:\\DEVSKITS", "C:\\DEVSKITS\\PROJECTS", "C:\\DEVSKITS\\LOKI", "C:\\DEVSKITS\\NOTES"].flatMap((path) => {
      const rows = window.DevSkitsFS.list(path) || [];
      return rows.map((r) => ({ type: "file", label: `${path}\\${r.name}`, target: `${path}\\${r.name}` }));
    });
    const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").map((n) => ({ type: "note", label: n.name, target: n.id }));
    const projects = (window.DevSkitsProjects || []).map((p) => ({ type: "project", label: p.name, target: p.name }));
    const inbox = [{ type: "inbox", label: "Inbox: Phase 4 help thread", target: "devskits://inbox-help" }];
    return [...apps, ...pages, ...files, ...notes, ...projects, ...inbox];
  }

  function renderSearch(container) {
    container.innerHTML = `<div class="badges"><input id="search-everywhere" placeholder="Search apps, pages, files, notes..."/></div><div class="files-list" id="search-results"></div>`;
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
      else if (t === "page" || t === "inbox") window.DevSkitsWindowManager.openApp("browser", { route: target });
      else if (t === "project") window.DevSkitsWindowManager.openApp("projects", { focusProject: target });
      else if (t === "note") window.DevSkitsWindowManager.openApp("notes");
      else if (t === "file") alert(window.DevSkitsFS.getNode(target)?.content || target);
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
    packages: renderPackages,
    achievements: renderAchievements,
    recycle: renderRecycle,
    networkmap: renderNetworkMap,
    lokigame: renderLokiGame,
    search: renderSearch
  });
})();
