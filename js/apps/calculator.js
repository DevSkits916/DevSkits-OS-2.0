(() => {
  function render(container) {
    container.innerHTML = `
      <h3>Calculator</h3>
      <div class="badges">
        <input id="calc-display" class="start-search" value="0" aria-label="Calculator display" />
      </div>
      <div class="badges" id="calc-keys"></div>`;

    const display = container.querySelector("#calc-display");
    const keys = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"];
    const wrap = container.querySelector("#calc-keys");
    wrap.innerHTML = keys.map((k) => `<button class="link-btn" data-k="${k}">${k}</button>`).join("");

    wrap.addEventListener("click", (e) => {
      const key = e.target.dataset.k;
      if (!key) return;
      if (key === "C") {
        display.value = "0";
        return;
      }
      if (key === "=") {
        try {
          display.value = String(Function(`"use strict"; return (${display.value || 0})`)());
        } catch {
          display.value = "ERR";
        }
        return;
      }
      if (display.value === "0" || display.value === "ERR") display.value = "";
      display.value += key;
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.calculator = render;
})();
