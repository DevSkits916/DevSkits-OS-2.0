(() => {
  function render(container) {
    const about = window.DevSkitsSystemData.about;
    container.innerHTML = `
      <h3>System / Identity Info</h3>
      <div class="app-grid">
        <div class="project-card"><strong>Who is DevSkits?</strong><p>Travis Ramsey, builder of creative retro-inspired web tools and interactive portfolio experiences.</p></div>
        <div class="project-card"><strong>What is this OS?</strong><p>A browser-based fictional desktop shell that acts as portfolio, playground, and personal operating environment.</p></div>
        <div class="project-card"><strong>Version</strong><p>${about.version} (${about.codename})</p></div>
        <div class="project-card"><strong>Feature List</strong><p>${about.features.map((f) => `• ${f}`).join('<br/>')}</p></div>
        <div class="project-card"><strong>Changelog Teaser</strong><p>${about.changelog.map((f) => `• ${f}`).join('<br/>')}</p></div>
      </div>`;
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.about = render;
})();
