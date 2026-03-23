(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    container.innerHTML = `
      <h3>Process Monitor</h3>
      <div id="proc-stats"></div>
      <div class="badges">
        <button class="link-btn" id="proc-tab-services">Services</button>
        <button class="link-btn" id="proc-tab-processes">Processes</button>
      </div>
      <div id="proc-body"></div>
    `;

    const stats = container.querySelector("#proc-stats");
    const body = container.querySelector("#proc-body");
    let tab = "services";

    function draw() {
      const snapshot = W().getProcessSnapshot();
      const services = W().getServices();
      stats.innerHTML = `<div class="widget">CPU ${snapshot.cpu}% · MEM ${snapshot.memory}% · Uptime ${Math.floor(snapshot.uptimeMs / 1000)}s · ${snapshot.running}/${snapshot.total} online</div>`;

      if (tab === "services") {
        body.innerHTML = Object.keys(services).map((id) => `
          <div class="note-row">
            <span>${services[id] ? "●" : "○"} ${id}</span>
            <button class="link-btn" data-toggle="${id}">${services[id] ? "Stop" : "Start"}</button>
          </div>
        `).join("");
        return;
      }

      body.innerHTML = Object.keys(services)
        .filter((id) => services[id])
        .map((id, index) => `<div class="note-row"><span>PID ${1000 + index} / ${id}</span><span>running</span></div>`)
        .join("") || "<em>No active processes.</em>";
    }

    container.addEventListener("click", (event) => {
      if (event.target.id === "proc-tab-services") tab = "services";
      if (event.target.id === "proc-tab-processes") tab = "processes";
      if (event.target.dataset.toggle) W().toggleService(event.target.dataset.toggle);
      draw();
    });

    draw();
    const timer = setInterval(draw, 2000);
    container.closest(".window")?.addEventListener("remove", () => clearInterval(timer), { once: true });
  }

  registerApp("process-monitor", render, ["processmon", "process-monitor", "processes"]);
})();
