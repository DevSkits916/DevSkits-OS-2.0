(() => {
  const projects = window.DevSkitsProjects;
  function card(p) {
    return `<article class="project-card" data-name="${p.name}"><h4>${p.name}</h4><p>${p.desc}</p><div class="badges"><span class="tag status-${p.status}">${p.status}</span>${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div></article>`;
  }

  function render(container, options = {}) {
    container.innerHTML = `<div class="badges"><label>Status <select id="project-filter"><option value="all">All</option><option value="active">Active</option><option value="building">Building</option><option value="concept">Concept</option></select></label></div><div id="project-list"></div><div id="project-detail" class="project-card">Select a project.</div>`;
    const list = container.querySelector("#project-list");
    const detail = container.querySelector("#project-detail");

    const draw = () => {
      const status = container.querySelector("#project-filter").value;
      const rows = projects.filter((p) => status === "all" || p.status === status);
      list.innerHTML = rows.map(card).join("");
      list.querySelectorAll(".project-card").forEach((el) => {
        el.addEventListener("click", () => {
          const proj = projects.find((p) => p.name === el.dataset.name);
          detail.innerHTML = `<h4>${proj.name}</h4><p>${proj.desc}</p><p>Tags: ${proj.tags.join(", ")}</p>`;
        });
      });
      if (options.focusProject) {
        const proj = projects.find((p) => p.name === options.focusProject);
        if (proj) detail.innerHTML = `<h4>${proj.name}</h4><p>${proj.desc}</p><p>Tags: ${proj.tags.join(", ")}</p>`;
      }
    };
    container.querySelector("#project-filter").addEventListener("change", draw);
    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.projects = render;
})();
