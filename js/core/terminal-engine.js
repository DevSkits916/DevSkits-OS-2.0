(() => {
  const { state, APPS, RUN_ALIASES } = window.DevSkitsState;
  const VFS = window.DevSkitsVFS;
  const W = () => window.DevSkitsWorld;

  const STORAGE_KEYS = {
    uptime: "devskits-shell-boot-v1"
  };

  const COMMAND_META = {
    help: { category: "system", description: "Show commands and examples", usage: "help [command]" },
    clear: { category: "system", description: "Clear terminal output", usage: "clear" },
    cls: { category: "system", description: "Alias for clear", usage: "cls" },
    ver: { category: "system", description: "Show shell version", usage: "ver" },
    status: { category: "system", description: "Show runtime status", usage: "status" },
    uptime: { category: "system", description: "Show current session uptime", usage: "uptime" },
    hostname: { category: "system", description: "Show host name", usage: "hostname" },
    settings: { category: "system", description: "Open Settings app", usage: "settings" },
    reboot: { category: "system", description: "Queue desktop reboot", usage: "reboot" },
    restart: { category: "system", description: "Alias for reboot", usage: "restart" },

    date: { category: "identity", description: "Show date", usage: "date" },
    time: { category: "identity", description: "Show time", usage: "time" },
    whoami: { category: "identity", description: "Show active profile", usage: "whoami" },
    about: { category: "identity", description: "About DevSkits OS 95", usage: "about" },
    contact: { category: "identity", description: "Open Contact app", usage: "contact" },
    donate: { category: "identity", description: "Open Donate app", usage: "donate" },
    github: { category: "identity", description: "Show GitHub destination", usage: "github" },
    loki: { category: "identity", description: "Open Loki app", usage: "loki" },

    apps: { category: "apps", description: "List launchable apps", usage: "apps" },
    open: { category: "apps", description: "Open app/file/route/url", usage: "open <target>" },
    run: { category: "apps", description: "Run app by id or alias", usage: "run <app>" },
    browser: { category: "apps", description: "Open route or url in Navigator", usage: "browser <route|url>" },
    links: { category: "apps", description: "Open Links app", usage: "links" },
    projects: { category: "apps", description: "Open Projects app", usage: "projects" },

    pwd: { category: "filesystem", description: "Print current directory", usage: "pwd" },
    ls: { category: "filesystem", description: "List directory contents", usage: "ls [path]" },
    dir: { category: "filesystem", description: "Alias for ls", usage: "dir [path]" },
    cd: { category: "filesystem", description: "Change directory", usage: "cd <path>" },
    cat: { category: "filesystem", description: "Print file contents", usage: "cat <file>" },

    echo: { category: "shell", description: "Echo text", usage: "echo <text>" },
    history: { category: "shell", description: "Show or clear history", usage: "history [clear]" },
    recent: { category: "shell", description: "Show recent activity", usage: "recent" },
    search: { category: "shell", description: "Search indexed items", usage: "search <query>" },
    find: { category: "shell", description: "Alias for search", usage: "find <query>" },
    alias: { category: "shell", description: "View/set command aliases", usage: "alias [name=value]" },
    notify: { category: "shell", description: "Send notification", usage: "notify <message>" },
    theme: { category: "shell", description: "Cycle desktop theme", usage: "theme" },
    exit: { category: "shell", description: "Shell exit hint", usage: "exit" },
    "?": { category: "shell", description: "Alias for help", usage: "?" }
  };

  const APP_ALIASES = {
    ...RUN_ALIASES,
    mail: "inbox"
  };

  const TERMINAL_BLOCKED_APPS = new Set(["inbox", "run"]);

  const CMD_ALIASES = {
    cls: "clear",
    dir: "ls",
    "?": "help",
    find: "search"
  };

  function ensureBootStamp() {
    if (!localStorage.getItem(STORAGE_KEYS.uptime)) {
      localStorage.setItem(STORAGE_KEYS.uptime, String(Date.now()));
    }
  }

  function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  }

  function createTerminalEngine(print) {
    let cwd = "This PC";
    let commandAliases = JSON.parse(localStorage.getItem("devskits-shell-aliases-v1") || "{}");
    ensureBootStamp();

    const commands = {
      help: (_, topic) => helpText(topic),
      clear: () => ({ clear: true }),
      cls: () => ({ clear: true }),

      about: () => ({ type: "system", text: "DevSkits OS 95 Shell // retro monochrome command environment." }),
      contact: () => runApp("contact"),
      donate: () => runApp("donate"),
      links: () => runApp("links"),
      projects: () => runApp("projects"),
      loki: () => runApp("loki"),
      github: () => ({ type: "link", href: "https://github.com/DevSkits916", label: "https://github.com/DevSkits916" }),

      whoami: () => "travis.ramsey@devskits.local",
      date: () => new Date().toDateString(),
      time: () => new Date().toLocaleTimeString(),
      ver: () => `DevSkits Shell v${window.DevSkitsSystemData?.about?.version || "3.2.0"}`,
      hostname: () => "devskits-workstation",
      uptime: () => `Session uptime: ${formatDuration(Date.now() - Number(localStorage.getItem(STORAGE_KEYS.uptime) || Date.now()))}`,

      ls: (_, arg) => listDir(arg),
      dir: (_, arg) => listDir(arg),
      cd: (_, arg) => changeDir(arg),
      pwd: () => cwd,
      cat: (_, arg) => catFile(arg),

      open: (_, ...arg) => openTarget(arg.join(" ")),
      run: (_, ...arg) => runApp(arg.join(" ")),
      browser: (_, ...arg) => browserRoute(arg.join(" ")),
      settings: () => runApp("settings"),
      apps: () => listApps(),

      history: (_, arg) => historyCommand(arg),
      recent: () => recentActivity(),
      notify: (_, ...msg) => (W().pushNotification(msg.join(" ") || "Terminal ping", "info"), { type: "success", text: "Notification sent." }),
      search: (_, ...args) => searchIndex(args.join(" ")),
      find: (_, ...args) => searchIndex(args.join(" ")),
      alias: (_, arg) => aliasCommand(arg),
      status: () => statusCommand(),
      echo: (_, ...args) => args.join(" "),
      theme: () => ({ type: "success", text: "Theme cycled." }),
      reboot: () => ({ type: "warn", text: "Reboot queued..." }),
      restart: () => ({ type: "warn", text: "Reboot queued..." }),
      "?": () => helpText(),
      exit: () => "This terminal is persistent. Close window to end this session."
    };

    function normalizeAppName(arg = "") {
      const trimmed = (arg || "").trim().toLowerCase();
      const normalized = APP_ALIASES[trimmed] || trimmed;
      return TERMINAL_BLOCKED_APPS.has(normalized) ? "" : normalized;
    }

    function listApps() {
      const rows = Object.values(APPS)
        .filter((app) => !TERMINAL_BLOCKED_APPS.has(app.id) && window.DevSkitsAppRegistry?.[app.id])
        .map((app) => [app.id, app.title, app.category || "misc"])
        .sort((a, b) => a[0].localeCompare(b[0]));
      return { type: "table", headers: ["ID", "Title", "Category"], rows };
    }

    function helpText(topic) {
      if (topic) {
        const t = topic.toLowerCase();
        const meta = COMMAND_META[t] || COMMAND_META[CMD_ALIASES[t]];
        if (!meta) return { type: "warn", text: `No help entry for '${topic}'.` };
        return { type: "box", title: `HELP: ${t}`, lines: [`Usage: ${meta.usage}`, `Category: ${meta.category}`, meta.description] };
      }
      const groups = Object.entries(COMMAND_META).reduce((acc, [name, meta]) => {
        acc[meta.category] = acc[meta.category] || [];
        acc[meta.category].push(`${name.padEnd(10, " ")} ${meta.description}`);
        return acc;
      }, {});
      return {
        type: "multi",
        blocks: [
          { type: "box", title: "DevSkits Shell Commands", lines: ["Use help <command> for details.", "Examples: open calculator | browser devskits://projects | cat about.txt"] },
          ...Object.entries(groups).map(([group, items]) => ({ type: "section", title: group.toUpperCase(), lines: items }))
        ]
      };
    }

    function listDir(arg = ".") {
      const path = VFS.resolvePath(arg || cwd);
      const listing = VFS.list(path);
      if (!listing) return { type: "error", text: `Not a directory: ${path}` };
      if (!listing.length) return { type: "system", text: `<empty> ${path}` };
      const rows = listing.map((x) => [x.name, x.type.toUpperCase(), x.type === "folder" ? "DIR" : "ITEM"]);
      return { type: "table", headers: ["Name", "Type", "Info"], rows, footnote: `${listing.length} item(s) in ${path}` };
    }

    function changeDir(arg = "This PC") {
      const next = VFS.resolvePath(arg || "This PC");
      const node = VFS.findNode(VFS.loadTree(), next);
      if (!node || node.type !== "folder") return { type: "error", text: `Directory not found: ${next}` };
      cwd = next;
      return { type: "success", text: `cwd => ${cwd}` };
    }

    function catFile(arg = "") {
      if (!arg) return { type: "warn", text: "Usage: cat <file>" };
      const folder = VFS.findNode(VFS.loadTree(), cwd);
      const node = (folder?.children || []).find((item) => item.type === "text" && item.name.toLowerCase() === arg.toLowerCase());
      if (!node) return { type: "error", text: "File not found." };
      return { type: "file", title: arg, text: node.content || "<empty>" };
    }

    function runApp(arg = "") {
      const target = normalizeAppName(arg);
      if (!target || !window.DevSkitsAppRegistry[target]) return { type: "error", text: `App not found: ${arg || "(blank)"}` };
      window.DevSkitsWindowManager.openApp(target);
      return { type: "success", text: `Opened ${target}` };
    }

    function browserRoute(raw = "") {
      const value = (raw || "").trim();
      if (!value) return runApp("browser");
      if (/^(github|reddit)$/i.test(value)) {
        const map = { github: "https://github.com/DevSkits916", reddit: "https://reddit.com" };
        window.DevSkitsWindowManager.openApp("browser", { route: map[value.toLowerCase()] });
        return { type: "success", text: `Navigator -> ${map[value.toLowerCase()]}` };
      }
      const route = value.startsWith("devskits://") || /^https?:\/\//i.test(value) ? value : `devskits://${value.replace(/^\/+/, "")}`;
      window.DevSkitsWindowManager.openApp("browser", { route });
      return { type: "success", text: `Navigator -> ${route}` };
    }

    function openTarget(arg = "") {
      if (!arg) return { type: "warn", text: "Usage: open <app-or-file-or-route>" };
      const normalizedApp = normalizeAppName(arg);
      if (normalizedApp && window.DevSkitsAppRegistry[normalizedApp]) return runApp(arg);
      if (arg.startsWith("devskits://") || /^https?:\/\//i.test(arg) || /^(github|reddit)$/i.test(arg)) return browserRoute(arg);
      const folder = VFS.findNode(VFS.loadTree(), cwd);
      const node = (folder?.children || []).find((item) => item.name.toLowerCase() === arg.toLowerCase());
      if (!node) return { type: "error", text: "Target not found." };
      if (node.type === "app") return runApp(node.app);
      if (node.type === "folder") return changeDir(`${cwd}/${node.name}`);
      return { type: "file", title: arg, text: node.content || "<empty>" };
    }

    function searchIndex(query) {
      if (!query) return { type: "warn", text: "Usage: search <query>" };
      const hits = W().searchEverything(query);
      const rows = hits.slice(0, 12).map((h) => [h.type, h.label]);
      return rows.length ? { type: "table", headers: ["Type", "Label"], rows } : { type: "warn", text: "No matches." };
    }

    function recentActivity() {
      const rows = W().getRecentActivity().slice(0, 10).map((r) => [new Date(r.at).toLocaleTimeString(), r.type, r.detail]);
      return rows.length ? { type: "table", headers: ["Time", "Type", "Detail"], rows } : { type: "system", text: "No recent activity." };
    }

    function historyCommand(arg = "") {
      if ((arg || "").toLowerCase() === "clear") {
        state.terminalHistory = [];
        localStorage.setItem("devskits-term-history", "[]");
        return { type: "success", text: "Command history cleared." };
      }
      const rows = state.terminalHistory.slice(-30).map((cmd, i) => [String(i + 1), cmd]);
      return rows.length ? { type: "table", headers: ["#", "Command"], rows } : { type: "system", text: "No command history." };
    }

    function statusCommand() {
      const ps = W().getProcessSnapshot();
      return {
        type: "box",
        title: "SYSTEM STATUS",
        lines: [
          `CPU: ${ps.cpu}%`,
          `Memory: ${ps.memory}%`,
          `Services: ${ps.running}/${ps.total}`,
          `Notifications: ${W().getNotifications().length}`
        ]
      };
    }

    function aliasCommand(arg = "") {
      if (!arg) {
        const rows = Object.entries(commandAliases).map(([name, value]) => [name, value]);
        return rows.length ? { type: "table", headers: ["Alias", "Value"], rows } : { type: "system", text: "No aliases configured." };
      }
      const [name, value] = arg.split("=");
      if (!value) return { type: "warn", text: "Usage: alias name=command" };
      commandAliases[name.trim().toLowerCase()] = value.trim();
      localStorage.setItem("devskits-shell-aliases-v1", JSON.stringify(commandAliases));
      return { type: "success", text: `Alias saved: ${name.trim()} -> ${value.trim()}` };
    }

    function unknownCommand(name) {
      const keys = Object.keys(commands);
      const near = keys.filter((cmd) => cmd.startsWith(name[0] || "")).slice(0, 4);
      return {
        type: "error",
        text: `Command not found: ${name}${near.length ? ` | Did you mean: ${near.join(", ")}?` : ""}`
      };
    }

    function execute(raw) {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const [name, ...args] = trimmed.split(/\s+/);
      const inputName = name.toLowerCase();
      const aliased = commandAliases[inputName] ? `${commandAliases[inputName]} ${args.join(" ")}`.trim() : trimmed;
      const [aliasedName, ...aliasedArgs] = aliased.split(/\s+/);
      const normalized = CMD_ALIASES[aliasedName.toLowerCase()] || aliasedName.toLowerCase();
      const handler = commands[normalized];
      if (!handler) return unknownCommand(name);
      const result = handler(aliased, ...aliasedArgs);
      if (normalized === "theme") window.DevSkitsDesktop.cycleTheme();
      if (normalized === "reboot" || normalized === "restart") setTimeout(window.DevSkitsDesktop.rebootSystem, 300);
      W().trackActivity("cmd", trimmed);
      W().registerCommand();
      return result;
    }

    function commandList() {
      return [...new Set(Object.keys(commands).concat(Object.keys(CMD_ALIASES)))].sort();
    }

    function completeToken(text = "") {
      const tokens = text.trim().split(/\s+/);
      const atEnd = /\s$/.test(text);
      const target = atEnd ? "" : tokens[tokens.length - 1] || "";
      if (tokens.length <= 1 && !atEnd) {
        const hit = commandList().find((cmd) => cmd.startsWith(target.toLowerCase()));
        return hit ? [hit] : [];
      }
      const head = (tokens[0] || "").toLowerCase();
      if (["open", "run", "browser"].includes(head)) {
        const pool = Object.keys(APP_ALIASES)
          .filter((alias) => !TERMINAL_BLOCKED_APPS.has(APP_ALIASES[alias]))
          .concat(Object.keys(APPS).filter((id) => !TERMINAL_BLOCKED_APPS.has(id) && window.DevSkitsAppRegistry?.[id]));
        return [...new Set(pool)].filter((value) => value.startsWith(target.toLowerCase())).sort().slice(0, 20);
      }
      return [];
    }

    return {
      execute,
      getPrompt: () => `${cwd}>`,
      getCwd: () => cwd,
      getCommandList: commandList,
      completeToken
    };
  }

  window.DevSkitsTerminal = { createTerminalEngine };
})();
