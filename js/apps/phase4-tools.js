(() => {
  const W = window.DevSkitsWorld;

  function renderCalculator(container) {
    container.innerHTML = `<div class="retro-calc"><input class="calc-display" readonly value="0"/><div class="calc-grid"></div></div>`;
    const display = container.querySelector(".calc-display");
    const grid = container.querySelector(".calc-grid");
    const keys = ["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+","C"];
    let expr = "";
    keys.forEach((k) => {
      const b = document.createElement("button"); b.className = "link-btn"; b.textContent = k; b.dataset.k = k; grid.appendChild(b);
    });
    function press(k) {
      if (k === "C") expr = "";
      else if (k === "=") {
        try { expr = String(Function(`return (${expr || 0})`)()); } catch (e) { expr = "ERR"; }
      } else expr += k;
      display.value = expr || "0";
    }
    grid.addEventListener("click", (e) => e.target.dataset.k && press(e.target.dataset.k));
    container.addEventListener("keydown", (e) => {
      if (/^[0-9/*+\-.]$/.test(e.key)) press(e.key);
      if (e.key === "Enter") press("=");
      if (e.key.toLowerCase() === "c") press("C");
    });
    container.tabIndex = 0;
    container.focus();
  }

  function renderCalendar(container) {
    const now = new Date();
    let year = now.getFullYear(); let month = now.getMonth();
    const notes = W.getCalendar();
    container.innerHTML = `<div class="calendar-top"><button class="link-btn" id="cal-prev">◀</button><strong id="cal-label"></strong><button class="link-btn" id="cal-next">▶</button></div><div class="calendar-grid"></div><textarea class="notes-editor" placeholder="Date note..."></textarea>`;
    const grid = container.querySelector(".calendar-grid");
    const label = container.querySelector("#cal-label");
    const editor = container.querySelector("textarea");
    let activeKey = "";
    function draw() {
      const start = new Date(year, month, 1);
      const days = new Date(year, month + 1, 0).getDate();
      label.textContent = start.toLocaleString([], { month: "long", year: "numeric" });
      grid.innerHTML = "";
      const lead = (start.getDay() + 6) % 7;
      for (let i = 0; i < lead; i += 1) grid.innerHTML += `<span class="cal-empty"></span>`;
      for (let d = 1; d <= days; d += 1) {
        const key = `${year}-${month + 1}-${d}`;
        const mark = notes[key] ? "•" : "";
        grid.innerHTML += `<button class="task-btn" data-day="${d}" data-key="${key}">${d} ${mark}</button>`;
      }
    }
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-key]"); if (!btn) return;
      activeKey = btn.dataset.key; editor.value = notes[activeKey] || "";
    });
    editor.addEventListener("input", () => { if (!activeKey) return; notes[activeKey] = editor.value; W.setCalendar(notes); draw(); });
    container.querySelector("#cal-prev").addEventListener("click", () => { month -= 1; if (month < 0) { month = 11; year -= 1; } draw(); });
    container.querySelector("#cal-next").addEventListener("click", () => { month += 1; if (month > 11) { month = 0; year += 1; } draw(); });
    draw();
  }

  function renderQuoteForge(container) {
    const categories = ["status", "dark", "build", "loki"];
    let quotes = W.getQuotes();
    container.innerHTML = `<div class="app-grid"><input id="quote-text" placeholder="Write line..." maxlength="140"/><select id="quote-cat">${categories.map((c) => `<option>${c}</option>`).join("")}</select><button class="link-btn" id="quote-save">Save</button></div><div id="quote-count">0/140</div><div class="files-list" id="quote-list"></div>`;
    const input = container.querySelector("#quote-text");
    const count = container.querySelector("#quote-count");
    function draw() {
      container.querySelector("#quote-list").innerHTML = quotes.map((q, i) => `<div class="note-row"><strong>[${q.category}]</strong> ${q.text}<button class="link-btn" data-copy="${i}">Copy</button></div>`).join("") || "<em>No quotes yet.</em>";
    }
    input.addEventListener("input", () => count.textContent = `${input.value.length}/140`);
    container.querySelector("#quote-save").addEventListener("click", () => {
      if (!input.value.trim()) return;
      quotes.unshift({ text: input.value.trim(), category: container.querySelector("#quote-cat").value, fav: false });
      quotes = quotes.slice(0, 80); W.setQuotes(quotes); input.value = ""; count.textContent = "0/140"; draw();
    });
    container.addEventListener("click", (e) => { if (e.target.dataset.copy) navigator.clipboard?.writeText(quotes[Number(e.target.dataset.copy)].text); });
    draw();
  }

  function renderAscii(container) {
    container.innerHTML = `<textarea class="notes-editor" id="ascii-input" placeholder="Type text"></textarea><pre class="terminal-output" id="ascii-out"></pre><button class="link-btn" id="ascii-copy">Copy</button>`;
    const out = container.querySelector("#ascii-out");
    function convert(s) { return s.toUpperCase().split("").map((ch) => `${ch} `).join("").trim(); }
    container.querySelector("#ascii-input").addEventListener("input", (e) => { out.textContent = convert(e.target.value); });
    container.querySelector("#ascii-copy").addEventListener("click", () => navigator.clipboard?.writeText(out.textContent));
  }

  function renderDraftPad(container) {
    let drafts = W.getDrafts();
    container.innerHTML = `<div class="badges"><button class="link-btn" id="draft-new">New Draft</button><button class="link-btn" id="draft-to-notes">Send To Notes</button></div><textarea class="notes-editor"></textarea><div class="files-list" id="draft-list"></div>`;
    const editor = container.querySelector("textarea"); let active = null;
    function draw() {
      container.querySelector("#draft-list").innerHTML = drafts.map((d) => `<button class="task-btn" data-id="${d.id}">${d.title}</button>`).join("") || "<em>No drafts saved.</em>";
      const row = drafts.find((d) => d.id === active); editor.value = row?.body || "";
    }
    container.querySelector("#draft-new").addEventListener("click", () => { const d = { id: `d-${Date.now()}`, title: `draft-${drafts.length + 1}`, body: "" }; drafts.unshift(d); active = d.id; W.setDrafts(drafts); draw(); });
    container.querySelector("#draft-list").addEventListener("click", (e) => { if (e.target.dataset.id) { active = e.target.dataset.id; draw(); } });
    editor.addEventListener("input", () => { const row = drafts.find((d) => d.id === active); if (!row) return; row.body = editor.value; W.setDrafts(drafts); });
    container.querySelector("#draft-to-notes").addEventListener("click", () => {
      const row = drafts.find((d) => d.id === active); if (!row) return;
      const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]");
      notes.push({ id: `note-${Date.now()}`, name: `${row.title}.txt`, content: row.body });
      localStorage.setItem("devskits-notes-v2", JSON.stringify(notes));
      window.DevSkitsDesktop.notify("Draft sent to Notes");
    });
    draw();
  }

  function renderClock(container) {
    const start = Date.now() - 1000 * 60 * 42;
    container.innerHTML = `<div class="clock-face"></div><div class="files-list" id="clock-meta"></div>`;
    const face = container.querySelector(".clock-face");
    const meta = container.querySelector("#clock-meta");
    setInterval(() => {
      const now = new Date();
      face.textContent = now.toLocaleTimeString();
      meta.innerHTML = `<div>UTC ${now.toUTCString().slice(17, 25)}</div><div>Uptime ${(Date.now() - start) / 60000 | 0}m</div><div>Build 2026.04-P4</div>`;
    }, 1000);
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  Object.assign(window.DevSkitsAppRegistry, {
    calendar: renderCalendar,
    quoteforge: renderQuoteForge,
    asciimaker: renderAscii,
    draftpad: renderDraftPad,
    clock: renderClock
  });
})();
