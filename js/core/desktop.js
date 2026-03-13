(() => {
  const { state, APPS, ui } = window.DevSkitsState;

  function applyTheme(theme) {
    if (theme === "default") document.body.removeAttribute("data-theme");
    else document.body.setAttribute("data-theme", theme);
    state.activeTheme = theme;
    localStorage.setItem("devskits-theme", theme);
  }

  function cycleTheme() {
    const idx = state.themes.indexOf(state.activeTheme);
    applyTheme(state.themes[(idx + 1) % state.themes.length]);
    notify(`Theme: ${state.activeTheme}`);
  }

  function applyWallpaper(name) {
    ui.desktop.dataset.wallpaper = name;
    state.wallpaper = name;
    localStorage.setItem("devskits-wallpaper", name);
  }

  function toggleCRT(force) {
    state.crt = typeof force === "boolean" ? force : !state.crt;
    document.querySelector(".scanlines").classList.toggle("hidden", !state.crt);
    localStorage.setItem("devskits-crt", state.crt ? "on" : "off");
  }

  function buildDesktopIcons() {
    const tpl = document.querySelector("#desktop-icon-template");
    ui.iconContainer.innerHTML = "";
    Object.entries(APPS).forEach(([id, app], index) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.app = id;
      node.querySelector(".icon-glyph").textContent = app.icon;
      node.querySelector(".icon-label").textContent = app.title;
      node.style.position = "absolute";
      const pos = state.iconPositions[id] || { x: 8 + (index % 4) * 94, y: 8 + Math.floor(index / 4) * 100 };
      node.style.left = `${pos.x}px`;
      node.style.top = `${pos.y}px`;
      wireIcon(node, id);
      ui.iconContainer.appendChild(node);
    });
  }

  function wireIcon(node, appId) {
    let drag = null;
    node.addEventListener("dblclick", () => window.DevSkitsWindowManager.openApp(appId));
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
      state.iconPositions[appId] = { x: parseInt(node.style.left, 10), y: parseInt(node.style.top, 10) };
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
      if (action === "terminal" || action === "settings") window.DevSkitsWindowManager.openApp(action);
      if (action === "reboot") rebootSystem();
      menu.classList.add("hidden");
    });
  }

  function notify(message) {
    const area = document.querySelector("#notification-area");
    const item = document.createElement("div");
    item.className = "notification";
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
    ui.desktop.classList.add("hidden");
    document.querySelector("#boot-screen").classList.remove("hidden");
    startBootSequence();
  }

  function startBootSequence() {
    const bar = document.querySelector("#boot-bar");
    const status = document.querySelector("#boot-status");
    const lines = [
      "Initializing identity shell...",
      "Mounting virtual filesystem...",
      "Loading desktop + window manager...",
      "Ready."
    ];
    let i = 0;
    bar.style.width = "0%";
    const timer = setInterval(() => {
      i += 1;
      bar.style.width = `${i * 25}%`;
      status.textContent = lines[Math.min(i, lines.length - 1)];
      if (i >= 4) {
        clearInterval(timer);
        document.querySelector("#boot-screen").classList.add("hidden");
        ui.desktop.classList.remove("hidden");
        window.DevSkitsWindowManager.restoreSession();
      }
    }, 550);
  }

  function initDesktop() {
    applyTheme(state.activeTheme);
    applyWallpaper(state.wallpaper);
    toggleCRT(state.crt);
    buildDesktopIcons();
    bindDesktopContextMenu();
    updateClock();
    setInterval(updateClock, 1000);
    startBootSequence();
  }

  window.DevSkitsDesktop = { initDesktop, cycleTheme, applyTheme, applyWallpaper, toggleCRT, notify, rebootSystem, buildDesktopIcons };
})();
