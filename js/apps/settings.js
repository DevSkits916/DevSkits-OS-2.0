(() => {
  function render(container) {
    const appSettings = window.DevSkitsWorld.getAppSettings();
    const fastBoot = localStorage.getItem("devskits-fast-boot") === "on";
    const animations = localStorage.getItem("devskits-animations") !== "off";
    const clock24h = appSettings.clock24h !== false;
    const soundsOn = localStorage.getItem("devskits-sound") !== "off";

    container.innerHTML = `
    <h3>Settings / Control Panel</h3>
    <div class="app-grid">
      <label>Wallpaper
        <select id="wallpaper-select">
          <option value="devskits95">DevSkits 95 (Embedded image, no binary file)</option>
        </select>
      </label>
      <label>Icon Density
        <select id="icon-density">
          <option value="normal">Normal</option>
          <option value="compact">Compact</option>
        </select>
      </label>
      <label>Mobile Density
        <select id="mobile-density">
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </label>
      <label><input type="checkbox" id="fast-boot-toggle" ${fastBoot ? "checked" : ""}/> Boot animation enabled</label>
      <label><input type="checkbox" id="animations-toggle" ${animations ? "checked" : ""}/> Reduced motion off</label>
      <label><input type="checkbox" id="clock-toggle" ${clock24h ? "checked" : ""}/> 24h clock format</label>
      <label><input type="checkbox" id="sound-toggle" ${soundsOn ? "checked" : ""}/> System sounds enabled</label>
      <button class="link-btn" id="cycle-theme">Cycle Theme</button>
      <button class="link-btn" id="toggle-crt">Toggle CRT Overlay</button>
      <button class="link-btn" id="reset-layout">Reset Desktop Layout</button>
      <button class="link-btn" id="reset-all">Reset Full OS State</button>
    </div>`;

    const { state } = window.DevSkitsState;
    const wp = container.querySelector("#wallpaper-select");
    wp.value = state.wallpaper;
    container.querySelector("#icon-density").value = appSettings.iconDensity || "normal";
    container.querySelector("#mobile-density").value = appSettings.mobileDensity || "comfortable";

    function persist(next) {
      window.DevSkitsWorld.setAppSettings(next);
    }

    wp.addEventListener("change", () => {
      window.DevSkitsDesktop.applyWallpaper(wp.value);
      const next = window.DevSkitsWorld.getAppSettings();
      next.wallpaper = wp.value;
      persist(next);
      window.DevSkitsDesktop.notify("Wallpaper changed", "ok");
    });
    container.querySelector("#cycle-theme").addEventListener("click", () => {
      window.DevSkitsDesktop.cycleTheme();
      const next = window.DevSkitsWorld.getAppSettings();
      next.theme = window.DevSkitsState.state.activeTheme;
      persist(next);
    });
    container.querySelector("#toggle-crt").addEventListener("click", () => window.DevSkitsDesktop.toggleCRT());

    container.querySelector("#icon-density").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.iconDensity = e.target.value;
      persist(next);
      document.body.dataset.iconDensity = e.target.value;
      window.DevSkitsDesktop.relayoutDesktopIcons();
    });

    container.querySelector("#mobile-density").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.mobileDensity = e.target.value;
      persist(next);
      document.body.dataset.mobileDensity = e.target.value;
      window.DevSkitsDesktop.relayoutDesktopIcons();
    });

    container.querySelector("#fast-boot-toggle").addEventListener("change", (e) => {
      localStorage.setItem("devskits-fast-boot", e.target.checked ? "off" : "on");
      const next = window.DevSkitsWorld.getAppSettings();
      next.bootAnimation = e.target.checked ? "full" : "minimal";
      persist(next);
    });

    container.querySelector("#animations-toggle").addEventListener("change", (e) => {
      localStorage.setItem("devskits-animations", e.target.checked ? "on" : "off");
      const next = window.DevSkitsWorld.getAppSettings();
      next.reducedMotion = !e.target.checked;
      persist(next);
      document.body.classList.toggle("reduce-motion", !e.target.checked);
    });

    container.querySelector("#clock-toggle").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.clock24h = e.target.checked;
      persist(next);
    });

    container.querySelector("#sound-toggle").addEventListener("change", (e) => {
      localStorage.setItem("devskits-sound", e.target.checked ? "on" : "off");
      const next = window.DevSkitsWorld.getAppSettings();
      next.soundEnabled = e.target.checked;
      persist(next);
    });

    container.querySelector("#reset-layout").addEventListener("click", () => {
      localStorage.removeItem("devskits-icon-positions");
      localStorage.removeItem("devskits-desktop-labels-v1");
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
