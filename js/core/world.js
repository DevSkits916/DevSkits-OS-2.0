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
    inbox: "devskits-inbox-v2",
    browserHistory: "devskits-browser-history-v1",
    activity: "devskits-activity-v2",
    changelog: "devskits-changelog-v2",
    media: "devskits-media-v1",
    appSettings: "devskits-app-settings-v2",
    updates: "devskits-updates-v1",
    services: "devskits-services-v1",
    notifications: "devskits-notifications-v1",
    logs: "devskits-logs-v1",
    reminders: "devskits-reminders-v1",
    profile: "devskits-profile-v1",
    searchIndex: "devskits-index-v1"
  };

  const PACKAGE_DEFS = {
    retro_clock_pack: { title: "Retro Clock Pack", unlocks: ["extra dashboard status", "clock variants"] },
    extra_wallpapers: { title: "Extra Wallpapers", unlocks: ["terminal wallpaper", "matrix wallpaper"] },
    loki_archive: { title: "Loki Archive", unlocks: ["loki dossier", "loki inbox threads", "devskits://loki/archive"] },
    devskits_labs: { title: "DevSkits Labs", unlocks: ["devskits://labs", "labs messages", "terminal easter egg"] },
    classic_icons: { title: "Classic Icons", unlocks: ["desktop shortcut theme", "icon density option"] }
  };

  const INTERNAL_PAGES = {
    "devskits://home": { title: "DevSkits Home", body: "Welcome to Navigator. Browse internal nodes, inspect build history, and jump into apps.", links: ["devskits://projects", "devskits://changelog", "devskits://system", "devskits://updates"] },
    "devskits://updates": { title: "Updater Node", body: "System Update service mirror.", appLink: "updater" },
    "devskits://services": { title: "Service Registry", body: "Service state and process snapshots.", appLink: "process-monitor" },
    "devskits://logs": { title: "System Console", body: "Timestamped runtime logs and alerts.", appLink: "system-logs" },
    "devskits://projects": { title: "Projects Wire", body: "Status board mirror for active, building, and concept tracks.", appLink: "projects", links: ["devskits://notes-index", "devskits://contact"] },
    "devskits://loki/archive": { title: "Loki Archive", lock: "loki_archive", body: "Unlocked dossier: stat blocks, toy routes, snack debt matrix." },
    "devskits://labs": { title: "DevSkits Labs", lock: "devskits_labs", body: "Experimental routes unlocked through Install Center.", links: ["devskits://hidden/loki-note"] },
    "devskits://hidden/loki-note": { title: "[hidden] Loki note", lock: "devskits_labs", body: "If you found this, Loki already found your keyboard." }
  };

  const BASE_CHANGELOG = [{ id: "p4", version: "0.4.0", build: "DSK-420", timestamp: "2026-05-21 09:15", title: "Phase 4 systems", tags: ["shell", "app"], body: "Install Center, inbox, browser routes, run dialog, media deck." }];
  const AVAILABLE_UPDATES = [{ id: "upd-500", version: "0.5.0", build: "DSK-500", title: "Living OS rollout", notes: { shell: ["Dynamic boot report", "Service-aware restart", "Widget memory layer"], apps: ["Updater", "Process Monitor", "System Logs", "Activity Log", "Reminders", "Presence", "Profile"], fixes: ["Inbox threading", "Search index coverage expansion", "Mobile readability in system apps"], hidden: ["Loki guard relay tuned", "Archive watcher signal"], } }];

  function getJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
  function setJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function uid(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`; }

  const world = {
    pages: INTERNAL_PAGES,
    packageDefs: PACKAGE_DEFS,
    servicesDefault: {
      "shell.host": true, "inbox.sync": true, "loki.guard": true, "notes.cache": true,
      "browser.indexer": true, "pkg.manager": true, "desktop.widgets": true, "archive.scan": true,
      "notifications.service": true, "session.restore": true
    },
    getPackages: () => getJSON(STORE_KEYS.packages, {}),
    setPackages: (v) => setJSON(STORE_KEYS.packages, v),
    isInstalled: (id) => Boolean(getJSON(STORE_KEYS.packages, {})[id]),
    getAchievements: () => getJSON(STORE_KEYS.achievements, {}),
    award(id) { const rows = world.getAchievements(); if (rows[id]) return false; rows[id] = { at: Date.now(), label: id }; setJSON(STORE_KEYS.achievements, rows); world.trackActivity("achievement", id); return true; },

    getRecycle: () => getJSON(STORE_KEYS.recycle, []),
    setRecycle: (rows) => setJSON(STORE_KEYS.recycle, rows),
    pushRecycle(item) { const rows = world.getRecycle(); rows.unshift({ ...item, id: uid("bin") }); world.setRecycle(rows.slice(0, 120)); },
    getSticky: () => getJSON(STORE_KEYS.sticky, []), setSticky: (rows) => setJSON(STORE_KEYS.sticky, rows),
    getCalendar: () => getJSON(STORE_KEYS.calendar, {}), setCalendar: (rows) => setJSON(STORE_KEYS.calendar, rows),
    getDrafts: () => getJSON(STORE_KEYS.drafts, []), setDrafts: (rows) => setJSON(STORE_KEYS.drafts, rows),
    getQuotes: () => getJSON(STORE_KEYS.quotes, []), setQuotes: (rows) => setJSON(STORE_KEYS.quotes, rows),
    getSessions: () => getJSON(STORE_KEYS.sessions, {}), setSessions: (rows) => setJSON(STORE_KEYS.sessions, rows),
    getShortcuts: () => getJSON(STORE_KEYS.shortcuts, []), setShortcuts: (rows) => setJSON(STORE_KEYS.shortcuts, rows),
    getMediaLibrary: () => getJSON(STORE_KEYS.media, []), setMediaLibrary: (rows) => setJSON(STORE_KEYS.media, rows),

    getAppSettings: () => getJSON(STORE_KEYS.appSettings, { hiddenContent: true, iconDensity: "normal", mobileDensity: "comfortable", notificationsEnabled: true, widgets: { clock: true, activity: true, health: true, updates: true }, eventEngine: true, theme: localStorage.getItem("devskits-theme") || "default", wallpaper: localStorage.getItem("devskits-wallpaper") || "devskits95", bootAnimation: localStorage.getItem("devskits-fast-boot") === "on" ? "minimal" : "full", soundEnabled: localStorage.getItem("devskits-sound") !== "off", reducedMotion: localStorage.getItem("devskits-animations") === "off", clock24h: true }),
    setAppSettings: (rows) => setJSON(STORE_KEYS.appSettings, rows),

    getInbox() {
      return getJSON(STORE_KEYS.inbox, [
        { id: uid("msg"), folder: "Inbox", threadId: "th-welcome", from: "system@devskits.os", to: "operator@local", subject: "Welcome to DevSkits OS", body: "Boot successful. Living services are online.", createdAt: Date.now() - 86400000, read: false },
        { id: uid("msg"), folder: "System", threadId: "th-updates", from: "updater@devskits.os", to: "operator@local", subject: "Updater ready", body: "Phase 5 update channels initialized.", createdAt: Date.now() - 40000000, read: false },
        { id: uid("msg"), folder: "Alerts", threadId: "th-loki", from: "loki.guard@daemon", to: "operator@local", subject: "Patrol report", body: "Archive watcher flagged hidden route traffic.", createdAt: Date.now() - 20000000, read: false }
      ]);
    },
    setInbox: (rows) => setJSON(STORE_KEYS.inbox, rows),
    pushInbox(msg) {
      const rows = world.getInbox();
      rows.unshift({ id: uid("msg"), createdAt: Date.now(), read: false, folder: "Inbox", threadId: uid("th"), to: "operator@local", ...msg });
      world.setInbox(rows.slice(0, 220));
      world.pushNotification(`New message: ${msg.subject || "(no subject)"}`, "system");
    },

    getBrowserHistory: () => getJSON(STORE_KEYS.browserHistory, []),
    pushBrowserHistory(route) { const rows = world.getBrowserHistory(); rows.unshift({ route, at: Date.now() }); setJSON(STORE_KEYS.browserHistory, rows.slice(0, 80)); world.trackActivity("browse", route); },

    getRecentActivity: () => getJSON(STORE_KEYS.activity, []),
    trackActivity(type, detail) {
      const rows = world.getRecentActivity();
      rows.unshift({ id: uid("act"), type, detail, at: Date.now() });
      setJSON(STORE_KEYS.activity, rows.slice(0, 200));
    },

    getLogs: () => getJSON(STORE_KEYS.logs, []),
    addLog(channel, message, level = "info") {
      const rows = world.getLogs();
      rows.unshift({ id: uid("log"), channel, message, level, at: Date.now() });
      setJSON(STORE_KEYS.logs, rows.slice(0, 500));
    },
    clearLogs: () => setJSON(STORE_KEYS.logs, []),

    getNotifications: () => getJSON(STORE_KEYS.notifications, []),
    pushNotification(message, level = "info") {
      const settings = world.getAppSettings();
      const rows = world.getNotifications();
      rows.unshift({ id: uid("ntf"), message, level, at: Date.now() });
      setJSON(STORE_KEYS.notifications, rows.slice(0, 120));
      world.addLog("notifications", message, level);
      if (settings.notificationsEnabled) window.DevSkitsDesktop?.notify?.(message, level === "alert" ? "warn" : level === "system" ? "ok" : "info");
    },
    clearNotifications: () => setJSON(STORE_KEYS.notifications, []),

    getChangelog: () => getJSON(STORE_KEYS.changelog, BASE_CHANGELOG),
    setChangelog: (rows) => setJSON(STORE_KEYS.changelog, rows),

    getUpdates: () => getJSON(STORE_KEYS.updates, { currentVersion: "0.4.0", currentBuild: "DSK-420", available: AVAILABLE_UPDATES, history: [], stage: "idle", pendingRestart: false }),
    setUpdates: (rows) => setJSON(STORE_KEYS.updates, rows),
    downloadUpdate(id) { const data = world.getUpdates(); data.stage = `downloaded:${id}`; world.setUpdates(data); world.trackActivity("update", `downloaded ${id}`); world.pushNotification(`Update package ready: ${id}`, "system"); },
    installUpdate(id) {
      const data = world.getUpdates();
      const item = data.available.find((u) => u.id === id); if (!item) return false;
      data.currentVersion = item.version; data.currentBuild = item.build; data.pendingRestart = true; data.stage = `installed:${id}`;
      data.history.unshift({ id, at: Date.now(), version: item.version, build: item.build, title: item.title });
      data.available = data.available.filter((u) => u.id !== id);
      world.setUpdates(data);
      const c = world.getChangelog(); c.unshift({ id, version: item.version, build: item.build, timestamp: new Date().toLocaleString(), title: item.title, tags: ["update", "system"], body: "Installed from local update channel." }); world.setChangelog(c);
      world.pushInbox({ folder: "System", threadId: "th-updates", from: "updater@devskits.os", subject: `Update installed ${item.version}`, body: `Restart required to finalize build ${item.build}.` });
      world.addLog("updates", `Installed ${item.version} (${item.build})`, "system");
      return true;
    },

    getServices: () => getJSON(STORE_KEYS.services, world.servicesDefault),
    setServices: (rows) => setJSON(STORE_KEYS.services, rows),
    toggleService(id) {
      const services = world.getServices(); services[id] = !services[id]; world.setServices(services);
      world.pushNotification(`Service ${id} ${services[id] ? "started" : "stopped"}`, services[id] ? "system" : "alert");
      world.trackActivity("service", `${id}:${services[id] ? "on" : "off"}`);
    },
    getProcessSnapshot() {
      const services = world.getServices();
      const running = Object.values(services).filter(Boolean).length;
      const cpu = Math.min(98, 8 + running * 6 + Math.floor(Math.random() * 10));
      const memory = Math.min(95, 20 + running * 5 + Math.floor(Math.random() * 12));
      return { running, total: Object.keys(services).length, cpu, memory, uptimeMs: Date.now() - world.getProfile().lastBootAt };
    },

    getReminders: () => getJSON(STORE_KEYS.reminders, []),
    setReminders: (rows) => setJSON(STORE_KEYS.reminders, rows),

    getProfile() { return getJSON(STORE_KEYS.profile, { firstBootAt: Date.now(), bootCount: 0, lastBootAt: Date.now(), commandsRun: 0, appsOpened: {}, packagesInstalled: 0, hiddenPagesFound: 0, notesCreated: 0 }); },
    setProfile: (rows) => setJSON(STORE_KEYS.profile, rows),
    registerBoot() {
      const p = world.getProfile(); p.bootCount += 1; p.lastBootAt = Date.now(); world.setProfile(p);
      world.addLog("boot", `Boot #${p.bootCount} initiated`, "system");
    },
    registerCommand() { const p = world.getProfile(); p.commandsRun += 1; world.setProfile(p); },
    registerAppOpen(appId) { const p = world.getProfile(); p.appsOpened[appId] = (p.appsOpened[appId] || 0) + 1; world.setProfile(p); },

    getIndexStatus: () => getJSON(STORE_KEYS.searchIndex, { progress: 100, lastIndexedAt: Date.now(), counts: {} }),
    reindex() {
      const counts = {
        apps: Object.keys(window.DevSkitsState?.APPS || {}).length,
        notes: JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").length,
        messages: world.getInbox().length,
        pages: Object.keys(world.pages).length,
        logs: world.getLogs().length,
        updates: world.getUpdates().history.length + world.getUpdates().available.length,
        achievements: Object.keys(world.getAchievements()).length,
        projects: (window.DevSkitsProjects || []).length
      };
      setJSON(STORE_KEYS.searchIndex, { progress: 100, lastIndexedAt: Date.now(), counts });
      world.pushNotification("Indexer scan complete", "info");
      world.trackActivity("index", "reindex completed");
      return counts;
    },

    searchEverything(query) {
      const q = query.toLowerCase();
      if (!q) return [];
      const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]");
      const fromMessages = world.getInbox().map((m) => ({ type: "message", label: `${m.subject} :: ${m.from}`, target: m.id }));
      const fromLogs = world.getLogs().map((l) => ({ type: "log", label: `${l.channel} ${l.message}`, target: l.id }));
      const base = [
        ...Object.entries(window.DevSkitsState.APPS).map(([id, a]) => ({ type: "app", label: a.title, target: id })),
        ...Object.keys(world.pages).map((route) => ({ type: "page", label: route, target: route })),
        ...notes.map((n) => ({ type: "note", label: `${n.name} ${n.content}`, target: n.id })),
        ...fromMessages,
        ...fromLogs
      ];
      return base.filter((x) => `${x.type} ${x.label}`.toLowerCase().includes(q)).slice(0, 70);
    },

    canAccessRoute(route) { const page = INTERNAL_PAGES[route]; if (!page) return false; if (!page.lock) return true; return world.isInstalled(page.lock); },
    getBootLines() {
      const u = world.getUpdates(); const profile = world.getProfile();
      return [
        `Initializing identity shell / build ${u.currentBuild}`,
        profile.bootCount <= 1 ? "First boot handshake complete." : `Restoring session profile / boot ${profile.bootCount}`,
        u.pendingRestart ? `Applying update ${u.currentVersion}... complete.` : "No pending core updates.",
        `Services online: ${Object.values(world.getServices()).filter(Boolean).length}`,
        `Notification buffer: ${world.getNotifications().length}`
      ];
    },

    initLivingSystem() {
      if (window.__devskitsLivingInit) return;
      window.__devskitsLivingInit = true;
      world.registerBoot();
      world.reindex();
      setInterval(() => {
        const settings = world.getAppSettings();
        if (!settings.eventEngine) return;
        const reminders = world.getReminders();
        const due = reminders.find((r) => !r.done && r.dueAt && r.dueAt <= Date.now() && !r.alerted);
        if (due) {
          due.alerted = true;
          world.setReminders(reminders);
          world.pushNotification(`Reminder due: ${due.title}`, "alert");
          world.addLog("reminders", `Due reminder fired: ${due.title}`, "alert");
        } else if (Math.random() < 0.22) {
          const events = ["update channel ping", "archive scan complete", "notes autosaved", "inbox sync checkpoint", "widgets refresh cycle"];
          const hit = events[Math.floor(Math.random() * events.length)];
          world.addLog("system", hit, "info");
          if (Math.random() < 0.25) world.pushNotification(hit, "info");
        }
      }, 15000);
    }
  };

  world.installPackage = function installPackage(id) {
    const next = world.getPackages();
    next[id] = true;
    world.setPackages(next);
    world.trackActivity("package", `installed ${id}`);
    if (id === "loki_archive") world.pushInbox({ folder: "System", threadId: "th-loki", from: "packages@devpkg", subject: "Loki Archive unlocked", body: "Navigator route devskits://loki/archive is now accessible.", link: "devskits://loki/archive" });
    if (id === "devskits_labs") world.pushInbox({ folder: "System", threadId: "th-labs", from: "packages@devpkg", subject: "Labs unlocked", body: "New experimental internal page enabled.", link: "devskits://labs" });
    const p = world.getProfile(); p.packagesInstalled = Object.keys(next).filter((k) => next[k]).length; world.setProfile(p);
    world.addLog("packages", `Installed package ${id}`, "system");
  };

  window.DevSkitsWorld = world;
})();
