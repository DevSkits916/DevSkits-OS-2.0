(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const data = W().getUpdates();
    const available = data.available[0];

    container.innerHTML = `
      <h3>System Update Engine</h3>
      <p>Current: ${data.currentVersion} / ${data.currentBuild}</p>
      ${available ? `
        <div class="project-card">
          <h4>Available ${available.version} / ${available.build}</h4>
          <p>${available.title}</p>
          <details>
            <summary>Patch Notes</summary>
            <pre>Shell:
- ${available.notes.shell.join("\n- ")}

Apps:
- ${available.notes.apps.join("\n- ")}

Fixes:
- ${available.notes.fixes.join("\n- ")}

Hidden:
- ${available.notes.hidden.join("\n- ")}</pre>
          </details>
          <div class="badges">
            <button class="link-btn" id="upd-download">Download update</button>
            <button class="link-btn" id="upd-install">Install update</button>
            <button class="link-btn" id="upd-restart">Restart system</button>
          </div>
        </div>
      ` : "<p>No available updates in channel.</p>"}
      <h4>Update History</h4>
      ${data.history.map((item) => `<div class="note-row">${item.version} ${item.build} <small>${new Date(item.at).toLocaleString()}</small></div>`).join("") || "<em>No installs yet.</em>"}
    `;

    container.querySelector("#upd-download")?.addEventListener("click", () => {
      W().downloadUpdate(available.id);
      render(container);
    });
    container.querySelector("#upd-install")?.addEventListener("click", () => {
      W().installUpdate(available.id);
      render(container);
    });
    container.querySelector("#upd-restart")?.addEventListener("click", () => {
      window.DevSkitsDesktop.rebootSystem();
    });
  }

  registerApp("updater", render, ["updates"]);
})();
