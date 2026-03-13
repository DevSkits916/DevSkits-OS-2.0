(() => {
  function retroSvg(inner, viewBox = "0 0 64 64") {
    return `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  const ICON_LIBRARY = {
    terminal: retroSvg(`<rect x="6" y="8" width="52" height="42" fill="#111" stroke="#000"/><rect x="8" y="10" width="48" height="38" fill="#101010" stroke="#7f7f7f"/><path d="M15 24l8 7-8 7" stroke="#63ff63" stroke-width="4" fill="none"/><rect x="30" y="35" width="16" height="3" fill="#63ff63"/>`),
    files: retroSvg(`<path d="M8 18h18l5 6h25v28H8z" fill="#f0c15a" stroke="#8f691f"/><rect x="8" y="22" width="48" height="30" fill="#f6d486" stroke="#8f691f"/>`),
    settings: retroSvg(`<circle cx="32" cy="33" r="10" fill="#dcdcdc" stroke="#333"/><g fill="#999" stroke="#333"><rect x="30" y="11" width="4" height="10"/><rect x="30" y="45" width="4" height="10"/><rect x="11" y="31" width="10" height="4"/><rect x="43" y="31" width="10" height="4"/></g><circle cx="32" cy="33" r="4" fill="#3a3a3a"/>`),
    recycle: retroSvg(`<rect x="18" y="20" width="28" height="34" fill="#efefef" stroke="#444"/><rect x="14" y="16" width="36" height="6" fill="#b0b0b0" stroke="#444"/><rect x="26" y="10" width="12" height="6" fill="#b0b0b0" stroke="#444"/><line x1="25" y1="27" x2="25" y2="48" stroke="#666"/><line x1="32" y1="27" x2="32" y2="48" stroke="#666"/><line x1="39" y1="27" x2="39" y2="48" stroke="#666"/>`),
    about: retroSvg(`<rect x="12" y="10" width="40" height="44" fill="#f8f8f8" stroke="#444"/><rect x="16" y="14" width="32" height="8" fill="#0000a8"/><rect x="20" y="27" width="24" height="3" fill="#777"/><rect x="20" y="34" width="20" height="3" fill="#777"/><circle cx="32" cy="45" r="3" fill="#0000a8"/>`),
    contact: retroSvg(`<rect x="12" y="12" width="40" height="40" fill="#fff" stroke="#555"/><circle cx="24" cy="26" r="6" fill="#f3c69b" stroke="#444"/><rect x="18" y="34" width="12" height="10" fill="#568ac9" stroke="#444"/><rect x="34" y="22" width="12" height="3" fill="#333"/><rect x="34" y="29" width="12" height="3" fill="#333"/><rect x="34" y="36" width="10" height="3" fill="#333"/>`),
    links: retroSvg(`<rect x="9" y="14" width="46" height="36" fill="#fff" stroke="#444"/><rect x="11" y="16" width="42" height="7" fill="#0000a8"/><path d="M22 34h8m5 0h7" stroke="#333" stroke-width="3"/><path d="M23 38c0-4 3-7 7-7m4 14c-4 0-7-3-7-7" stroke="#1a56b3" stroke-width="3" fill="none"/><path d="M45 28l8-8m0 0h-5m5 0v5" stroke="#1a56b3" stroke-width="3" fill="none"/>`),
    donate: retroSvg(`<rect x="10" y="12" width="44" height="40" fill="#fff" stroke="#444"/><path d="M22 26c0-4 4-7 10-7 6 0 10 3 10 7 0 3-2 5-10 7-8 2-10 4-10 7s3 6 10 6c5 0 9-2 10-6" stroke="#1a7c1a" stroke-width="3" fill="none"/><line x1="32" y1="16" x2="32" y2="48" stroke="#1a7c1a" stroke-width="3"/>`),
    loki: retroSvg(`<rect x="13" y="16" width="38" height="34" fill="#f3e2c4" stroke="#553a23"/><path d="M20 20l6-8 6 8m6 0l6-8 6 8" fill="#f3e2c4" stroke="#553a23"/><circle cx="27" cy="32" r="3" fill="#000"/><circle cx="37" cy="32" r="3" fill="#000"/><path d="M28 40c2 2 6 2 8 0" stroke="#000" fill="none" stroke-width="2"/>`),
    projects: retroSvg(`<rect x="8" y="11" width="48" height="42" fill="#efefef" stroke="#444"/><rect x="12" y="15" width="40" height="7" fill="#0000a8"/><rect x="14" y="27" width="17" height="11" fill="#fff" stroke="#777"/><rect x="34" y="27" width="17" height="11" fill="#fff" stroke="#777"/><rect x="14" y="40" width="37" height="9" fill="#fff" stroke="#777"/>`),
    notes: retroSvg(`<rect x="12" y="8" width="40" height="48" fill="#fff9c4" stroke="#666"/><line x1="19" y1="20" x2="45" y2="20" stroke="#7f7f7f"/><line x1="19" y1="28" x2="45" y2="28" stroke="#7f7f7f"/><line x1="19" y1="36" x2="45" y2="36" stroke="#7f7f7f"/><rect x="14" y="8" width="4" height="48" fill="#d55"/>`),
    browser: retroSvg(`<rect x="7" y="12" width="50" height="40" fill="#fff" stroke="#444"/><rect x="9" y="14" width="46" height="8" fill="#0000a8"/><circle cx="14" cy="18" r="2" fill="#fff"/><circle cx="20" cy="18" r="2" fill="#fff"/><rect x="12" y="27" width="40" height="20" fill="#d8e7ff" stroke="#557"/><path d="M16 42c7-10 16-6 20-12 1 6 6 8 12 10" stroke="#2f7f2f" stroke-width="2" fill="none"/>`),
    default: retroSvg(`<rect x="10" y="10" width="44" height="44" fill="#efefef" stroke="#444"/><rect x="14" y="14" width="36" height="8" fill="#0000a8"/><rect x="18" y="29" width="28" height="3" fill="#666"/><rect x="18" y="36" width="20" height="3" fill="#666"/>`)
  };

  function icon(id, fallback = "default") {
    return ICON_LIBRARY[id] || ICON_LIBRARY[fallback] || ICON_LIBRARY.default;
  }

  function defineApp(id, config) {
    return {
      id,
      description: "",
      desktopVisible: true,
      startMenuVisible: true,
      multiInstance: false,
      category: "System",
      ...config,
      launch(options = {}) {
        return window.DevSkitsWindowManager.openApp(id, options);
      }
    };
  }

  const APPS = {
    terminal: defineApp("terminal", { title: "Terminal", icon: ">_", iconSvg: icon("terminal"), category: "System", desktopVisible: true }),
    files: defineApp("files", { title: "My Computer", icon: "▣", iconSvg: icon("files"), category: "System" }),
    settings: defineApp("settings", { title: "Settings", icon: "⚙", iconSvg: icon("settings"), category: "System" }),
    activity: defineApp("activity", { title: "Activity Log", icon: "ACT", iconSvg: icon("default"), category: "System", desktopVisible: false }),
    recycle: defineApp("recycle", { title: "Recycle Bin", icon: "BIN", iconSvg: icon("recycle"), category: "System" }),

    about: defineApp("about", { title: "System", icon: "i", iconSvg: icon("about"), category: "Identity" }),
    contact: defineApp("contact", { title: "Contact", icon: "☎", iconSvg: icon("contact"), category: "Identity" }),
    links: defineApp("links", { title: "Links", icon: "↗", iconSvg: icon("links"), category: "Identity" }),
    donate: defineApp("donate", { title: "Donate", icon: "$", iconSvg: icon("donate"), category: "Identity" }),
    loki: defineApp("loki", { title: "Loki", icon: "DOG", iconSvg: icon("loki"), category: "Identity" }),

    projects: defineApp("projects", { title: "Projects", icon: "⌘", iconSvg: icon("projects"), category: "Projects" }),
    notes: defineApp("notes", { title: "Notepad", icon: "TXT", iconSvg: icon("notes"), category: "Projects" }),
    browser: defineApp("browser", { title: "Navigator", icon: "WWW", iconSvg: icon("browser"), category: "Projects" }),
    reminders: defineApp("reminders", { title: "Planner", icon: "REM", iconSvg: icon("default"), category: "Projects" }),
    calculator: defineApp("calculator", { title: "Calculator", icon: "⊞", iconSvg: icon("default"), category: "Projects" }),

    run: defineApp("run", { title: "Run", icon: ">", iconSvg: icon("default"), category: "System", desktopVisible: false, startMenuVisible: false }),

    inbox: defineApp("inbox", { title: "Inbox", icon: "✉", iconSvg: icon("default"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    updater: defineApp("updater", { title: "System Update", icon: "UPD", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    processmon: defineApp("processmon", { title: "Process Monitor", icon: "CPU", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    syslogs: defineApp("syslogs", { title: "System Logs", icon: "LOG", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    profile: defineApp("profile", { title: "System Identity", icon: "ID", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    presence: defineApp("presence", { title: "Network Status", icon: "NET", iconSvg: icon("default"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    buildlog: defineApp("buildlog", { title: "Build Log", icon: "LOG", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    mediadeck: defineApp("mediadeck", { title: "Media Deck", icon: "▶", iconSvg: icon("default"), category: "Media", startMenuVisible: false, desktopVisible: false }),
    packages: defineApp("packages", { title: "Install Center", icon: "PKG", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    achievements: defineApp("achievements", { title: "Discoveries", icon: "★", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    calendar: defineApp("calendar", { title: "Calendar", icon: "▦", iconSvg: icon("default"), category: "Tools", startMenuVisible: false, desktopVisible: false }),
    clock: defineApp("clock", { title: "Clock", icon: "◷", iconSvg: icon("default"), category: "Tools", startMenuVisible: false, desktopVisible: false }),
    quoteforge: defineApp("quoteforge", { title: "Quote Forge", icon: "❞", iconSvg: icon("default"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    asciimaker: defineApp("asciimaker", { title: "ASCII Maker", icon: "#", iconSvg: icon("default"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    draftpad: defineApp("draftpad", { title: "Post Draft Pad", icon: "✎", iconSvg: icon("default"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    networkmap: defineApp("networkmap", { title: "Network Map", icon: "⌗", iconSvg: icon("default"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    lokigame: defineApp("lokigame", { title: "Loki Mini Game", icon: "🐾", iconSvg: icon("default"), category: "Companion", startMenuVisible: false, desktopVisible: false }),
    search: defineApp("search", { title: "Search Everywhere", icon: "⌕", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false })
  };

  const START_MENU_SECTIONS = [
    { id: "favorites", label: "FAVORITES", items: ["about", "contact", "projects", "notes", "terminal"] },
    { id: "workspace", label: "WORKSPACE", items: ["files", "browser", "settings", "recycle"] },
    { id: "links", label: "WEB + LINKS", items: ["links", "donate", "loki"] },
    { id: "power", label: "POWER", items: ["run", "reboot", "shutdown"] }
  ];

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

  window.DevSkitsState = { APPS, START_MENU_SECTIONS, state, ui, saveState, ICON_LIBRARY };
})();
