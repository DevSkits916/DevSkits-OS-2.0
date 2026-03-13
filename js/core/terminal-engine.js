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
      about: () => "DevSkits OS 3.2 RetroShell - fictional desktop identity OS.",
      contact: () => runApp("contact"),
      donate: () => runApp("donate"),
      links: () => runApp("links"),
      projects: () => runApp("projects"),
      loki: () => runApp("loki"),
      github: () => "https://github.com/DevSkits916",
      whoami: () => "travis.ramsey@devskits.local",
      date: () => new Date().toDateString(),
      time: () => new Date().toLocaleTimeString(),
      ver: () => `DevSkits ${window.DevSkitsSystemData?.about?.version || '3.2.0'}`,
      ls: (_, arg) => listDir(arg),
      dir: (_, arg) => listDir(arg),
      cd: (_, arg) => changeDir(arg),
      pwd: () => cwd,
      cat: (_, arg) => catFile(arg),
      open: (_, ...arg) => openTarget(arg.join(" ")),
      run: (_, arg) => runApp(arg),
      history: () => state.terminalHistory.slice(-20).join("\n") || "No command history.",
      apps: () => Object.keys(window.DevSkitsState.APPS).join(", "),
      recent: () => W().getRecentActivity().slice(0, 10).map((r) => `${new Date(r.at).toLocaleTimeString()} ${r.type} ${r.detail}`).join("\n") || "No recent activity.",
      notify: (_, ...msg) => (W().pushNotification(msg.join(" ") || "Terminal ping", "info"), "Notification sent."),
      search: (_, ...args) => searchIndex(args.join(" ")),
      find: (_, ...args) => searchIndex(args.join(" ")),
      secret: () => secretCommand(),
      theme: () => "Theme cycled.",
      reboot: () => "Reboot queued...",
      restart: () => "Reboot queued...",
      status: () => statusCommand(),
      echo: (_, ...args) => args.join(" "),
      "?": () => helpText(),
      exit: () => "This terminal is persistent. Close window to exit shell session."
    };

    function helpText(topic) {
      const base = "Commands: help clear cls about contact donate links projects loki github whoami date time theme apps open run reboot echo ver status ls dir cd cat search history recent";
      if (!topic) return base;
      const map = {
        open: "open [app|path|devskits://route|https://url]",
        cat: "cat [file] e.g. cat about.txt",
        search: "search [term] finds apps/files/projects",
        theme: "theme cycles the active desktop theme"
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
      let node = FS.getNode(FS.normalize(arg, cwd));
      if (!node && !arg.includes("\\")) {
        const aliases = {
          "about.txt": "C:\\DEVSKITS\\about.txt",
          "projects.txt": "C:\\DEVSKITS\\projects.txt",
          "loki.txt": "C:\\DEVSKITS\\loki.txt",
          "contact.txt": "C:\\DEVSKITS\\contact.txt",
          "changelog.txt": "C:\\DEVSKITS\\changelog.txt"
        };
        node = FS.getNode(aliases[arg.toLowerCase()]);
      }
      if (!node || node.type === "dir") return "File not found.";
      if (node.type === "project") return `Project stub: ${node.ref}`;
      return node.content || "<empty>";
    }

    function runApp(arg = "") {
      const alias = { browser: "browser", mail: "inbox", logs: "syslogs", settings: "settings", notes: "notes", files: "files" };
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

    function searchIndex(query) {
      if (!query) return "Usage: search <query>";
      const hits = W().searchEverything(query);
      return hits.slice(0, 12).map((h) => `[${h.type}] ${h.label}`).join("\n") || "No matches.";
    }

    function secretCommand() {
      W().award("terminal_diver");
      return "Hidden relay discovered.";
    }

    function statusCommand() {
      const ps = W().getProcessSnapshot();
      return `CPU ${ps.cpu}% MEM ${ps.memory}%\nServices ${ps.running}/${ps.total}\nNotifications ${W().getNotifications().length}`;
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
