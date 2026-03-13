(() => {
  const APPS = {
    terminal: { title: "Terminal", icon: ">_", category: "System" },
    files: { title: "Files", icon: "▣", category: "System" },
    settings: { title: "Settings", icon: "⚙", category: "System" },
    browser: { title: "Navigator", icon: "◫", category: "Network" },
    inbox: { title: "Inbox", icon: "✉", category: "Network" },
    buildlog: { title: "Build Log", icon: "#", category: "System" },
    projects: { title: "Projects", icon: "⌘", category: "Dev" },
    notes: { title: "Notes", icon: "✎", category: "Dev" },
    links: { title: "Links", icon: "↗", category: "Network" },
    contact: { title: "Contact", icon: "☎", category: "Network" },
    donate: { title: "Donate", icon: "$", category: "Support" },
    loki: { title: "Loki", icon: "🐾", category: "Companion" },
    about: { title: "About", icon: "i", category: "System" }
  };

  const STORAGE = {
    termHistory: "devskits-term-history",
    recentApps: "devskits-recent-apps",
    iconPositions: "devskits-icon-positions",
    notes: "devskits-notes-v2",
    activity: "devskits-activity-v3",
    inbox: "devskits-inbox-v3",
    inboxDrafts: "devskits-inbox-drafts-v3",
    browserHistory: "devskits-browser-history-v3",
    packages: "devskits-packages-v3",
    changelog: "devskits-changelog-v3"
  };

  const defaults = {
    packages: [
      { id: "retro-clock-pack", name: "Retro Clock Pack", installed: false, unlocks: ["browser:devskits://system-specs"] },
      { id: "extra-wallpapers", name: "Extra Wallpapers", installed: false, unlocks: ["settings:wallpapers"] },
      { id: "loki-archive", name: "Loki Archive", installed: false, unlocks: ["inbox:loki", "browser:devskits://loki"] },
      { id: "devskits-labs", name: "DevSkits Labs", installed: false, unlocks: ["browser:devskits://labs"] },
      { id: "classic-icons", name: "Classic Icons", installed: false, unlocks: ["desktop:icons"] }
    ],
    changelog: [
      { id: "b100", build: "0.1.047", phase: "Phase 1", date: "2026-01-07 08:12", tags: ["shell", "feature"], note: "Boot sequence, desktop, windows, taskbar, start menu and base apps came online." },
      { id: "b200", build: "0.2.131", phase: "Phase 2", date: "2026-02-18 22:41", tags: ["polish", "app", "fix"], note: "Themes, wallpapers, persistence, and shell quality upgrades stabilized the identity shell." },
      { id: "b300", build: "0.3.005", phase: "Phase 3", date: "2026-03-03 13:09", tags: ["app", "feature", "shell"], note: "Navigator, Inbox, Build Log and shared state bridge introduced for cross-app systems." }
    ],
    inbox: [
      { id: "sys-boot", folder: "System", from: "system@devskits.os", subject: "Welcome to DevSkits OS 2.0", body: "Identity shell initialized. Use Navigator to explore devskits://home and devskits://changelog.", timestamp: "2026-03-03 13:10", links: ["devskits://home", "devskits://changelog"] },
      { id: "loki-status", folder: "Inbox", from: "loki@companion.local", subject: "Loki status report", body: "Companion telemetry normal. Favorite zones: /projects and /notes. Requesting additional archive space.", timestamp: "2026-03-04 09:17", links: ["devskits://loki", "app:projects"] },
      { id: "build-notes", folder: "Inbox", from: "builder@devskits.os", subject: "Build 0.3 patch notes", body: "Navigator internal pages now route through the shared state layer. Build Log app now tracks live history entries.", timestamp: "2026-03-04 22:06", links: ["app:buildlog", "devskits://projects"] },
      { id: "support", folder: "Archive", from: "support@devskits.os", subject: "Support + donation channels", body: "Thanks for supporting the lab. Donation links are mirrored in Navigator and the Donate app.", timestamp: "2026-03-05 11:45", links: ["devskits://donate", "app:donate"] },
      { id: "ideas", folder: "Drafts", from: "you@devskits.os", subject: "Unfinished project ideas", body: "- terminal profile cards\n- app package unlock cinematic text\n- loki gallery placeholders", timestamp: "2026-03-05 12:02", links: ["app:notes"] }
    ]
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  const state = {
    windows: new Map(),
    z: 10,
    themes: ["default", "graphite", "paper"],
    activeTheme: localStorage.getItem("devskits-theme") || "default",
    terminalHistory: loadJSON(STORAGE.termHistory, []),
    recentApps: loadJSON(STORAGE.recentApps, []),
    iconPositions: loadJSON(STORAGE.iconPositions, {}),
    crt: localStorage.getItem("devskits-crt") !== "off",
    wallpaper: localStorage.getItem("devskits-wallpaper") || "default",
    activity: loadJSON(STORAGE.activity, []),
    inboxMessages: loadJSON(STORAGE.inbox, defaults.inbox),
    inboxDrafts: loadJSON(STORAGE.inboxDrafts, []),
    browserHistory: loadJSON(STORAGE.browserHistory, []),
    packages: loadJSON(STORAGE.packages, defaults.packages),
    changelogEntries: loadJSON(STORAGE.changelog, defaults.changelog)
  };

  const ui = {
    desktop: document.querySelector("#desktop"),
    iconContainer: document.querySelector("#desktop-icons"),
    windowLayer: document.querySelector("#window-layer"),
    taskButtons: document.querySelector("#task-buttons")
  };

  const listeners = new Map();

  function saveState(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function emit(event, payload) {
    (listeners.get(event) || []).forEach((fn) => fn(payload));
  }

  function on(event, handler) {
    const items = listeners.get(event) || [];
    items.push(handler);
    listeners.set(event, items);
    return () => listeners.set(event, (listeners.get(event) || []).filter((fn) => fn !== handler));
  }

  function addActivity(type, detail) {
    const entry = { id: `a-${Date.now()}`, type, detail, at: new Date().toISOString() };
    state.activity = [entry, ...state.activity].slice(0, 40);
    saveState(STORAGE.activity, state.activity);
    emit("activity", entry);
    return entry;
  }

  function setInboxMessages(messages) {
    state.inboxMessages = messages;
    saveState(STORAGE.inbox, messages);
    emit("state:inboxMessages", messages);
  }

  function setInboxDrafts(drafts) {
    state.inboxDrafts = drafts;
    saveState(STORAGE.inboxDrafts, drafts);
    emit("state:inboxDrafts", drafts);
  }

  function setBrowserHistory(history) {
    state.browserHistory = history;
    saveState(STORAGE.browserHistory, history);
    emit("state:browserHistory", history);
  }

  function setChangelogEntries(entries) {
    state.changelogEntries = entries;
    saveState(STORAGE.changelog, entries);
    emit("state:changelogEntries", entries);
  }

  function setPackages(packages) {
    state.packages = packages;
    saveState(STORAGE.packages, packages);
    emit("state:packages", packages);
  }


  window.DevSkitsState = {
    APPS,
    STORAGE,
    defaults,
    state,
    ui,
    saveState,
    on,
    emit,
    addActivity,
    setInboxMessages,
    setInboxDrafts,
    setBrowserHistory,
    setChangelogEntries,
    setPackages
  };
})();
