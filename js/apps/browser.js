(() => {
  const { state, addActivity, setBrowserHistory } = window.DevSkitsState;

  const browserState = {
    history: [],
    index: -1,
    current: "devskits://home"
  };

  function retroPage(title, body) {
    return `<article class="retro-web-page"><h2>${title}</h2>${body}</article>`;
  }

  function buildPageMap() {
    const projects = (window.DevSkitsProjects || []).map((p) => `<li><b>${p.name}</b> <small>[${p.status}]</small><br/>${p.desc}</li>`).join("");
    const notes = JSON.parse(localStorage.getItem("devskits-notes-v2") || "[]").map((n) => `<li>${n.name}</li>`).join("") || "<li>No notes yet.</li>";
    const changelog = state.changelogEntries.map((e) => `<li><b>${e.phase}</b> / Build ${e.build} <small>${e.date}</small><br/>${e.note}</li>`).join("");
    const pkg = state.packages.map((p) => `<li>${p.installed ? "[x]" : "[ ]"} ${p.name}</li>`).join("");
    const labsUnlocked = state.packages.find((p) => p.id === "devskits-labs")?.installed;

    return {
      "devskits://home": retroPage("DevSkits Internal Network", `<p>Welcome to Navigator. This browser renders internal pages over the DevSkits protocol.</p><ul><li><a href="devskits://projects">Projects</a></li><li><a href="devskits://changelog">Changelog</a></li><li><a href="devskits://system-specs">System Specs</a></li><li><a href="devskits://packages">Installed Packages</a></li></ul>`),
      "devskits://projects": retroPage("Projects Index", `<ol>${projects}</ol><p><button data-open-app="projects" class="link-btn">Open Projects App</button></p>`),
      "devskits://contact": retroPage("Contact", `<p>Route support calls to Contact app or Links directory.</p><p><a href="devskits://donate">Support DevSkits</a> · <button data-open-app="contact" class="link-btn">Launch Contact</button></p>`),
      "devskits://donate": retroPage("Donate", `<p>Support keeps the shell alive.</p><p><button data-open-app="donate" class="link-btn">Open Donate App</button></p>`),
      "devskits://loki": retroPage("Loki Companion Dossier", `<p>Status: online. Mood: curious.</p><ul><li>Archive references hidden in Inbox/System folder.</li><li><button data-open-app="loki" class="link-btn">Open Loki App</button></li></ul>`),
      "devskits://about": retroPage("About DevSkits OS", `<p>A monochrome Windows/terminal hybrid shell with modular internal apps.</p>`),
      "devskits://changelog": retroPage("Build Changelog", `<ul>${changelog}</ul><p><button data-open-app="buildlog" class="link-btn">Open Build Log App</button></p>`),
      "devskits://system-specs": retroPage("System Specs", `<ul><li>Kernel: IdentityShell 2.0</li><li>Display: CRT ${state.crt ? "enabled" : "disabled"}</li><li>Theme: ${state.activeTheme}</li><li>Wallpaper: ${state.wallpaper}</li></ul>`),
      "devskits://packages": retroPage("Installed Packages", `<ul>${pkg}</ul>`),
      "devskits://notes-index": retroPage("Notes Index", `<ul>${notes}</ul><p><button data-open-app="notes" class="link-btn">Open Notes</button></p>`),
      "devskits://labs": labsUnlocked
        ? retroPage("DevSkits Labs", `<p>Labs unlocked. Experimental modules queued.</p><ul><li>Prototype: App-to-app jump routing</li><li>Prototype: Lore crawler</li></ul>`)
        : retroPage("DevSkits Labs", `<p>Access denied. Install package <b>DevSkits Labs</b> in Install Center when available.</p>`)
    };
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  function openUrl(rawUrl, options = {}) {
    const url = (rawUrl || "").trim() || "devskits://home";
    if (isExternal(url)) {
      window.open(url, "_blank", "noopener");
      addActivity("external-link", url);
      return { external: true };
    }

    const pages = buildPageMap();
    const html = pages[url] || retroPage("404 - Internal Page Missing", `<p>No route for <b>${url}</b>.</p><p><a href="devskits://home">Return home</a></p>`);
    if (!options.skipHistory) {
      browserState.history = browserState.history.slice(0, browserState.index + 1);
      browserState.history.push(url);
      browserState.index = browserState.history.length - 1;
    }
    browserState.current = url;
    setBrowserHistory([url, ...state.browserHistory.filter((item) => item !== url)].slice(0, 30));
    addActivity("browser-page", url);
    return { url, html };
  }

  function render(container, options = {}) {
    container.innerHTML = `
      <div class="browser-shell">
        <div class="browser-toolbar">
          <button class="link-btn" data-nav="back">◀</button>
          <button class="link-btn" data-nav="forward">▶</button>
          <button class="link-btn" data-nav="reload">↻</button>
          <input class="browser-address" aria-label="Navigator address" value="devskits://home" />
          <button class="link-btn" data-nav="go">Go</button>
        </div>
        <div class="browser-view"></div>
      </div>`;

    const view = container.querySelector(".browser-view");
    const address = container.querySelector(".browser-address");

    function paint(result) {
      if (!result || result.external) return;
      view.innerHTML = result.html;
      address.value = result.url;
    }

    function go(url, opts) {
      const result = openUrl(url, opts);
      paint(result);
    }

    go(options.url || browserState.current || "devskits://home");

    container.addEventListener("click", (e) => {
      const internal = e.target.closest("a[href^='devskits://']");
      const appBtn = e.target.closest("[data-open-app]");
      const nav = e.target.closest("[data-nav]")?.dataset.nav;

      if (internal) {
        e.preventDefault();
        go(internal.getAttribute("href"));
      }
      if (appBtn) {
        window.DevSkitsWindowManager.openApp(appBtn.dataset.openApp);
      }
      if (nav === "go") go(address.value);
      if (nav === "reload") go(browserState.current, { skipHistory: true });
      if (nav === "back" && browserState.index > 0) {
        browserState.index -= 1;
        go(browserState.history[browserState.index], { skipHistory: true });
      }
      if (nav === "forward" && browserState.index < browserState.history.length - 1) {
        browserState.index += 1;
        go(browserState.history[browserState.index], { skipHistory: true });
      }
    });

    address.addEventListener("keydown", (e) => {
      if (e.key === "Enter") go(address.value);
    });
  }

  window.DevSkitsBrowser = { openUrl };
  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.browser = render;
})();
