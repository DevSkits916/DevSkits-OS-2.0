(() => {
  const { state } = window.DevSkitsState;
  const FS = window.DevSkitsFS;
  const W = () => window.DevSkitsWorld;

  function createTerminalEngine(print) {
    let cwd = "C:\\DEVSKITS";
    let gameState = null;

    const commands = {
      help: (_, topic) => helpText(topic),
      clear: () => ({ clear: true }),
      cls: () => ({ clear: true }),
      about: () => "DevSkits 3.1 identity shell. Retro browser desktop.",
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
      run: (_, arg) => runApp(arg),
      echo: (_, ...args) => args.join(" "),
      ver: () => "DevSkits 3.1 / Build 2026.04-P4",
      hostname: () => "DEVSKITS-STATION",
      settings: () => "Opening Settings app...",
      pkg: (_, action, name) => pkgCommand(action, name),
      achievements: () => achievementList(),
      find: (_, ...args) => searchIndex(args.join(" ")),
      search: (_, ...args) => searchIndex(args.join(" ")),
      recent: () => `Recent apps: ${state.recentApps.join(", ") || "none"}`,
      archive: () => "Tip: open devskits://archive after installing archive_recovery",
      unlock: (_, route) => unlockRoute(route),
      secret: () => secretCommand(),
      game: (_, arg) => terminalGame(arg)
    };

    function helpText(topic) {
      const base = "Commands: help clear about open run pkg find search ls cd cat secret game unlock achievements recent";
      if (!topic) return base;
      const map = {
        pkg: "pkg list | pkg install <name>",
        open: "open <app|file|devskits://route>",
        find: "find <term> searches apps/pages/files/notes",
        secret: "secret reveals hidden route hints",
        game: "game start launches terminal scavenger"
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
      if (!window.DevSkitsAppRegistry[arg]) return "App not found.";
      window.DevSkitsWindowManager.openApp(arg);
      return `Opened ${arg}`;
    }

    function openTarget(arg = "") {
      if (!arg) return "Usage: open <app-or-file-or-route>";
      const lower = arg.toLowerCase();
      if (window.DevSkitsAppRegistry[lower]) {
        window.DevSkitsWindowManager.openApp(lower);
        return `Opened ${lower}`;
      }
      if (arg.startsWith("devskits://")) {
        window.DevSkitsWindowManager.openApp("browser", { route: arg });
        return `Opened ${arg}`;
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

    function achievementList() {
      const rows = W().getAchievements();
      return Object.keys(W().achievementDefs).map((id) => `${rows[id] ? "[x]" : "[ ]"} ${W().achievementDefs[id]}`).join("\n");
    }

    function searchIndex(query) {
      if (!query) return "Usage: search <query>";
      const pages = Object.keys(W().pages).filter((p) => p.includes(query));
      const apps = Object.keys(window.DevSkitsState.APPS).filter((id) => id.includes(query.toLowerCase()));
      const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").filter((n) => `${n.name} ${n.content}`.toLowerCase().includes(query.toLowerCase())).map((n) => n.name);
      return [
        `Apps: ${apps.join(", ") || "none"}`,
        `Pages: ${pages.join(", ") || "none"}`,
        `Notes: ${notes.join(", ") || "none"}`
      ].join("\n");
    }

    function unlockRoute(route = "") {
      if (!route) return "Usage: unlock <package-id>";
      if (!W().packageDefs[route]) return "Unknown unlock id.";
      W().installPackage(route);
      return `Unlocked package ${route}`;
    }

    function secretCommand() {
      W().award("terminal_diver");
      return "Hidden relay discovered: install hidden_routes then open devskits://secrets";
    }

    function terminalGame(arg = "") {
      if (arg === "start" || !gameState) {
        gameState = { step: 0 };
        return "SCAVENGER> find token in route. Type: game home|labs|archive";
      }
      if (!gameState) return "Type game start";
      const answers = ["home", "labs", "archive"];
      if (arg === answers[gameState.step]) {
        gameState.step += 1;
        if (gameState.step >= answers.length) {
          gameState = null;
          W().award("first_secret");
          return "Mission complete. Reward: route clue devskits://secrets";
        }
        return `Good. Next node: ${answers[gameState.step]}`;
      }
      return "Wrong node. Try sequence home -> labs -> archive";
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
      if (["contact", "donate", "links", "projects", "loki", "settings"].includes(cmd)) window.DevSkitsWindowManager.openApp(cmd);
      return result;
    }

    return { execute, getPrompt: () => `${cwd}>` };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
