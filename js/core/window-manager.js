(() => {
  const { state, ui, APPS } = window.DevSkitsState;

  function viewportBounds() {
    const taskbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--taskbar-h"), 10) || 42;
    return { width: window.innerWidth, height: window.innerHeight - taskbarHeight };
  }

  function playSound(type) {
    window.DevSkitsBootSound?.playEffect?.(type);
  }

  function getSavedAppBounds(appId) {
    const raw = localStorage.getItem("devskits-window-bounds");
    if (!raw) return null;
    try {
      const map = JSON.parse(raw);
      return map[appId] || null;
    } catch (e) {
      return null;
    }
  }

  function saveAppBounds(appId, el) {
    if (!appId || !el || el.classList.contains("hidden")) return;
    const rec = [...state.windows.values()].find((r) => r.el === el);
    if (rec?.maximized) return;
    const raw = localStorage.getItem("devskits-window-bounds");
    let map = {};
    try { map = JSON.parse(raw || "{}"); } catch (e) { map = {}; }
    map[appId] = {
      left: el.style.left,
      top: el.style.top,
      width: el.style.width,
      height: el.style.height
    };
    localStorage.setItem("devskits-window-bounds", JSON.stringify(map));
  }

  function persistSession() {
    const session = [];
    state.windows.forEach((rec, id) => {
      session.push({
        windowId: id,
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
      saveAppBounds(rec.appId, rec.el);
    });
    localStorage.setItem("devskits-session", JSON.stringify(session));
  }

  function clampToViewport(el) {
    const bounds = viewportBounds();
    const rect = el.getBoundingClientRect();
    const width = Math.min(rect.width, bounds.width - 8);
    const height = Math.min(rect.height, bounds.height - 8);
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    const maxLeft = Math.max(0, bounds.width - width);
    const maxTop = Math.max(0, bounds.height - height);
    const left = Math.min(maxLeft, Math.max(0, parseInt(el.style.left || rect.left, 10)));
    const top = Math.min(maxTop, Math.max(0, parseInt(el.style.top || rect.top, 10)));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }

  function snapWindow(win) {
    const bounds = viewportBounds();
    const rect = win.getBoundingClientRect();
    const snapDist = 24;
    if (rect.left <= snapDist) {
      win.style.left = "0px";
      win.style.width = `${Math.floor(bounds.width / 2)}px`;
    }
    if (rect.right >= bounds.width - snapDist) {
      win.style.left = `${Math.floor(bounds.width / 2)}px`;
      win.style.width = `${Math.ceil(bounds.width / 2)}px`;
    }
    if (rect.top <= snapDist) {
      win.style.top = "0px";
      win.style.width = `${bounds.width}px`;
      win.style.height = `${bounds.height}px`;
    }
    clampToViewport(win);
  }

  function getWindowKey(appId) {
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
    const bounds = viewportBounds();
    if (!rec.maximized) {
      rec.prev = {
        left: rec.el.style.left,
        top: rec.el.style.top,
        width: rec.el.style.width,
        height: rec.el.style.height
      };
      rec.el.style.left = "0px";
      rec.el.style.top = "0px";
      rec.el.style.width = `${bounds.width}px`;
      rec.el.style.height = `${bounds.height}px`;
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
    playSound("windowClose");
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
    bar.addEventListener("pointerup", () => {
      if (!drag) return;
      snapWindow(win);
      saveAppBounds(state.windows.get(appId)?.appId, win);
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
      const bounds = viewportBounds();
      const minWidth = window.innerWidth <= 760 ? 220 : 280;
      const minHeight = window.innerWidth <= 760 ? 160 : 190;
      const w = Math.max(minWidth, resize.w + (e.clientX - resize.x));
      const h = Math.max(minHeight, resize.h + (e.clientY - resize.y));
      win.style.width = `${Math.min(w, bounds.width)}px`;
      win.style.height = `${Math.min(h, bounds.height)}px`;
    });
    handle.addEventListener("pointerup", () => {
      if (!resize) return;
      clampToViewport(win);
      saveAppBounds(state.windows.get(appId)?.appId, win);
      resize = null;
      persistSession();
    });
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

  function initialWindowStyle(win, appId) {
    const saved = getSavedAppBounds(appId);
    if (saved) {
      Object.assign(win.style, saved);
      return;
    }
    const bounds = viewportBounds();
    const mobile = window.innerWidth <= 760;
    if (mobile) {
      win.style.left = "5px";
      win.style.top = "5px";
      win.style.width = `${bounds.width - 10}px`;
      win.style.height = `${bounds.height - 10}px`;
      return;
    }
    const width = Math.min(620, bounds.width - 16);
    const height = Math.min(420, bounds.height - 16);
    win.style.width = `${width}px`;
    win.style.height = `${height}px`;
    win.style.left = `${Math.max(0, Math.min(70 + state.windows.size * 20, bounds.width - width))}px`;
    win.style.top = `${Math.max(0, Math.min(60 + state.windows.size * 18, bounds.height - height))}px`;
  }

  function launchApp(appId, options = {}) {
    const render = window.DevSkitsAppRegistry?.[appId];
    if (!APPS[appId] || !render) return;
    const windowKey = getWindowKey(appId);
    if (!APPS[appId].multiInstance && state.windows.has(windowKey)) {
      restoreWindow(windowKey);
      focusWindow(windowKey);
      return;
    }

    const win = document.querySelector("#window-template").content.firstElementChild.cloneNode(true);
    const meta = APPS[appId];
    win.dataset.app = windowKey;
    win.querySelector(".window-title").textContent = `${meta.title} - DevSkits 3.1`;
    win.style.zIndex = ++state.z;
    initialWindowStyle(win, appId);

    wireWindow(win, windowKey);
    ui.windowLayer.appendChild(win);

    const record = { el: win, minimized: false, maximized: false, appId };
    state.windows.set(windowKey, record);
    createTaskButton(windowKey, meta.title);
    render(win.querySelector(".window-content"), options);
    focusWindow(windowKey);
    clampToViewport(win);
    playSound("windowOpen");

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
      const targetId = item.windowId || item.appId;
      const rec = state.windows.get(targetId) || state.windows.get(item.appId);
      if (!rec) return;
      Object.assign(rec.el.style, item.style || {});
      clampToViewport(rec.el);
      if (item.maximized) toggleMaximize(targetId);
      if (item.minimized) minimizeWindow(targetId);
    });
    if (!items.length) {
      launchApp("about");
      launchApp("contact");
      const contactWindowId = [...state.windows.entries()].find(([, rec]) => rec.appId === "contact")?.[0];
      if (contactWindowId) toggleMaximize(contactWindowId);
    }

    const hasTerminal = [...state.windows.values()].some((rec) => rec.appId === "terminal");
    if (!hasTerminal) {
      launchApp("terminal");
      const terminalWindowId = [...state.windows.entries()].find(([, rec]) => rec.appId === "terminal")?.[0];
      if (terminalWindowId) minimizeWindow(terminalWindowId);
    }
  }

  function showDesktop() {
    state.windows.forEach((_, id) => minimizeWindow(id));
  }

  window.addEventListener("resize", () => {
    state.windows.forEach((rec) => {
      if (window.innerWidth <= 760 && !rec.maximized) {
        rec.el.style.left = "5px";
        rec.el.style.top = "5px";
      }
      clampToViewport(rec.el);
    });
  });

  window.DevSkitsWindowManager = {
    launchApp,
    closeWindow,
    restoreSession,
    focusWindow,
    showDesktop,
    persistSession,
    openApp: launchApp
  };
})();
