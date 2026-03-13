(() => {
  function render(container) {
    const groups = {
      social: [["Facebook", "https://www.facebook.com/DevSkits?mibextid=wwXIfr"], ["Reddit", "https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1"]],
      support: [["GoFundMe", "https://gofund.me/6bbc0274e"]],
      code: [["GitHub", "https://github.com/DevSkits916"]]
    };
    container.innerHTML = Object.entries(groups).map(([group, rows]) => `<h4>${group.toUpperCase()}</h4><div class="app-grid">${rows.map(([n, u]) => `<button class="link-btn" data-url="${u}">${n}</button>`).join("")}</div>`).join("");
    container.querySelectorAll(".link-btn").forEach((b) => b.addEventListener("click", () => window.open(b.dataset.url, "_blank", "noopener")));
  }
  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.links = render;
})();
