(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function render(container) {
    const groups = window.DevSkitsSystemData.links;
    container.innerHTML = Object.entries(groups).map(([group, rows]) => `<h4>${group.toUpperCase()}</h4><div class="app-grid">${rows.map((row) => `<button class="link-btn icon-btn" data-url="${row.url}">${icon(row.icon, row.label)} ${row.label} ${icon("external", "external")}</button>`).join("")}</div>`).join("");
    container.querySelectorAll(".link-btn").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.url.startsWith("devskits://")) {
        window.DevSkitsWindowManager.openApp("browser", { route: b.dataset.url });
        return;
      }
      window.open(b.dataset.url, "_blank", "noopener");
    }));
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.links = render;
})();
