(() => {
  function render(container) {
    const instanceId = `lokiCanvas-${Math.random().toString(36).slice(2, 8)}`;
    container.innerHTML = `
      <section class="loki-game-app">
        <canvas id="${instanceId}" class="loki-canvas" aria-label="LOKI: Streets of Sacramento"></canvas>
        ${window.LokiGameUI.hudMarkup()}
      </section>
    `;

    const canvas = container.querySelector("canvas");
    const game = new window.LokiGameEngine(canvas, container, { saved: window.LokiGameEngine.loadSave() });
    game.start();

    const win = container.closest(".window");
    const observer = new MutationObserver(() => {
      const hidden = win.classList.contains("hidden") || !document.body.contains(win);
      game.setPaused(hidden || !win.classList.contains("active") || document.hidden);
      if (!document.body.contains(win)) {
        game.stop();
        observer.disconnect();
      }
    });
    observer.observe(win, { attributes: true, childList: false, attributeFilter: ["class"] });

    const visibility = () => game.setPaused(document.hidden);
    document.addEventListener("visibilitychange", visibility);

    container._lokiCleanup = () => {
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
      game.stop();
    };
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry["loki-game"] = render;
})();
