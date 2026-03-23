(() => {
  const W = () => window.DevSkitsWorld;
  const { registerApp } = window.DevSkitsAppHelpers;

  function render(container) {
    const categories = ["status", "dark", "build", "loki"];
    let quotes = W().getQuotes();

    container.innerHTML = `
      <div class="app-grid">
        <input id="quote-text" placeholder="Write line..." maxlength="140"/>
        <select id="quote-cat">${categories.map((category) => `<option>${category}</option>`).join("")}</select>
        <button class="link-btn" id="quote-save">Save</button>
      </div>
      <div id="quote-count">0/140</div>
      <div class="files-list" id="quote-list"></div>
    `;

    const input = container.querySelector("#quote-text");
    const count = container.querySelector("#quote-count");
    const list = container.querySelector("#quote-list");

    function draw() {
      list.innerHTML = quotes.map((quote, index) => `
        <div class="note-row">
          <strong>[${quote.category}]</strong> ${quote.text}
          <button class="link-btn" data-copy="${index}">Copy</button>
        </div>
      `).join("") || "<em>No quotes yet.</em>";
    }

    input.addEventListener("input", () => {
      count.textContent = `${input.value.length}/140`;
    });

    container.querySelector("#quote-save").addEventListener("click", () => {
      const value = input.value.trim();
      if (!value) return;
      quotes.unshift({ text: value, category: container.querySelector("#quote-cat").value, fav: false });
      quotes = quotes.slice(0, 80);
      W().setQuotes(quotes);
      input.value = "";
      count.textContent = "0/140";
      draw();
    });

    container.addEventListener("click", (event) => {
      const index = event.target.dataset.copy;
      if (index == null) return;
      navigator.clipboard?.writeText(quotes[Number(index)]?.text || "");
    });

    draw();
  }

  registerApp("quoteforge", render, ["quote-forge"]);
})();
