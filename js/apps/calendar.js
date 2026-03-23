(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    const notes = W().getCalendar();
    let activeKey = "";

    container.innerHTML = `
      <div class="calendar-top">
        <button class="link-btn" id="cal-prev">◀</button>
        <strong id="cal-label"></strong>
        <button class="link-btn" id="cal-next">▶</button>
      </div>
      <div class="calendar-grid"></div>
      <textarea class="notes-editor" placeholder="Date note..."></textarea>
    `;

    const grid = container.querySelector(".calendar-grid");
    const label = container.querySelector("#cal-label");
    const editor = container.querySelector("textarea");

    function draw() {
      const start = new Date(year, month, 1);
      const days = new Date(year, month + 1, 0).getDate();
      label.textContent = start.toLocaleString([], { month: "long", year: "numeric" });
      grid.innerHTML = "";

      const lead = (start.getDay() + 6) % 7;
      for (let i = 0; i < lead; i += 1) {
        grid.innerHTML += '<span class="cal-empty"></span>';
      }

      for (let day = 1; day <= days; day += 1) {
        const key = `${year}-${month + 1}-${day}`;
        const mark = notes[key] ? "•" : "";
        grid.innerHTML += `<button class="task-btn" data-day="${day}" data-key="${key}">${day} ${mark}</button>`;
      }
    }

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-key]");
      if (!button) return;
      activeKey = button.dataset.key;
      editor.value = notes[activeKey] || "";
    });

    editor.addEventListener("input", () => {
      if (!activeKey) return;
      notes[activeKey] = editor.value;
      W().setCalendar(notes);
      draw();
    });

    container.querySelector("#cal-prev").addEventListener("click", () => {
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      draw();
    });

    container.querySelector("#cal-next").addEventListener("click", () => {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      draw();
    });

    draw();
  }

  registerApp("calendar", render, ["calendar-planner"]);
})();
