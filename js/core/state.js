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
    calculator: retroSvg(`<rect x="12" y="8" width="40" height="48" fill="#e8e8e8" stroke="#444"/><rect x="16" y="14" width="32" height="10" fill="#d6f6c2" stroke="#6d6d6d"/><g fill="#fff" stroke="#666"><rect x="16" y="28" width="8" height="8"/><rect x="26" y="28" width="8" height="8"/><rect x="36" y="28" width="8" height="8"/><rect x="16" y="38" width="8" height="8"/><rect x="26" y="38" width="8" height="8"/><rect x="36" y="38" width="8" height="8"/></g>`),
    lokigame: window.LokiGameAssets?.pawIconSvg?.() || retroSvg(`<circle cx="32" cy="34" r="12" fill="#c68f59" stroke="#553019"/><ellipse cx="19" cy="20" rx="5" ry="7" fill="#c68f59" stroke="#553019"/><ellipse cx="30" cy="16" rx="5" ry="7" fill="#c68f59" stroke="#553019"/><ellipse cx="42" cy="16" rx="5" ry="7" fill="#c68f59" stroke="#553019"/><ellipse cx="50" cy="24" rx="5" ry="7" fill="#c68f59" stroke="#553019"/>`),
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
    terminal: defineApp("terminal", { title: "Terminal", icon: ">_", iconSvg: icon("terminal"), category: "System", desktopVisible: true, description: "Retro shell for files, routes, and app launching." }),
    files: defineApp("files", { title: "My Computer", icon: "▣", iconSvg: icon("files"), category: "System", description: "Browse the built-in filesystem and storage map." }),
    settings: defineApp("settings", { title: "Settings", icon: "⚙", iconSvg: icon("settings"), category: "System", description: "Adjust desktop preferences and shell options." }),
    activity: defineApp("activity", { title: "Activity Log", icon: "ACT", iconSvg: icon("default"), category: "System", desktopVisible: false, startMenuVisible: true, description: "Inspect recent shell, app, and system events." }),
    recycle: defineApp("recycle", { title: "Recycle Bin", icon: "BIN", iconSvg: icon("recycle"), category: "System", description: "Review deleted local items." }),

    about: defineApp("about", { title: "System", icon: "i", iconSvg: icon("about"), category: "Identity", description: "Version info and product overview." }),
    contact: defineApp("contact", { title: "Contact", icon: "☎", iconSvg: icon("contact"), category: "Identity", description: "Contact card and export tools." }),
    links: defineApp("links", { title: "Links", icon: "↗", iconSvg: icon("links"), category: "Identity", description: "Launch public profiles and destinations." }),
    donate: defineApp("donate", { title: "Donate", icon: "$", iconSvg: icon("donate"), category: "Identity", description: "Support the DevSkits project." }),
    loki: defineApp("loki", { title: "Loki", icon: "DOG", iconSvg: icon("loki"), category: "Identity", startMenuVisible: false, description: "Mascot dossier and lore." }),

    projects: defineApp("projects", { title: "Projects", icon: "⌘", iconSvg: icon("projects"), category: "Projects", startMenuVisible: false, description: "Portfolio projects and roadmap board." }),
    notes: defineApp("notes", { title: "Notepad", icon: "TXT", iconSvg: icon("notes"), category: "Projects", description: "Persistent note editor with local storage." }),
    browser: defineApp("browser", { title: "Navigator", icon: "WWW", iconSvg: icon("browser"), category: "Projects", description: "Browse internal devskits:// routes and web URLs." }),
    reminders: defineApp("reminders", { title: "Reminders", icon: "REM", iconSvg: icon("default"), category: "Projects", description: "Track reminders and due dates." }),
    calculator: defineApp("calculator", { title: "Calculator", icon: "⊞", iconSvg: icon("calculator"), category: "Projects", description: "Standalone calculator with memory and history." }),
    calendar: defineApp("calendar", { title: "Calendar", icon: "▦", iconSvg: icon("default"), category: "Tools", desktopVisible: false, startMenuVisible: true, description: "Month view with per-day notes." }),
    clock: defineApp("clock", { title: "Clock", icon: "◷", iconSvg: icon("default"), category: "Tools", desktopVisible: false, startMenuVisible: true, description: "Live time, UTC, and uptime panel." }),

    run: defineApp("run", { title: "Run", icon: ">", iconSvg: icon("default"), category: "System", desktopVisible: false, startMenuVisible: false }),

    inbox: defineApp("inbox", { title: "Inbox", icon: "✉", iconSvg: icon("default"), category: "Network", startMenuVisible: false, desktopVisible: false, description: "Internal message viewer." }),
    updater: defineApp("updater", { title: "Updater", icon: "UPD", iconSvg: icon("default"), category: "System", startMenuVisible: true, desktopVisible: false, description: "Review and install update packages." }),
    "process-monitor": defineApp("process-monitor", { title: "Process Monitor", icon: "CPU", iconSvg: icon("default"), category: "System", startMenuVisible: true, desktopVisible: false, description: "Inspect services and simulated process state." }),
    "system-logs": defineApp("system-logs", { title: "System Logs", icon: "LOG", iconSvg: icon("default"), category: "System", startMenuVisible: true, desktopVisible: false, description: "Filter, clear, and export runtime logs." }),
    profile: defineApp("profile", { title: "Profile", icon: "ID", iconSvg: icon("default"), category: "System", startMenuVisible: true, desktopVisible: false, description: "View boot counts and usage statistics." }),
    presence: defineApp("presence", { title: "Presence", icon: "NET", iconSvg: icon("default"), category: "Network", startMenuVisible: true, desktopVisible: false, description: "See service presence and route index status." }),
    buildlog: defineApp("buildlog", { title: "Build Log", icon: "LOG", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    mediadeck: defineApp("mediadeck", { title: "Media Deck", icon: "▶", iconSvg: icon("default"), category: "Media", startMenuVisible: false, desktopVisible: false }),
    packages: defineApp("packages", { title: "Install Center", icon: "PKG", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    achievements: defineApp("achievements", { title: "Discoveries", icon: "★", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false }),
    quoteforge: defineApp("quoteforge", { title: "Quote Forge", icon: "❞", iconSvg: icon("default"), category: "Creator", startMenuVisible: true, desktopVisible: false, description: "Save and reuse short copy snippets." }),
    asciimaker: defineApp("asciimaker", { title: "ASCII Maker", icon: "#", iconSvg: icon("default"), category: "Creator", startMenuVisible: true, desktopVisible: false, description: "Transform text into simple ASCII spacing art." }),
    draftpad: defineApp("draftpad", { title: "Draft Pad", icon: "✎", iconSvg: icon("default"), category: "Creator", startMenuVisible: true, desktopVisible: false, description: "Draft quick posts and send them to notes." }),
    networkmap: defineApp("networkmap", { title: "Network Map", icon: "⌗", iconSvg: icon("default"), category: "Network", startMenuVisible: false, desktopVisible: false }),
    "loki-game": defineApp("loki-game", { title: "Loki Game", icon: "🐾", iconSvg: icon("lokigame"), category: "Companion", startMenuVisible: true, desktopVisible: true, description: "Standalone Loki mini-game." }),
    search: defineApp("search", { title: "Search Everywhere", icon: "⌕", iconSvg: icon("default"), category: "System", startMenuVisible: false, desktopVisible: false })
  };

  const START_MENU_SECTIONS = [
    { id: "programs", label: "PROGRAMS", items: ["terminal", "files", "notes", "browser", "calculator", "loki-game"] },
    { id: "tools", label: "TOOLS", items: ["calendar", "clock", "reminders", "updater"] },
    { id: "creator", label: "CREATOR", items: ["quoteforge", "asciimaker", "draftpad"] },
    { id: "system", label: "SYSTEM", items: ["settings", "activity", "process-monitor", "system-logs", "profile", "presence", "recycle", "run"] },
    { id: "devskits", label: "DEVSKITS", items: ["links", "donate", "contact", "about", "reboot", "shutdown"] }
  ];

  const RUN_ALIASES = {
    terminal: "terminal",
    cmd: "terminal",
    shell: "terminal",
    files: "files",
    explorer: "files",
    settings: "settings",
    control: "settings",
    contact: "contact",
    donate: "donate",
    projects: "projects",
    loki: "loki",
    links: "links",
    about: "about",
    calculator: "calculator",
    calc: "calculator",
    notes: "notes",
    notepad: "notes",
    browser: "browser",
    navigator: "browser",
    inbox: "inbox",
    updater: "updater",
    updates: "updater",
    "process-monitor": "process-monitor",
    processmonitor: "process-monitor",
    processmon: "process-monitor",
    processes: "process-monitor",
    activity: "activity",
    logs: "system-logs",
    "system-logs": "system-logs",
    systemlogs: "system-logs",
    syslogs: "system-logs",
    reminders: "reminders",
    reminder: "reminders",
    planner: "reminders",
    profile: "profile",
    "system-profile": "profile",
    presence: "presence",
    "network-status": "presence",
    packages: "packages",
    achievements: "achievements",
    calendar: "calendar",
    "calendar-planner": "calendar",
    clock: "clock",
    quoteforge: "quoteforge",
    "quote-forge": "quoteforge",
    asciimaker: "asciimaker",
    "ascii-maker": "asciimaker",
    draftpad: "draftpad",
    "draft-pad": "draftpad",
    networkmap: "networkmap",
    "loki-game": "loki-game",
    lokigame: "loki-game",
    lokigamelegacy: "loki-game",
    search: "search",
    recycle: "recycle"
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

  window.DevSkitsState = { APPS, START_MENU_SECTIONS, RUN_ALIASES, state, ui, saveState, ICON_LIBRARY };
})();
