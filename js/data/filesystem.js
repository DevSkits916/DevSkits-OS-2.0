(() => {
  const fs = {
    "C:": {
      type: "dir",
      children: {
        DEVSKITS: {
          type: "dir",
          children: {
            PROJECTS: {
              type: "dir",
              children: {
                "projects.txt": { type: "file", content: "Projects:\n- DevSkits OS\n- Landing Pages\n- Terminal Projects\n- Automation / Userscripts\n- Loki Creative" },
                "devskits-os.project": { type: "project", ref: "DevSkits OS" }
              }
            },
            CONTACT: { type: "dir", children: { "contact.txt": { type: "file", content: "Email: DevSkits@icloud.com\nGitHub: https://github.com/DevSkits916" } } },
            LOKI: { type: "dir", children: { "loki.txt": { type: "file", content: "Loki // German Shepherd\nStatus: Loyal\nRole: Companion + Mascot" } } },
            DOCS: {
              type: "dir",
              children: {
                "about.txt": { type: "file", content: "DevSkits OS is a retro browser shell + portfolio." },
                "changelog.txt": { type: "file", content: "3.2.0: Shell polish, new boot, improved core apps." }
              }
            },
            "about.txt": { type: "file", content: "DevSkits OS identity hub." },
            "projects.txt": { type: "file", content: "Open Projects app for full details." },
            "loki.txt": { type: "file", content: "Loki says hi." },
            "contact.txt": { type: "file", content: "Open Contact app for complete profile." },
            "changelog.txt": { type: "file", content: "Boot, start menu, apps and settings were upgraded." }
          }
        }
      }
    }
  };

  function splitPath(path) {
    return path.replace(/\\+/g, "\\").replace(/^\\/, "").split("\\").filter(Boolean);
  }

  function normalize(path, cwd = "C:\\DEVSKITS") {
    if (!path || path === ".") return cwd;
    const absolute = /^[A-Z]:\\/i.test(path);
    const base = absolute ? path : `${cwd}\\${path}`;
    const parts = splitPath(base);
    const stack = [];
    parts.forEach((part, index) => {
      if (index === 0 && /:$/.test(part)) {
        stack.length = 0;
        stack.push(part.toUpperCase());
        return;
      }
      if (part === ".") return;
      if (part === "..") {
        if (stack.length > 1) stack.pop();
        return;
      }
      stack.push(part.toUpperCase());
    });
    return `${stack[0]}\\${stack.slice(1).join("\\")}`.replace(/\\$/, "");
  }

  function getNode(path) {
    const normalized = normalize(path);
    const parts = splitPath(normalized);
    let node = fs[`${parts[0]}\\`];
    for (let i = 1; i < parts.length; i += 1) {
      if (!node || node.type !== "dir") return null;
      node = node.children[parts[i]];
    }
    return node || null;
  }

  function list(path) {
    const node = getNode(path);
    if (!node || node.type !== "dir") return null;
    return Object.entries(node.children).map(([name, value]) => ({ name, type: value.type }));
  }

  window.DevSkitsFS = { fs, normalize, getNode, list };
})();
