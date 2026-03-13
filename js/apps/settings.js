(() => {
  function render(container) {
    container.innerHTML = `
    <h3>Settings / Control Panel</h3>
    <div class="app-grid">
      <label>Wallpaper
        <select id="wallpaper-select">
          <option value="default">Default</option>
          <option value="grid">Grid</option>
          <option value="noise">Noise</option>
          <option value="fade">Fade</option>
        </select>
      </label>
      <button class="link-btn" id="cycle-theme">Cycle Theme</button>
      <button class="link-btn" id="toggle-crt">Toggle CRT Overlay</button>
      <button class="link-btn" id="reset-layout">Reset Desktop Layout</button>
      <button class="link-btn" id="toggle-saver">Toggle Screensaver</button>
      <button class="link-btn" id="save-session">Save Session Snapshot</button>
      <button class="link-btn" id="load-session">Load Session Snapshot</button>
      <button class="link-btn" id="reset-notes">Reset Notes</button>
      <button class="link-btn" id="reset-all">Reset All Saved State</button>
    </div>`;

    const { state } = window.DevSkitsState;
    const wp = container.querySelector("#wallpaper-select");
    wp.value = state.wallpaper;
    wp.addEventListener("change", () => window.DevSkitsDesktop.applyWallpaper(wp.value));
    container.querySelector("#cycle-theme").addEventListener("click", window.DevSkitsDesktop.cycleTheme);
    container.querySelector("#toggle-crt").addEventListener("click", () => window.DevSkitsDesktop.toggleCRT());
    container.querySelector("#reset-layout").addEventListener("click", () => {
      localStorage.removeItem("devskits-icon-positions");
      state.iconPositions = {};
      window.DevSkitsDesktop.buildDesktopIcons();
    });
    container.querySelector("#toggle-saver").addEventListener("click", () => {
      const on = localStorage.getItem("devskits-screensaver") === "on";
      localStorage.setItem("devskits-screensaver", on ? "off" : "on");
      window.DevSkitsDesktop.notify(`Screensaver ${on ? "disabled" : "enabled"}`);
    });
    container.querySelector("#save-session").addEventListener("click", () => {
      const name = prompt("Snapshot name", "writing mode"); if (!name) return;
      const sessions = window.DevSkitsWorld.getSessions();
      sessions[name] = JSON.parse(localStorage.getItem("devskits-session") || "[]");
      window.DevSkitsWorld.setSessions(sessions);
      window.DevSkitsDesktop.notify(`Saved snapshot: ${name}`);
    });
    container.querySelector("#load-session").addEventListener("click", () => {
      const name = prompt("Load snapshot name"); if (!name) return;
      const snap = window.DevSkitsWorld.getSessions()[name];
      if (!snap) return window.DevSkitsDesktop.notify("Snapshot not found");
      localStorage.setItem("devskits-session", JSON.stringify(snap));
      window.DevSkitsDesktop.rebootSystem();
    });
    container.querySelector("#reset-notes").addEventListener("click", () => localStorage.removeItem("devskits-notes-v2"));
    container.querySelector("#reset-all").addEventListener("click", () => {
      ["devskits-session", "devskits-theme", "devskits-notes-v2", "devskits-icon-positions", "devskits-crt", "devskits-wallpaper"].forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.settings = render;
})();
