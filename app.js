const APPS = {
  terminal: { title: "Terminal", icon: ">_" },
  contact: { title: "Contact", icon: "☎" },
  donate: { title: "Donate", icon: "$" },
  projects: { title: "Projects", icon: "⌘" },
  loki: { title: "Loki", icon: "🐾" },
  notes: { title: "Notes", icon: "✎" },
  links: { title: "Links", icon: "↗" },
  about: { title: "About", icon: "i" },
  recycle: { title: "Recycle Bin", icon: "🗑" }
};

const state = {
  windows: new Map(),
  z: 5,
  history: [],
  historyIndex: -1,
  themes: ["default", "graphite", "paper"],
  activeTheme: localStorage.getItem("devskits-theme") || "default"
};

const $ = (sel) => document.querySelector(sel);
const desktop = $("#desktop");
const iconContainer = $("#desktop-icons");
const windowLayer = $("#window-layer");
const taskButtons = $("#task-buttons");
const startMenu = $("#start-menu");
const startBtn = $("#start-btn");

function init() {
  applyTheme(state.activeTheme);
  buildDesktopIcons();
  bindGlobalUI();
  startBootSequence();
  setInterval(updateClock, 1000);
  updateClock();
}

function startBootSequence() {
  const boot = $("#boot-screen");
  const bar = $("#boot-bar");
  const status = $("#boot-status");
  const lines = [
    "Initializing identity shell...",
    "Loading modules: terminal, notes, loki...",
    "Mounting localStorage volumes...",
    "Bringing desktop online..."
  ];
  let i = 0;
  bar.style.width = "0%";
  const total = 3200;
  const interval = 800;
  status.textContent = lines[0];
  const tick = setInterval(() => {
    i += 1;
    bar.style.width = `${Math.min(100, (i * interval / total) * 100)}%`;
    status.textContent = lines[Math.min(i, lines.length - 1)];
  }, interval);

  setTimeout(() => {
    clearInterval(tick);
    boot.classList.add("hidden");
    desktop.classList.remove("hidden");
    restoreSession();
  }, total);
}

function buildDesktopIcons() {
  const tpl = $("#desktop-icon-template");
  Object.entries(APPS).forEach(([id, app]) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.app = id;
    node.querySelector(".icon-glyph").textContent = app.icon;
    node.querySelector(".icon-label").textContent = app.title;
    node.addEventListener("dblclick", () => openApp(id));
    node.addEventListener("click", () => node.focus());
    iconContainer.appendChild(node);
  });
}

function bindGlobalUI() {
  startBtn.addEventListener("click", () => {
    const expanded = !startMenu.classList.contains("hidden");
    startMenu.classList.toggle("hidden", expanded);
    startBtn.setAttribute("aria-expanded", String(!expanded));
  });

  startMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-open]");
    if (!btn) return;
    openApp(btn.dataset.open);
    hideMenu();
  });

  $("#menu-reboot").addEventListener("click", () => rebootSystem());
  $("#menu-shutdown").addEventListener("click", () => fakeShutdown());
  document.addEventListener("click", (e) => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) hideMenu();
  });
}

function hideMenu() {
  startMenu.classList.add("hidden");
  startBtn.setAttribute("aria-expanded", "false");
}

function openApp(appId) {
  if (!APPS[appId]) return;
  if (appId === "recycle") {
    alert("Recycle Bin is decorative in this build.");
    return;
  }
  if (state.windows.has(appId)) {
    restoreWindow(appId);
    focusWindow(appId);
    return;
  }

  const win = $("#window-template").content.firstElementChild.cloneNode(true);
  const meta = APPS[appId];
  win.dataset.app = appId;
  win.querySelector(".window-title").textContent = `${meta.title} - DevSkits OS 2.0`;
  win.style.left = `${90 + state.windows.size * 20}px`;
  win.style.top = `${80 + state.windows.size * 18}px`;
  win.style.zIndex = ++state.z;

  const content = win.querySelector(".window-content");
  renderAppContent(appId, content);
  wireWindowControls(win, appId);
  enableDragging(win, appId);
  windowLayer.appendChild(win);
  state.windows.set(appId, { el: win, minimized: false, maximized: false });
  createTaskButton(appId, meta.title);
  focusWindow(appId);
  persistSession();
}

function renderAppContent(appId, container) {
  const creators = {
    terminal: terminalContent,
    contact: contactContent,
    donate: donateContent,
    projects: projectsContent,
    loki: lokiContent,
    notes: notesContent,
    links: linksContent,
    about: aboutContent
  };
  const fn = creators[appId];
  container.innerHTML = "";
  if (fn) fn(container);
}

function wireWindowControls(win, appId) {
  win.addEventListener("mousedown", () => focusWindow(appId));
  win.querySelector(".win-close").addEventListener("click", () => closeWindow(appId));
  win.querySelector(".win-min").addEventListener("click", () => minimizeWindow(appId));
  win.querySelector(".win-max").addEventListener("click", () => toggleMaximize(appId));
  win.querySelector(".window-titlebar").addEventListener("dblclick", () => toggleMaximize(appId));
}

function createTaskButton(appId, title) {
  const btn = document.createElement("button");
  btn.className = "task-btn";
  btn.dataset.app = appId;
  btn.textContent = title;
  btn.addEventListener("click", () => {
    const rec = state.windows.get(appId);
    if (!rec) return;
    if (rec.minimized) restoreWindow(appId);
    else if (rec.el.classList.contains("active")) minimizeWindow(appId);
    else focusWindow(appId);
  });
  taskButtons.appendChild(btn);
}

function focusWindow(appId) {
  state.windows.forEach((rec, id) => {
    rec.el.classList.toggle("active", id === appId);
    const task = taskButtons.querySelector(`[data-app="${id}"]`);
    task?.classList.toggle("active", id === appId);
  });
  const rec = state.windows.get(appId);
  if (!rec) return;
  rec.el.style.zIndex = ++state.z;
}

function closeWindow(appId) {
  const rec = state.windows.get(appId);
  if (!rec) return;
  rec.el.remove();
  state.windows.delete(appId);
  taskButtons.querySelector(`[data-app="${appId}"]`)?.remove();
  persistSession();
}

function minimizeWindow(appId) {
  const rec = state.windows.get(appId);
  if (!rec) return;
  rec.minimized = true;
  rec.el.classList.add("hidden");
  taskButtons.querySelector(`[data-app="${appId}"]`)?.classList.remove("active");
  persistSession();
}

function restoreWindow(appId) {
  const rec = state.windows.get(appId);
  if (!rec) return;
  rec.minimized = false;
  rec.el.classList.remove("hidden");
  focusWindow(appId);
  persistSession();
}

function toggleMaximize(appId) {
  const rec = state.windows.get(appId);
  if (!rec || rec.minimized) return;
  if (!rec.maximized) {
    rec.prev = {
      left: rec.el.style.left,
      top: rec.el.style.top,
      width: rec.el.style.width,
      height: rec.el.style.height
    };
    rec.el.style.left = "0";
    rec.el.style.top = "0";
    rec.el.style.width = "100%";
    rec.el.style.height = "calc(100% - 2.3rem)";
    rec.maximized = true;
  } else {
    Object.assign(rec.el.style, rec.prev || {});
    rec.maximized = false;
  }
  persistSession();
}

function enableDragging(win, appId) {
  const bar = win.querySelector(".window-titlebar");
  let drag = null;

  bar.addEventListener("pointerdown", (e) => {
    const rec = state.windows.get(appId);
    if (!rec || rec.maximized || e.target.closest("button")) return;
    const rect = win.getBoundingClientRect();
    drag = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 80;
    const x = Math.max(0, Math.min(maxX, e.clientX - drag.offsetX));
    const y = Math.max(0, Math.min(maxY, e.clientY - drag.offsetY));
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  });

  bar.addEventListener("pointerup", () => {
    if (drag) persistSession();
    drag = null;
  });
}

function terminalContent(container) {
  container.innerHTML = `
    <div class="terminal">
      <div class="terminal-output" id="terminal-output"></div>
      <div class="terminal-input-line">
        <span>C:\\DEVSKITS&gt;</span>
        <input id="terminal-input" autocomplete="off" aria-label="Terminal command input" />
      </div>
    </div>`;

  const output = container.querySelector("#terminal-output");
  const input = container.querySelector("#terminal-input");

  const print = (text) => {
    output.textContent += `${text}\n`;
    output.scrollTop = output.scrollHeight;
  };
  print("DevSkits terminal online. type 'help' for commands.");

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      print(`C:\\DEVSKITS> ${cmd}`);
      runTerminalCommand(cmd, print, output);
      if (cmd) {
        state.history.push(cmd);
        state.historyIndex = state.history.length;
      }
      input.value = "";
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!state.history.length) return;
      state.historyIndex = Math.max(0, state.historyIndex - 1);
      input.value = state.history[state.historyIndex] || "";
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!state.history.length) return;
      state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
      input.value = state.history[state.historyIndex] || "";
    }
  });
  setTimeout(() => input.focus(), 20);
}

function runTerminalCommand(raw, print, outputEl) {
  const cmd = raw.toLowerCase();
  const map = {
    help: "Commands: help, about, contact, donate, links, projects, loki, github, clear, date, whoami, theme, reboot",
    about: "DevSkits OS 2.0 is Travis Ramsey's retro desktop identity hub.",
    contact: "Email: DevSkits@icloud.com | Phone: 916-420-3052",
    donate: "Support: GoFundMe / Venmo / Cash App / Chime",
    links: "github.com/DevSkits916 | facebook.com/DevSkits | reddit.com/u/DevSkits",
    projects: "Use Projects app for full catalog.",
    loki: "Loki: German Shepherd, companion, mascot, legend.",
    github: "Opening GitHub profile...",
    date: new Date().toString(),
    whoami: "travis.ramsey@devskits",
    theme: "Theme toggled.",
    reboot: "Rebooting DevSkits OS 2.0..."
  };

  if (!cmd) return;
  if (cmd === "clear") {
    outputEl.textContent = "";
    return;
  }
  if (cmd === "github") {
    window.open("https://github.com/DevSkits916", "_blank", "noopener");
  }
  if (cmd === "theme") {
    cycleTheme();
  }
  if (cmd === "reboot") {
    setTimeout(rebootSystem, 450);
  }
  print(map[cmd] || `Unknown command: ${raw}. type 'help'.`);
}

function contactContent(container) {
  const rows = [
    ["Name", "Travis Ramsey"],
    ["Brand", "DevSkits"],
    ["Email", "DevSkits@icloud.com"],
    ["Phone", "916-420-3052"],
    ["GitHub", "https://github.com/DevSkits916"],
    ["Facebook", "https://www.facebook.com/DevSkits?mibextid=wwXIfr"],
    ["Reddit", "https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1"],
    ["X / Twitter", "@Devskits916"],
    ["GoFundMe", "https://gofund.me/6bbc0274e"],
    ["Venmo", "@DevSkits"],
    ["Cash App", "$DevSkits916"],
    ["Chime", "$DevSkits916"]
  ];
  container.innerHTML = `<div class="app-grid">${rows.map(([k,v]) => `
    <div class="info-row"><strong>${k}</strong><span>${toLink(v)}</span><button class="copy-btn" data-copy="${escapeHtml(v)}">Copy</button></div>`).join("")}
  </div>`;
  wireCopyButtons(container);
}

function donateContent(container) {
  container.innerHTML = `
    <h3>Support DevSkits</h3>
    <p>Fuel builds, upgrades, and rescue-friendly content with Loki at the center of the story.</p>
    <div class="app-grid">
      ${donationItem("GoFundMe", "https://gofund.me/6bbc0274e")}
      ${donationItem("Venmo", "https://venmo.com/u/DevSkits")}
      ${donationItem("Cash App", "https://cash.app/$DevSkits916")}
      ${donationItem("Chime", "https://chime.com/$DevSkits916")}
      ${donationItem("PayPal (placeholder)", "https://paypal.me/")}
    </div>`;
}

function projectsContent(container) {
  const projects = [
    ["DevSkits OS 2.0", "Retro browser desktop that acts as a digital identity hub.", "active"],
    ["Paste Happy Studio", "Creative pasteboard utility for quick snippet workflows.", "building"],
    ["Terminal Portfolio Generator", "CLI-style portfolio scaffolder for creators.", "building"],
    ["LokiMon", "Companion tracking concept inspired by Loki's daily adventures.", "concept"],
    ["Timeline Vault", "Visual time capsule for milestones and releases.", "concept"],
    ["Notes Forge", "Offline-first notes system with templated memory prompts.", "building"],
    ["Asset Factory", "Batch utility for generating branded visual assets.", "concept"]
  ];
  container.innerHTML = projects.map(([name, desc, status]) => `
    <article class="project-card">
      <h4>${name}</h4>
      <p>${desc}</p>
      <div class="badges"><span class="tag status-${status}">${status}</span>
      <button class="link-btn">Open</button></div>
    </article>`).join("");
}

function lokiContent(container) {
  container.innerHTML = `
    <div class="app-grid">
      <h3>Loki // Companion • Mascot • Legend</h3>
      <p>Loki is the loyal German Shepherd at the heart of DevSkits stories—part protector, part morale engine, full-time legend.</p>
      <div class="loki-avatar">Loki Avatar Zone<br/>[ future photo/gallery slot ]</div>
      <div class="gallery"><div>Paw Cam</div><div>Guard Mode</div><div>Adventure Log</div></div>
    </div>`;
}

function notesContent(container) {
  const saved = localStorage.getItem("devskits-notes") || "";
  container.innerHTML = `<strong>notes.txt</strong><textarea class="notes-editor" aria-label="Notes editor">${escapeHtml(saved)}</textarea>`;
  const ta = container.querySelector("textarea");
  ta.addEventListener("input", () => localStorage.setItem("devskits-notes", ta.value));
}

function linksContent(container) {
  const links = [
    ["GitHub", "https://github.com/DevSkits916"],
    ["Facebook", "https://www.facebook.com/DevSkits?mibextid=wwXIfr"],
    ["Reddit", "https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1"],
    ["X", "https://x.com/Devskits916"],
    ["GoFundMe", "https://gofund.me/6bbc0274e"]
  ];
  container.innerHTML = `<div class="app-grid">${links.map(([n,u]) => `<button class="link-btn" data-url="${u}">${n}</button>`).join("")}</div>`;
  container.querySelectorAll(".link-btn").forEach((b) => b.addEventListener("click", () => window.open(b.dataset.url, "_blank", "noopener")));
}

function aboutContent(container) {
  container.innerHTML = `
    <h3>About DevSkits OS 2.0</h3>
    <p>DevSkits OS 2.0 is a browser-based retro operating environment designed as Travis Ramsey's digital identity hub under the DevSkits brand.</p>
    <p>It blends a vintage desktop metaphor with terminal culture: windows, taskbar, icons, and working mini-apps for projects, contact, notes, donations, and Loki content.</p>
    <p><strong>Identity statement:</strong> Build useful things, stay human, and keep the legend close.</p>`;
}

function donationItem(name, url) {
  return `<div class="info-row"><strong>${name}</strong><span>${url}</span><button class="link-btn" onclick="window.open('${url}','_blank','noopener')">Open</button></div>`;
}

function wireCopyButtons(scope) {
  scope.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = btn.dataset.copy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      btn.dataset.copied = "true";
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.dataset.copied = "false";
        btn.textContent = "Copy";
      }, 900);
    });
  });
}

function toLink(value) {
  if (value.startsWith("http")) return `<a href="${value}" target="_blank" rel="noopener">${value}</a>`;
  return escapeHtml(value);
}

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
}

function updateClock() {
  $("#clock").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function applyTheme(theme) {
  if (theme === "default") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme", theme);
  state.activeTheme = theme;
  localStorage.setItem("devskits-theme", theme);
}

function cycleTheme() {
  const idx = state.themes.indexOf(state.activeTheme);
  applyTheme(state.themes[(idx + 1) % state.themes.length]);
}

function persistSession() {
  const session = [];
  state.windows.forEach((rec, appId) => {
    session.push({
      appId,
      minimized: rec.minimized,
      maximized: rec.maximized,
      style: {
        left: rec.el.style.left,
        top: rec.el.style.top,
        width: rec.el.style.width,
        height: rec.el.style.height
      }
    });
  });
  localStorage.setItem("devskits-session", JSON.stringify(session));
}

function restoreSession() {
  let items = [];
  try {
    items = JSON.parse(localStorage.getItem("devskits-session") || "[]");
  } catch {
    items = [];
  }
  items.forEach((item) => {
    openApp(item.appId);
    const rec = state.windows.get(item.appId);
    if (!rec) return;
    Object.assign(rec.el.style, item.style || {});
    if (item.maximized) toggleMaximize(item.appId);
    if (item.minimized) minimizeWindow(item.appId);
  });
  if (!items.length) openApp("about");
}

function fakeShutdown() {
  const overlay = document.createElement("div");
  overlay.className = "shutdown-overlay";
  overlay.innerHTML = `<div><h2>It is now safe to close your browser.</h2><p>DevSkits OS is sleeping...</p><button class="link-btn" id="wake-btn">Wake</button></div>`;
  desktop.appendChild(overlay);
  overlay.querySelector("#wake-btn").addEventListener("click", () => overlay.remove());
  hideMenu();
}

function rebootSystem() {
  hideMenu();
  localStorage.setItem("devskits-session", "[]");
  state.windows.forEach((rec) => rec.el.remove());
  state.windows.clear();
  taskButtons.innerHTML = "";
  desktop.classList.add("hidden");
  $("#boot-screen").classList.remove("hidden");
  startBootSequence();
}

init();
