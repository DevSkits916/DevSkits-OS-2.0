(() => {
  const { state } = window.DevSkitsState;
  const FS = window.DevSkitsFS;
  const W = () => window.DevSkitsWorld;

  function createTerminalEngine(print) {
    let cwd = "C:\\DEVSKITS";

    const commands = {
      help: (_, topic) => helpText(topic),
      clear: () => ({ clear: true }),
      cls: () => ({ clear: true }),
      about: () => "DevSkits 3.1 identity shell. Retro browser desktop.",
      date: () => new Date().toString(),
      whoami: () => "operator@devskits.local",
      ls: (_, arg) => listDir(arg),
      dir: (_, arg) => listDir(arg),
      cd: (_, arg) => changeDir(arg),
      pwd: () => cwd,
      cat: (_, arg) => catFile(arg),
      open: (_, arg) => openTarget(arg),
      run: (_, arg) => runApp(arg),
      history: () => state.terminalHistory.slice(-20).join("\n") || "No command history.",
      apps: () => Object.keys(window.DevSkitsState.APPS).join(", "),
      recent: () => W().getRecentActivity().slice(0, 10).map((r) => `${new Date(r.at).toLocaleTimeString()} ${r.type} ${r.detail}`).join("\n") || "No recent activity.",
      notify: (_, ...msg) => (W().pushNotification(msg.join(" ") || "Terminal ping", "info"), "Notification sent."),
      pkg: (_, action, name) => pkgCommand(action, name),
      search: (_, ...args) => searchIndex(args.join(" ")),
      find: (_, ...args) => searchIndex(args.join(" ")),
      secret: () => secretCommand(),
      theme: () => "Theme cycled.",
      reboot: () => "Reboot queued...",
      restart: () => "Reboot queued...",
      updates: () => updatesCommand(),
      install: (_, target) => installCommand(target),
      services: () => servicesCommand(),
      ps: () => servicesCommand(true),
      logs: () => logsCommand(),
      inbox: () => runApp("inbox"),
      remind: (_, ...args) => remindCommand(args.join(" ")),
      tasks: () => remindCommand("list"),
      stats: () => statsCommand(),
      profile: () => statsCommand(),
      reindex: () => JSON.stringify(W().reindex()),
      events: () => W().getNotifications().slice(0, 12).map((n) => `${new Date(n.at).toLocaleTimeString()} [${n.level}] ${n.message}`).join("\n") || "No events.",
      uptime: () => `${(W().getProcessSnapshot().uptimeMs / 1000 | 0)}s`,
      status: () => statusCommand()
    };

    function helpText(topic) {
      const base = "Commands: help clear ls cd cat open run history apps recent notify pkg search updates install services ps logs inbox remind tasks stats profile reindex events uptime status theme reboot";
      if (!topic) return base;
      const map = {
        updates: "updates -> list current + available updates",
        install: "install update -> install first available update",
        services: "services -> show service states",
        logs: "logs -> open logs app and print recent lines",
        remind: "remind <text> | remind list",
        status: "status -> quick system health summary"
      };
      return map[topic] || `No extended help for ${topic}`;
    }

    function listDir(arg = ".") {
      const path = FS.normalize(arg, cwd);
      const listing = FS.list(path);
      if (!listing) return `Not a directory: ${path}`;
      return listing.map((x) => `${x.type === "dir" ? "[DIR]" : "[FILE]"} ${x.name}`).join("\n") || "<empty>";
    }

    function changeDir(arg = "C:\\DEVSKITS") {
      const next = FS.normalize(arg, cwd);
      const node = FS.getNode(next);
      if (!node || node.type !== "dir") return `Directory not found: ${next}`;
      cwd = next;
      return cwd;
    }

    function catFile(arg = "") {
      if (!arg) return "Usage: cat <file>";
      const node = FS.getNode(FS.normalize(arg, cwd));
      if (!node || node.type === "dir") return "File not found.";
      if (node.type === "project") return `Project stub: ${node.ref}`;
      return node.content || "<empty>";
    }

    function runApp(arg = "") {
      const alias = { changelog: "buildlog", browser: "browser", mail: "inbox", logs: "syslogs", updates: "updater" };
      const target = alias[arg] || arg;
      if (!window.DevSkitsAppRegistry[target]) return "App not found.";
      window.DevSkitsWindowManager.openApp(target);
      return `Opened ${target}`;
    }

    function openTarget(arg = "") {
      if (!arg) return "Usage: open <app-or-file-or-route>";
      const lower = arg.toLowerCase();
      if (window.DevSkitsAppRegistry[lower]) return runApp(lower);
      if (arg.startsWith("devskits://")) {
        window.DevSkitsWindowManager.openApp("browser", { route: arg });
        return `Opened ${arg}`;
      }
      if (/^https?:\/\//i.test(arg)) {
        window.open(arg, "_blank", "noopener");
        return `Opened external ${arg}`;
      }
      const node = FS.getNode(FS.normalize(arg, cwd));
      if (!node) return "Target not found.";
      if (node.type === "app") return runApp(node.app);
      if (node.type === "project") {
        window.DevSkitsWindowManager.openApp("projects", { focusProject: node.ref });
        return `Opened project: ${node.ref}`;
      }
      return node.content || "Opened file.";
    }

    function pkgCommand(action = "list", name = "") {
      if (action === "list") return Object.entries(W().packageDefs).map(([id, p]) => `${id} :: ${W().isInstalled(id) ? "installed" : "not installed"} :: ${p.title}`).join("\n");
      if (action === "install") {
        if (!W().packageDefs[name]) return "Unknown package";
        if (W().isInstalled(name)) return "Package already installed";
        W().installPackage(name);
        return `Installed ${name}`;
      }
      return "Usage: pkg list | pkg install <name>";
    }

    function searchIndex(query) {
      if (!query) return "Usage: search <query>";
      const hits = W().searchEverything(query);
      return hits.slice(0, 12).map((h) => `[${h.type}] ${h.label}`).join("\n") || "No matches.";
    }

    function secretCommand() {
      W().award("terminal_diver");
      return "Hidden relay discovered: try open devskits://hidden/loki-note after installing devskits_labs";
    }

    function updatesCommand() {
      const u = W().getUpdates();
      const next = u.available.map((x) => `${x.id} ${x.version} ${x.build}`).join(" | ") || "none";
      return `Current ${u.currentVersion} ${u.currentBuild}\nAvailable ${next}\nPending restart ${u.pendingRestart ? "yes" : "no"}`;
    }

    function installCommand(target = "") {
      if (target !== "update") return "Usage: install update";
      const u = W().getUpdates();
      if (!u.available.length) return "No updates available.";
      W().downloadUpdate(u.available[0].id);
      W().installUpdate(u.available[0].id);
      return `Installed ${u.available[0].id}. Run restart.`;
    }

    function servicesCommand(withPid = false) {
      const s = W().getServices();
      return Object.keys(s).map((id, i) => withPid ? `${s[id] ? "RUN" : "STOP"} PID ${1200 + i} ${id}` : `${id}: ${s[id] ? "online" : "offline"}`).join("\n");
    }

    function logsCommand() {
      window.DevSkitsWindowManager.openApp("syslogs");
      return W().getLogs().slice(0, 8).map((r) => `[${r.channel}] ${r.message}`).join("\n") || "No logs";
    }

    function remindCommand(arg) {
      if (!arg || arg === "list") return W().getReminders().map((r, i) => `${i + 1}. ${r.done ? "[x]" : "[ ]"} ${r.title}`).join("\n") || "No reminders.";
      const rows = W().getReminders();
      rows.unshift({ title: arg, dueAt: null, done: false });
      W().setReminders(rows);
      return `Reminder added: ${arg}`;
    }

    function statsCommand() {
      const p = W().getProfile();
      return `Boots: ${p.bootCount}\nCommands: ${p.commandsRun}\nPackages: ${p.packagesInstalled}\nHidden pages: ${p.hiddenPagesFound}`;
    }

    function statusCommand() {
      const ps = W().getProcessSnapshot();
      const u = W().getUpdates();
      return `CPU ${ps.cpu}% MEM ${ps.memory}%\nServices ${ps.running}/${ps.total}\nBuild ${u.currentVersion} ${u.currentBuild}\nNotifications ${W().getNotifications().length}`;
    }

    function execute(raw) {
      const [name, ...args] = raw.trim().split(/\s+/);
      if (!name) return;
      const cmd = name.toLowerCase();
      const handler = commands[cmd];
      if (!handler) return `Unknown command: ${name}`;
      const result = handler(raw, ...args);
      if (cmd === "theme") window.DevSkitsDesktop.cycleTheme();
      if (cmd === "reboot" || cmd === "restart") setTimeout(window.DevSkitsDesktop.rebootSystem, 300);
      W().trackActivity("cmd", raw);
      W().registerCommand();
      return result;
    }

    return { execute, getPrompt: () => `${cwd}>` };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
