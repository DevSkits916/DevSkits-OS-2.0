(() => {
  const VIEWS = {
    Desktop: [
      { type: "dir", name: "Documents" },
      { type: "dir", name: "Contact Info" },
      { type: "dir", name: "DevSkits Projects" },
      { type: "app", name: "Terminal", app: "terminal" }
    ],
    Documents: [
      { type: "file", name: "welcome.txt", content: "Welcome to DevSkits OS 2.0" },
      { type: "file", name: "roadmap.txt", content: "Improve, preserve, and extend." }
    ],
    "Contact Info": [
      { type: "app", name: "Open Contact Viewer", app: "contact" }
    ],
    "DevSkits Projects": [
      { type: "app", name: "Projects", app: "projects" },
      { type: "app", name: "Links", app: "links" }
    ]
  };

  function render(container, options = {}) {
    let cwd = options.startPath && VIEWS[options.startPath] ? options.startPath : "Desktop";
    const stack = [];

    container.innerHTML = `<div class="files-shell"><aside class="files-tree"></aside><section><div class="files-path"></div><div class="files-list"></div></section></div>`;
    const tree = container.querySelector(".files-tree");
    const pathEl = container.querySelector(".files-path");
    const list = container.querySelector(".files-list");

    const roots = ["Desktop", "Documents", "Contact Info", "DevSkits Projects"];
    tree.innerHTML = roots.map((p) => `<button class="task-btn" data-path="${p}">${p}</button>`).join("");

    function openItem(item) {
      if (item.type === "dir") {
        stack.push(cwd);
        cwd = item.name;
        draw();
      } else if (item.type === "app") {
        window.DevSkitsWindowManager.openApp(item.app);
      } else {
        alert(item.content || "Empty file");
      }
    }

    function draw() {
      pathEl.textContent = `This PC > ${cwd}`;
      const rows = VIEWS[cwd] || [];
      list.innerHTML = `${stack.length ? '<button class="task-btn" data-back="1">⬅ Back</button>' : ""}${rows.map((r) => `<button class="task-btn" data-name="${r.name}">${r.type === "dir" ? "📁" : "📄"} ${r.name}</button>`).join("")}` || "<em>Empty folder</em>";

      list.querySelector('[data-back]')?.addEventListener('click', () => {
        cwd = stack.pop() || "Desktop";
        draw();
      });

      list.querySelectorAll("button[data-name]").forEach((b) => b.addEventListener("dblclick", () => {
        const item = rows.find((r) => r.name === b.dataset.name);
        if (item) openItem(item);
      }));
    }

    tree.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      cwd = b.dataset.path;
      stack.length = 0;
      draw();
    }));

    draw();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.files = render;
})();
