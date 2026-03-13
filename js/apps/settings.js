(() => {
  function render(container) {
    const appSettings = window.DevSkitsWorld.getAppSettings();
    const fastBoot = localStorage.getItem("devskits-fast-boot") === "on";
    const animations = localStorage.getItem("devskits-animations") !== "off";
    const clock24h = appSettings.clock24h !== false;

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
      <label>Icon Density
        <select id="icon-density">
          <option value="normal">Normal</option>
          <option value="compact">Compact</option>
        </select>
      </label>
      <label><input type="checkbox" id="fast-boot-toggle" ${fastBoot ? "checked" : ""}/> Fast boot mode</label>
      <label><input type="checkbox" id="animations-toggle" ${animations ? "checked" : ""}/> Window animations enabled</label>
      <label><input type="checkbox" id="clock-toggle" ${clock24h ? "checked" : ""}/> 24h clock format</label>
      <button class="link-btn" id="cycle-theme">Cycle Theme</button>
      <button class="link-btn" id="toggle-crt">Toggle CRT Overlay</button>
      <button class="link-btn" id="reset-layout">Reset Desktop Layout</button>
      <button class="link-btn" id="reset-all">Reset Full OS State</button>
    </div>`;

    const { state } = window.DevSkitsState;
    const wp = container.querySelector("#wallpaper-select");
    wp.value = state.wallpaper;
    container.querySelector("#icon-density").value = appSettings.iconDensity || "normal";

    wp.addEventListener("change", () => {
      window.DevSkitsDesktop.applyWallpaper(wp.value);
      window.DevSkitsDesktop.notify("Wallpaper changed", "ok");
    });
    container.querySelector("#cycle-theme").addEventListener("click", window.DevSkitsDesktop.cycleTheme);
    container.querySelector("#toggle-crt").addEventListener("click", () => window.DevSkitsDesktop.toggleCRT());

    container.querySelector("#icon-density").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.iconDensity = e.target.value;
      window.DevSkitsWorld.setAppSettings(next);
      document.body.dataset.iconDensity = e.target.value;
    });

    container.querySelector("#fast-boot-toggle").addEventListener("change", (e) => {
      localStorage.setItem("devskits-fast-boot", e.target.checked ? "on" : "off");
    });

    container.querySelector("#animations-toggle").addEventListener("change", (e) => {
      localStorage.setItem("devskits-animations", e.target.checked ? "on" : "off");
      document.body.classList.toggle("reduce-motion", !e.target.checked);
    });

    container.querySelector("#clock-toggle").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.clock24h = e.target.checked;
      window.DevSkitsWorld.setAppSettings(next);
    });

    container.querySelector("#reset-layout").addEventListener("click", () => {
      localStorage.removeItem("devskits-icon-positions");
      state.iconPositions = {};
      window.DevSkitsDesktop.buildDesktopIcons();
      window.DevSkitsDesktop.notify("Layout reset", "ok");
    });

    container.querySelector("#reset-all").addEventListener("click", () => {
      Object.keys(localStorage).filter((k) => k.startsWith("devskits-")).forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.settings = render;
})();
