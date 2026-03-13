(() => {
  const { APPS, state } = window.DevSkitsState;

  function renderStartApps(filter = "") {
    const wrap = document.querySelector("#start-apps");
    const q = filter.trim().toLowerCase();
    const items = Object.entries(APPS).filter(([id, app]) => `${app.title} ${app.category}`.toLowerCase().includes(q));
    wrap.innerHTML = items.map(([id, app]) => `<button data-open="${id}"><span>${app.title}</span><small>${app.category}</small></button>`).join("");
  }

  function renderRecent() {
    const wrap = document.querySelector("#start-recent");
    if (!state.recentApps.length) {
      wrap.innerHTML = '<div class="start-section-label">Recent: none</div>';
      return;
    }
    wrap.innerHTML = `<div class="start-section-label">Recent</div>${state.recentApps.map((id) => `<button data-open="${id}">${APPS[id]?.title || id}</button>`).join("")}`;
  }

  function hideMenu() {
    document.querySelector("#start-menu").classList.add("hidden");
    document.querySelector("#start-btn").setAttribute("aria-expanded", "false");
  }

  function bindStartMenu() {
    const menu = document.querySelector("#start-menu");
    const btn = document.querySelector("#start-btn");
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(!open));
      renderRecent();
      renderStartApps(document.querySelector("#start-search").value);
    });

    menu.addEventListener("click", (e) => {
      const app = e.target.closest("button[data-open]")?.dataset.open;
      const action = e.target.closest("button[data-action]")?.dataset.action;
      if (app) window.DevSkitsWindowManager.openApp(app);
      if (action === "show-desktop") window.DevSkitsWindowManager.showDesktop();
      if (action === "run") window.DevSkitsDesktop.openRunDialog();
      if (action === "settings") window.DevSkitsWindowManager.openApp("settings");
      if (action === "about") window.DevSkitsWindowManager.openApp("about");
      if (action === "reboot") window.DevSkitsDesktop.rebootSystem();
      if (app || action) hideMenu();
    });

    document.querySelector("#start-search").addEventListener("input", (e) => renderStartApps(e.target.value));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== btn) hideMenu();
    });
  }

  window.DevSkitsStartMenu = { bindStartMenu, hideMenu, renderStartApps, renderRecent };
})();
