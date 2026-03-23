(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const profile = W().getProfile();
    const mostUsed = Object.entries(profile.appsOpened || {}).sort((a, b) => b[1] - a[1])[0];

    container.innerHTML = `
      <h3>Profile</h3>
      <div class="app-grid">
        <div class="widget">First boot: ${new Date(profile.firstBootAt).toLocaleString()}</div>
        <div class="widget">Boots: ${profile.bootCount}</div>
        <div class="widget">Most used app: ${mostUsed ? `${mostUsed[0]} (${mostUsed[1]})` : "n/a"}</div>
        <div class="widget">Commands run: ${profile.commandsRun}</div>
        <div class="widget">Packages installed: ${profile.packagesInstalled}</div>
        <div class="widget">Hidden pages found: ${profile.hiddenPagesFound}</div>
        <div class="widget">Notes created: ${profile.notesCreated}</div>
      </div>
    `;
  }

  registerApp("profile", render, ["system-profile"]);
})();
