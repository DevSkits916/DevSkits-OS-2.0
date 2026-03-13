(() => {
  const { state, APPS, ui } = window.DevSkitsState;
  const W = () => window.DevSkitsWorld;
  const GRID = { x: 96, y: 104, margin: 8 };
  let selectedIconId = null;

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

  function launchDesktopEntry(entry) {
    if (!entry.isShortcut) return window.DevSkitsWindowManager.launchApp(entry.id);
    if (entry.shortcut.type === "route") return window.DevSkitsWindowManager.launchApp("browser", { route: entry.shortcut.target });
    return window.DevSkitsWindowManager.launchApp(entry.shortcut.target);
  }

  function getDesktopEntries() {
    const appEntries = Object.entries(APPS)
      .filter(([, app]) => app.desktopVisible)
      .map(([id, app]) => ({ id, app, isShortcut: false }));
    const shortcuts = (W()?.getShortcuts?.() || [])
      .map((s) => ({ id: s.id, app: { title: s.label, iconSvg: s.iconSvg || APPS.browser.iconSvg }, isShortcut: true, shortcut: s }));
    return [...appEntries, ...shortcuts];
  }

  function snapToGrid(x, y) {
    return {
      x: Math.round((x - GRID.margin) / GRID.x) * GRID.x + GRID.margin,
      y: Math.round((y - GRID.margin) / GRID.y) * GRID.y + GRID.margin
    };
  }

  function clampIconPosition(x, y) {
    const maxX = Math.max(GRID.margin, ui.iconContainer.clientWidth - 94);
    const maxY = Math.max(GRID.margin, ui.iconContainer.clientHeight - 96);
    return {
      x: Math.min(maxX, Math.max(GRID.margin, x)),
      y: Math.min(maxY, Math.max(GRID.margin, y))
    };
  }

  function saveIconPosition(id, x, y) {
    state.iconPositions[id] = clampIconPosition(x, y);
    localStorage.setItem("devskits-icon-positions", JSON.stringify(state.iconPositions));
  }

  function selectIcon(iconId, shouldFocus = false) {
    selectedIconId = iconId;
    ui.iconContainer.querySelectorAll(".desktop-icon").forEach((node) => {
      const active = node.dataset.app === iconId;
      node.classList.toggle("selected", active);
      node.setAttribute("aria-selected", String(active));
      if (active && shouldFocus) node.focus();
    });
  }

  function clearIconSelection() {
    selectedIconId = null;
    ui.iconContainer.querySelectorAll(".desktop-icon.selected").forEach((n) => {
      n.classList.remove("selected");
      n.setAttribute("aria-selected", "false");
    });
  }

  function buildDesktopIcons() {
    const tpl = document.querySelector("#desktop-icon-template");
    ui.iconContainer.innerHTML = "";
    clearIconSelection();

    getDesktopEntries().forEach((entry, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.app = entry.id;
      node.querySelector(".icon-glyph").innerHTML = entry.app.iconSvg || APPS.about.iconSvg;
      node.querySelector(".icon-label").textContent = entry.app.title;
      node.style.position = "absolute";
      node.setAttribute("role", "option");
      node.setAttribute("aria-label", entry.app.title);
      node.setAttribute("aria-selected", "false");
      node.setAttribute("tabindex", "-1");

      const fallback = snapToGrid(GRID.margin + (index % 7) * GRID.x, GRID.margin + Math.floor(index / 7) * GRID.y);
      const saved = state.iconPositions[entry.id] || fallback;
      const safe = clampIconPosition(saved.x, saved.y);
      node.style.left = `${safe.x}px`;
      node.style.top = `${safe.y}px`;
      saveIconPosition(entry.id, safe.x, safe.y);

      wireIcon(node, entry);
      ui.iconContainer.appendChild(node);
    });
  }

  function wireIcon(node, entry) {
    let drag = null;
    let dragged = false;
    let suppressClick = false;

    node.addEventListener("click", () => {
      if (suppressClick) return;
      selectIcon(entry.id);
    });

    node.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (dragged) return;
      selectIcon(entry.id);
      launchDesktopEntry(entry);
    });

    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        launchDesktopEntry(entry);
      }
    });

    node.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 && e.pointerType !== "touch") return;
      const rect = node.getBoundingClientRect();
      dragged = false;
      suppressClick = false;
      selectIcon(entry.id, true);
      drag = {
        pointerId: e.pointerId,
        originX: e.clientX,
        originY: e.clientY,
        left: parseInt(node.style.left, 10) || 0,
        top: parseInt(node.style.top, 10) || 0,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      };
      node.setPointerCapture(e.pointerId);
    });

    node.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const shift = Math.hypot(e.clientX - drag.originX, e.clientY - drag.originY);
      const threshold = e.pointerType === "touch" ? 8 : 4;
      if (!dragged && shift > threshold) {
        dragged = true;
        document.body.classList.add("dragging-icons");
        node.classList.add("dragging");
      }
      if (!dragged) return;
      const rawX = e.clientX - drag.offsetX;
      const rawY = e.clientY - drag.offsetY;
      const safe = clampIconPosition(rawX, rawY);
      node.style.left = `${safe.x}px`;
      node.style.top = `${safe.y}px`;
    });

    node.addEventListener("pointerup", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      node.releasePointerCapture(e.pointerId);
      if (dragged) {
        const snapped = snapToGrid(parseInt(node.style.left, 10), parseInt(node.style.top, 10));
        const safe = clampIconPosition(snapped.x, snapped.y);
        node.style.left = `${safe.x}px`;
        node.style.top = `${safe.y}px`;
        saveIconPosition(entry.id, safe.x, safe.y);
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 120);
      }
      document.body.classList.remove("dragging-icons");
      node.classList.remove("dragging");
      drag = null;
      dragged = false;
    });
  }

  function bindDesktopInteractions() {
    ui.iconContainer.addEventListener("click", (e) => {
      if (e.target.closest(".desktop-icon") || e.target.closest(".window")) return;
      clearIconSelection();
    });

    ui.iconContainer.addEventListener("keydown", (e) => {
      const icons = [...ui.iconContainer.querySelectorAll(".desktop-icon")];
      if (!icons.length) return;
      const currentIndex = icons.findIndex((icon) => icon.dataset.app === selectedIconId);

      if (e.key === "Enter" && selectedIconId) {
        e.preventDefault();
        icons[currentIndex]?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      }

      const keyMap = { ArrowDown: 7, ArrowUp: -7, ArrowRight: 1, ArrowLeft: -1 };
      if (!(e.key in keyMap)) return;
      e.preventDefault();
      const nextIndex = Math.max(0, Math.min(icons.length - 1, (currentIndex === -1 ? 0 : currentIndex) + keyMap[e.key]));
      const next = icons[nextIndex];
      if (!next) return;
      selectIcon(next.dataset.app, true);
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
      if (action === "terminal" || action === "settings") window.DevSkitsWindowManager.launchApp(action);
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
    if (cmd.startsWith("devskits://")) return window.DevSkitsWindowManager.launchApp("browser", { route: cmd });
    if (cmd.startsWith("open ")) return runCommand(cmd.replace(/^open\s+/, ""));
    const target = appAlias[cmd];
    if (target) return window.DevSkitsWindowManager.launchApp(target);
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
    bindDesktopInteractions();
    bindDesktopContextMenu();
    bindRunDialog();
    window.addEventListener("resize", () => buildDesktopIcons());
    W().getSticky().forEach((s) => createSticky(s));
    updateClock();
    setInterval(updateClock, 1000);
    startBootSequence();
  }

  window.DevSkitsDesktop = { initDesktop, cycleTheme, applyTheme, applyWallpaper, toggleCRT, notify, rebootSystem, buildDesktopIcons, createSticky, openRunDialog, runCommand };
})();
