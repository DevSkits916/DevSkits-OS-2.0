(() => {
  const STORE_KEYS = {
    packages: "devskits-packages-v1",
    achievements: "devskits-achievements-v1",
    recycle: "devskits-recycle-v1",
    sticky: "devskits-sticky-v1",
    calendar: "devskits-calendar-v1",
    drafts: "devskits-drafts-v1",
    quotes: "devskits-quotes-v1",
    sessions: "devskits-snapshots-v1",
    shortcuts: "devskits-shortcuts-v1"
  };

  const PACKAGE_DEFS = {
    classic_tools: { title: "Classic Tools Pack", unlocks: ["calculator", "calendar", "clock"] },
    desktop_toys: { title: "Desktop Toys Pack", unlocks: ["sticky", "screensaver"] },
    devskits_labs: { title: "DevSkits Labs Pack", unlocks: ["devskits://labs", "ascii", "quoteforge"] },
    hidden_routes: { title: "Hidden Routes Pack", unlocks: ["devskits://secrets", "terminal:secret"] },
    loki_archive: { title: "Loki Archive Pack", unlocks: ["devskits://loki", "loki mini-game+"] },
    archive_recovery: { title: "Archive Recovery Pack", unlocks: ["devskits://archive", "recycle restore"] }
  };

  const ACHIEVEMENT_DEFS = {
    first_secret: "Opened first hidden page",
    pkg_collector: "Installed all Phase 4 packages",
    loki_hunter: "Found Loki archive",
    terminal_diver: "Used terminal secret command",
    restore_op: "Restored a deleted item"
  };

  const INTERNAL_PAGES = {
    "devskits://home": { title: "Home Node", body: "Welcome to the DevSkits internal webring. Use the index to jump through active and archival nodes." },
    "devskits://projects": { title: "Projects Wire", body: "Project feed mirrors the Projects app with rough status tags and internal dev snapshots." },
    "devskits://contact": { title: "Contact Relay", body: "Signal relay for contact routes, socials, and support channels." },
    "devskits://donate": { title: "Support Relay", body: "Sustain development cycles and unlock ambient lore through package drops." },
    "devskits://loki": { title: "Loki Archive", lock: "loki_archive", body: "Companion logs: patrol count 117, treat debt unresolved, toy stash hidden in SYS/LOKI." },
    "devskits://buildlog": { title: "Build Log", body: "Build 3.1.4: shell sync stabilized, package hooks wired, labs route linked." },
    "devskits://labs": { title: "DevSkits Labs", lock: "devskits_labs", body: "Experimental zone: ASCII Forge prototype, quote pressure tests, signal decoder mock." },
    "devskits://archive": { title: "System Archive", lock: "archive_recovery", body: "Recovered memos, failed builds, and companion incident notes." },
    "devskits://inbox-help": { title: "Inbox Help", body: "Draft transfer endpoint active. Use Post Draft Pad to stage quick dispatches." },
    "devskits://downloads": { title: "Downloads", body: "Available packs: wallpapers.zip, icon-pack-95.zip, loki-dossier.txt, archive-docs.bin" },
    "devskits://network": { title: "Network Map", body: "Mapped nodes: home, projects, labs, archive, secrets. Some links require package keys." },
    "devskits://secrets": { title: "Hidden Routes", lock: "hidden_routes", body: "Route fragment found: devskits://secrets/blackbox :: passphrase handled via terminal unlock." }
  };

  function getJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch (e) { return fallback; }
  }
  function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

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
    canAccessRoute(route) {
      const page = INTERNAL_PAGES[route];
      if (!page) return false;
      if (!page.lock) return true;
      return world.isInstalled(page.lock);
    }
  };

  window.DevSkitsWorld = world;
})();
