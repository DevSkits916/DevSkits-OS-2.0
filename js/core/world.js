(() => {
  const STORE_KEYS = {
    packages: "devskits-packages-v2",
    achievements: "devskits-achievements-v1",
    recycle: "devskits-recycle-v1",
    sticky: "devskits-sticky-v1",
    calendar: "devskits-calendar-v1",
    drafts: "devskits-drafts-v2",
    quotes: "devskits-quotes-v1",
    sessions: "devskits-snapshots-v1",
    shortcuts: "devskits-shortcuts-v1",
    inbox: "devskits-inbox-v1",
    browserHistory: "devskits-browser-history-v1",
    activity: "devskits-activity-v1",
    changelog: "devskits-changelog-v1",
    media: "devskits-media-v1",
    appSettings: "devskits-app-settings-v1"
  };

  const PACKAGE_DEFS = {
    retro_clock_pack: { title: "Retro Clock Pack", unlocks: ["extra dashboard status", "clock variants"] },
    extra_wallpapers: { title: "Extra Wallpapers", unlocks: ["terminal wallpaper", "matrix wallpaper"] },
    loki_archive: { title: "Loki Archive", unlocks: ["loki dossier", "loki inbox threads", "devskits://loki/archive"] },
    devskits_labs: { title: "DevSkits Labs", unlocks: ["devskits://labs", "labs messages", "terminal easter egg"] },
    classic_icons: { title: "Classic Icons", unlocks: ["desktop shortcut theme", "icon density option"] }
  };

  const ACHIEVEMENT_DEFS = {
    first_secret: "Opened first hidden page",
    pkg_collector: "Installed all package modules",
    loki_hunter: "Found Loki archive",
    terminal_diver: "Used terminal secret command",
    restore_op: "Restored a deleted item"
  };

  const BASE_CHANGELOG = [
    { id: "p1", version: "0.1.0", build: "DSK-101", timestamp: "2026-03-02 08:14", title: "Phase 1 foundation", tags: ["shell", "app"], body: "Boot sequence, desktop shell, taskbar, draggable windows, core apps online." },
    { id: "p2", version: "0.2.0", build: "DSK-208", timestamp: "2026-03-07 21:22", title: "Phase 2 polish", tags: ["feature", "polish"], body: "Theme cycles, wallpaper choices, persistence upgrades, smarter files and projects." },
    { id: "p3", version: "0.3.0", build: "DSK-315", timestamp: "2026-03-12 11:05", title: "Phase 3 pseudo-OS depth", tags: ["feature", "shell", "app"], body: "Navigator, Inbox, Build Log, Install Center unlock chains, Media Deck, Run dialog, deep linking." }
  ];

  const BASE_MEDIA = [
    { id: "memo-1", title: "Voice Memo: Sprint Notes", type: "voice memos", details: "Synthetic placeholder clip", preview: "No audio bundled in static mode." },
    { id: "sys-1", title: "System Log // Boot Warmup", type: "system logs", details: "Boot analyzer snapshot", preview: "Frame drops: 0 | Shell latency: nominal" },
    { id: "loki-1", title: "Loki Moment #12", type: "Loki moments", details: "Gallery placeholder", preview: "Companion stole the cursor. Again." },
    { id: "demo-1", title: "Project Demo Reel", type: "project demos", details: "Storyboard placeholders", preview: "Open Projects for linked detail cards." }
  ];

  const INTERNAL_PAGES = {
    "devskits://home": { title: "DevSkits Home", body: "Welcome to Navigator. Browse internal nodes, inspect build history, and jump into apps.", links: ["devskits://projects", "devskits://changelog", "devskits://system", "devskits://packages"] },
    "devskits://projects": { title: "Projects Wire", body: "Status board mirror for active, building, and concept tracks.", appLink: "projects", links: ["devskits://notes-index", "devskits://contact"] },
    "devskits://contact": { title: "Contact Relay", body: "Internal relay for support and collaboration channels.", appLink: "contact", links: ["devskits://donate"] },
    "devskits://donate": { title: "Support Relay", body: "Support powers longer build cycles and unlock drops.", appLink: "donate", links: ["devskits://packages"] },
    "devskits://loki": { title: "Loki Companion Profile", body: "Profile, behavior tags, archive pointers, and patrol logs.", appLink: "loki", links: ["devskits://loki/archive"] },
    "devskits://loki/archive": { title: "Loki Archive", lock: "loki_archive", body: "Unlocked dossier: stat blocks, toy routes, snack debt matrix.", links: ["devskits://home"] },
    "devskits://about": { title: "System Identity", body: "DevSkits OS blends terminal discipline with desktop exploration.", appLink: "about" },
    "devskits://changelog": { title: "Build Log Feed", body: "Chronological build history with tags for shell, app, and fixes.", appLink: "buildlog" },
    "devskits://system": { title: "System Specs", body: "Core: static HTML/CSS/JS | Rendering: retro monochrome shell | Persistence: localStorage" },
    "devskits://packages": { title: "Installed Packages", body: "Inspect package modules and unlock status.", appLink: "packages" },
    "devskits://notes-index": { title: "Notes Index", body: "Quick launch into Notes, drafts, and linked project research.", appLink: "notes" },
    "devskits://labs": { title: "DevSkits Labs", lock: "devskits_labs", body: "Experimental routes unlocked through Install Center.", links: ["devskits://hidden/loki-note"] },
    "devskits://hidden/loki-note": { title: "[hidden] Loki note", lock: "devskits_labs", body: "If you found this, Loki already found your keyboard." }
  };

  function getJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; }
  }
  function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function trackActivity(type, detail) {
    const rows = getJSON(STORE_KEYS.activity, []);
    rows.unshift({ id: `act-${Date.now()}`, type, detail, at: Date.now() });
    setJSON(STORE_KEYS.activity, rows.slice(0, 40));
  }

  function defaultInbox() {
    return [
      { id: "msg-1", folder: "Inbox", from: "system@devskits.os", subject: "Welcome to DevSkits OS", body: "Boot successful. Explore Navigator and run command launcher for quick actions.", createdAt: Date.now() - 86400000 },
      { id: "msg-2", folder: "System", from: "loki@companion.node", subject: "Loki status report", body: "Mood: curious. Patrol count: 117. Toy stash location has changed.", createdAt: Date.now() - 72000000 },
      { id: "msg-3", folder: "Inbox", from: "build@devskits.os", subject: "Build 0.3 patch notes", body: "Phase 3 modules integrated. Check Build Log for full timeline.", createdAt: Date.now() - 36000000, link: "devskits://changelog" },
      { id: "msg-4", folder: "Archive", from: "ideas@devskits.os", subject: "Unfinished project ideas", body: "- CLI sketchpad\n- Loki gallery cards\n- Retro launcher macros", createdAt: Date.now() - 23000000 },
      { id: "msg-5", folder: "System", from: "support@devskits.os", subject: "Support acknowledgement", body: "Thanks for keeping the shell alive. Donation routes are mapped.", createdAt: Date.now() - 12000000, link: "devskits://donate" }
    ];
  }

  const world = {
    packageDefs: PACKAGE_DEFS,
    achievementDefs: ACHIEVEMENT_DEFS,
    pages: INTERNAL_PAGES,
    getPackages: () => getJSON(STORE_KEYS.packages, {}),
    setPackages: (v) => setJSON(STORE_KEYS.packages, v),
    isInstalled: (id) => Boolean(getJSON(STORE_KEYS.packages, {})[id]),
    installPackage(id) {
      const next = getJSON(STORE_KEYS.packages, {});
      next[id] = true;
      setJSON(STORE_KEYS.packages, next);
      trackActivity("package", `installed ${id}`);
      if (id === "loki_archive") world.pushInbox({ folder: "System", from: "packages@devpkg", subject: "Loki Archive unlocked", body: "Navigator route devskits://loki/archive is now accessible.", link: "devskits://loki/archive" });
      if (id === "devskits_labs") world.pushInbox({ folder: "System", from: "packages@devpkg", subject: "Labs unlocked", body: "New experimental internal page enabled.", link: "devskits://labs" });
      if (Object.keys(PACKAGE_DEFS).every((pkg) => next[pkg])) world.award("pkg_collector");
    },
    getAchievements: () => getJSON(STORE_KEYS.achievements, {}),
    award(id) {
      const rows = getJSON(STORE_KEYS.achievements, {});
      if (rows[id]) return false;
      rows[id] = { at: Date.now(), label: ACHIEVEMENT_DEFS[id] || id };
      setJSON(STORE_KEYS.achievements, rows);
      return true;
    },
    getRecycle: () => getJSON(STORE_KEYS.recycle, []),
    pushRecycle(item) {
      const rows = getJSON(STORE_KEYS.recycle, []);
      rows.unshift({ ...item, id: `bin-${Date.now()}` });
      setJSON(STORE_KEYS.recycle, rows.slice(0, 120));
    },
    setRecycle: (rows) => setJSON(STORE_KEYS.recycle, rows),
    getSticky: () => getJSON(STORE_KEYS.sticky, []),
    setSticky: (rows) => setJSON(STORE_KEYS.sticky, rows),
    getCalendar: () => getJSON(STORE_KEYS.calendar, {}),
    setCalendar: (rows) => setJSON(STORE_KEYS.calendar, rows),
    getDrafts: () => getJSON(STORE_KEYS.drafts, []),
    setDrafts: (rows) => setJSON(STORE_KEYS.drafts, rows),
    getQuotes: () => getJSON(STORE_KEYS.quotes, []),
    setQuotes: (rows) => setJSON(STORE_KEYS.quotes, rows),
    getSessions: () => getJSON(STORE_KEYS.sessions, {}),
    setSessions: (rows) => setJSON(STORE_KEYS.sessions, rows),
    getShortcuts: () => getJSON(STORE_KEYS.shortcuts, []),
    setShortcuts: (rows) => setJSON(STORE_KEYS.shortcuts, rows),
    getInbox: () => getJSON(STORE_KEYS.inbox, defaultInbox()),
    setInbox: (rows) => setJSON(STORE_KEYS.inbox, rows),
    pushInbox(msg) {
      const rows = world.getInbox();
      rows.unshift({ id: `msg-${Date.now()}`, createdAt: Date.now(), ...msg });
      world.setInbox(rows.slice(0, 120));
    },
    getBrowserHistory: () => getJSON(STORE_KEYS.browserHistory, []),
    pushBrowserHistory(route) {
      const rows = world.getBrowserHistory();
      rows.unshift({ route, at: Date.now() });
      setJSON(STORE_KEYS.browserHistory, rows.slice(0, 40));
      trackActivity("browse", route);
    },
    getRecentActivity: () => getJSON(STORE_KEYS.activity, []),
    trackActivity,
    getChangelog: () => getJSON(STORE_KEYS.changelog, BASE_CHANGELOG),
    setChangelog: (rows) => setJSON(STORE_KEYS.changelog, rows),
    getMediaLibrary: () => getJSON(STORE_KEYS.media, BASE_MEDIA),
    setMediaLibrary: (rows) => setJSON(STORE_KEYS.media, rows),
    getAppSettings: () => getJSON(STORE_KEYS.appSettings, { hiddenContent: true, iconDensity: "normal" }),
    setAppSettings: (rows) => setJSON(STORE_KEYS.appSettings, rows),
    canAccessRoute(route) {
      const page = INTERNAL_PAGES[route];
      if (!page) return false;
      if (!page.lock) return true;
      return world.isInstalled(page.lock);
    }
  };

  window.DevSkitsWorld = world;
})();
