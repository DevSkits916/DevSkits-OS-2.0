(() => {
  function render(container) {
    const items = [
      ["GoFundMe", "https://gofund.me/6bbc0274e", "Community support campaign"],
      ["Venmo", "https://venmo.com/u/DevSkits", "Fast direct support"],
      ["Cash App", "https://cash.app/$DevSkits916", "Quick utility donations"]
    ];
    container.innerHTML = `<h3>Support DevSkits</h3><div class="app-grid">${items.map(([n, u, d]) => `<article class="project-card"><strong>${n}</strong><p>${d}</p><div class="badges"><button class="link-btn" data-url="${u}">Open</button><span class="tag">QR</span></div></article>`).join("")}</div>`;
    container.querySelectorAll(".link-btn").forEach((btn) => btn.addEventListener("click", () => window.open(btn.dataset.url, "_blank", "noopener")));
  }
  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.donate = render;
})();
