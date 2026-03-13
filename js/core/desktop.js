(() => {
  const { state, APPS, ui } = window.DevSkitsState;
  const W = () => window.DevSkitsWorld;

  function applyTheme(theme) {
    if (theme === "default") document.body.removeAttribute("data-theme");
    else document.body.setAttribute("data-theme", theme);
    state.activeTheme = theme;
    localStorage.setItem("devskits-theme", theme);
    W().trackActivity("theme", theme);
  }

  function cycleTheme() {
    const idx = state.themes.indexOf(state.activeTheme);
    applyTheme(state.themes[(idx + 1) % state.themes.length]);
    notify(`Theme changed: ${state.activeTheme}`);
  }

  function applyWallpaper(name) {
    ui.desktop.dataset.wallpaper = name;
    state.wallpaper = name;
    localStorage.setItem("devskits-wallpaper", name);
    W().trackActivity("wallpaper", name);
  }

  function toggleCRT(force) {
    state.crt = typeof force === "boolean" ? force : !state.crt;
    document.querySelector(".scanlines").classList.toggle("hidden", !state.crt);
    localStorage.setItem("devskits-crt", state.crt ? "on" : "off");
  }

  function buildDesktopIcons() {
    const tpl = document.querySelector("#desktop-icon-template");
    ui.iconContainer.innerHTML = "";
    const appEntries = Object.entries(APPS).map(([id, app]) => ({ id, app, isShortcut: false }));
    const shortcuts = (W()?.getShortcuts?.() || []).map((s) => ({ id: s.id, app: { title: s.label, icon: s.icon || "◫" }, isShortcut: true, shortcut: s }));
    [...appEntries, ...shortcuts].forEach((entry, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.app = entry.id;
      node.querySelector(".icon-glyph").textContent = entry.app.icon;
      node.querySelector(".icon-label").textContent = entry.app.title;
      node.style.position = "absolute";
      const pos = state.iconPositions[entry.id] || { x: 8 + (index % 5) * 94, y: 8 + Math.floor(index / 5) * 100 };
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      wireIcon(node, entry);
      ui.iconContainer.appendChild(node);
    });
  }

  function wireIcon(node, entry) {
    let drag = null;
    node.addEventListener("dblclick", () => {
      if (!entry.isShortcut) window.DevSkitsWindowManager.openApp(entry.id);
      else if (entry.shortcut.type === "route") window.DevSkitsWindowManager.openApp("browser", { route: entry.shortcut.target });
      else window.DevSkitsWindowManager.openApp(entry.shortcut.target);
    });
    node.addEventListener("pointerdown", (e) => {
      drag = { dx: e.offsetX, dy: e.offsetY };
      node.setPointerCapture(e.pointerId);
    });
    node.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const x = Math.max(0, Math.min(e.clientX - drag.dx, window.innerWidth - 94));
      const y = Math.max(0, Math.min(e.clientY - drag.dy, window.innerHeight - 130));
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    });
    node.addEventListener("pointerup", () => {
      if (!drag) return;
      state.iconPositions[entry.id] = { x: parseInt(node.style.left, 10), y: parseInt(node.style.top, 10) };
      localStorage.setItem("devskits-icon-positions", JSON.stringify(state.iconPositions));
      drag = null;
    });
  }

  function bindDesktopContextMenu() {
    const menu = document.querySelector("#desktop-context-menu");
    document.addEventListener("contextmenu", (e) => {
      if (!e.target.closest("#desktop")) return;
      e.preventDefault();
      menu.style.left = `${e.clientX}px`;
      menu.style.top = `${e.clientY}px`;
      menu.classList.remove("hidden");
    });
    document.addEventListener("click", () => menu.classList.add("hidden"));
    menu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      if (action === "refresh") buildDesktopIcons();
      if (action === "new-note") window.dispatchEvent(new CustomEvent("devskits:new-note"));
      if (action === "new-sticky") createSticky();
      if (action === "terminal" || action === "settings") window.DevSkitsWindowManager.openApp(action);
      if (action === "reboot") rebootSystem();
      menu.classList.add("hidden");
    });
  }

  function notify(message, level = "info") {
    const area = document.querySelector("#notification-area");
    const item = document.createElement("div");
    item.className = `notification ${level}`;
    item.textContent = message;
    area.appendChild(item);
    setTimeout(() => item.remove(), 2400);
  }

  function updateClock() {
    document.querySelector("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function rebootSystem() {
    localStorage.setItem("devskits-session", "[]");
    state.windows.forEach((rec) => rec.el.remove());
    state.windows.clear();
    ui.taskButtons.innerHTML = "";
    const updates = W().getUpdates?.();
    if (updates?.pendingRestart) {
      updates.pendingRestart = false;
      W().setUpdates(updates);
      W().pushInbox({ folder: "System", threadId: "th-updates", from: "updater@devskits.os", subject: `Restart complete on ${updates.currentVersion}`, body: `Core services restarted for build ${updates.currentBuild}.` });
    }
    ui.desktop.classList.add("hidden");
    document.querySelector("#boot-screen").classList.remove("hidden");
    notify("Reboot complete", "ok");
    startBootSequence();
  }

  function createSticky(seed = {}) {
    const rows = W().getSticky();
    const id = seed.id || `sticky-${Date.now()}`;
    const el = document.createElement("textarea");
    el.className = "sticky-note";
    el.value = seed.text || "";
    el.dataset.id = id;
    el.style.left = `${seed.x ?? 30 + rows.length * 20}px`;
    el.style.top = `${seed.y ?? 110 + rows.length * 16}px`;
    ui.desktop.appendChild(el);
    let drag = null;
    el.addEventListener("pointerdown", (e) => { drag = { dx: e.offsetX, dy: e.offsetY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      el.style.left = `${Math.max(0, e.clientX - drag.dx)}px`;
      el.style.top = `${Math.max(0, e.clientY - drag.dy)}px`;
    });
    el.addEventListener("pointerup", () => { drag = null; persistStickies(); });
    el.addEventListener("input", persistStickies);
    el.addEventListener("dblclick", () => { el.remove(); persistStickies(); });
    persistStickies();
  }

  function persistStickies() {
    const rows = [...document.querySelectorAll(".sticky-note")].map((n) => ({ id: n.dataset.id, text: n.value, x: parseInt(n.style.left, 10), y: parseInt(n.style.top, 10) }));
    W().setSticky(rows);
  }

  function runCommand(input) {
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    const appAlias = {
      browser: "browser", navigator: "browser", terminal: "terminal", files: "files", notes: "notes", links: "links", inbox: "inbox", settings: "settings", projects: "projects", changelog: "buildlog", buildlog: "buildlog", mail: "inbox", media: "mediadeck"
    };
    if (cmd.startsWith("devskits://")) return window.DevSkitsWindowManager.openApp("browser", { route: cmd });
    if (cmd.startsWith("open ")) return runCommand(cmd.replace(/^open\s+/, ""));
    const target = appAlias[cmd];
    if (target) return window.DevSkitsWindowManager.openApp(target);
    notify("Run: command not found", "warn");
  }

  function openRunDialog() {
    const dlg = document.querySelector("#run-dialog");
    const input = document.querySelector("#run-input");
    dlg.classList.remove("hidden");
    input.value = "";
    setTimeout(() => input.focus(), 20);
  }

  function closeRunDialog() {
    document.querySelector("#run-dialog").classList.add("hidden");
  }

  function bindRunDialog() {
    const dlg = document.querySelector("#run-dialog");
    const input = document.querySelector("#run-input");
    document.querySelector("#run-go").addEventListener("click", () => {
      runCommand(input.value);
      W().trackActivity("run", input.value);
      closeRunDialog();
    });
    document.querySelector("#run-cancel").addEventListener("click", closeRunDialog);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.querySelector("#run-go").click();
      if (e.key === "Escape") closeRunDialog();
    });
    dlg.addEventListener("click", (e) => e.target === dlg && closeRunDialog());
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === "r") || (e.metaKey && e.key.toLowerCase() === "r")) {
        e.preventDefault();
        openRunDialog();
      }
    });
  }

  function renderWidgets() {
    const bar = document.createElement("aside");
    bar.className = "desktop-widgets";
    ui.desktop.appendChild(bar);
    setInterval(() => {
      const settings = W().getAppSettings();
      const packages = Object.values(W().getPackages()).filter(Boolean).length;
      const recent = W().getRecentActivity().slice(0, 2).map((r) => `${r.type}: ${r.detail}`).join(" | ") || "none";
      const proc = W().getProcessSnapshot();
      const upd = W().getUpdates();
      const rows = [];
      if (settings.widgets.clock) rows.push(`<div class="widget">${new Date().toLocaleTimeString()} / Uptime ${(proc.uptimeMs / 60000) | 0}m</div>`);
      if (settings.widgets.health) rows.push(`<div class="widget">CPU ${proc.cpu}% MEM ${proc.memory}%</div>`);
      if (settings.widgets.updates) rows.push(`<div class="widget">Build ${upd.currentVersion} / ${upd.currentBuild}${upd.available.length ? ` · ${upd.available.length} update` : ""}</div>`);
      if (settings.widgets.activity) rows.push(`<div class="widget">Recent ${recent.slice(0, 74)}</div>`);
      rows.push(`<div class="widget">Packages ${packages}/5 · <button class="link-btn" data-quick="activity">Activity</button> <button class="link-btn" data-quick="updater">Updater</button></div>`);
      bar.innerHTML = rows.join("");
    }, 1200);
    bar.addEventListener("click", (e) => {
      const q = e.target.dataset.quick;
      if (q) window.DevSkitsWindowManager.openApp(q);
    });
  }

  function initScreensaver() {
    const enabled = localStorage.getItem("devskits-screensaver") === "on";
    if (!enabled) return;
    const saver = document.createElement("div");
    saver.id = "screensaver";
    saver.innerHTML = "<span>DEVSKITS</span>";
    document.body.appendChild(saver);
    let idleTimer;
    function wake() { saver.classList.remove("active"); clearTimeout(idleTimer); idleTimer = setTimeout(() => saver.classList.add("active"), 20000); }
    ["mousemove", "keydown", "touchstart", "click"].forEach((ev) => document.addEventListener(ev, wake));
    wake();
  }

  function startBootSequence() {
    const bar = document.querySelector("#boot-bar");
    const status = document.querySelector("#boot-status");
    const lines = W().getBootLines?.() || ["Initializing identity shell...", "Ready."];
    let i = 0;
    bar.style.width = "0%";
    const timer = setInterval(() => {
      i += 1;
      bar.style.width = `${Math.min(100, (i / lines.length) * 100)}%`;
      status.textContent = lines[Math.min(i - 1, lines.length - 1)];
      if (i >= lines.length) {
        clearInterval(timer);
        document.querySelector("#boot-screen").classList.add("hidden");
        ui.desktop.classList.remove("hidden");
        window.DevSkitsWindowManager.restoreSession();
      }
    }, 420);
  }

  function initDesktop() {
    W().initLivingSystem?.();
    applyTheme(state.activeTheme);
    applyWallpaper(state.wallpaper);
    toggleCRT(state.crt);
    buildDesktopIcons();
    bindDesktopContextMenu();
    bindRunDialog();
    W().getSticky().forEach((s) => createSticky(s));
    renderWidgets();
    initScreensaver();
    updateClock();
    setInterval(updateClock, 1000);
    startBootSequence();
  }

  window.DevSkitsDesktop = { initDesktop, cycleTheme, applyTheme, applyWallpaper, toggleCRT, notify, rebootSystem, buildDesktopIcons, createSticky, openRunDialog, runCommand };
})();
