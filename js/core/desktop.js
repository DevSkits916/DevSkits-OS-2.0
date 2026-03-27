(() => {
  const { state, APPS, ui, RUN_ALIASES } = window.DevSkitsState;
  const W = () => window.DevSkitsWorld;
  const ICON_POSITIONS_KEY = "devskits-icon-positions";
  const ICON_LAYOUT_VERSION_KEY = "devskits-icon-layout-version";
  const ICON_LAYOUT_VERSION = 2;
  let selectedIconId = null;
  let touchContextTimer = null;
  const DESKTOP_LABELS_KEY = "devskits-desktop-labels-v1";

  function isMobileLike() {
    return window.innerWidth <= 760 || window.matchMedia("(pointer: coarse)").matches;
  }

  function cssNumber(style, property, fallback = 0) {
    const value = parseFloat(style.getPropertyValue(property));
    return Number.isFinite(value) ? value : fallback;
  }

  function readIconMetrics() {
    const containerStyle = getComputedStyle(ui.iconContainer);
    const firstIcon = ui.iconContainer.querySelector(".desktop-icon");
    const measureNode = !firstIcon ? document.querySelector("#desktop-icon-template")?.content?.firstElementChild?.cloneNode(true) : null;

    if (measureNode) {
      measureNode.classList.add("desktop-icon");
      measureNode.style.visibility = "hidden";
      measureNode.style.pointerEvents = "none";
      measureNode.style.left = "-10000px";
      measureNode.style.top = "-10000px";
      const label = measureNode.querySelector(".icon-label");
      if (label) label.textContent = "Desktop Icon Label";
      const glyph = measureNode.querySelector(".icon-glyph");
      if (glyph) glyph.innerHTML = APPS.about?.iconSvg || "";
      ui.iconContainer.appendChild(measureNode);
    }

    const sample = firstIcon || measureNode;
    const sampleRect = sample?.getBoundingClientRect();
    const slotWidth = Math.max(56, Math.ceil(sampleRect?.width || cssNumber(containerStyle, "--icon-slot-width", 92)));
    const slotHeight = Math.max(72, Math.ceil(sampleRect?.height || cssNumber(containerStyle, "--icon-slot-height", 108)));

    if (measureNode) measureNode.remove();

    const margin = Math.max(0, cssNumber(containerStyle, "--desktop-icon-margin", 8));
    const gapX = Math.max(0, cssNumber(containerStyle, "--desktop-icon-gap-x", 10));
    const gapY = Math.max(0, cssNumber(containerStyle, "--desktop-icon-gap-y", 10));

    const width = Math.max(180, ui.iconContainer.clientWidth);
    const height = Math.max(120, ui.iconContainer.clientHeight);
    const maxX = Math.max(margin, width - slotWidth - margin);
    const maxY = Math.max(margin, height - slotHeight - margin);

    return {
      width,
      height,
      margin,
      slotWidth,
      slotHeight,
      gapX,
      gapY,
      stepX: slotWidth + gapX,
      stepY: slotHeight + gapY,
      maxX,
      maxY,
      mobileLayout: isMobileLike()
    };
  }

  function calculateGridSlots(entryCount, metrics) {
    const usableWidth = Math.max(0, metrics.width - metrics.margin * 2 - metrics.slotWidth);
    const usableHeight = Math.max(0, metrics.height - metrics.margin * 2 - metrics.slotHeight);
    const cols = Math.max(1, Math.floor(usableWidth / metrics.stepX) + 1);
    const rows = Math.max(1, Math.floor(usableHeight / metrics.stepY) + 1);
    const maxSlots = Math.max(entryCount, cols * rows);
    return { cols, rows, maxSlots };
  }

  function fallbackPosition(index, metrics, slots) {
    const row = index % slots.rows;
    const col = Math.floor(index / slots.rows);
    return {
      x: metrics.margin + col * metrics.stepX,
      y: metrics.margin + row * metrics.stepY
    };
  }

  function clampIconPosition(x, y, metrics = readIconMetrics()) {
    return {
      x: Math.min(metrics.maxX, Math.max(metrics.margin, x)),
      y: Math.min(metrics.maxY, Math.max(metrics.margin, y))
    };
  }

  function snapToGrid(x, y, metrics = readIconMetrics()) {
    const col = Math.round((x - metrics.margin) / metrics.stepX);
    const row = Math.round((y - metrics.margin) / metrics.stepY);
    return clampIconPosition(
      metrics.margin + col * metrics.stepX,
      metrics.margin + row * metrics.stepY,
      metrics
    );
  }

  function positionKey(position, metrics) {
    const col = Math.round((position.x - metrics.margin) / metrics.stepX);
    const row = Math.round((position.y - metrics.margin) / metrics.stepY);
    return `${col}:${row}`;
  }

  function persistIconPositions() {
    localStorage.setItem(ICON_POSITIONS_KEY, JSON.stringify(state.iconPositions));
    localStorage.setItem(ICON_LAYOUT_VERSION_KEY, String(ICON_LAYOUT_VERSION));
  }

  function saveIconPosition(id, x, y, metrics = readIconMetrics()) {
    state.iconPositions[id] = clampIconPosition(x, y, metrics);
    persistIconPositions();
  }

  function shouldResetStoredLayout(rawPositions) {
    if (Number(localStorage.getItem(ICON_LAYOUT_VERSION_KEY)) !== ICON_LAYOUT_VERSION) return true;
    return !rawPositions || typeof rawPositions !== "object" || Array.isArray(rawPositions);
  }

  function validateSavedPosition(saved, metrics) {
    if (!saved || typeof saved !== "object") return null;
    const x = Number(saved.x);
    const y = Number(saved.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const snapped = snapToGrid(x, y, metrics);
    return clampIconPosition(snapped.x, snapped.y, metrics);
  }

  function sanitizeStoredPositions(entries, metrics, slots) {
    const next = {};
    const occupied = new Set();
    let changed = false;

    entries.forEach((entry, index) => {
      const saved = validateSavedPosition(state.iconPositions[entry.id], metrics);
      let safe = saved || fallbackPosition(index, metrics, slots);
      safe = snapToGrid(safe.x, safe.y, metrics);
      let key = positionKey(safe, metrics);

      if (occupied.has(key)) {
        changed = true;
        for (let slot = 0; slot < slots.maxSlots + entries.length; slot += 1) {
          const fallback = fallbackPosition(slot, metrics, slots);
          const probe = clampIconPosition(fallback.x, fallback.y, metrics);
          const snapped = snapToGrid(probe.x, probe.y, metrics);
          const probeKey = positionKey(snapped, metrics);
          if (!occupied.has(probeKey)) {
            safe = snapped;
            key = probeKey;
            break;
          }
        }
      }

      if (!saved || saved.x !== safe.x || saved.y !== safe.y) changed = true;
      occupied.add(key);
      next[entry.id] = safe;
    });

    const knownIds = new Set(entries.map((entry) => entry.id));
    Object.keys(state.iconPositions).forEach((id) => {
      if (!knownIds.has(id)) changed = true;
    });

    state.iconPositions = next;
    if (changed) persistIconPositions();
    return next;
  }

  function resolveIconPositions(entries, metrics) {
    if (shouldResetStoredLayout(state.iconPositions)) {
      state.iconPositions = {};
      persistIconPositions();
    }
    const slots = calculateGridSlots(entries.length, metrics);
    return sanitizeStoredPositions(entries, metrics, slots);
  }

  let relayoutFrame = null;
  function relayoutDesktopIcons() {
    if (relayoutFrame) cancelAnimationFrame(relayoutFrame);
    relayoutFrame = requestAnimationFrame(() => {
      relayoutFrame = null;
      buildDesktopIcons();
    });
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
    const normalized = name === "devskits95" ? name : "devskits95";
    ui.desktop.dataset.wallpaper = normalized;
    state.wallpaper = normalized;
    localStorage.setItem("devskits-wallpaper", normalized);
    W().trackActivity("wallpaper", normalized);
  }

  function toggleCRT(force) {
    state.crt = typeof force === "boolean" ? force : !state.crt;
    document.querySelector(".scanlines").classList.toggle("hidden", !state.crt);
    localStorage.setItem("devskits-crt", state.crt ? "on" : "off");
  }

  function applyBranding() {
    const logo = window.DevSkitsBranding?.logos?.devskits95 || "";
    const desktopLogo = document.querySelector("#desktop-brandmark");
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

  function getDesktopLabels() {
    try { return JSON.parse(localStorage.getItem(DESKTOP_LABELS_KEY) || "{}"); } catch (e) { return {}; }
  }

  function setDesktopLabel(id, label) {
    const labels = getDesktopLabels();
    labels[id] = label;
    localStorage.setItem(DESKTOP_LABELS_KEY, JSON.stringify(labels));
  }

  function getDesktopEntries() {
    const labels = getDesktopLabels();
    const appEntries = Object.values(APPS)
      .filter((app) => app.launcher?.desktop !== false && window.DevSkitsAppRegistry?.[app.id])
      .map((app) => ({ id: app.id, app: { ...app, title: labels[app.id] || app.title }, isShortcut: false }));
    const shortcuts = W().getShortcuts().map((shortcut) => ({
      id: shortcut.id,
      app: {
        title: labels[shortcut.id] || shortcut.label || shortcut.target,
        iconSvg: APPS[shortcut.target]?.iconSvg || APPS.browser.iconSvg
      },
      isShortcut: true,
      shortcut
    }));
    return [...appEntries, ...shortcuts];
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
    const metrics = readIconMetrics();
    const positions = resolveIconPositions(entries, metrics);
    ui.iconContainer.classList.toggle("mobile-layout", metrics.mobileLayout);

    entries.forEach((entry) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.app = entry.id;
      node.querySelector(".icon-glyph").innerHTML = entry.app.iconSvg || APPS.about.iconSvg;
      node.querySelector(".icon-label").textContent = entry.app.title;
      node.setAttribute("role", "option");
      node.setAttribute("aria-label", entry.app.title);
      node.setAttribute("aria-selected", "false");
      node.setAttribute("tabindex", "-1");

      const safe = positions[entry.id];
      if (metrics.mobileLayout) {
        node.style.left = "";
        node.style.top = "";
      } else {
        node.style.left = `${safe.x}px`;
        node.style.top = `${safe.y}px`;
      }
      saveIconPosition(entry.id, safe.x, safe.y, metrics);

      wireIcon(node, entry);
      ui.iconContainer.appendChild(node);
    });
  }

  function wireIcon(node, entry) {
    let drag = null;
    let dragged = false;
    let suppressClick = false;

    function promptRename() {
      const current = node.querySelector(".icon-label").textContent || entry.app.title;
      const next = prompt("Rename desktop icon", current);
      if (!next || !next.trim()) return;
      setDesktopLabel(entry.id, next.trim());
      node.querySelector(".icon-label").textContent = next.trim();
      notify("Desktop item renamed", "ok");
    }

    function removeShortcut() {
      if (!entry.isShortcut) return;
      const next = W().getShortcuts().filter((row) => row.id !== entry.id);
      W().setShortcuts(next);
      delete state.iconPositions[entry.id];
      persistIconPositions();
      notify("Shortcut removed", "ok");
      buildDesktopIcons();
    }

    function openIconMenu(x, y) {
      const menu = document.createElement("div");
      menu.className = "context-menu";
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.innerHTML = `<button data-act="open">Open</button><button data-act="rename">Rename</button>${entry.isShortcut ? '<button data-act="remove">Remove Shortcut</button>' : ''}`;
      document.body.appendChild(menu);
      const close = () => menu.remove();
      menu.addEventListener("click", (event) => {
        const action = event.target.dataset.act;
        if (action === "open") launchDesktopEntry(entry);
        if (action === "rename") promptRename();
        if (action === "remove") removeShortcut();
        close();
      });
      setTimeout(() => document.addEventListener("click", close, { once: true }), 0);
    }


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

    node.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      selectIcon(entry.id, true);
      openIconMenu(e.clientX, e.clientY);
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
      if (e.pointerType === "touch") {
        clearTimeout(touchContextTimer);
        touchContextTimer = setTimeout(() => {
          openIconMenu(e.clientX, e.clientY);
        }, 550);
      }
    });

    node.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      clearTimeout(touchContextTimer);
      const shift = Math.hypot(e.clientX - drag.originX, e.clientY - drag.originY);
      if (!dragged && shift > 4) {
        dragged = true;
        document.body.classList.add("dragging-icons");
        node.classList.add("dragging");
      }
      if (!dragged) return;
      const metrics = readIconMetrics();
      const safe = clampIconPosition(e.clientX - drag.offsetX, e.clientY - drag.offsetY, metrics);
      node.style.left = `${safe.x}px`;
      node.style.top = `${safe.y}px`;
    });

    node.addEventListener("pointerup", (e) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      clearTimeout(touchContextTimer);
      node.releasePointerCapture(e.pointerId);
      if (dragged) {
        const metrics = readIconMetrics();
        const snapped = snapToGrid(parseInt(node.style.left, 10), parseInt(node.style.top, 10), metrics);
        const safe = clampIconPosition(snapped.x, snapped.y, metrics);
        node.style.left = `${safe.x}px`;
        node.style.top = `${safe.y}px`;
        saveIconPosition(entry.id, safe.x, safe.y, metrics);
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 140);
      } else if (e.pointerType === "touch") {
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 220);
        selectIcon(entry.id, true);
        launchDesktopEntry(entry);
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

      const { cols } = calculateGridSlots(icons.length, readIconMetrics());
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
      if (action === "new-folder") window.DevSkitsVFS?.create("This PC/Desktop", "folder", "New Folder", "");
      if (action === "new-text-document") window.DevSkitsVFS?.create("This PC/Desktop", "text", "New Text File.txt", "");
      if (action === "new-folder" || action === "new-text-document") buildDesktopIcons();
      if (action === "personalize") window.DevSkitsWindowManager.launchApp("settings");
      if (action === "about") window.DevSkitsWindowManager.launchApp("about");
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
    const cmd = (input || "").trim();
    if (!cmd) return;
    const normalized = cmd.toLowerCase();

    if (normalized.startsWith("devskits://") || /^https?:\/\//i.test(cmd)) {
      return window.DevSkitsWindowManager.launchApp("browser", { route: cmd });
    }

    if (normalized.startsWith("open ")) {
      return runCommand(cmd.replace(/^open\s+/i, ""));
    }

    const target = RUN_ALIASES[normalized] || (window.DevSkitsAppRegistry?.[normalized] ? normalized : "");
    if (target && window.DevSkitsAppRegistry?.[target]) {
      return window.DevSkitsWindowManager.launchApp(target);
    }

    notify(`Run: '${cmd}' not found`, "warn");
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


  function bindTaskbarTray() {
    const tray = document.querySelector(".system-tray");
    tray?.addEventListener("click", (e) => {
      const btn = e.target.closest(".tray-icon");
      if (!btn) return;
      window.DevSkitsWindowManager.launchApp(btn.dataset.app);
    });
  }

  function finishBoot() {
    document.querySelector("#boot-screen").classList.add("hidden");
    ui.desktop.classList.remove("hidden");
    window.DevSkitsBootSound?.playBootSound();
    window.DevSkitsWindowManager.restoreSession();
  }

  function startBootSequence() {
    const fastBoot = localStorage.getItem("devskits-fast-boot") === "on";
    if (fastBoot || !window.DevSkitsBoot?.runSequence) return finishBoot();

    const profile = W().getProfile?.() || { bootCount: 1 };
    const build = W().getUpdates?.().currentBuild || "DSK-200";
    const biosLines = [
      `DevSkits BIOS / ${build}`,
      "POST: memory check complete",
      `Storage map online (${profile.bootCount} boots logged)`,
      "Loading system modules",
      "Kernel handoff ready"
    ];

    const systemMessages = [
      "Loading system modules",
      "Initializing desktop environment",
      "Starting DevSkits Shell",
      "Launching Desktop",
      "Desktop ready"
    ];

    window.DevSkitsBoot.runSequence({
      biosLines,
      systemMessages,
      onComplete: finishBoot
    });
  }

  function initDesktop() {
    W().initLivingSystem?.();
    applyTheme(state.activeTheme);
    applyWallpaper(state.wallpaper);
    toggleCRT(state.crt);
    applyBranding();
    const appSettings = W().getAppSettings();
    if (!W().getShortcuts().length) {
      W().setShortcuts([{ id: "shortcut-docs", type: "app", target: "files", label: "File Explorer" }, { id: "shortcut-notes", type: "app", target: "notes", label: "Notepad" }]);
    }
    document.body.dataset.iconDensity = appSettings.iconDensity || "normal";
    document.body.classList.toggle("reduce-motion", localStorage.getItem("devskits-animations") === "off");
    buildDesktopIcons();
    bindDesktopInteractions();
    bindDesktopContextMenu();
    bindRunDialog();
    bindTaskbarTray();
    window.addEventListener("resize", relayoutDesktopIcons);
    window.addEventListener("orientationchange", relayoutDesktopIcons);
    const bodyObserver = new MutationObserver((mutations) => {
      if (mutations.some((entry) => entry.type === "attributes" && (entry.attributeName === "data-icon-density" || entry.attributeName === "data-mobile-density" || entry.attributeName === "data-theme"))) {
        relayoutDesktopIcons();
      }
    });
    bodyObserver.observe(document.body, { attributes: true });
    W().getSticky().forEach((s) => createSticky(s));
    updateClock();
    setInterval(updateClock, 1000);
    startBootSequence();
  }

  window.DevSkitsDesktop = {
    initDesktop,
    cycleTheme,
    applyTheme,
    applyWallpaper,
    toggleCRT,
    notify,
    rebootSystem,
    buildDesktopIcons,
    relayoutDesktopIcons,
    createSticky,
    openRunDialog,
    runCommand
  };
})();
