(() => {
  const STORE_KEYS = {
    memory: "devskits-calc-memory-v2",
    history: "devskits-calc-history-v2"
  };

  const MAX_HISTORY = 12;
  const MAX_DIGITS = 14;

  function parseNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "ERR";
    if (Object.is(value, -0)) value = 0;

    const abs = Math.abs(value);
    if ((abs >= 1e12 || (abs > 0 && abs < 1e-9))) {
      return value.toExponential(8).replace(/\.?0+e/, "e");
    }

    const fixed = Number(value.toFixed(10)).toString();
    if (fixed.length <= MAX_DIGITS + 2) return fixed;
    return value.toPrecision(MAX_DIGITS).replace(/\.?0+$/, "");
  }

  function calculate(a, b, op) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    if (op === "×") return a * b;
    if (op === "÷") {
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    }
    return b;
  }

  function createButton(label, kind = "") {
    return `<button type="button" class="calc-key ${kind}" data-key="${label}" aria-label="${label}">${label}</button>`;
  }

  function render(container) {
    const savedHistory = JSON.parse(localStorage.getItem(STORE_KEYS.history) || "[]");

    let displayValue = "0";
    let expressionText = "";
    let accumulator = null;
    let pendingOperator = null;
    let lastOperand = null;
    let lastOperator = null;
    let justEvaluated = false;
    let memory = parseNumber(localStorage.getItem(STORE_KEYS.memory) || "0");
    let history = Array.isArray(savedHistory) ? savedHistory.slice(0, MAX_HISTORY) : [];

    container.innerHTML = `
      <section class="ds-calc" aria-label="Calculator">
        <header class="ds-calc-head">
          <strong>Calculator</strong>
          <button type="button" class="link-btn calc-copy" data-key="COPY">Copy</button>
        </header>

        <div class="ds-calc-display-wrap" role="status" aria-live="polite">
          <div class="ds-calc-topline">
            <span class="ds-calc-memory">M: <strong id="calc-memory">0</strong></span>
            <span class="ds-calc-expression" id="calc-expression">&nbsp;</span>
          </div>
          <output id="calc-display" class="ds-calc-display">0</output>
        </div>

        <div class="ds-calc-main">
          <div id="calc-keys" class="ds-calc-keys"></div>
          <aside class="ds-calc-history" aria-label="Recent calculations">
            <h4>History</h4>
            <div id="calc-history-list"></div>
          </aside>
        </div>
      </section>
    `;

    const memoryEl = container.querySelector("#calc-memory");
    const expressionEl = container.querySelector("#calc-expression");
    const displayEl = container.querySelector("#calc-display");
    const keysWrap = container.querySelector("#calc-keys");
    const historyWrap = container.querySelector("#calc-history-list");

    const keyRows = [
      ["MC", "MR", "M+", "M-", "⌫"],
      ["C", "+/-", "%", "÷"],
      ["7", "8", "9", "×"],
      ["4", "5", "6", "-"],
      ["1", "2", "3", "+"],
      ["0", ".", "="]
    ];

    function persist() {
      localStorage.setItem(STORE_KEYS.memory, String(memory));
      localStorage.setItem(STORE_KEYS.history, JSON.stringify(history.slice(0, MAX_HISTORY)));
    }

    function refresh() {
      displayEl.textContent = displayValue;
      expressionEl.textContent = expressionText || "\u00A0";
      memoryEl.textContent = formatNumber(memory);
    }

    function drawKeys() {
      keysWrap.innerHTML = keyRows.map((row) => {
        const template = row.length === 3 ? "2fr 1fr 1fr" : `repeat(${row.length}, minmax(0, 1fr))`;
        return `<div class="calc-row" style="grid-template-columns:${template}">${row.map((label) => {
          const isOperator = ["+", "-", "×", "÷", "="].includes(label);
          const isUtility = ["C", "⌫", "%", "+/-", "MC", "MR", "M+", "M-"].includes(label);
          const className = isOperator ? "op" : (isUtility ? "util" : "");
          return createButton(label, className);
        }).join("")}</div>`;
      }).join("");
    }

    function drawHistory() {
      if (!history.length) {
        historyWrap.innerHTML = '<em class="calc-empty">No calculations yet.</em>';
        return;
      }
      historyWrap.innerHTML = history.map((item, idx) => (
        `<button type="button" class="calc-h-row" data-history="${idx}"><span>${item.expr}</span><strong>${item.result}</strong></button>`
      )).join("");
    }

    function setError(message) {
      expressionText = message;
      displayValue = "ERR";
      accumulator = null;
      pendingOperator = null;
      lastOperand = null;
      lastOperator = null;
      justEvaluated = true;
      refresh();
    }

    function clearAll() {
      displayValue = "0";
      expressionText = "";
      accumulator = null;
      pendingOperator = null;
      lastOperand = null;
      lastOperator = null;
      justEvaluated = false;
      refresh();
    }

    function inputDigit(digit) {
      if (displayValue === "ERR") clearAll();
      if (justEvaluated && pendingOperator) {
        displayValue = "0";
      } else if (justEvaluated && !pendingOperator) {
        displayValue = "0";
        expressionText = "";
      }
      justEvaluated = false;
      if (displayValue === "0") displayValue = digit;
      else if (displayValue.replace("-", "").length < MAX_DIGITS) displayValue += digit;
      refresh();
    }

    function inputDecimal() {
      if (displayValue === "ERR") clearAll();
      if (justEvaluated && pendingOperator) {
        displayValue = "0";
      } else if (justEvaluated && !pendingOperator) {
        displayValue = "0";
        expressionText = "";
      }
      justEvaluated = false;
      if (!displayValue.includes(".")) displayValue += ".";
      refresh();
    }

    function applyOperator(nextOperator) {
      if (displayValue === "ERR") return;
      const current = parseNumber(displayValue);

      if (pendingOperator && !justEvaluated) {
        try {
          accumulator = calculate(accumulator ?? 0, current, pendingOperator);
        } catch (err) {
          setError(err.message);
          return;
        }
      } else {
        accumulator = pendingOperator ? accumulator : current;
      }

      pendingOperator = nextOperator;
      justEvaluated = true;
      displayValue = formatNumber(accumulator);
      expressionText = `${displayValue} ${nextOperator}`;
      refresh();
    }

    function doPercent() {
      if (displayValue === "ERR") return;
      const current = parseNumber(displayValue);
      const base = accumulator ?? 0;
      const percentValue = pendingOperator ? (base * current) / 100 : current / 100;
      displayValue = formatNumber(percentValue);
      justEvaluated = false;
      refresh();
    }

    function toggleSign() {
      if (displayValue === "ERR") return;
      if (displayValue === "0") return;
      displayValue = displayValue.startsWith("-") ? displayValue.slice(1) : `-${displayValue}`;
      refresh();
    }

    function backspace() {
      if (displayValue === "ERR") return clearAll();
      if (justEvaluated) return;
      displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
      if (displayValue === "-" || displayValue === "") displayValue = "0";
      refresh();
    }

    function equals() {
      if (displayValue === "ERR") return;
      const current = parseNumber(displayValue);

      if (!pendingOperator) {
        if (lastOperator && lastOperand != null) {
          try {
            const result = calculate(current, lastOperand, lastOperator);
            expressionText = `${formatNumber(current)} ${lastOperator} ${formatNumber(lastOperand)} =`;
            displayValue = formatNumber(result);
          } catch (err) {
            setError(err.message);
            return;
          }
        }
        justEvaluated = true;
        refresh();
        return;
      }

      const left = accumulator ?? current;
      const right = justEvaluated ? (lastOperand ?? left) : current;

      try {
        const result = calculate(left, right, pendingOperator);
        expressionText = `${formatNumber(left)} ${pendingOperator} ${formatNumber(right)} =`;
        displayValue = formatNumber(result);
        history.unshift({ expr: expressionText, result: displayValue });
        history = history.slice(0, MAX_HISTORY);
        lastOperand = right;
        lastOperator = pendingOperator;
        accumulator = parseNumber(displayValue);
        pendingOperator = null;
        justEvaluated = true;
        persist();
        drawHistory();
        refresh();
      } catch (err) {
        setError(err.message);
      }
    }

    function memoryAction(action) {
      const current = parseNumber(displayValue);
      if (action === "MC") memory = 0;
      if (action === "MR") {
        displayValue = formatNumber(memory);
        justEvaluated = false;
      }
      if (action === "M+") memory += current;
      if (action === "M-") memory -= current;
      persist();
      refresh();
    }

    function copyResult() {
      if (!navigator.clipboard || displayValue === "ERR") return;
      navigator.clipboard.writeText(displayValue).catch(() => {});
    }

    function press(key) {
      if (/^[0-9]$/.test(key)) return inputDigit(key);
      if (key === ".") return inputDecimal();
      if (["+", "-", "×", "÷"].includes(key)) return applyOperator(key);
      if (key === "=") return equals();
      if (key === "C") return clearAll();
      if (key === "⌫") return backspace();
      if (key === "%") return doPercent();
      if (key === "+/-") return toggleSign();
      if (["MC", "MR", "M+", "M-"].includes(key)) return memoryAction(key);
      if (key === "COPY") return copyResult();
    }

    keysWrap.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-key]");
      if (!button) return;
      press(button.dataset.key);
    });

    historyWrap.addEventListener("click", (event) => {
      const row = event.target.closest("button[data-history]");
      if (!row) return;
      const entry = history[Number(row.dataset.history)];
      if (!entry) return;
      displayValue = entry.result;
      expressionText = entry.expr;
      justEvaluated = true;
      refresh();
    });

    container.addEventListener("keydown", (event) => {
      const keyMap = {
        Enter: "=",
        "=": "=",
        Escape: "C",
        Delete: "C",
        Backspace: "⌫",
        "/": "÷",
        "*": "×"
      };
      const mapped = keyMap[event.key] || event.key;
      if (/^[0-9]$/.test(mapped) || [".", "+", "-", "×", "÷", "=", "C", "⌫", "%"].includes(mapped)) {
        event.preventDefault();
        press(mapped);
      }
    });

    container.querySelector(".calc-copy").addEventListener("click", () => press("COPY"));

    drawKeys();
    drawHistory();
    refresh();
    container.tabIndex = 0;
    persist();
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.calculator = render;
})();
