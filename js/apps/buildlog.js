(() => {
  const { state, addActivity } = window.DevSkitsState;

  function render(container) {
    container.innerHTML = `
      <div class="buildlog-shell">
        <div class="buildlog-tools">
          <label>View
            <select id="buildlog-view"><option value="timeline">Timeline</option><option value="list">List</option></select>
          </label>
          <label>Tag
            <select id="buildlog-tag"><option value="all">All</option><option value="feature">feature</option><option value="fix">fix</option><option value="shell">shell</option><option value="app">app</option><option value="polish">polish</option></select>
          </label>
        </div>
        <div id="buildlog-entries"></div>
      </div>`;

    const entriesEl = container.querySelector("#buildlog-entries");

    function draw() {
      const mode = container.querySelector("#buildlog-view").value;
      const tag = container.querySelector("#buildlog-tag").value;
      const rows = state.changelogEntries.filter((e) => tag === "all" || e.tags.includes(tag));
      entriesEl.className = mode === "timeline" ? "buildlog-timeline" : "buildlog-list";
      entriesEl.innerHTML = rows.map((entry) => `
        <article class="build-entry">
          <header><b>${entry.phase}</b> <span>Build ${entry.build}</span></header>
          <small>${entry.date}</small>
          <p>${entry.note}</p>
          <div class="badges">${entry.tags.map((t) => `<span class="tag">${t}</span>`).join("")}<button class="link-btn" data-open-url="devskits://changelog">open in Navigator</button></div>
        </article>
      `).join("");
    }

    container.addEventListener("change", (e) => {
      if (e.target.matches("#buildlog-view, #buildlog-tag")) draw();
    });

    container.addEventListener("click", (e) => {
      const url = e.target.closest("[data-open-url]")?.dataset.openUrl;
      if (!url) return;
      window.DevSkitsWindowManager.openApp("browser", { url });
      addActivity("buildlog-open-url", url);
    });

    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.buildlog = render;
})();
