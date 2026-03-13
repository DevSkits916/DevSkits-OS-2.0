(() => {
  const APPS = {
    terminal: { title: "Terminal", icon: ">_", category: "System" },
    files: { title: "Files", icon: "▣", category: "System" },
    settings: { title: "Settings", icon: "⚙", category: "System" },
    projects: { title: "Projects", icon: "⌘", category: "Dev" },
    notes: { title: "Notes", icon: "✎", category: "Dev" },
    links: { title: "Links", icon: "↗", category: "Network" },
    contact: { title: "Contact", icon: "☎", category: "Network" },
    donate: { title: "Donate", icon: "$", category: "Support" },
    loki: { title: "Loki", icon: "🐾", category: "Companion" },
    about: { title: "About", icon: "i", category: "System" }
  };

  const state = {
    windows: new Map(),
    z: 10,
    themes: ["default", "graphite", "paper"],
    activeTheme: localStorage.getItem("devskits-theme") || "default",
    terminalHistory: JSON.parse(localStorage.getItem("devskits-term-history") || "[]"),
    recentApps: JSON.parse(localStorage.getItem("devskits-recent-apps") || "[]"),
    iconPositions: JSON.parse(localStorage.getItem("devskits-icon-positions") || "{}"),
    crt: localStorage.getItem("devskits-crt") !== "off",
    wallpaper: localStorage.getItem("devskits-wallpaper") || "default"
  };

  const ui = {
    desktop: document.querySelector("#desktop"),
    iconContainer: document.querySelector("#desktop-icons"),
    windowLayer: document.querySelector("#window-layer"),
    taskButtons: document.querySelector("#task-buttons")
  };

  function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  window.DevSkitsState = { APPS, state, ui, saveState };
})();
