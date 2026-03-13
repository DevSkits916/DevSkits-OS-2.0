(() => {
  const { APPS, state } = window.DevSkitsState;

  const CATEGORY_ORDER = ["System", "Identity", "Tools", "Projects", "Network", "Support", "Companion", "Creator", "Dev", "Media"];

  function groupApps(filter = "") {
    const q = filter.trim().toLowerCase();
    const grouped = {};
    Object.entries(APPS)
      .filter(([, app]) => `${app.title} ${app.category}`.toLowerCase().includes(q))
      .forEach(([id, app]) => {
        const category = app.category || "Other";
        grouped[category] = grouped[category] || [];
        grouped[category].push({ id, app });
      });
    return grouped;
  }

  function renderStartApps(filter = "") {
    const wrap = document.querySelector("#start-apps");
    const grouped = groupApps(filter);
    const ordered = [...CATEGORY_ORDER.filter((c) => grouped[c]), ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)).sort()];
    wrap.innerHTML = ordered.map((category) => `
      <section class="start-category">
        <div class="start-section-label">${category}</div>
        ${grouped[category].map(({ id, app }) => `<button data-open="${id}"><span>${app.icon} ${app.title}</span><small>${category}</small></button>`).join("")}
      </section>`).join("") || '<small>No matching apps.</small>';
  }

  function renderRecent() {
    const wrap = document.querySelector("#start-recent");
    if (!state.recentApps.length) {
      wrap.innerHTML = '<div class="start-section-label">Recent: none</div>';
      return;
    }
    const recentActivity = (window.DevSkitsWorld?.getRecentActivity?.() || []).slice(0, 3);
    wrap.innerHTML = `<div class="start-section-label">Recent</div>${state.recentApps.map((id) => `<button data-open="${id}">${APPS[id]?.title || id}</button>`).join("")}<div class="start-section-label">Activity</div>${recentActivity.map((r) => `<small>${r.type}: ${r.detail}</small>`).join("")}`;
  }

  function hideMenu() {
    document.querySelector("#start-menu").classList.add("hidden");
    document.querySelector("#start-btn").setAttribute("aria-expanded", "false");
  }

  function bindStartMenu() {
    const menu = document.querySelector("#start-menu");
    const btn = document.querySelector("#start-btn");
    const search = document.querySelector("#start-search");

    btn.addEventListener("click", () => {
      const hidden = menu.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", String(!hidden));
      renderRecent();
      renderStartApps(search.value);
      if (!hidden) setTimeout(() => search.focus(), 10);
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
      if (action === "shutdown") location.reload();
      if (app || action) hideMenu();
    });

    search.addEventListener("input", (e) => renderStartApps(e.target.value));
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== btn) hideMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideMenu();
    });
  }

  window.DevSkitsStartMenu = { bindStartMenu, hideMenu, renderStartApps, renderRecent };
})();
