(() => {
  const FS_KEY = "devskits-vfs-v1";
  const now = () => new Date().toLocaleString();
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function makeId(prefix = "item") {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
  }

  function seedTree() {
    const ts = now();
    return {
      id: "this-pc",
      name: "This PC",
      type: "folder",
      modified: ts,
      children: [
        { id: "desktop", name: "Desktop", type: "folder", modified: ts, children: [] },
        { id: "documents", name: "Documents", type: "folder", modified: ts, children: [
          { id: "doc-welcome", name: "welcome.txt", type: "text", content: "Welcome to DevSkits OS 95", modified: ts },
          { id: "doc-readme", name: "readme.txt", type: "text", content: "This folder is shared across Files, Terminal, and Notepad.", modified: ts }
        ] },
        { id: "downloads", name: "Downloads", type: "folder", modified: ts, children: [] },
        { id: "notes", name: "Notes", type: "folder", modified: ts, children: [] },
        { id: "recycle", name: "Recycle Bin", type: "folder", modified: ts, systemFolder: true, children: [] }
      ]
    };
  }

  function seed() {
    return { tree: seedTree(), trash: [], customByPath: {} };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FS_KEY) || "null");
      if (parsed?.tree?.type === "folder" && Array.isArray(parsed.tree.children)) return parsed;
    } catch (e) {}
    const initial = seed();
    localStorage.setItem(FS_KEY, JSON.stringify(initial));
    return initial;
  }

  function saveState(state) {
    localStorage.setItem(FS_KEY, JSON.stringify(state));
  }

  function loadTree() {
    return loadState().tree;
  }

  function split(path = "This PC") {
    return String(path).split("/").filter(Boolean);
  }

  function path(parts) {
    return parts.join("/") || "This PC";
  }

  function findNode(tree, fullPath = "This PC") {
    const parts = split(fullPath);
    if (parts[0] !== "This PC") return null;
    let node = tree;
    for (let i = 1; i < parts.length; i += 1) {
      node = (node.children || []).find((child) => child.type === "folder" && child.name === parts[i]);
      if (!node) return null;
    }
    return node;
  }

  function list(fullPath = "This PC") {
    const folder = findNode(loadTree(), fullPath);
    return folder?.type === "folder" ? clone(folder.children || []) : null;
  }

  function uniqueName(folder, desired) {
    const used = new Set((folder.children || []).map((c) => c.name.toLowerCase()));
    if (!used.has(desired.toLowerCase())) return desired;
    const dot = desired.lastIndexOf(".");
    const stem = dot > 0 ? desired.slice(0, dot) : desired;
    const ext = dot > 0 ? desired.slice(dot) : "";
    let n = 2;
    let candidate = `${stem} (${n})${ext}`;
    while (used.has(candidate.toLowerCase())) {
      n += 1;
      candidate = `${stem} (${n})${ext}`;
    }
    return candidate;
  }

  function mutate(mutator) {
    const state = loadState();
    const result = mutator(state.tree, state);
    saveState(state);
    return result;
  }

  function create(fullPath, type = "text", name = "New Text File.txt", content = "") {
    return mutate((tree) => {
      const folder = findNode(tree, fullPath);
      if (!folder) return null;
      const item = { id: makeId(type), name: uniqueName(folder, name), type, modified: now(), ...(type === "folder" ? { children: [] } : { content }) };
      folder.children = folder.children || [];
      folder.children.push(item);
      folder.modified = now();
      return clone(item);
    });
  }

  function rename(fullPath, id, nextName) {
    return mutate((tree) => {
      const folder = findNode(tree, fullPath);
      if (!folder?.children || !nextName?.trim()) return null;
      const target = folder.children.find((item) => item.id === id);
      if (!target) return null;
      target.name = uniqueName(folder, nextName.trim());
      target.modified = now();
      folder.modified = now();
      return clone(target);
    });
  }

  function remove(fullPath, id) {
    return mutate((tree) => {
      const folder = findNode(tree, fullPath);
      if (!folder?.children) return false;
      const idx = folder.children.findIndex((item) => item.id === id);
      if (idx === -1) return false;
      folder.children.splice(idx, 1);
      folder.modified = now();
      return true;
    });
  }

  function readText(fullPath, fileName) {
    const folder = findNode(loadTree(), fullPath);
    const file = (folder?.children || []).find((item) => item.type === "text" && item.name === fileName);
    return file ? file.content || "" : null;
  }

  function writeText(fullPath, fileName, content) {
    return mutate((tree) => {
      const folder = findNode(tree, fullPath);
      if (!folder) return null;
      folder.children = folder.children || [];
      let file = folder.children.find((item) => item.type === "text" && item.name === fileName);
      if (!file) {
        file = { id: makeId("text"), name: uniqueName(folder, fileName), type: "text", content: "", modified: now() };
        folder.children.push(file);
      }
      file.content = content;
      file.modified = now();
      folder.modified = now();
      return clone(file);
    });
  }

  function resolvePath(pathLike = "This PC") {
    const normalized = String(pathLike).replace(/\\/g, "/").replace(/^\/+/, "").trim();
    if (!normalized || normalized === ".") return "This PC";
    if (/^this pc/i.test(normalized)) return normalized.replace(/^this pc/i, "This PC");
    if (/^[a-z]:/i.test(normalized)) {
      const tail = normalized.slice(2).replace(/^\/+/, "");
      return `This PC/${tail || ""}`.replace(/\/$/, "");
    }
    return `This PC/${normalized}`;
  }

  window.DevSkitsVFS = {
    key: FS_KEY,
    now,
    seed,
    loadState,
    saveState,
    loadTree,
    split,
    path,
    findNode,
    list,
    create,
    rename,
    remove,
    readText,
    writeText,
    resolvePath,
    uniqueName
  };
})();
