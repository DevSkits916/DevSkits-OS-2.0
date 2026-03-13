(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function render(container) {
    const items = [
      ["GoFundMe", "https://gofund.me/6bbc0274e", "Community support campaign", "gofundme"],
      ["Venmo", "https://venmo.com/u/DevSkits", "Fast direct support", "venmo"],
      ["Chime", "https://chime.com", "Quick utility donations", "chime"]
    ];
    container.innerHTML = `<h3>${icon("document", "Support DevSkits")}</h3><div class="app-grid">${items.map(([name, url, description, iconName]) => `<article class="project-card"><strong>${icon(iconName, name)}</strong><p>${description}</p><div class="badges"><button class="link-btn icon-btn" data-url="${url}">${icon("external", "Open")}</button></div></article>`).join("")}</div>`;
    container.querySelectorAll(".link-btn").forEach((btn) => btn.addEventListener("click", () => window.open(btn.dataset.url, "_blank", "noopener")));
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.donate = render;
})();
