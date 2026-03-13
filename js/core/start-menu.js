(() => {
  const { APPS, START_MENU_SECTIONS } = window.DevSkitsState;

  const POWER_ITEMS = {
    reboot: { id: "reboot", title: "Reboot", iconSvg: APPS.settings.iconSvg },
    shutdown: { id: "shutdown", title: "Shut Down", iconSvg: APPS.terminal.iconSvg }
  };

  let focusedIndex = -1;

  function menuNodes() {
    return [...document.querySelectorAll("#start-menu .start-item")];
  }

  function hideMenu() {
    const menu = document.querySelector("#start-menu");
    const btn = document.querySelector("#start-btn");
    menu.classList.add("hidden");
    menu.setAttribute("aria-hidden", "true");
    btn.classList.remove("active");
    btn.setAttribute("aria-expanded", "false");
    focusedIndex = -1;
  }

  function openMenu() {
    const menu = document.querySelector("#start-menu");
    const btn = document.querySelector("#start-btn");
    renderStartMenu(document.querySelector("#start-search").value || "");
    menu.classList.remove("hidden");
    menu.setAttribute("aria-hidden", "false");
    btn.classList.add("active");
    btn.setAttribute("aria-expanded", "true");
    setTimeout(() => document.querySelector("#start-search").focus(), 10);
  }

  function toggleMenu() {
    const isHidden = document.querySelector("#start-menu").classList.contains("hidden");
    if (isHidden) openMenu();
    else hideMenu();
  }

  function renderItem(itemId) {
    if (itemId === "run") return `<button class="start-item" type="button" data-action="run" role="menuitem"><span class="start-item-icon">${APPS.terminal.iconSvg}</span><span class="start-item-text"><strong>Run</strong><small>Open command launcher</small></span></button>`;
    if (POWER_ITEMS[itemId]) {
      const p = POWER_ITEMS[itemId];
      return `<button class="start-item" type="button" data-action="${p.id}" role="menuitem"><span class="start-item-icon">${p.iconSvg}</span><span class="start-item-text"><strong>${p.title}</strong></span></button>`;
    }
    const app = APPS[itemId];
    if (!app) return "";
    return `<button class="start-item" type="button" data-open="${itemId}" role="menuitem"><span class="start-item-icon">${app.iconSvg}</span><span class="start-item-text"><strong>${app.title}</strong><small>${app.description || app.category}</small></span></button>`;
  }

  function renderStartMenu(filter = "") {
    const q = filter.trim().toLowerCase();
    const sectionsWrap = document.querySelector("#start-sections");
    sectionsWrap.innerHTML = START_MENU_SECTIONS.map((section) => {
      const items = section.items
        .filter((id) => {
          if (!q) return true;
          if (POWER_ITEMS[id]) return POWER_ITEMS[id].title.toLowerCase().includes(q);
          const app = APPS[id];
          return app && `${app.title} ${app.category}`.toLowerCase().includes(q);
        })
        .map(renderItem)
        .join("");
      if (!items) return "";
      return `<section class="start-group"><h3 class="start-section-label">${section.label}</h3><div class="start-group-items">${items}</div></section>`;
    }).join("") || '<div class="start-empty">No matching apps.</div>';

    focusedIndex = -1;
  }

  function launchFromMenu(target, action) {
    if (target) window.DevSkitsWindowManager.launchApp(target);
    if (action === "run") window.DevSkitsDesktop.openRunDialog();
    if (action === "reboot") window.DevSkitsDesktop.rebootSystem();
    if (action === "shutdown") location.reload();
    hideMenu();
  }

  function moveFocus(step) {
    const items = menuNodes();
    if (!items.length) return;
    focusedIndex = Math.max(0, Math.min(items.length - 1, focusedIndex + step));
    items.forEach((n, idx) => n.classList.toggle("focused", idx === focusedIndex));
    items[focusedIndex].focus();
  }

  function bindStartMenu() {
    const menu = document.querySelector("#start-menu");
    const btn = document.querySelector("#start-btn");
    const search = document.querySelector("#start-search");

    btn.addEventListener("click", toggleMenu);

    menu.addEventListener("click", (e) => {
      const app = e.target.closest("button[data-open]")?.dataset.open;
      const action = e.target.closest("button[data-action]")?.dataset.action;
      if (app || action) launchFromMenu(app, action);
    });

    search.addEventListener("input", (e) => renderStartMenu(e.target.value));

    menu.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveFocus(1);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveFocus(-1);
      }
      if (e.key === "Enter") {
        const active = document.activeElement.closest(".start-item");
        if (active) {
          e.preventDefault();
          launchFromMenu(active.dataset.open, active.dataset.action);
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        hideMenu();
      }
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== btn) hideMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hideMenu();
    });

    window.addEventListener("devskits:app-launched", hideMenu);
  }

  window.DevSkitsStartMenu = { bindStartMenu, hideMenu, renderStartMenu };
})();
