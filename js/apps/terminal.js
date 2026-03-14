(() => {
  const STORE_KEY = "devskits-shell-history-v1";

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderTerminal(container) {
    container.innerHTML = `
      <div class="ds-terminal">
        <header class="ds-terminal-header">
          <strong>DevSkits Shell</strong>
          <span class="ds-terminal-meta">Session Path: <code class="ds-terminal-path"></code></span>
        </header>
        <div class="ds-terminal-output" aria-live="polite"></div>
        <div class="ds-terminal-input-row">
          <span class="ds-terminal-prompt"></span>
          <input class="ds-terminal-input" autocomplete="off" spellcheck="false" aria-label="Terminal command input" />
          <span class="ds-terminal-cursor" aria-hidden="true"></span>
        </div>
      </div>`;

    const output = container.querySelector(".ds-terminal-output");
    const input = container.querySelector(".ds-terminal-input");
    const prompt = container.querySelector(".ds-terminal-prompt");
    const pathEl = container.querySelector(".ds-terminal-path");
    const engine = window.DevSkitsTerminal.createTerminalEngine(printBlock);

    let history = JSON.parse(localStorage.getItem(STORE_KEY) || "null") || window.DevSkitsState.state.terminalHistory || [];
    let historyIndex = history.length;
    let draftValue = "";

    function saveHistory() {
      history = history.slice(-200);
      window.DevSkitsState.state.terminalHistory = history.slice();
      localStorage.setItem("devskits-term-history", JSON.stringify(history));
      localStorage.setItem(STORE_KEY, JSON.stringify(history));
    }

    function scrollOutput() {
      output.scrollTop = output.scrollHeight;
    }

    function renderTable(headers = [], rows = []) {
      return `<table class="ds-term-table"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    }

    function printLine(text = "", kind = "output") {
      const row = document.createElement("div");
      row.className = `ds-term-line ${kind}`;
      row.innerHTML = escapeHtml(text);
      output.appendChild(row);
      scrollOutput();
    }

    function printBlock(payload, kind = "output") {
      if (payload == null) return;
      if (typeof payload === "string") {
        payload.split("\n").forEach((line) => printLine(line, kind));
        return;
      }
      if (payload.type === "multi") {
        payload.blocks.forEach((block) => printBlock(block));
        return;
      }
      if (payload.type === "section") {
        const wrap = document.createElement("section");
        wrap.className = "ds-term-section";
        wrap.innerHTML = `<h4>${escapeHtml(payload.title || "Section")}</h4><pre>${escapeHtml((payload.lines || []).join("\n"))}</pre>`;
        output.appendChild(wrap);
        scrollOutput();
        return;
      }
      if (payload.type === "box") {
        const wrap = document.createElement("section");
        wrap.className = "ds-term-box";
        wrap.innerHTML = `<strong>${escapeHtml(payload.title || "System")}</strong><pre>${escapeHtml((payload.lines || []).join("\n"))}</pre>`;
        output.appendChild(wrap);
        scrollOutput();
        return;
      }
      if (payload.type === "table") {
        const wrap = document.createElement("section");
        wrap.className = "ds-term-table-wrap";
        wrap.innerHTML = renderTable(payload.headers || [], payload.rows || []);
        if (payload.footnote) {
          const note = document.createElement("div");
          note.className = "ds-term-footnote";
          note.textContent = payload.footnote;
          wrap.appendChild(note);
        }
        output.appendChild(wrap);
        scrollOutput();
        return;
      }
      if (payload.type === "link") {
        const row = document.createElement("div");
        row.className = "ds-term-line link";
        row.innerHTML = `<a href="${escapeHtml(payload.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(payload.label || payload.href)}</a>`;
        output.appendChild(row);
        scrollOutput();
        return;
      }
      if (payload.type === "file") {
        const wrap = document.createElement("section");
        wrap.className = "ds-term-file";
        wrap.innerHTML = `<h4>${escapeHtml(payload.title || "file")}</h4><pre>${escapeHtml(payload.text || "")}</pre>`;
        output.appendChild(wrap);
        scrollOutput();
        return;
      }
      printLine(payload.text || "", payload.type || "output");
    }

    function refreshPrompt() {
      prompt.textContent = engine.getPrompt();
      pathEl.textContent = engine.getCwd();
    }

    function runCommand(value) {
      const cmd = value.trim();
      if (!cmd) return;
      printLine(`${engine.getPrompt()} ${cmd}`, "input");
      const result = engine.execute(cmd);
      if (result?.clear) {
        output.innerHTML = "";
      } else {
        printBlock(result, result?.type || "output");
      }
      history.push(cmd);
      historyIndex = history.length;
      draftValue = "";
      saveHistory();
      refreshPrompt();
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        runCommand(input.value);
        input.value = "";
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex === history.length) draftValue = input.value;
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex] || "";
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = historyIndex === history.length ? draftValue : (history[historyIndex] || "");
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const hits = engine.completeToken(input.value);
        if (hits.length === 1) {
          const tokens = input.value.trim().split(/\s+/);
          if (tokens.length <= 1) input.value = `${hits[0]} `;
          else input.value = `${tokens.slice(0, -1).join(" ")} ${hits[0]} `;
        } else if (hits.length > 1) {
          printBlock({ type: "table", headers: ["Completions"], rows: hits.map((h) => [h]) });
        }
      }
    });

    container.addEventListener("mousedown", () => setTimeout(() => input.focus(), 20));

    printBlock({ type: "box", title: "DevSkits Shell", lines: ["Retro shell online.", "Type 'help' to list available commands."] });
    refreshPrompt();
    setTimeout(() => input.focus(), 40);
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.terminal = renderTerminal;
})();
