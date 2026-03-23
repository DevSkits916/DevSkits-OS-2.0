(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    container.innerHTML = `
      <h3>Recent Activity</h3>
      <div class="badges">
        <select id="act-filter">
          <option value="all">all</option>
          <option value="app">app</option>
          <option value="cmd">cmd</option>
          <option value="update">update</option>
          <option value="service">service</option>
          <option value="message">message</option>
        </select>
      </div>
      <div id="act-list" class="files-list"></div>
    `;

    const list = container.querySelector("#act-list");
    const filter = container.querySelector("#act-filter");

    function draw() {
      const rows = W().getRecentActivity().filter((row) => filter.value === "all" || row.type === filter.value);
      list.innerHTML = rows.map((row) => `<div class="note-row"><span>[${row.type}] ${row.detail}</span><small>${new Date(row.at).toLocaleTimeString()}</small></div>`).join("") || "<em>No activity yet.</em>";
    }

    filter.addEventListener("change", draw);
    draw();
  }

  registerApp("activity", render);
})();
