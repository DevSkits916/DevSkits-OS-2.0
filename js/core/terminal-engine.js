(() => {
  const { state } = window.DevSkitsState;
  const FS = window.DevSkitsFS;

  function createTerminalEngine(print) {
    let cwd = "C:\\DEVSKITS";

    const commands = {
      help: () => "Commands: help clear cls about contact donate links projects loki github date whoami reboot theme ls dir cd pwd cat open echo ver hostname settings",
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
      echo: (_, ...args) => args.join(" "),
      ver: () => "DevSkits 3.1 / Build 2026.02",
      hostname: () => "DEVSKITS-STATION",
      settings: () => "Opening Settings app..."
    };

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
      if (!arg) return "Usage: open <app-or-file>";
      const lower = arg.toLowerCase();
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
      if (["contact", "donate", "links", "projects", "loki", "settings"].includes(cmd)) window.DevSkitsWindowManager.openApp(cmd);
      return result;
    }

    return { execute, getPrompt: () => `${cwd}>` };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
