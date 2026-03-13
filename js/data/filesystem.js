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
                "roadmap.txt": { type: "file", content: "DevSkits OS Roadmap\n- Shell polish\n- Deep app ecosystem\n- Better file integration" },
                "devskits-os.project": { type: "project", ref: "DevSkits 3.1" }
              }
            },
            CONTACT: {
              type: "dir",
              children: {
                "contact.card": { type: "app", app: "contact", content: "Open Contact app profile." }
              }
            },
            LOKI: {
              type: "dir",
              children: {
                "profile.txt": { type: "file", content: "Loki // German Shepherd\nStatus: Loyal\nRole: Companion + Mascot" }
              }
            },
            NOTES: {
              type: "dir",
              children: {
                "welcome.txt": { type: "file", content: "Use Notes app to create and organize multiple notes." }
              }
            },
            ARCHIVE: {
              type: "dir",
              children: {
                "build-0001.log": { type: "file", content: "Early build note: shell was monochrome by design." },
                "loki-companion.log": { type: "file", content: "Loki patrol report: found hidden route breadcrumb near NETWORK node." }
              }
            },
            SECRET: {
              type: "dir",
              children: {
                ".blackbox.txt": { type: "file", content: "If you can read this, open devskits://secrets and run terminal command secret." }
              }
            },
            "readme.txt": { type: "file", content: "Welcome to DevSkits virtual filesystem." }
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
