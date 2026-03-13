(() => {
  function renderTerminal(container) {
    container.innerHTML = `
      <div class="terminal">
        <div class="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt"></span>
          <input class="terminal-input" autocomplete="off" aria-label="Terminal command input" />
        </div>
      </div>`;

    const output = container.querySelector(".terminal-output");
    const input = container.querySelector(".terminal-input");
    const prompt = container.querySelector(".terminal-prompt");
    const engine = window.DevSkitsTerminal.createTerminalEngine(print);
    let historyIndex = window.DevSkitsState.state.terminalHistory.length;

    function print(text = "") {
      output.textContent += `${text}\n`;
      output.scrollTop = output.scrollHeight;
    }

    function refreshPrompt() {
      prompt.textContent = engine.getPrompt();
    }

    print("DevSkits terminal online. type 'help'.");
    refreshPrompt();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = input.value.trim();
        print(`${engine.getPrompt()} ${cmd}`);
        const result = engine.execute(cmd);
        if (result?.clear) output.textContent = "";
        else if (result) print(result);
        if (cmd) {
          const hist = window.DevSkitsState.state.terminalHistory;
          hist.push(cmd);
          window.DevSkitsState.state.terminalHistory = hist.slice(-100);
          localStorage.setItem("devskits-term-history", JSON.stringify(window.DevSkitsState.state.terminalHistory));
          historyIndex = window.DevSkitsState.state.terminalHistory.length;
        }
        input.value = "";
        refreshPrompt();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const hist = window.DevSkitsState.state.terminalHistory;
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = hist[historyIndex] || "";
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const hist = window.DevSkitsState.state.terminalHistory;
        historyIndex = Math.min(hist.length, historyIndex + 1);
        input.value = hist[historyIndex] || "";
      }
    });

    setTimeout(() => input.focus(), 40);
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.terminal = renderTerminal;
})();
