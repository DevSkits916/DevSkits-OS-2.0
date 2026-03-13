(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function render(container) {
    const groups = {
      social: [
        ["GitHub", "https://github.com/DevSkits916", "github"],
        ["Facebook", "https://www.facebook.com/DevSkits?mibextid=wwXIfr", "facebook"],
        ["Reddit", "https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1", "reddit"],
        ["X / Twitter", "https://x.com", "x"],
        ["GoFundMe", "https://gofund.me/6bbc0274e", "gofundme"]
      ]
    };
    container.innerHTML = Object.entries(groups).map(([group, rows]) => `<h4>${group.toUpperCase()}</h4><div class="app-grid">${rows.map(([name, url, iconName]) => `<button class="link-btn icon-btn" data-url="${url}">${icon(iconName, name)}${icon("external", "")}</button>`).join("")}</div>`).join("");
    container.querySelectorAll(".link-btn").forEach((b) => b.addEventListener("click", () => window.open(b.dataset.url, "_blank", "noopener")));
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.links = render;
})();
