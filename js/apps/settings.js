(() => {
  function render(container) {
    const appSettings = window.DevSkitsWorld.getAppSettings();
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
      <label><input type="checkbox" id="hidden-toggle" ${appSettings.hiddenContent ? "checked" : ""}/> Enable hidden content/easter eggs</label>
      <label><input type="checkbox" id="notifications-toggle" ${appSettings.notificationsEnabled ? "checked" : ""}/> Notifications enabled</label>
      <label><input type="checkbox" id="events-toggle" ${appSettings.eventEngine ? "checked" : ""}/> Event engine enabled</label>
      <fieldset><legend>Desktop widgets</legend>
        <label><input type="checkbox" id="widget-clock" ${appSettings.widgets.clock ? "checked" : ""}/> Clock/Uptime</label>
        <label><input type="checkbox" id="widget-activity" ${appSettings.widgets.activity ? "checked" : ""}/> Recent activity</label>
        <label><input type="checkbox" id="widget-health" ${appSettings.widgets.health ? "checked" : ""}/> System health</label>
        <label><input type="checkbox" id="widget-updates" ${appSettings.widgets.updates ? "checked" : ""}/> Update status</label>
      </fieldset>
      <button class="link-btn" id="cycle-theme">Cycle Theme</button>
      <button class="link-btn" id="toggle-crt">Toggle CRT Overlay</button>
      <button class="link-btn" id="reset-layout">Reset Desktop Layout</button>
      <button class="link-btn" id="toggle-saver">Toggle Screensaver</button>
      <button class="link-btn" id="save-session">Save Session Snapshot</button>
      <button class="link-btn" id="load-session">Load Session Snapshot</button>
      <button class="link-btn" id="reset-logs">Reset Logs</button>
      <button class="link-btn" id="reset-messages">Reset Messages</button>
      <button class="link-btn" id="reset-profile">Reset Profile Stats</button>
      <button class="link-btn" id="reset-updates">Reset Update History</button>
      <button class="link-btn" id="reset-all">Reset Full OS State</button>
    </div>`;

    const { state } = window.DevSkitsState;
    const wp = container.querySelector("#wallpaper-select");
    wp.value = state.wallpaper;
    container.querySelector("#icon-density").value = appSettings.iconDensity || "normal";

    function saveSettings() {
      const next = window.DevSkitsWorld.getAppSettings();
      next.hiddenContent = container.querySelector("#hidden-toggle").checked;
      next.notificationsEnabled = container.querySelector("#notifications-toggle").checked;
      next.eventEngine = container.querySelector("#events-toggle").checked;
      next.widgets = {
        clock: container.querySelector("#widget-clock").checked,
        activity: container.querySelector("#widget-activity").checked,
        health: container.querySelector("#widget-health").checked,
        updates: container.querySelector("#widget-updates").checked
      };
      window.DevSkitsWorld.setAppSettings(next);
    }

    wp.addEventListener("change", () => {
      window.DevSkitsDesktop.applyWallpaper(wp.value);
      window.DevSkitsDesktop.notify("Wallpaper changed", "ok");
    });
    container.querySelectorAll("input[type='checkbox']").forEach((el) => el.addEventListener("change", saveSettings));
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
      if (!snap) return window.DevSkitsDesktop.notify("Snapshot not found", "warn");
      localStorage.setItem("devskits-session", JSON.stringify(snap));
      window.DevSkitsDesktop.rebootSystem();
    });
    container.querySelector("#icon-density").addEventListener("change", (e) => {
      const next = window.DevSkitsWorld.getAppSettings();
      next.iconDensity = e.target.value;
      window.DevSkitsWorld.setAppSettings(next);
      document.body.dataset.iconDensity = e.target.value;
    });
    container.querySelector("#reset-logs").addEventListener("click", () => window.DevSkitsWorld.clearLogs());
    container.querySelector("#reset-messages").addEventListener("click", () => localStorage.removeItem("devskits-inbox-v2"));
    container.querySelector("#reset-profile").addEventListener("click", () => localStorage.removeItem("devskits-profile-v1"));
    container.querySelector("#reset-updates").addEventListener("click", () => localStorage.removeItem("devskits-updates-v1"));
    container.querySelector("#reset-all").addEventListener("click", () => {
      Object.keys(localStorage).filter((k) => k.startsWith("devskits-")).forEach((k) => localStorage.removeItem(k));
      location.reload();
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.settings = render;
})();
