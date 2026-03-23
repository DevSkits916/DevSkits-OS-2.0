(() => {
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    container.innerHTML = `
      <textarea class="notes-editor" id="ascii-input" placeholder="Type text"></textarea>
      <pre class="terminal-output" id="ascii-out"></pre>
      <button class="link-btn" id="ascii-copy">Copy</button>
    `;

    const output = container.querySelector("#ascii-out");

    function convert(value) {
      return value.toUpperCase().split("").map((character) => `${character} `).join("").trim();
    }

    container.querySelector("#ascii-input").addEventListener("input", (event) => {
      output.textContent = convert(event.target.value);
    });

    container.querySelector("#ascii-copy").addEventListener("click", () => {
      navigator.clipboard?.writeText(output.textContent);
    });
  }

  registerApp("asciimaker", render, ["ascii-maker"]);
})();
