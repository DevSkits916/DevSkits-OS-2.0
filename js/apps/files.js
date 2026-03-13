(() => {
  const FS = window.DevSkitsFS;

  function render(container) {
    let cwd = "C:\\DEVSKITS";
    container.innerHTML = `<div class="files-shell"><aside class="files-tree"></aside><section><div class="files-path"></div><div class="files-list"></div></section></div>`;
    const tree = container.querySelector(".files-tree");
    const pathEl = container.querySelector(".files-path");
    const list = container.querySelector(".files-list");

    tree.innerHTML = ["C:\\DEVSKITS", "C:\\DEVSKITS\\PROJECTS", "C:\\DEVSKITS\\CONTACT", "C:\\DEVSKITS\\LOKI", "C:\\DEVSKITS\\NOTES", "C:\\DEVSKITS\\ARCHIVE", "C:\\DEVSKITS\\SECRET"].map((p) => `<button class="task-btn" data-path="${p}">${p}</button>`).join("");

    function openItem(item) {
      const full = FS.normalize(item, cwd);
      const node = FS.getNode(full);
      if (!node) return;
      if (node.type === "dir") {
        cwd = full;
        draw();
      } else if (node.type === "app") {
        window.DevSkitsWindowManager.openApp(node.app);
      } else if (node.type === "project") {
        window.DevSkitsWindowManager.openApp("projects", { focusProject: node.ref });
      } else {
        if ((node.content || "").includes("devskits://")) {
          const route = (node.content.match(/devskits:\/\/[\w/-]+/) || [])[0];
          if (route) return window.DevSkitsWindowManager.openApp("browser", { route });
        }
        if (item.toLowerCase().includes("note")) return window.DevSkitsWindowManager.openApp("notes");
        alert(node.content || "Empty file");
      }
    }

    function draw() {
      pathEl.textContent = cwd;
      const rows = FS.list(cwd) || [];
      list.innerHTML = rows.map((r) => `<button class="task-btn" data-name="${r.name}">${r.type === "dir" ? "📁" : "📄"} ${r.name}</button>`).join("") || "<em>Empty folder</em>";
      list.querySelectorAll("button").forEach((b) => b.addEventListener("dblclick", () => openItem(b.dataset.name)));
    }

    tree.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      cwd = b.dataset.path;
      draw();
    }));

    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.files = render;
})();
