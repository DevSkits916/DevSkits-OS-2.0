(() => {
  const { state, APPS, ui } = window.DevSkitsState;
  const W = () => window.DevSkitsWorld;
  const BASE_GRID = { x: 98, y: 100, margin: 8 };
  let selectedIconId = null;

  function currentGrid() {
    if (window.innerWidth <= 760) return { x: 82, y: 92, margin: 6 };
    if (window.innerWidth <= 1024) return { x: 90, y: 96, margin: 7 };
    return BASE_GRID;
  }

  function isMobileLike() {
    return window.innerWidth <= 760 || window.matchMedia("(pointer: coarse)").matches;
  }

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

    if (ui.desktop && logo) {
      const encodedLogo = window.btoa(unescape(encodeURIComponent(logo)));
      ui.desktop.style.setProperty("--desktop-logo", `url("data:image/svg+xml;base64,${encodedLogo}")`);
    }
  }

  function launchDesktopEntry(entry) {
    if (!entry.isShortcut) return window.DevSkitsWindowManager.launchApp(entry.id);
    if (entry.shortcut.type === "route") return window.DevSkitsWindowManager.launchApp("browser", { route: entry.shortcut.target });
    return window.DevSkitsWindowManager.launchApp(entry.shortcut.target);
  }

  function getDesktopEntries() {
    const appEntries = Object.entries(APPS)
      .filter(([id, app]) => app.desktopVisible && window.DevSkitsAppRegistry?.[id])
      .map(([id, app]) => ({ id, app, isShortcut: false }));
    const shortcuts = (W()?.getShortcuts?.() || [])
      .map((s) => ({ id: s.id, app: { title: s.label, iconSvg: s.iconSvg || APPS.browser.iconSvg }, isShortcut: true, shortcut: s }));
    return [...appEntries, ...shortcuts];
  }

  function snapToGrid(x, y) {
    const grid = currentGrid();
    return {
      x: Math.round((x - grid.margin) / grid.x) * grid.x + grid.margin,
      y: Math.round((y - grid.margin) / grid.y) * grid.y + grid.margin
    };
  }

  function clampIconPosition(x, y) {
    const grid = currentGrid();
    const maxX = Math.max(grid.margin, ui.iconContainer.clientWidth - 88);
    const maxY = Math.max(grid.margin, ui.iconContainer.clientHeight - 92);
    return {
      x: Math.min(maxX, Math.max(grid.margin, x)),
      y: Math.min(maxY, Math.max(grid.margin, y))
    };
  }

  function saveIconPosition(id, x, y) {
    state.iconPositions[id] = clampIconPosition(x, y);
    localStorage.setItem("devskits-icon-positions", JSON.stringify(state.iconPositions));
  }

  function iconSlots(entryCount) {
    const grid = currentGrid();
    const width = Math.max(180, ui.iconContainer.clientWidth);
    const cols = Math.max(1, Math.floor((width - grid.margin * 2) / grid.x));
    return { cols, grid, count: entryCount };
  }

  function fallbackPosition(index, cols, grid) {
    return snapToGrid(
      grid.margin + (index % cols) * grid.x,
      grid.margin + Math.floor(index / cols) * grid.y
    );
  }

  function resolveIconPositions(entries) {
    const { cols, grid } = iconSlots(entries.length);
    const occupied = new Set();
    return entries.map((entry, index) => {
      const saved = state.iconPositions[entry.id] || fallbackPosition(index, cols, grid);
      let safe = clampIconPosition(saved.x, saved.y);
      const keyFrom = (p) => `${Math.round((p.x - grid.margin) / grid.x)}:${Math.round((p.y - grid.margin) / grid.y)}`;
      let key = keyFrom(safe);
      if (occupied.has(key)) {
        for (let slot = index; slot < index + 200; slot += 1) {
          const next = fallbackPosition(slot, cols, grid);
          const k = keyFrom(next);
          if (!occupied.has(k)) {
            safe = clampIconPosition(next.x, next.y);
            key = k;
            break;
          }
        }
      }
      occupied.add(key);
      return safe;
    });
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

    const entries = getDesktopEntries();
    const positions = resolveIconPositions(entries);

    entries.forEach((entry, index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.app = entry.id;
      node.querySelector(".icon-glyph").innerHTML = entry.app.iconSvg || APPS.about.iconSvg;
      node.querySelector(".icon-label").textContent = entry.app.title;
      node.setAttribute("role", "option");
      node.setAttribute("aria-label", entry.app.title);
      node.setAttribute("aria-selected", "false");
      node.setAttribute("tabindex", "-1");

      const safe = positions[index];
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
      if (selectedIconId === entry.id || isMobileLike()) {
        launchDesktopEntry(entry);
      }
      selectIcon(entry.id, true);
    });

    node.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (dragged) return;
      selectIcon(entry.id);
      launchDesktopEntry(entry);
    });

    node.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        launchDesktopEntry(entry);
      }
    });

    node.addEventListener("pointerdown", (e) => {
      if (isMobileLike()) return;
      if (e.button !== 0 && e.pointerType !== "touch") return;
      const rect = node.getBoundingClientRect();
      dragged = false;
      suppressClick = false;
      selectIcon(entry.id, true);
      drag = {
        pointerId: e.pointerId,
        originX: e.clientX,
        originY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top
      };
      node.setPointerCapture(e.pointerId);
    });

    node.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const shift = Math.hypot(e.clientX - drag.originX, e.clientY - drag.originY);
      if (!dragged && shift > 4) {
        dragged = true;
        document.body.classList.add("dragging-icons");
        node.classList.add("dragging");
      }
      if (!dragged) return;
      const safe = clampIconPosition(e.clientX - drag.offsetX, e.clientY - drag.offsetY);
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
        setTimeout(() => { suppressClick = false; }, 140);
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

      const { cols } = iconSlots(icons.length);
      const keyMap = { ArrowDown: cols, ArrowUp: -cols, ArrowRight: 1, ArrowLeft: -1 };
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
      menu.style.left = `${Math.min(e.clientX, window.innerWidth - menu.offsetWidth - 8)}px`;
      menu.style.top = `${Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 8)}px`;
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
