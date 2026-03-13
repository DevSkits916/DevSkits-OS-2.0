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

  function applyBranding() {
    const logo = window.DevSkitsBranding?.logos?.devskits31 || "";
    const bootLogo = document.querySelector("#boot-logo");
    const desktopLogo = document.querySelector("#desktop-brandmark");
    if (bootLogo) bootLogo.innerHTML = logo;
    if (desktopLogo) desktopLogo.innerHTML = logo;
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
    let moved = false;
    let clickTimer = null;

    function openEntry() {
      if (!entry.isShortcut) window.DevSkitsWindowManager.openApp(entry.id);
      else if (entry.shortcut.type === "route") window.DevSkitsWindowManager.openApp("browser", { route: entry.shortcut.target });
      else window.DevSkitsWindowManager.openApp(entry.shortcut.target);
    }

    node.addEventListener("dblclick", (e) => {
      e.preventDefault();
      clearTimeout(clickTimer);
      if (!moved) openEntry();
    });

    node.addEventListener("click", () => {
      clearTimeout(clickTimer);
      if (moved) return;
      clickTimer = setTimeout(() => openEntry(), 180);
    });

    node.addEventListener("pointerdown", (e) => {
      moved = false;
      drag = { dx: e.offsetX, dy: e.offsetY, startX: e.clientX, startY: e.clientY };
      node.setPointerCapture(e.pointerId);
    });

    node.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const shift = Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY);
      moved = moved || shift > 4;
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
      setTimeout(() => { moved = false; }, 0);
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
    const settings = W().getAppSettings();
    const use24 = settings.clock24h !== false;
    document.querySelector("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: !use24 });
  }

  function rebootSystem() {
    localStorage.setItem("devskits-session", "[]");
    state.windows.forEach((rec) => rec.el.remove());
    state.windows.clear();
    ui.taskButtons.innerHTML = "";
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
      browser: "browser", navigator: "browser", terminal: "terminal", files: "files", notes: "notes", links: "links", settings: "settings", projects: "projects", contact: "contact", donate: "donate", about: "about"
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

  function closeRunDialog() { document.querySelector("#run-dialog").classList.add("hidden"); }

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
      if (e.key === "Escape") closeRunDialog();
    });
  }

  function finishBoot() {
    document.querySelector("#boot-screen").classList.add("hidden");
    ui.desktop.classList.remove("hidden");
    window.DevSkitsWindowManager.restoreSession();
  }

  function startBootSequence() {
    const fastBoot = localStorage.getItem("devskits-fast-boot") === "on";
    if (fastBoot) return finishBoot();

    const bar = document.querySelector("#boot-bar");
    const status = document.querySelector("#boot-status");
    const lines = W().getBootLines?.() || ["Initializing identity shell...", "Ready."];
    const skipBtn = document.querySelector("#boot-skip");
    let i = 0;
    bar.style.width = "0%";

    const timer = setInterval(() => {
      i += 1;
      bar.style.width = `${Math.min(100, (i / lines.length) * 100)}%`;
      status.textContent = lines[Math.min(i - 1, lines.length - 1)];
      if (i >= lines.length) {
        clearInterval(timer);
        finishBoot();
      }
    }, 420);

    skipBtn.onclick = () => {
      clearInterval(timer);
      finishBoot();
    };
  }

  function initDesktop() {
    W().initLivingSystem?.();
    applyTheme(state.activeTheme);
    applyWallpaper(state.wallpaper);
    toggleCRT(state.crt);
    applyBranding();
    buildDesktopIcons();
    bindDesktopContextMenu();
    bindRunDialog();
    W().getSticky().forEach((s) => createSticky(s));
    updateClock();
    setInterval(updateClock, 1000);
    startBootSequence();
  }

  window.DevSkitsDesktop = { initDesktop, cycleTheme, applyTheme, applyWallpaper, toggleCRT, notify, rebootSystem, buildDesktopIcons, createSticky, openRunDialog, runCommand };
})();
