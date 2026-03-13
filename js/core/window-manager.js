(() => {
  const { state, ui, APPS } = window.DevSkitsState;

  function persistSession() {
    const session = [];
    state.windows.forEach((rec) => {
      session.push({
        appId: rec.appId,
        minimized: rec.minimized,
        maximized: rec.maximized,
        style: {
          left: rec.el.style.left,
          top: rec.el.style.top,
          width: rec.el.style.width,
          height: rec.el.style.height
        }
      });
    });
    localStorage.setItem("devskits-session", JSON.stringify(session));
  }

  function clampToViewport(el) {
    const rect = el.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - 120);
    const maxTop = Math.max(0, window.innerHeight - 130);
    const left = Math.min(maxLeft, Math.max(0, parseInt(el.style.left || rect.left, 10)));
    const top = Math.min(maxTop, Math.max(0, parseInt(el.style.top || rect.top, 10)));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }


  function getWindowKey(appId, options = {}) {
    const meta = APPS[appId] || {};
    if (!meta.multiInstance) return appId;
    return `${appId}:${Date.now()}:${Math.random().toString(16).slice(2, 7)}`;
  }

  function focusWindow(appId) {
    state.windows.forEach((rec, id) => {
      rec.el.classList.toggle("active", id === appId);
      const task = ui.taskButtons.querySelector(`[data-app="${id}"]`);
      task?.classList.toggle("active", id === appId);
    });
    const rec = state.windows.get(appId);
    if (!rec) return;
    rec.el.style.zIndex = ++state.z;
  }

  function minimizeWindow(appId) {
    const rec = state.windows.get(appId);
    if (!rec) return;
    rec.minimized = true;
    rec.el.classList.add("minimizing");
    setTimeout(() => {
      rec.el.classList.add("hidden");
      rec.el.classList.remove("minimizing");
    }, 140);
    persistSession();
  }

  function restoreWindow(appId) {
    const rec = state.windows.get(appId);
    if (!rec) return;
    rec.minimized = false;
    rec.el.classList.remove("hidden");
    focusWindow(appId);
    persistSession();
  }

  function toggleMaximize(appId) {
    const rec = state.windows.get(appId);
    if (!rec || rec.minimized) return;
    if (!rec.maximized) {
      rec.prev = {
        left: rec.el.style.left,
        top: rec.el.style.top,
        width: rec.el.style.width,
        height: rec.el.style.height
      };
      rec.el.style.left = "0px";
      rec.el.style.top = "0px";
      rec.el.style.width = "100%";
      rec.el.style.height = "calc(100% - 2.35rem)";
      rec.maximized = true;
    } else {
      Object.assign(rec.el.style, rec.prev || {});
      rec.maximized = false;
      clampToViewport(rec.el);
    }
    persistSession();
  }

  function closeWindow(appId) {
    const rec = state.windows.get(appId);
    if (!rec) return;
    rec.el.remove();
    state.windows.delete(appId);
    ui.taskButtons.querySelector(`[data-app="${appId}"]`)?.remove();
    persistSession();
  }

  function createTaskButton(appId, title) {
    const btn = document.createElement("button");
    btn.className = "task-btn";
    btn.dataset.app = appId;
    btn.textContent = title;
    btn.addEventListener("click", () => {
      const rec = state.windows.get(appId);
      if (!rec) return;
      if (rec.minimized) restoreWindow(appId);
      else if (rec.el.classList.contains("active")) minimizeWindow(appId);
      else focusWindow(appId);
    });
    ui.taskButtons.appendChild(btn);
  }

  function enableDragging(win, appId) {
    const bar = win.querySelector(".window-titlebar");
    let drag = null;
    bar.addEventListener("pointerdown", (e) => {
      const rec = state.windows.get(appId);
      if (!rec || rec.maximized || e.target.closest("button")) return;
      const rect = win.getBoundingClientRect();
      drag = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      bar.setPointerCapture(e.pointerId);
      focusWindow(appId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!drag) return;
      win.style.left = `${Math.max(0, e.clientX - drag.x)}px`;
      win.style.top = `${Math.max(0, e.clientY - drag.y)}px`;
    });
    bar.addEventListener("pointerup", (e) => {
      if (!drag) return;
      if (e.clientX < 25) snapWindow(appId, "left");
      else if (e.clientX > window.innerWidth - 25) snapWindow(appId, "right");
      else clampToViewport(win);
      drag = null;
      persistSession();
    });
  }

  function enableResize(win, appId) {
    const handle = win.querySelector(".resize-handle");
    let resize = null;
    handle.addEventListener("pointerdown", (e) => {
      const rec = state.windows.get(appId);
      if (!rec || rec.maximized) return;
      const rect = win.getBoundingClientRect();
      resize = { w: rect.width, h: rect.height, x: e.clientX, y: e.clientY };
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!resize) return;
      const w = Math.max(280, resize.w + (e.clientX - resize.x));
      const h = Math.max(180, resize.h + (e.clientY - resize.y));
      win.style.width = `${Math.min(w, window.innerWidth)}px`;
      win.style.height = `${Math.min(h, window.innerHeight - 36)}px`;
    });
    handle.addEventListener("pointerup", () => {
      if (!resize) return;
      clampToViewport(win);
      resize = null;
      persistSession();
    });
  }

  function snapWindow(appId, side) {
    const rec = state.windows.get(appId);
    if (!rec) return;
    rec.maximized = false;
    rec.el.style.top = "0px";
    rec.el.style.width = "50%";
    rec.el.style.height = "calc(100% - 2.35rem)";
    rec.el.style.left = side === "left" ? "0px" : "50%";
    persistSession();
  }

  function wireWindow(win, appId) {
    win.addEventListener("mousedown", () => focusWindow(appId));
    win.querySelector(".win-close").addEventListener("click", () => closeWindow(appId));
    win.querySelector(".win-min").addEventListener("click", () => minimizeWindow(appId));
    win.querySelector(".win-max").addEventListener("click", () => toggleMaximize(appId));
    win.querySelector(".window-titlebar").addEventListener("dblclick", () => toggleMaximize(appId));
    enableDragging(win, appId);
    enableResize(win, appId);
  }

  function launchApp(appId, options = {}) {
    const render = window.DevSkitsAppRegistry?.[appId];
    if (!APPS[appId] || !render) return;
    const windowKey = getWindowKey(appId, options);
    if (!APPS[appId].multiInstance && state.windows.has(windowKey)) {
      restoreWindow(windowKey);
      focusWindow(windowKey);
      return;
    }

    const win = document.querySelector("#window-template").content.firstElementChild.cloneNode(true);
    const meta = APPS[appId];
    win.dataset.app = windowKey;
    win.querySelector(".window-title").textContent = `${meta.title} - DevSkits 3.1`;
    win.style.left = `${Math.min(80 + state.windows.size * 22, window.innerWidth - 360)}px`;
    win.style.top = `${Math.min(70 + state.windows.size * 18, window.innerHeight - 260)}px`;
    win.style.zIndex = ++state.z;

    wireWindow(win, windowKey);
    ui.windowLayer.appendChild(win);

    const record = { el: win, minimized: false, maximized: false, appId };
    state.windows.set(windowKey, record);
    createTaskButton(windowKey, meta.title);
    render(win.querySelector(".window-content"), options);
    focusWindow(windowKey);

    state.recentApps = [appId, ...state.recentApps.filter((id) => id !== appId)].slice(0, 5);
    window.DevSkitsWorld?.trackActivity?.("app", `opened ${appId}`);
    window.DevSkitsWorld?.registerAppOpen?.(appId);
    localStorage.setItem("devskits-recent-apps", JSON.stringify(state.recentApps));
    persistSession();
    window.dispatchEvent(new CustomEvent("devskits:app-launched", { detail: { appId } }));
  }

  function restoreSession() {
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem("devskits-session") || "[]");
    } catch (e) {
      items = [];
    }
    items.forEach((item) => {
      launchApp(item.appId);
      const rec = state.windows.get(item.appId);
      if (!rec) return;
      Object.assign(rec.el.style, item.style || {});
      clampToViewport(rec.el);
      if (item.maximized) toggleMaximize(item.appId);
      if (item.minimized) minimizeWindow(item.appId);
    });
    if (!items.length) launchApp("about");
  }

  function showDesktop() {
    state.windows.forEach((_, id) => minimizeWindow(id));
  }

  window.addEventListener("resize", () => state.windows.forEach((rec) => clampToViewport(rec.el)));

  window.DevSkitsWindowManager = {
    launchApp,
    closeWindow,
    restoreSession,
    focusWindow,
    showDesktop,
    persistSession,
    snapWindow,
    openApp: launchApp
  };
})();
