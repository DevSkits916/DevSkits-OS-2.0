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
      whoami: () => "travis.ramsey@devskits",
      ls: (_, arg) => listDir(arg),
      dir: (_, arg) => listDir(arg),
      cd: (_, arg) => changeDir(arg),
      pwd: () => cwd,
      cat: (_, arg) => catFile(arg),
      open: (_, arg) => openTarget(arg),
      run: (_, arg) => runApp(arg),
      history: () => state.terminalHistory.slice(-20).join("\n") || "No command history.",
      apps: () => Object.keys(window.DevSkitsState.APPS).join(", "),
      mail: () => runApp("inbox"),
      browser: (_, arg) => openTarget(arg || "browser"),
      changelog: () => runApp("buildlog"),
      recent: () => W().getRecentActivity().slice(0, 10).map((r) => `${new Date(r.at).toLocaleTimeString()} ${r.type} ${r.detail}`).join("\n") || "No recent activity.",
      notify: (_, ...msg) => (window.DevSkitsDesktop.notify(msg.join(" ") || "Terminal ping"), "Notification sent."),
      pkg: (_, action, name) => pkgCommand(action, name),
      search: (_, ...args) => searchIndex(args.join(" ")),
      find: (_, ...args) => searchIndex(args.join(" ")),
      secret: () => secretCommand(),
      theme: () => "Theme cycled.",
      reboot: () => "Reboot queued..."
    };

    function helpText(topic) {
      const base = "Commands: help clear ls cd cat open run history apps mail browser changelog pkg recent notify search theme reboot";
      if (!topic) return base;
      const map = {
        run: "run <app> launches an app alias (terminal, files, notes, inbox, browser...)",
        open: "open <app|file|devskits://route>",
        pkg: "pkg list | pkg install <name>",
        browser: "browser [devskits://route|https://url]",
        recent: "recent prints tracked shared activity"
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
      const alias = { changelog: "buildlog", browser: "browser", mail: "inbox" };
      const target = alias[arg] || arg;
      if (!window.DevSkitsAppRegistry[target]) return "App not found.";
      window.DevSkitsWindowManager.openApp(target);
      W().trackActivity("app", `opened ${target}`);
      return `Opened ${target}`;
    }

    function openTarget(arg = "") {
      if (!arg) return "Usage: open <app-or-file-or-route>";
      const lower = arg.toLowerCase();
      if (window.DevSkitsAppRegistry[lower]) return runApp(lower);
      if (arg.startsWith("devskits://")) {
        window.DevSkitsWindowManager.openApp("browser", { route: arg });
        W().trackActivity("browse", arg);
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
        window.DevSkitsDesktop.notify(`Package installed: ${name}`, "ok");
        return `Installed ${name}`;
      }
      return "Usage: pkg list | pkg install <name>";
    }

    function searchIndex(query) {
      if (!query) return "Usage: search <query>";
      const pages = Object.keys(W().pages).filter((p) => p.includes(query));
      const apps = Object.keys(window.DevSkitsState.APPS).filter((id) => id.includes(query.toLowerCase()));
      const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").filter((n) => `${n.name} ${n.content}`.toLowerCase().includes(query.toLowerCase())).map((n) => n.name);
      return [`Apps: ${apps.join(", ") || "none"}`, `Pages: ${pages.join(", ") || "none"}`, `Notes: ${notes.join(", ") || "none"}`].join("\n");
    }

    function secretCommand() {
      W().award("terminal_diver");
      return "Hidden relay discovered: try open devskits://hidden/loki-note after installing devskits_labs";
    }

    function execute(raw) {
      const [name, ...args] = raw.trim().split(/\s+/);
      if (!name) return;
      const cmd = name.toLowerCase();
      const handler = commands[cmd];
      if (!handler) return `Unknown command: ${name}`;
      const result = handler(raw, ...args);
      if (cmd === "theme") window.DevSkitsDesktop.cycleTheme();
      if (cmd === "reboot") setTimeout(window.DevSkitsDesktop.rebootSystem, 300);
      W().trackActivity("cmd", raw);
      return result;
    }

    return { execute, getPrompt: () => `${cwd}>` };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
