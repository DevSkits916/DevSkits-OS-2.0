(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function toLink(value, type) {
    if (type === "email") return `<a href="mailto:${value}">${value}</a>`;
    if (type === "phone") return `<a href="tel:${value}">${value}</a>`;
    if (type === "url") return `<a href="${value}" target="_blank" rel="noopener">${value}</a>`;
    return value;
  }

  function render(container) {
    const rows = [
      ["person", "Name", "Travis Ramsey", "text"],
      ["person", "Brand", "DevSkits", "text"],
      ["email", "Email", "DevSkits@icloud.com", "email"],
      ["phone", "Phone", "916-420-3052", "phone"],
      ["location", "Location", "Sacramento, CA", "text"],
      ["github", "GitHub", "https://github.com/DevSkits916", "url"]
    ];
    container.innerHTML = `<div class="app-grid">${rows.map(([iconName, key, value, type]) => `<div class="info-row"><strong>${icon(iconName, key)}</strong><span>${toLink(value, type)}</span><button class="copy-btn icon-btn" data-copy="${value}">${icon("copy", "Copy")}</button></div>`).join("")}<button class="link-btn icon-btn" id="vcard-download">${icon("notes", "Download vCard")}</button></div>`;

    container.querySelectorAll(".copy-btn").forEach((btn) => btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
      btn.innerHTML = icon("copy", "Copied");
      setTimeout(() => { btn.innerHTML = icon("copy", "Copy"); }, 700);
    }));

    container.querySelector("#vcard-download").addEventListener("click", () => {
      const data = "BEGIN:VCARD\nVERSION:3.0\nFN:Travis Ramsey\nEMAIL:DevSkits@icloud.com\nTEL:916-420-3052\nEND:VCARD";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "text/vcard" }));
      a.download = "devskits-contact.vcf";
      a.click();
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.contact = render;
})();
