(() => {
  function icon(monogram) {
    return `<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="1" y="1" width="14" height="14" fill="none" stroke="currentColor"/><text x="8" y="11" text-anchor="middle" font-size="6" font-family="monospace" fill="currentColor">${monogram}</text></svg>`;
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
    terminal: defineApp("terminal", { title: "Terminal", icon: ">_", iconSvg: icon("T"), category: "System", desktopVisible: true }),
    files: defineApp("files", { title: "Files", icon: "▣", iconSvg: icon("F"), category: "System" }),
    settings: defineApp("settings", { title: "Settings", icon: "⚙", iconSvg: icon("S"), category: "System" }),
    activity: defineApp("activity", { title: "Activity Log", icon: "ACT", iconSvg: icon("A"), category: "System", desktopVisible: false }),
    recycle: defineApp("recycle", { title: "Recycle Bin", icon: "BIN", iconSvg: icon("R"), category: "System" }),

    about: defineApp("about", { title: "About", icon: "i", iconSvg: icon("i"), category: "Identity" }),
    contact: defineApp("contact", { title: "Contact", icon: "☎", iconSvg: icon("C"), category: "Identity" }),
    links: defineApp("links", { title: "Links", icon: "↗", iconSvg: icon("L"), category: "Identity" }),
    donate: defineApp("donate", { title: "Donate", icon: "$", iconSvg: icon("$"), category: "Identity" }),
    loki: defineApp("loki", { title: "Loki", icon: "DOG", iconSvg: icon("K"), category: "Identity" }),

    projects: defineApp("projects", { title: "Projects", icon: "⌘", iconSvg: icon("P"), category: "Projects" }),
    notes: defineApp("notes", { title: "Notes", icon: "TXT", iconSvg: icon("N"), category: "Projects" }),
    browser: defineApp("browser", { title: "Navigator", icon: "WWW", iconSvg: icon("W"), category: "Projects" }),
    reminders: defineApp("reminders", { title: "Planner", icon: "REM", iconSvg: icon("PL"), category: "Projects" }),
    calculator: defineApp("calculator", { title: "Calculator", icon: "⊞", iconSvg: icon("+"), category: "Projects" }),

    run: defineApp("run", { title: "Run", icon: ">", iconSvg: icon(">"), category: "System", desktopVisible: false, startMenuVisible: false }),

    inbox: defineApp("inbox", { title: "Inbox", icon: "✉", iconSvg: icon("I"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    updater: defineApp("updater", { title: "System Update", icon: "UPD", iconSvg: icon("U"), category: "System", startMenuVisible: false, desktopVisible: false }),
    processmon: defineApp("processmon", { title: "Process Monitor", icon: "CPU", iconSvg: icon("PM"), category: "System", startMenuVisible: false, desktopVisible: false }),
    syslogs: defineApp("syslogs", { title: "System Logs", icon: "LOG", iconSvg: icon("LG"), category: "System", startMenuVisible: false, desktopVisible: false }),
    profile: defineApp("profile", { title: "System Identity", icon: "ID", iconSvg: icon("ID"), category: "System", startMenuVisible: false, desktopVisible: false }),
    presence: defineApp("presence", { title: "Network Status", icon: "NET", iconSvg: icon("NE"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    buildlog: defineApp("buildlog", { title: "Build Log", icon: "LOG", iconSvg: icon("BL"), category: "System", startMenuVisible: false, desktopVisible: false }),
    mediadeck: defineApp("mediadeck", { title: "Media Deck", icon: "▶", iconSvg: icon("M"), category: "Media", startMenuVisible: false, desktopVisible: false }),
    packages: defineApp("packages", { title: "Install Center", icon: "PKG", iconSvg: icon("PK"), category: "System", startMenuVisible: false, desktopVisible: false }),
    achievements: defineApp("achievements", { title: "Discoveries", icon: "★", iconSvg: icon("*"), category: "System", startMenuVisible: false, desktopVisible: false }),
    calendar: defineApp("calendar", { title: "Calendar", icon: "▦", iconSvg: icon("CA"), category: "Tools", startMenuVisible: false, desktopVisible: false }),
    clock: defineApp("clock", { title: "Clock", icon: "◷", iconSvg: icon("CL"), category: "Tools", startMenuVisible: false, desktopVisible: false }),
    quoteforge: defineApp("quoteforge", { title: "Quote Forge", icon: "❞", iconSvg: icon("Q"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    asciimaker: defineApp("asciimaker", { title: "ASCII Maker", icon: "#", iconSvg: icon("#"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    draftpad: defineApp("draftpad", { title: "Post Draft Pad", icon: "✎", iconSvg: icon("DP"), category: "Creator", startMenuVisible: false, desktopVisible: false }),
    networkmap: defineApp("networkmap", { title: "Network Map", icon: "⌗", iconSvg: icon("NM"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    lokigame: defineApp("lokigame", { title: "Loki Mini Game", icon: "🐾", iconSvg: icon("LG"), category: "Companion", startMenuVisible: false, desktopVisible: false }),
    search: defineApp("search", { title: "Search Everywhere", icon: "⌕", iconSvg: icon("?"), category: "System", startMenuVisible: false, desktopVisible: false })
  };

  const START_MENU_SECTIONS = [
    { id: "identity", label: "IDENTITY", items: ["about", "contact", "donate"] },
    { id: "system", label: "SYSTEM", items: ["terminal", "settings"] },
    { id: "projects", label: "PROJECTS", items: ["notes"] },
    { id: "power", label: "POWER", items: ["reboot", "shutdown"] }
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

  window.DevSkitsState = { APPS, START_MENU_SECTIONS, state, ui, saveState };
})();
