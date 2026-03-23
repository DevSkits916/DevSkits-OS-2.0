(() => {
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const start = Date.now() - 1000 * 60 * 42;

    container.innerHTML = `
      <div class="clock-face"></div>
      <div class="files-list" id="clock-meta"></div>
    `;

    const face = container.querySelector(".clock-face");
    const meta = container.querySelector("#clock-meta");

    function draw() {
      const now = new Date();
      face.textContent = now.toLocaleTimeString();
      meta.innerHTML = `
        <div>UTC ${now.toUTCString().slice(17, 25)}</div>
        <div>Uptime ${Math.floor((Date.now() - start) / 60000)}m</div>
        <div>Build ${window.DevSkitsWorld?.getUpdates?.().currentBuild || "DSK-420"}</div>
      `;
    }

    draw();
    const timer = setInterval(draw, 1000);
    container.closest(".window")?.addEventListener("remove", () => clearInterval(timer), { once: true });
  }

  registerApp("clock", render);
})();
