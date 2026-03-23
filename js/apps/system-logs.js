(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    container.innerHTML = `
      <h3>System Logs</h3>
      <div class="badges">
        <select id="log-filter">
          <option value="all">all</option>
          <option value="system">system</option>
          <option value="updates">updates</option>
          <option value="notifications">notifications</option>
          <option value="boot">boot</option>
          <option value="reminders">reminders</option>
        </select>
        <button class="link-btn" id="log-clear">Clear</button>
        <button class="link-btn" id="log-export">Export</button>
      </div>
      <pre id="log-out" class="terminal-output" style="height:260px"></pre>
    `;

    const output = container.querySelector("#log-out");
    const filter = container.querySelector("#log-filter");

    function draw() {
      const rows = W().getLogs().filter((row) => filter.value === "all" || row.channel === filter.value);
      output.textContent = rows.map((row) => `${new Date(row.at).toLocaleString()} [${row.channel}/${row.level}] ${row.message}`).join("\n") || "No logs.";
    }

    filter.addEventListener("change", draw);
    container.querySelector("#log-clear").addEventListener("click", () => {
      W().clearLogs();
      draw();
    });
    container.querySelector("#log-export").addEventListener("click", () => {
      const blob = new Blob([output.textContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "devskits-system-logs.txt";
      link.click();
    });

    draw();
  }

  registerApp("system-logs", render, ["syslogs", "systemlogs", "logs"]);
})();
