(() => {
  const projects = window.DevSkitsProjects;
  function card(p) {
    return `<article class="project-card" data-name="${p.name}"><h4>${p.name}</h4><p>${p.desc}</p><div class="badges"><span class="tag status-${p.status}">${p.status}</span>${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div></article>`;
  }

  function render(container, options = {}) {
    container.innerHTML = `<div class="badges"><label>Status <select id="project-filter"><option value="all">All</option><option value="active">Active</option><option value="building">Building</option><option value="concept">Concept</option></select></label><label>Sort <select id="project-sort"><option value="name">Name</option><option value="status">Status</option></select></label></div><div id="project-list"></div><div id="project-detail" class="project-card">Select a project.</div>`;
    const list = container.querySelector("#project-list");
    const detail = container.querySelector("#project-detail");

    const draw = () => {
      const status = container.querySelector("#project-filter").value;
      const sortBy = container.querySelector("#project-sort").value;
      const rows = projects
        .filter((p) => status === "all" || p.status === status)
        .sort((a, b) => String(a[sortBy]).localeCompare(String(b[sortBy])));
      list.innerHTML = rows.map(card).join("");
      list.querySelectorAll(".project-card").forEach((el) => {
        el.addEventListener("click", () => {
          const proj = projects.find((p) => p.name === el.dataset.name);
          detail.innerHTML = `<h4>${proj.name}</h4><p>${proj.desc}</p><p>Tags: ${proj.tags.join(", ")}</p><div class="badges"><button class="link-btn" data-open-route="devskits://projects">Open in Browser</button><button class="link-btn" data-shortcut="${proj.name}">Create Desktop Shortcut</button></div>`;
        });
      });
      if (options.focusProject) {
        const proj = projects.find((p) => p.name === options.focusProject);
        if (proj) detail.innerHTML = `<h4>${proj.name}</h4><p>${proj.desc}</p><p>Tags: ${proj.tags.join(", ")}</p>`;
      }
    };

    detail.addEventListener("click", (e) => {
      if (e.target.dataset.openRoute) window.DevSkitsWindowManager.openApp("browser", { route: e.target.dataset.openRoute });
      if (e.target.dataset.shortcut) {
        const rows = window.DevSkitsWorld.getShortcuts();
        rows.push({ id: `sc-${Date.now()}`, label: `${e.target.dataset.shortcut}`, type: "app", target: "projects", icon: "⌘" });
        window.DevSkitsWorld.setShortcuts(rows);
        window.DevSkitsDesktop.buildDesktopIcons();
      }
    });

    container.querySelector("#project-filter").addEventListener("change", draw);
    container.querySelector("#project-sort").addEventListener("change", draw);
    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.projects = render;
})();
