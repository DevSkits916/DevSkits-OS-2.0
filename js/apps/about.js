(() => {
  function render(container) {
    container.innerHTML = `<h3>About DevSkits OS 2.0</h3><div class="app-grid"><div class="project-card"><strong>OS Name</strong><p>DevSkits OS 2.0</p></div><div class="project-card"><strong>Shell</strong><p>Retro Web Desktop Shell</p></div><div class="project-card"><strong>Build</strong><p>2026.02</p></div><div class="project-card"><strong>Runtime</strong><p>Browser / Vanilla JS</p></div><div class="project-card"><strong>Host</strong><p>${location.host || "localhost"}</p></div><div class="project-card"><strong>Status</strong><p>Stable-ish and expanding.</p></div></div>`;
  }
  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.about = render;
})();
