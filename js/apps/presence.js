(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const services = W().getServices();
    const updates = W().getUpdates();

    container.innerHTML = `
      <h3>Presence</h3>
      <pre>operator      :: online
system        :: online
archive       :: ${services["archive.scan"] ? "online" : "offline"}
loki.guard    :: ${services["loki.guard"] ? "online" : "offline"}
devpkg        :: ${services["pkg.manager"] ? "online" : "offline"}
inbox relay   :: ${services["inbox.sync"] ? "active" : "stalled"}
package chan  :: stable
route index   :: ${W().getIndexStatus().counts.pages || 0} mapped
update node   :: ${updates.available.length ? "pending packages" : "up-to-date"}</pre>
    `;
  }

  registerApp("presence", render, ["network-status"]);
})();
