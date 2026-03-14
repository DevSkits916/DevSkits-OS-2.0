(() => {
  const FS_KEY = "devskits-explorer-fs-v1";
  const VIEW_KEY = "devskits-explorer-view-v1";
  const LAST_PATH_KEY = "devskits-explorer-last-path-v1";
  const CLIPBOARD_KEY = "devskits-explorer-clipboard-v1";
  const dateText = () => new Date().toLocaleString();

  const ICONS = {
    folder: "📁",
    text: "📄",
    shortcut: "↪",
    app: "🪟",
    link: "🌐",
    system: "🖴"
  };

  function makeId(prefix = "item") {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
  }

  function typeLabel(type) {
    return {
      folder: "File Folder",
      text: "Text Document",
      shortcut: "Shortcut",
      app: "Application Launcher",
      link: "Internet Shortcut",
      system: "System Item"
    }[type] || "Item";
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function seedFs() {
    const now = dateText();
    const base = {
      tree: {
        id: "this-pc",
        name: "This PC",
        type: "folder",
        path: "This PC",
        modified: now,
        children: [
          { id: "desktop", name: "Desktop", type: "folder", modified: now, children: [
            { id: "desk-shortcut-contact", name: "Contact.lnk", type: "shortcut", targetPath: "This PC/Contact Info", modified: now },
            { id: "desk-terminal", name: "Terminal", type: "app", app: "terminal", modified: now },
            { id: "desk-readme", name: "readme.txt", type: "text", content: "Welcome to DevSkits File Explorer!", size: 84, modified: now }
          ]},
          { id: "documents", name: "Documents", type: "folder", modified: now, children: [
            { id: "doc-welcome", name: "welcome.txt", type: "text", content: "Welcome to DevSkits OS 3.1", size: 64, modified: now },
            { id: "doc-roadmap", name: "roadmap.txt", type: "text", content: "Improve, preserve, and extend.", size: 72, modified: now }
          ]},
          { id: "contact-info", name: "Contact Info", type: "folder", modified: now, children: [
            { id: "contact-app", name: "Open Contact Viewer", type: "app", app: "contact", modified: now },
            { id: "contact-github", name: "DevSkits GitHub", type: "link", href: "https://github.com/DevSkits916", modified: now }
          ]},
          { id: "projects", name: "DevSkits Projects", type: "folder", modified: now, children: [
            { id: "proj-app", name: "Projects", type: "app", app: "projects", modified: now },
            { id: "links-app", name: "Links", type: "app", app: "links", modified: now }
          ]},
          { id: "downloads", name: "Downloads", type: "folder", modified: now, children: [] },
          { id: "notes-folder", name: "Notes", type: "folder", modified: now, children: [
            { id: "notes-app", name: "Open Notes App", type: "app", app: "notes", modified: now }
          ]},
          { id: "system", name: "System", type: "folder", modified: now, children: [
            { id: "settings", name: "Settings", type: "app", app: "settings", modified: now },
            { id: "terminal", name: "Terminal", type: "app", app: "terminal", modified: now },
            { id: "local-disk", name: "Local Disk (C:)", type: "system", capacity: 128, used: 42, modified: now },
            { id: "dev-disk", name: "DevSkits Data (D:)", type: "system", capacity: 256, used: 118, modified: now }
          ]},
          { id: "recycle", name: "Recycle Bin", type: "folder", modified: now, systemFolder: true, children: [] }
        ]
      },
      trash: [],
      customByPath: {}
    };
    return base;
  }

  function loadFs() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FS_KEY) || "null");
      if (parsed?.tree?.children) return parsed;
    } catch (e) {
      // ignore
    }
    const seeded = seedFs();
    localStorage.setItem(FS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  function saveFs(state) {
    localStorage.setItem(FS_KEY, JSON.stringify(state));
  }

  function parsePath(path) {
    return (path || "This PC").split("/").filter(Boolean);
  }

  function pathString(parts) {
    return parts.join("/") || "This PC";
  }

  function flattenPaths(node, current = ["This PC"], out = []) {
    out.push(pathString(current));
    (node.children || []).filter((c) => c.type === "folder").forEach((child) => flattenPaths(child, [...current, child.name], out));
    return out;
  }

  function getNodeByPath(tree, path) {
    const parts = parsePath(path);
    if (parts[0] !== "This PC") return null;
    let node = tree;
    for (let i = 1; i < parts.length; i += 1) {
      node = (node.children || []).find((child) => child.name === parts[i] && child.type === "folder");
      if (!node) return null;
    }
    return node;
  }

  function getParentByPath(tree, path) {
    const parts = parsePath(path);
    if (parts.length <= 1) return null;
    return getNodeByPath(tree, pathString(parts.slice(0, -1)));
  }

  function findItemById(node, id, parent = null, current = ["This PC"]) {
    if (!node?.children) return null;
    for (const child of node.children) {
      const childPath = [...current, child.name];
      if (child.id === id) return { item: child, parent, path: childPath };
      if (child.type === "folder") {
        const found = findItemById(child, id, child, childPath);
        if (found) return found;
      }
    }
    return null;
  }

  function ensureUniqueName(folder, desired) {
    const existing = new Set((folder.children || []).map((it) => it.name.toLowerCase()));
    if (!existing.has(desired.toLowerCase())) return desired;
    const dot = desired.lastIndexOf(".");
    const stem = dot > 0 ? desired.slice(0, dot) : desired;
    const ext = dot > 0 ? desired.slice(dot) : "";
    let count = 2;
    let candidate = `${stem} (${count})${ext}`;
    while (existing.has(candidate.toLowerCase())) {
      count += 1;
      candidate = `${stem} (${count})${ext}`;
    }
    return candidate;
  }

  function fakeSize(item) {
    if (typeof item.size === "number") return `${item.size} KB`;
    if (item.type === "folder") return "—";
    if (item.type === "text") return `${Math.max(1, Math.ceil((item.content || "").length / 8))} KB`;
    return "4 KB";
  }

  function estimateUsage(fsState) {
    const all = [];
    function walk(node) {
      (node.children || []).forEach((child) => {
        all.push(child);
        if (child.type === "folder") walk(child);
      });
    }
    walk(fsState.tree);
    const used = 36 + all.reduce((sum, item) => sum + (item.type === "folder" ? 1 : Math.max(1, Math.ceil((item.content || "").length / 12))), 0);
    return {
      c: { used, capacity: 128 },
      d: { used: Math.max(24, Math.floor(used * 0.72)), capacity: 256 }
    };
  }

  function render(container, options = {}) {
    const fsState = loadFs();
    let viewMode = localStorage.getItem(VIEW_KEY) || "icons";
    let currentPath = options.startPath || localStorage.getItem(LAST_PATH_KEY) || "This PC";
    if (!getNodeByPath(fsState.tree, currentPath)) currentPath = "This PC";

    const history = [currentPath];
    let historyIndex = 0;
    let selectedId = "";
    let contextMenu = null;

    container.innerHTML = `
      <div class="explorer-shell" tabindex="0">
        <aside class="explorer-sidebar"></aside>
        <section class="explorer-main">
          <header class="explorer-toolbar">
            <div class="explorer-btns">
              <button class="link-btn" data-act="back">◀ Back</button>
              <button class="link-btn" data-act="forward">Forward ▶</button>
              <button class="link-btn" data-act="up">⬆ Up</button>
              <button class="link-btn" data-act="refresh">⟳ Refresh</button>
              <button class="link-btn" data-act="new-folder">📁 New Folder</button>
              <button class="link-btn" data-act="view">View: <span class="view-label"></span></button>
            </div>
            <div class="explorer-breadcrumb" aria-label="Path"></div>
          </header>
          <div class="explorer-content-wrap">
            <div class="explorer-content" tabindex="0"></div>
          </div>
          <footer class="explorer-status"></footer>
        </section>
      </div>`;

    const shell = container.querySelector(".explorer-shell");
    const sidebar = container.querySelector(".explorer-sidebar");
    const content = container.querySelector(".explorer-content");
    const status = container.querySelector(".explorer-status");
    const breadcrumb = container.querySelector(".explorer-breadcrumb");
    const viewLabel = container.querySelector(".view-label");

    function openPath(path, addHistory = true) {
      if (!getNodeByPath(fsState.tree, path)) return;
      currentPath = path;
      localStorage.setItem(LAST_PATH_KEY, currentPath);
      if (addHistory && history[historyIndex] !== path) {
        history.splice(historyIndex + 1);
        history.push(path);
        historyIndex = history.length - 1;
      }
      selectedId = "";
      draw();
    }

    function getCurrentFolder() {
      return getNodeByPath(fsState.tree, currentPath);
    }

    function closeContextMenu() {
      contextMenu?.remove();
      contextMenu = null;
      document.removeEventListener("click", closeContextMenu);
    }

    function makeContextMenu(x, y, entries) {
      closeContextMenu();
      const menu = document.createElement("div");
      menu.className = "context-menu explorer-context";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.innerHTML = entries.map((entry) => {
        if (entry.sep) return `<div class="explorer-sep"></div>`;
        const disabled = entry.disabled ? "disabled" : "";
        return `<button type="button" ${disabled} data-id="${entry.id}">${entry.label}</button>`;
      }).join("");
      document.body.appendChild(menu);
      contextMenu = menu;
      menu.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-id]");
        if (!btn || btn.disabled) return;
        const entry = entries.find((e) => e.id === btn.dataset.id);
        closeContextMenu();
        entry?.onSelect?.();
      });
      setTimeout(() => document.addEventListener("click", closeContextMenu, { once: true }), 0);
    }

    function openProperties(item, itemPath) {
      const values = [
        ["Name", item.name],
        ["Type", typeLabel(item.type)],
        ["Path", itemPath],
        ["Modified", item.modified || "Unknown"],
        ["Size", fakeSize(item)],
        ["Item Count", item.type === "folder" ? String(item.children?.length || 0) : "—"]
      ];
      const win = window.open("", "_blank", "width=360,height=360");
      if (!win) {
        window.DevSkitsDesktop?.notify?.("Popup blocked for properties", "warn");
        return;
      }
      win.document.write(`<title>${item.name} Properties</title><style>body{font:12px Tahoma;padding:10px;background:#efefef;}table{width:100%;border-collapse:collapse;}td{border:1px solid #777;padding:6px;}</style><h3>${item.name} Properties</h3><table>${values.map((row) => `<tr><td><strong>${row[0]}</strong></td><td>${row[1]}</td></tr>`).join("")}</table>`);
      win.document.close();
    }

    function sendToTrash(item) {
      const currentFolder = getCurrentFolder();
      if (!currentFolder || item.systemFolder) return;
      currentFolder.children = (currentFolder.children || []).filter((c) => c.id !== item.id);
      const rec = { ...clone(item), deletedFrom: currentPath, deletedAt: dateText() };
      fsState.trash.push(rec);
      const recycle = getNodeByPath(fsState.tree, "This PC/Recycle Bin");
      recycle.children = fsState.trash.map((t) => ({ ...t, type: t.type || "text" }));
      saveFs(fsState);
      draw();
    }

    function createFolder() {
      const folder = getCurrentFolder();
      if (!folder) return;
      const name = ensureUniqueName(folder, "New Folder");
      folder.children.push({ id: makeId("folder"), name, type: "folder", modified: dateText(), children: [] });
      folder.modified = dateText();
      saveFs(fsState);
      draw();
    }

    function createTextFile() {
      const folder = getCurrentFolder();
      if (!folder) return;
      const name = ensureUniqueName(folder, "New Text File.txt");
      folder.children.push({ id: makeId("text"), name, type: "text", content: "", size: 1, modified: dateText() });
      folder.modified = dateText();
      saveFs(fsState);
      draw();
    }

    function createShortcut(item) {
      const folder = getCurrentFolder();
      if (!folder) return;
      const name = ensureUniqueName(folder, `${item.name} Shortcut.lnk`);
      folder.children.push({ id: makeId("shortcut"), name, type: "shortcut", targetPath: [...parsePath(currentPath), item.name].join("/"), modified: dateText() });
      saveFs(fsState);
      draw();
    }

    function sendToDesktop(item) {
      const desktop = getNodeByPath(fsState.tree, "This PC/Desktop");
      if (!desktop) return;
      const name = ensureUniqueName(desktop, `${item.name}.lnk`);
      desktop.children.push({ id: makeId("shortcut"), name, type: "shortcut", targetPath: [...parsePath(currentPath), item.name].join("/"), modified: dateText() });
      saveFs(fsState);
      draw();
      window.DevSkitsDesktop?.notify?.("Shortcut sent to Desktop", "ok");
    }

    function renameItem(item) {
      if (item.systemFolder) return;
      const folder = getCurrentFolder();
      const entered = prompt("Rename item", item.name);
      if (!entered) return;
      item.name = ensureUniqueName(folder, entered.trim());
      item.modified = dateText();
      saveFs(fsState);
      draw();
    }

    function openItem(item) {
      if (!item) return;
      if (item.type === "folder") {
        openPath(`${currentPath}/${item.name}`);
        return;
      }
      if (item.type === "shortcut") {
        openPath(item.targetPath || "This PC");
        return;
      }
      if (item.type === "app") {
        window.DevSkitsWindowManager.openApp(item.app);
        return;
      }
      if (item.type === "link") {
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }
      if (item.type === "system") {
        openProperties(item, `${currentPath}/${item.name}`);
        return;
      }
      if (item.type === "text") {
        window.DevSkitsWindowManager.openApp("notes");
        window.dispatchEvent(new CustomEvent("devskits:open-note-file", {
          detail: { name: item.name, content: item.content || "", sourcePath: `${currentPath}/${item.name}` }
        }));
      }
    }

    function renderThisPc(currentFolder) {
      const usage = estimateUsage(fsState);
      const systemObjects = ["Desktop", "Documents", "Downloads", "Notes", "Contact Info", "DevSkits Projects", "Terminal", "Settings", "Recycle Bin"];
      const locations = [
        { name: "Local Disk (C:)", info: usage.c, type: "drive" },
        { name: "DevSkits Data (D:)", info: usage.d, type: "drive" },
        { name: "Contacts", info: null, type: "location" },
        { name: "Projects", info: null, type: "location" },
        { name: "Network", info: null, type: "location" }
      ];

      return `
        <div class="thispc-grid">
          <section>
            <h4>System Objects</h4>
            <div class="thispc-objects">
              ${systemObjects.map((name) => {
                const found = (currentFolder.children || []).find((it) => it.name === name);
                const appMap = { Terminal: "terminal", Settings: "settings" };
                return `<button class="thispc-object" data-open-path="${found ? `${currentPath}/${found.name}` : ""}" data-open-app="${appMap[name] || ""}"><span>${found ? ICONS[found.type] || "📦" : "🧩"}</span>${name}</button>`;
              }).join("")}
            </div>
          </section>
          <section>
            <h4>Devices & Locations</h4>
            <div class="thispc-devices">
              ${locations.map((loc) => {
                if (!loc.info) {
                  return `<div class="drive-row"><div><strong>${loc.name}</strong><div>${loc.type === "location" ? "System Location" : "Unavailable"}</div></div></div>`;
                }
                const usedPct = Math.min(100, Math.round((loc.info.used / loc.info.capacity) * 100));
                const free = Math.max(0, loc.info.capacity - loc.info.used);
                return `<button class="drive-row" data-props-drive="${loc.name}"><div><strong>${loc.name}</strong><div>${loc.info.used} MB used of ${loc.info.capacity} MB</div><div>${free} MB free</div></div><div class="drive-meter"><span style="width:${usedPct}%"></span></div></button>`;
              }).join("")}
            </div>
          </section>
        </div>`;
    }

    function drawSidebar() {
      const all = flattenPaths(fsState.tree);
      sidebar.innerHTML = all.map((path) => {
        const depth = parsePath(path).length - 1;
        return `<button class="explorer-tree-item ${path === currentPath ? "active" : ""}" data-path="${path}" style="padding-left:${8 + depth * 14}px">${depth ? "└" : "▦"} ${parsePath(path).slice(-1)[0]}</button>`;
      }).join("");

      sidebar.querySelectorAll("[data-path]").forEach((button) => {
        button.addEventListener("click", () => openPath(button.dataset.path));
      });
    }

    function drawBreadcrumb() {
      const parts = parsePath(currentPath);
      breadcrumb.innerHTML = `${parts.map((part, index) => `<button class="crumb" data-path="${pathString(parts.slice(0, index + 1))}">${part}</button>`).join('<span class="crumb-sep">›</span>')}<button class="link-btn crumb-copy">Copy Path</button>`;
      breadcrumb.querySelectorAll(".crumb").forEach((button) => button.addEventListener("click", () => openPath(button.dataset.path)));
      breadcrumb.querySelector(".crumb-copy")?.addEventListener("click", async () => {
        await navigator.clipboard.writeText(currentPath).catch(() => {});
        window.DevSkitsDesktop?.notify?.("Path copied", "ok");
      });
    }

    function drawContent() {
      const folder = getCurrentFolder();
      const items = folder?.children || [];
      if (currentPath === "This PC") {
        content.innerHTML = renderThisPc(folder);
        content.querySelectorAll("[data-open-path]").forEach((button) => button.addEventListener("dblclick", () => {
          if (button.dataset.openPath) openPath(button.dataset.openPath);
          if (button.dataset.openApp) window.DevSkitsWindowManager.openApp(button.dataset.openApp);
        }));
        content.querySelectorAll("[data-props-drive]").forEach((button) => button.addEventListener("click", () => {
          const usage = estimateUsage(fsState);
          const map = button.dataset.propsDrive.includes("C:") ? usage.c : usage.d;
          openProperties({
            name: button.dataset.propsDrive,
            type: "system",
            modified: dateText(),
            size: map.used,
            children: []
          }, `This PC/${button.dataset.propsDrive}`);
        }));
        return;
      }

      if (!items.length) {
        content.innerHTML = `<div class="explorer-empty">This folder is empty.<br/>Use right-click or toolbar to create new items.</div>`;
      } else if (viewMode === "details") {
        content.innerHTML = `<table class="explorer-table"><thead><tr><th>Name</th><th>Type</th><th>Path</th><th>Modified</th><th>Size</th></tr></thead><tbody>${items.map((item) => `<tr class="explorer-row ${item.id === selectedId ? "selected" : ""}" data-id="${item.id}"><td>${ICONS[item.type] || "📦"} ${item.name}</td><td>${typeLabel(item.type)}</td><td>${currentPath}</td><td>${item.modified || "Unknown"}</td><td>${fakeSize(item)}</td></tr>`).join("")}</tbody></table>`;
      } else {
        const cls = viewMode === "list" ? "list" : "icons";
        content.innerHTML = `<div class="explorer-items ${cls}">${items.map((item) => `<button class="explorer-item ${item.id === selectedId ? "selected" : ""}" data-id="${item.id}" type="button"><span class="glyph">${ICONS[item.type] || "📦"}</span><span>${item.name}</span><small>${typeLabel(item.type)}</small></button>`).join("")}</div>`;
      }

      const rowSelector = viewMode === "details" ? ".explorer-row" : ".explorer-item";
      content.querySelectorAll(rowSelector).forEach((row) => {
        row.addEventListener("click", () => {
          selectedId = row.dataset.id;
          drawContent();
          drawStatus();
        });
        row.addEventListener("dblclick", () => {
          const item = items.find((it) => it.id === row.dataset.id);
          openItem(item);
        });
        row.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          selectedId = row.dataset.id;
          drawContent();
          const item = items.find((it) => it.id === row.dataset.id);
          makeContextMenu(event.pageX, event.pageY, [
            { id: "open", label: "Open", onSelect: () => openItem(item) },
            { id: "open-new", label: "Open in new window", onSelect: () => window.DevSkitsWindowManager.openApp("files", { startPath: `${currentPath}/${item.name}` }) },
            { sep: true },
            { id: "rename", label: "Rename", disabled: item.systemFolder, onSelect: () => renameItem(item) },
            { id: "delete", label: "Delete", disabled: item.systemFolder, onSelect: () => sendToTrash(item) },
            { id: "shortcut", label: "Create shortcut", onSelect: () => createShortcut(item) },
            { id: "desktop", label: "Send to Desktop", onSelect: () => sendToDesktop(item) },
            { sep: true },
            { id: "props", label: "Properties", onSelect: () => openProperties(item, `${currentPath}/${item.name}`) }
          ]);
        });
      });

      content.addEventListener("contextmenu", (event) => {
        if (event.target.closest(rowSelector)) return;
        event.preventDefault();
        const clip = localStorage.getItem(CLIPBOARD_KEY);
        makeContextMenu(event.pageX, event.pageY, [
          { id: "new-folder", label: "New Folder", onSelect: createFolder },
          { id: "new-text", label: "New Text File", onSelect: createTextFile },
          { sep: true },
          { id: "refresh", label: "Refresh", onSelect: draw },
          { id: "paste", label: "Paste", disabled: !clip, onSelect: () => window.DevSkitsDesktop?.notify?.("Paste queue is not yet wired", "warn") },
          { sep: true },
          { id: "props", label: "Properties", onSelect: () => openProperties(folder, currentPath) }
        ]);
      }, { once: true });
    }

    function drawStatus() {
      const folder = getCurrentFolder();
      const items = folder?.children || [];
      const selected = items.find((it) => it.id === selectedId);
      status.innerHTML = `<span>${items.length} item(s)</span><span>${selected ? `${selected.name} • ${typeLabel(selected.type)} • ${fakeSize(selected)}` : "No item selected"}</span><span>View: ${viewMode}</span>`;
    }

    function updateToolbar() {
      viewLabel.textContent = viewMode;
      container.querySelector('[data-act="back"]').disabled = historyIndex <= 0;
      container.querySelector('[data-act="forward"]').disabled = historyIndex >= history.length - 1;
      container.querySelector('[data-act="up"]').disabled = parsePath(currentPath).length <= 1;
    }

    function draw() {
      drawSidebar();
      drawBreadcrumb();
      drawContent();
      drawStatus();
      updateToolbar();
      saveFs(fsState);
    }

    container.querySelectorAll("[data-act]").forEach((button) => {
      button.addEventListener("click", () => {
        const act = button.dataset.act;
        if (act === "back" && historyIndex > 0) {
          historyIndex -= 1;
          openPath(history[historyIndex], false);
        } else if (act === "forward" && historyIndex < history.length - 1) {
          historyIndex += 1;
          openPath(history[historyIndex], false);
        } else if (act === "up") {
          const parts = parsePath(currentPath);
          openPath(pathString(parts.slice(0, -1)) || "This PC");
        } else if (act === "refresh") {
          draw();
        } else if (act === "new-folder") {
          createFolder();
        } else if (act === "view") {
          viewMode = viewMode === "icons" ? "list" : viewMode === "list" ? "details" : "icons";
          localStorage.setItem(VIEW_KEY, viewMode);
          draw();
        }
      });
    });

    function keyboardMove(offset) {
      const folder = getCurrentFolder();
      const items = folder?.children || [];
      if (!items.length) return;
      let idx = items.findIndex((it) => it.id === selectedId);
      idx = idx < 0 ? 0 : Math.max(0, Math.min(items.length - 1, idx + offset));
      selectedId = items[idx].id;
      drawContent();
      drawStatus();
    }

    shell.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        keyboardMove(1);
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        keyboardMove(-1);
      }
      if (event.key === "Enter") {
        const folder = getCurrentFolder();
        const item = (folder?.children || []).find((it) => it.id === selectedId);
        openItem(item);
      }
    });

    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.files = render;
})();
