(() => {
  const W = window.DevSkitsWorld;

  function renderUpdater(container) {
    const data = W.getUpdates();
    const available = data.available[0];
    container.innerHTML = `<h3>System Update Engine</h3><p>Current: ${data.currentVersion} / ${data.currentBuild}</p>${available ? `<div class="project-card"><h4>Available ${available.version} / ${available.build}</h4><p>${available.title}</p><details><summary>Patch Notes</summary><pre>Shell:\n- ${available.notes.shell.join("\n- ")}\n\nApps:\n- ${available.notes.apps.join("\n- ")}\n\nFixes:\n- ${available.notes.fixes.join("\n- ")}\n\nHidden:\n- ${available.notes.hidden.join("\n- ")}</pre></details><div class="badges"><button class="link-btn" id="upd-download">Download update</button><button class="link-btn" id="upd-install">Install update</button><button class="link-btn" id="upd-restart">Restart system</button></div></div>` : "<p>No available updates in channel.</p>"}<h4>Update History</h4>${data.history.map((h) => `<div class="note-row">${h.version} ${h.build} <small>${new Date(h.at).toLocaleString()}</small></div>`).join("") || "<em>No installs yet.</em>"}`;
    container.querySelector("#upd-download")?.addEventListener("click", () => { W.downloadUpdate(available.id); renderUpdater(container); });
    container.querySelector("#upd-install")?.addEventListener("click", () => { W.installUpdate(available.id); renderUpdater(container); });
    container.querySelector("#upd-restart")?.addEventListener("click", () => window.DevSkitsDesktop.rebootSystem());
  }

  function renderProcessMonitor(container) {
    container.innerHTML = `<h3>Process Monitor</h3><div id="proc-stats"></div><div class="badges"><button class="link-btn" id="proc-tab-services">Services</button><button class="link-btn" id="proc-tab-processes">Processes</button></div><div id="proc-body"></div>`;
    const stats = container.querySelector("#proc-stats");
    const body = container.querySelector("#proc-body");
    let tab = "services";
    function draw() {
      const snap = W.getProcessSnapshot();
      const services = W.getServices();
      stats.innerHTML = `<div class="widget">CPU ${snap.cpu}% · MEM ${snap.memory}% · Uptime ${(snap.uptimeMs / 1000 | 0)}s · ${snap.running}/${snap.total} online</div>`;
      if (tab === "services") {
        body.innerHTML = Object.keys(services).map((id) => `<div class="note-row"><span>${services[id] ? "●" : "○"} ${id}</span><button class="link-btn" data-toggle="${id}">${services[id] ? "Stop" : "Start"}</button></div>`).join("");
      } else {
        body.innerHTML = Object.keys(services).filter((id) => services[id]).map((id, i) => `<div class="note-row"><span>PID ${1000 + i} / ${id}</span><span>running</span></div>`).join("");
      }
    }
    container.addEventListener("click", (e) => {
      if (e.target.id === "proc-tab-services") tab = "services";
      if (e.target.id === "proc-tab-processes") tab = "processes";
      if (e.target.dataset.toggle) W.toggleService(e.target.dataset.toggle);
      draw();
    });
    draw();
    const timer = setInterval(draw, 2000);
    container.closest(".window")?.addEventListener("remove", () => clearInterval(timer));
  }

  function renderActivity(container) {
    container.innerHTML = `<h3>Recent Activity</h3><div class="badges"><select id="act-filter"><option value="all">all</option><option value="app">app</option><option value="cmd">cmd</option><option value="update">update</option><option value="service">service</option><option value="message">message</option></select></div><div id="act-list" class="files-list"></div>`;
    const list = container.querySelector("#act-list");
    const select = container.querySelector("#act-filter");
    function draw() {
      const rows = W.getRecentActivity().filter((r) => select.value === "all" || r.type === select.value);
      list.innerHTML = rows.map((r) => `<div class="note-row"><span>[${r.type}] ${r.detail}</span><small>${new Date(r.at).toLocaleTimeString()}</small></div>`).join("") || "<em>No activity yet.</em>";
    }
    select.addEventListener("change", draw);
    draw();
  }

  function renderLogs(container) {
    container.innerHTML = `<h3>System Logs</h3><div class="badges"><select id="log-filter"><option value="all">all</option><option value="system">system</option><option value="updates">updates</option><option value="notifications">notifications</option><option value="boot">boot</option><option value="reminders">reminders</option></select><button class="link-btn" id="log-clear">Clear</button><button class="link-btn" id="log-export">Export</button></div><pre id="log-out" class="terminal-output" style="height:260px"></pre>`;
    const out = container.querySelector("#log-out");
    const filter = container.querySelector("#log-filter");
    function draw() {
      const rows = W.getLogs().filter((r) => filter.value === "all" || r.channel === filter.value);
      out.textContent = rows.map((r) => `${new Date(r.at).toLocaleString()} [${r.channel}/${r.level}] ${r.message}`).join("\n") || "No logs.";
    }
    filter.addEventListener("change", draw);
    container.querySelector("#log-clear").addEventListener("click", () => { W.clearLogs(); draw(); });
    container.querySelector("#log-export").addEventListener("click", () => {
      const blob = new Blob([out.textContent], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "devskits-system-logs.txt";
      a.click();
    });
    draw();
  }

  function renderReminders(container) {
    let rows = W.getReminders();
    container.innerHTML = `<h3>Reminders / Tasks</h3><div class="badges"><input id="rem-title" class="start-search" placeholder="Task title"/><input id="rem-due" type="datetime-local"/><button class="link-btn" id="rem-add">Add</button></div><div id="rem-list" class="files-list"></div>`;
    const list = container.querySelector("#rem-list");
    function draw() {
      rows = W.getReminders();
      list.innerHTML = rows.map((r, i) => `<div class="note-row"><span>${r.done ? "[x]" : "[ ]"} ${r.title}${r.dueAt ? ` · due ${new Date(r.dueAt).toLocaleString()}` : ""}</span><span><button class="link-btn" data-done="${i}">Done</button><button class="link-btn" data-archive="${i}">Archive</button></span></div>`).join("") || "<em>No reminders.</em>";
    }
    container.addEventListener("click", (e) => {
      if (e.target.id === "rem-add") {
        const title = container.querySelector("#rem-title").value.trim();
        if (!title) return;
        rows.unshift({ title, dueAt: container.querySelector("#rem-due").value ? new Date(container.querySelector("#rem-due").value).getTime() : null, done: false, archived: false });
        W.setReminders(rows);
        W.trackActivity("reminder", `created ${title}`);
        draw();
      }
      if (e.target.dataset.done) { rows[Number(e.target.dataset.done)].done = true; W.setReminders(rows); draw(); }
      if (e.target.dataset.archive) { rows.splice(Number(e.target.dataset.archive), 1); W.setReminders(rows); draw(); }
    });
    draw();
  }

  function renderProfile(container) {
    const p = W.getProfile();
    const mostUsed = Object.entries(p.appsOpened || {}).sort((a, b) => b[1] - a[1])[0];
    container.innerHTML = `<h3>System Identity Profile</h3><div class="app-grid"><div class="widget">First boot: ${new Date(p.firstBootAt).toLocaleString()}</div><div class="widget">Boots: ${p.bootCount}</div><div class="widget">Most used app: ${mostUsed ? `${mostUsed[0]} (${mostUsed[1]})` : "n/a"}</div><div class="widget">Commands run: ${p.commandsRun}</div><div class="widget">Packages installed: ${p.packagesInstalled}</div><div class="widget">Hidden pages found: ${p.hiddenPagesFound}</div><div class="widget">Notes created: ${p.notesCreated}</div></div>`;
  }

  function renderPresence(container) {
    const services = W.getServices();
    const updates = W.getUpdates();
    container.innerHTML = `<h3>Network / Presence Layer</h3><pre>operator      :: online\nsystem        :: online\narchive       :: ${services["archive.scan"] ? "online" : "offline"}\nloki.guard    :: ${services["loki.guard"] ? "online" : "offline"}\ndevpkg        :: ${services["pkg.manager"] ? "online" : "offline"}\ninbox relay   :: ${services["inbox.sync"] ? "active" : "stalled"}\npackage chan  :: stable\nroute index   :: ${W.getIndexStatus().counts.pages || 0} mapped\nupdate node   :: ${updates.available.length ? "pending packages" : "up-to-date"}</pre>`;
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  Object.assign(window.DevSkitsAppRegistry, {
    updater: renderUpdater,
    processmon: renderProcessMonitor,
    activity: renderActivity,
    syslogs: renderLogs,
    reminders: renderReminders,
    profile: renderProfile,
    presence: renderPresence
  });
})();
