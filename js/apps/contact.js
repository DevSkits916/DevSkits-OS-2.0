(() => {
  function toLink(v) {
    if (v.startsWith("http")) return `<a href="${v}" target="_blank" rel="noopener">${v}</a>`;
    if (v.includes("@")) return `<a href="mailto:${v}">${v}</a>`;
    return v;
  }
  function render(container) {
    const rows = [["Name", "Travis Ramsey"], ["Brand", "DevSkits"], ["Email", "DevSkits@icloud.com"], ["Phone", "916-420-3052"], ["GitHub", "https://github.com/DevSkits916"]];
    container.innerHTML = `<div class="app-grid">${rows.map(([k, v]) => `<div class="info-row"><strong>${k}</strong><span>${toLink(v)}</span><button class="copy-btn" data-copy="${v}">Copy</button></div>`).join("")}<button class="link-btn" id="vcard-download">Download vCard</button></div>`;
    container.querySelectorAll(".copy-btn").forEach((btn) => btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
      btn.textContent = "Copied";
      setTimeout(() => (btn.textContent = "Copy"), 700);
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
