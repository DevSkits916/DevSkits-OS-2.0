(() => {
  const STORE_KEYS = {
    memory: "devskits-calc-memory-v1",
    history: "devskits-calc-history-v1",
    mode: "devskits-calc-mode-v1"
  };

  const PRECEDENCE = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };

  function tokenize(expr) {
    const clean = expr.replace(/\s+/g, "");
    if (!clean) return [];
    const out = [];
    let i = 0;
    while (i < clean.length) {
      const c = clean[i];
      if (/[0-9.]/.test(c)) {
        let num = c;
        i += 1;
        while (i < clean.length && /[0-9.]/.test(clean[i])) num += clean[i++];
        if ((num.match(/\./g) || []).length > 1) throw new Error("Malformed number");
        out.push({ type: "num", value: Number(num) });
        continue;
      }
      if (/[()+\-*/%^]/.test(c)) {
        out.push({ type: "op", value: c });
        i += 1;
        continue;
      }
      throw new Error(`Invalid token: ${c}`);
    }
    return out;
  }

  function toRpn(tokens) {
    const output = [];
    const stack = [];
    let prev = null;
    tokens.forEach((token) => {
      if (token.type === "num") {
        output.push(token);
      } else if (token.value === "(") {
        stack.push(token);
      } else if (token.value === ")") {
        while (stack.length && stack[stack.length - 1].value !== "(") output.push(stack.pop());
        if (!stack.length) throw new Error("Mismatched parentheses");
        stack.pop();
      } else {
        if (token.value === "-" && (!prev || (prev.type === "op" && prev.value !== ")"))) {
          output.push({ type: "num", value: 0 });
        }
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.value === "(") break;
          const rightAssoc = token.value === "^";
          if ((rightAssoc && PRECEDENCE[token.value] < PRECEDENCE[top.value]) || (!rightAssoc && PRECEDENCE[token.value] <= PRECEDENCE[top.value])) {
            output.push(stack.pop());
          } else {
            break;
          }
        }
        stack.push(token);
      }
      prev = token;
    });
    while (stack.length) {
      const op = stack.pop();
      if (op.value === "(" || op.value === ")") throw new Error("Mismatched parentheses");
      output.push(op);
    }
    return output;
  }

  function evalRpn(rpn) {
    const stack = [];
    rpn.forEach((t) => {
      if (t.type === "num") return stack.push(t.value);
      const b = stack.pop();
      const a = stack.pop();
      if (a == null || b == null) throw new Error("Malformed expression");
      if (t.value === "+") stack.push(a + b);
      if (t.value === "-") stack.push(a - b);
      if (t.value === "*") stack.push(a * b);
      if (t.value === "/") {
        if (b === 0) throw new Error("Divide by zero");
        stack.push(a / b);
      }
      if (t.value === "%") stack.push(a % b);
      if (t.value === "^") stack.push(a ** b);
    });
    if (stack.length !== 1 || !Number.isFinite(stack[0])) throw new Error("Invalid result");
    return stack[0];
  }

  function safeEval(expr) {
    const result = evalRpn(toRpn(tokenize(expr)));
    return Math.abs(result) > 1e12 ? result.toExponential(8) : Number(result.toFixed(10)).toString();
  }

  function render(container) {
    const persistedMode = localStorage.getItem(STORE_KEYS.mode) || "standard";
    let mode = persistedMode;
    let expression = "0";
    let memory = Number(localStorage.getItem(STORE_KEYS.memory) || "0");
    let history = JSON.parse(localStorage.getItem(STORE_KEYS.history) || "[]");

    container.innerHTML = `
      <div class="ds-calc">
        <header class="ds-calc-head"><strong>Calculator</strong><div class="ds-calc-modes">
          <button data-mode="standard" class="link-btn">STD</button>
          <button data-mode="scientific" class="link-btn">SCI</button>
          <button data-mode="programmer" class="link-btn">PRG</button>
        </div></header>
        <div class="ds-calc-display-wrap">
          <div class="ds-calc-memory">M: <span id="calc-memory">0</span></div>
          <input id="calc-display" class="ds-calc-display" value="0" aria-label="Calculator display" readonly />
          <div id="calc-status" class="ds-calc-status">Ready</div>
        </div>
        <div class="ds-calc-layout">
          <section class="ds-calc-panel">
            <div id="calc-keys" class="ds-calc-keys"></div>
          </section>
          <aside class="ds-calc-history">
            <h4>History</h4>
            <div id="calc-history-list"></div>
          </aside>
        </div>
      </div>`;

    const display = container.querySelector("#calc-display");
    const status = container.querySelector("#calc-status");
    const memoryEl = container.querySelector("#calc-memory");
    const keysWrap = container.querySelector("#calc-keys");
    const historyList = container.querySelector("#calc-history-list");

    const baseKeys = [
      "MC", "MR", "M+", "M-", "MS",
      "CE", "C", "⌫", "%", "/",
      "7", "8", "9", "*", "sqrt",
      "4", "5", "6", "-", "1/x",
      "1", "2", "3", "+", "+/-",
      "0", ".", "(", ")", "="
    ];

    const sciKeys = ["pi", "sin", "cos", "tan", "^"];
    const prgKeys = ["AND", "OR", "XOR", "BIN", "HEX"];

    function saveState() {
      localStorage.setItem(STORE_KEYS.memory, String(memory));
      localStorage.setItem(STORE_KEYS.history, JSON.stringify(history.slice(0, 25)));
      localStorage.setItem(STORE_KEYS.mode, mode);
    }

    function drawKeys() {
      const extra = mode === "scientific" ? sciKeys : (mode === "programmer" ? prgKeys : []);
      const keys = [...extra, ...baseKeys];
      keysWrap.innerHTML = keys.map((k) => `<button class="calc-key ${/[=+\-*/^]/.test(k) ? "op" : ""}" data-k="${k}">${k}</button>`).join("");
      container.querySelectorAll("[data-mode]").forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === mode));
    }

    function drawHistory() {
      historyList.innerHTML = history.map((row, idx) => `<button class="calc-h-row" data-h="${idx}"><span>${row.expr}</span><strong>${row.result}</strong></button>`).join("") || "<em>No calculations yet.</em>";
    }

    function updateView() {
      display.value = expression;
      memoryEl.textContent = String(Number(memory.toFixed(8)));
    }

    function setError(message) {
      status.textContent = message;
      display.value = "ERR";
      expression = "0";
    }

    function appendValue(v) {
      if (expression === "0" && /[0-9.]/.test(v)) expression = "";
      expression += v;
      status.textContent = "Ready";
      updateView();
    }

    function commitResult() {
      try {
        const result = safeEval(expression);
        history.unshift({ expr: expression, result });
        expression = result;
        status.textContent = "OK";
        drawHistory();
        saveState();
      } catch (err) {
        setError(err.message);
      }
      updateView();
    }

    function applyFunction(fn) {
      try {
        const current = Number(safeEval(expression));
        let next = current;
        if (fn === "sqrt") {
          if (current < 0) throw new Error("Invalid input");
          next = Math.sqrt(current);
        }
        if (fn === "1/x") {
          if (current === 0) throw new Error("Divide by zero");
          next = 1 / current;
        }
        if (["sin", "cos", "tan"].includes(fn)) {
          const rad = current * (Math.PI / 180);
          if (fn === "sin") next = Math.sin(rad);
          if (fn === "cos") next = Math.cos(rad);
          if (fn === "tan") next = Math.tan(rad);
        }
        expression = String(Number(next.toFixed(10)));
        status.textContent = `${fn} applied`;
      } catch (err) {
        setError(err.message);
      }
      updateView();
    }

    function handleKey(key) {
      if (!key) return;
      if (/^[0-9]$/.test(key) || ["+", "-", "*", "/", "(", ")", "^"].includes(key)) return appendValue(key);
      if (key === ".") {
        const last = expression.split(/[+\-*/%^()]/).pop();
        if (!last.includes(".")) appendValue(".");
        return;
      }
      if (key === "C") { expression = "0"; status.textContent = "Cleared"; }
      if (key === "CE") { expression = expression.replace(/[0-9.]+$/, "") || "0"; status.textContent = "Entry cleared"; }
      if (key === "⌫") { expression = expression.slice(0, -1) || "0"; }
      if (key === "%") appendValue("%");
      if (key === "+/-") {
        if (expression.startsWith("-")) expression = expression.slice(1);
        else expression = `-${expression}`;
      }
      if (key === "=") commitResult();
      if (key === "pi") appendValue(String(Math.PI.toFixed(8)));
      if (["sqrt", "1/x", "sin", "cos", "tan"].includes(key)) applyFunction(key);

      if (key === "MC") { memory = 0; status.textContent = "Memory cleared"; saveState(); }
      if (key === "MR") { expression = String(memory); status.textContent = "Memory recalled"; }
      if (key === "MS") {
        try { memory = Number(safeEval(expression)); status.textContent = "Memory stored"; saveState(); } catch { setError("Invalid input"); }
      }
      if (key === "M+") {
        try { memory += Number(safeEval(expression)); status.textContent = "Memory add"; saveState(); } catch { setError("Invalid input"); }
      }
      if (key === "M-") {
        try { memory -= Number(safeEval(expression)); status.textContent = "Memory subtract"; saveState(); } catch { setError("Invalid input"); }
      }

      if (mode === "programmer" && ["AND", "OR", "XOR", "BIN", "HEX"].includes(key)) {
        try {
          const value = Number(safeEval(expression));
          if (key === "BIN") expression = `0b${value.toString(2)}`;
          if (key === "HEX") expression = `0x${value.toString(16).toUpperCase()}`;
          if (["AND", "OR", "XOR"].includes(key)) status.textContent = `${key} requires manual operands`;
        } catch (err) {
          setError(err.message);
        }
      }
      updateView();
    }

    keysWrap.addEventListener("click", (e) => handleKey(e.target.closest("button")?.dataset.k));
    container.querySelector(".ds-calc-modes").addEventListener("click", (e) => {
      const nextMode = e.target.dataset.mode;
      if (!nextMode) return;
      mode = nextMode;
      status.textContent = `Mode: ${mode}`;
      drawKeys();
      saveState();
    });
    historyList.addEventListener("click", (e) => {
      const idx = Number(e.target.closest("button")?.dataset.h);
      if (Number.isNaN(idx) || !history[idx]) return;
      expression = history[idx].result;
      status.textContent = "History loaded";
      updateView();
    });

    container.addEventListener("keydown", (e) => {
      const map = { Enter: "=", Backspace: "⌫", Escape: "C", "%": "%" };
      const key = map[e.key] || e.key;
      if (/^[0-9.+\-*/()^]$/.test(key) || ["=", "⌫", "C", "%"].includes(key)) {
        e.preventDefault();
        handleKey(key);
      }
    });

    drawKeys();
    drawHistory();
    updateView();
    container.tabIndex = 0;
    saveState();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.calculator = render;
})();
