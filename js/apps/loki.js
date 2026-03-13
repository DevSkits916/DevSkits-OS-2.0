(() => {
  function render(container) {
    container.innerHTML = `<div class="app-grid"><h3>Loki Companion Console</h3><div class="project-card"><strong>Status</strong><p>Online / Loyal / Guardian Mode</p></div><div class="loki-avatar">Loki Profile Card</div><div class="gallery"><div>Memory 01</div><div>Memory 02</div><div>Memory 03</div></div></div>`;
  }
  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.loki = render;
})();
