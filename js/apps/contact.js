(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function toLink(value, type) {
    if (type === "email") return `<a href="mailto:${value}">${value}</a>`;
    if (type === "phone") return `<a href="tel:${value}">${value}</a>`;
    if (type === "url") return `<a href="${value}" target="_blank" rel="noopener">${value}</a>`;
    return value;
  }

  function render(container) {
    const rows = window.DevSkitsSystemData.contacts;
    container.innerHTML = `<h3>Contact Directory</h3><div class="app-grid">${rows.map((r) => `<div class="info-row"><strong>${icon(r.icon, r.label)} ${r.label}</strong><span>${toLink(r.value, r.type)}</span><button class="copy-btn icon-btn" data-copy="${r.value}">${icon("copy", "Copy")}</button></div>`).join("")}<div class="project-card"><strong>vCard</strong><p>Download contact card for Travis Ramsey / DevSkits.</p><button class="link-btn icon-btn" id="vcard-download">${icon("notes", "Download vCard")}</button></div></div>`;

    container.querySelectorAll(".copy-btn").forEach((btn) => btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
      window.DevSkitsDesktop.notify("Copied", "ok");
    }));

    container.querySelector("#vcard-download").addEventListener("click", () => {
      const data = "BEGIN:VCARD\nVERSION:3.0\nFN:Travis Ramsey\nN:Ramsey;Travis;;;\nORG:DevSkits\nEMAIL:DevSkits@icloud.com\nTEL:916-420-3052\nURL:https://github.com/DevSkits916\nEND:VCARD";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([data], { type: "text/vcard" }));
      a.download = "devskits-contact.vcf";
      a.click();
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.contact = render;
})();
