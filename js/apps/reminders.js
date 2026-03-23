(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    let rows = W().getReminders();

    container.innerHTML = `
      <h3>Reminders</h3>
      <div class="badges">
        <input id="rem-title" class="start-search" placeholder="Reminder title"/>
        <input id="rem-due" type="datetime-local"/>
        <button class="link-btn" id="rem-add">Add</button>
      </div>
      <div id="rem-list" class="files-list"></div>
    `;

    const list = container.querySelector("#rem-list");

    function draw() {
      rows = W().getReminders();
      list.innerHTML = rows.map((row, index) => `
        <div class="note-row">
          <span>${row.done ? "[x]" : "[ ]"} ${row.title}${row.dueAt ? ` · due ${new Date(row.dueAt).toLocaleString()}` : ""}</span>
          <span>
            <button class="link-btn" data-done="${index}">Done</button>
            <button class="link-btn" data-archive="${index}">Archive</button>
          </span>
        </div>
      `).join("") || "<em>No reminders.</em>";
    }

    container.addEventListener("click", (event) => {
      if (event.target.id === "rem-add") {
        const title = container.querySelector("#rem-title").value.trim();
        if (!title) return;
        rows.unshift({
          title,
          dueAt: container.querySelector("#rem-due").value ? new Date(container.querySelector("#rem-due").value).getTime() : null,
          done: false,
          archived: false
        });
        W().setReminders(rows);
        W().trackActivity("reminder", `created ${title}`);
        draw();
      }
      if (event.target.dataset.done) {
        rows[Number(event.target.dataset.done)].done = true;
        W().setReminders(rows);
        draw();
      }
      if (event.target.dataset.archive) {
        rows.splice(Number(event.target.dataset.archive), 1);
        W().setReminders(rows);
        draw();
      }
    });

    draw();
  }

  registerApp("reminders", render, ["planner"]);
})();
