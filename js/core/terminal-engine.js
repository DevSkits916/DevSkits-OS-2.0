(() => {
  const { state } = window.DevSkitsState;
  const FS = window.DevSkitsFS;

  function createTerminalEngine(print) {
    let cwd = "C:\\DEVSKITS";

    const helpText = {
      help: "help [command] - list commands or command help",
      run: "run <app> - launch app by id/name",
      open: "open <app|path|devskits://url> - open file, app, or internal browser url",
      mail: "mail - open Inbox",
      browser: "browser [url] - open Navigator",
      changelog: "changelog - open Build Log",
      recent: "recent - show tracked activity"
    };

    const commands = {
      help: (_, cmd) => (cmd ? helpText[cmd] || `No extended help for ${cmd}` : `Commands: ${Object.keys(commands).join(" ")}`),
      clear: () => ({ clear: true }),
      cls: () => ({ clear: true }),
      about: () => "DevSkits OS 2.0 identity shell. Retro browser desktop.",
      contact: () => "Opening Contact app...",
      donate: () => "Opening Donate app...",
      links: () => "Opening Links app...",
      projects: () => "Opening Projects app...",
      loki: () => "Opening Loki app...",
      github: () => "Opening github.com/DevSkits916",
      date: () => new Date().toString(),
      whoami: () => "travis.ramsey@devskits",
      reboot: () => "Reboot queued...",
      theme: () => "Theme cycled.",
      ls: (_, arg) => listDir(arg),
      dir: (_, arg) => listDir(arg),
      cd: (_, arg) => changeDir(arg),
      pwd: () => cwd,
      cat: (_, arg) => catFile(arg),
      open: (_, arg) => openTarget(arg),
      echo: (_, ...args) => args.join(" "),
      ver: () => "DevSkits OS 2.0 / Build 2026.03",
      hostname: () => "DEVSKITS-STATION",
      settings: () => "Opening Settings app...",
      run: (_, ...args) => runApp(args.join(" ")),
      apps: () => Object.keys(window.DevSkitsState.APPS).join("\n"),
      history: () => state.terminalHistory.join("\n") || "No terminal history.",
      mail: () => "Opening Inbox...",
      browser: (_, arg) => {
        const target = arg || "devskits://home";
        window.DevSkitsWindowManager.openApp("browser", { url: target });
        return `Navigator -> ${target}`;
      },
      changelog: () => "Opening Build Log...",
      pkg: () => state.packages.map((p) => `${p.installed ? "[x]" : "[ ]"} ${p.name}`).join("\n"),
      recent: () => state.activity.slice(0, 12).map((a) => `${new Date(a.at).toLocaleTimeString()} ${a.type}: ${a.detail}`).join("\n") || "No activity yet.",
      notify: (_, ...args) => {
        const msg = args.join(" ") || "DevSkits ping";
        window.DevSkitsDesktop.notify(msg);
        return `Notified: ${msg}`;
      }
    };

    function runApp(name = "") {
      if (!name) return "Usage: run <app>";
      const normalized = name.toLowerCase();
      const alias = { navigator: "browser", inbox: "inbox", buildlog: "buildlog" };
      const appId = window.DevSkitsAppRegistry[normalized] ? normalized : alias[normalized];
      if (!appId) return `Unknown app: ${name}`;
      window.DevSkitsWindowManager.openApp(appId);
      return `Launched ${appId}`;
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

    function openTarget(arg = "") {
      if (!arg) return "Usage: open <app-or-file-or-url>";
      const lower = arg.toLowerCase();
      if (lower.startsWith("devskits://")) {
        window.DevSkitsWindowManager.openApp("browser", { url: lower });
        return `Opened ${lower}`;
      }
      if (window.DevSkitsAppRegistry[lower]) {
        window.DevSkitsWindowManager.openApp(lower);
        return `Opened ${lower}`;
      }
      const node = FS.getNode(FS.normalize(arg, cwd));
      if (!node) return "Target not found.";
      if (node.type === "app") {
        window.DevSkitsWindowManager.openApp(node.app);
        return `Opened app: ${node.app}`;
      }
      if (node.type === "project") {
        window.DevSkitsWindowManager.openApp("projects", { focusProject: node.ref });
        return `Opened project: ${node.ref}`;
      }
      return node.content || "Opened file.";
    }

    function execute(raw) {
      const [name, ...args] = raw.trim().split(/\s+/);
      if (!name) return;
      const cmd = name.toLowerCase();
      const handler = commands[cmd];
      if (!handler) return `Unknown command: ${name}`;
      const result = handler(raw, ...args);
      if (cmd === "github") window.open("https://github.com/DevSkits916", "_blank", "noopener");
      if (cmd === "theme") window.DevSkitsDesktop.cycleTheme();
      if (cmd === "reboot") setTimeout(window.DevSkitsDesktop.rebootSystem, 300);
      if (["contact", "donate", "links", "projects", "loki", "settings", "mail", "changelog"].includes(cmd)) {
        const map = { mail: "inbox", changelog: "buildlog" };
        window.DevSkitsWindowManager.openApp(map[cmd] || cmd);
      }
      return result;
    }

    return { execute, getPrompt: () => `${cwd}>` };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
