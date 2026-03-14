(() => {
  const icon = (name, label) => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function safeOpen(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyText(value, label = "Copied") {
    return navigator.clipboard.writeText(value).then(() => {
      window.DevSkitsDesktop.notify(label, "ok");
    }).catch(() => {
      window.DevSkitsDesktop.notify("Copy failed", "warn");
    });
  }

  function toPlainText(groups) {
    return groups.map((group) => {
      const lines = group.items.filter((item) => item.value).map((item) => `${item.label}: ${item.value}`);
      return `${group.title}\n${lines.join("\n")}`;
    }).join("\n\n");
  }

  function toMarkdown(groups) {
    return groups.map((group) => {
      const lines = group.items.filter((item) => item.value).map((item) => `- **${item.label}:** ${item.value}`);
      return `## ${group.title}\n${lines.join("\n")}`;
    }).join("\n\n");
  }

  function makeVcard(profile, allItems) {
    const email = allItems.find((it) => it.type === "email")?.value || "";
    const phone = allItems.find((it) => it.type === "phone")?.value || "";
    const github = allItems.find((it) => it.id === "github")?.value || "";
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${profile.name}`,
      `N:${profile.lastName || "Ramsey"};${profile.firstName || "Travis"};;;`,
      `ORG:${profile.brand}`,
      `TITLE:${profile.descriptor}`,
      `EMAIL:${email}`,
      `TEL:${phone}`,
      `URL:${github}`,
      "END:VCARD"
    ].join("\n");
  }

  function triggerDownload(name, text, type = "text/plain") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
  }

  function render(container) {
    const baseRows = window.DevSkitsSystemData.contacts || [];
    const byId = Object.fromEntries(baseRows.map((row) => [row.id, row]));

    const profile = {
      name: byId.name?.value || "Travis Ramsey",
      firstName: "Travis",
      lastName: "Ramsey",
      brand: byId.brand?.value || "DevSkits",
      descriptor: "Retro web OS builder, indie creator, and digital identity architect."
    };

    const groups = [
      {
        id: "identity",
        title: "Identity",
        items: ["name", "brand"].map((id) => byId[id]).filter(Boolean)
      },
      {
        id: "direct",
        title: "Direct Contact",
        items: ["email", "phone"].map((id) => byId[id]).filter(Boolean)
      },
      {
        id: "social",
        title: "Social Links",
        items: ["github", "twitter", "reddit"].map((id) => byId[id]).filter(Boolean)
      },
      {
        id: "support",
        title: "Payment / Support",
        items: ["gofundme", "venmo", "chime"].map((id) => byId[id]).filter(Boolean)
      },
      {
        id: "projects",
        title: "Projects / Developer",
        items: [
          { id: "projects-app", label: "Projects App", value: "devskits://projects", type: "app", icon: "projects" },
          { id: "links-app", label: "Links App", value: "devskits://links", type: "app", icon: "links" }
        ]
      }
    ];

    const allItems = groups.flatMap((group) => group.items);

    container.innerHTML = `
      <div class="contact-shell">
        <aside class="contact-profile">
          <div class="contact-avatar" aria-hidden="true">${icon("contact", "Profile")}</div>
          <h3>${profile.name}</h3>
          <p><strong>${profile.brand}</strong></p>
          <p>${profile.descriptor}</p>
          <div class="contact-quick-actions">
            <button class="link-btn" data-action="copy-all">Copy all contact info</button>
            <button class="link-btn" data-action="copy-md">Copy as markdown</button>
            <button class="link-btn" data-action="download-vcf">Download vCard</button>
            <button class="link-btn" data-action="open-important">Open important links</button>
            <button class="link-btn" data-action="open-gofundme">Open GoFundMe</button>
            <button class="link-btn" data-action="open-github">Open GitHub</button>
            <button class="link-btn" data-action="export-json">Export JSON</button>
          </div>
        </aside>
        <section class="contact-groups">
          ${groups.map((group) => `
            <article class="contact-group">
              <header><h4>${group.title}</h4></header>
              <div class="contact-rows">
                ${group.items.length ? group.items.map((item) => `
                  <div class="contact-row" data-id="${item.id}">
                    <div class="contact-main">
                      <strong>${icon(item.icon || "notes", item.label)}</strong>
                      <span>${item.value || "Not provided"}</span>
                    </div>
                    <div class="contact-actions">
                      <button class="copy-btn" data-item-action="copy" data-id="${item.id}">Copy</button>
                      <button class="link-btn" data-item-action="open" data-id="${item.id}" ${item.type === "text" ? "disabled" : ""}>Open</button>
                      <button class="link-btn" data-item-action="launch" data-id="${item.id}" ${(item.type === "email" || item.type === "phone") ? "" : "disabled"}>Launch</button>
                    </div>
                  </div>
                `).join("") : `<div class="contact-empty">No entries in this section.</div>`}
              </div>
            </article>
          `).join("")}
        </section>
      </div>`;

    function handleItemAction(id, action) {
      const item = allItems.find((entry) => entry.id === id);
      if (!item) return;
      if (action === "copy") {
        copyText(item.value || "", `${item.label} copied`);
        return;
      }
      if (action === "open") {
        if (item.type === "url") safeOpen(item.value);
        if (item.type === "app") {
          const appId = item.value.replace("devskits://", "");
          window.DevSkitsWindowManager.openApp(appId);
        }
        if (item.type === "email") safeOpen(`mailto:${item.value}`);
        if (item.type === "phone") safeOpen(`tel:${item.value}`);
        return;
      }
      if (action === "launch") {
        if (item.type === "email") safeOpen(`mailto:${item.value}`);
        if (item.type === "phone") safeOpen(`tel:${item.value}`);
      }
    }

    container.querySelectorAll("[data-item-action]").forEach((button) => {
      button.addEventListener("click", () => handleItemAction(button.dataset.id, button.dataset.itemAction));
    });

    container.querySelector('[data-action="copy-all"]').addEventListener("click", () => {
      copyText(toPlainText(groups), "All contact info copied");
    });

    container.querySelector('[data-action="copy-md"]').addEventListener("click", () => {
      copyText(toMarkdown(groups), "Markdown copied");
    });

    container.querySelector('[data-action="download-vcf"]').addEventListener("click", () => {
      triggerDownload("devskits-contact.vcf", makeVcard(profile, allItems), "text/vcard");
    });

    container.querySelector('[data-action="open-important"]').addEventListener("click", () => {
      [byId.github?.value, byId.twitter?.value, byId.gofundme?.value].filter(Boolean).forEach((url, idx) => {
        setTimeout(() => safeOpen(url), idx * 120);
      });
    });

    container.querySelector('[data-action="open-gofundme"]').addEventListener("click", () => safeOpen(byId.gofundme?.value));
    container.querySelector('[data-action="open-github"]').addEventListener("click", () => safeOpen(byId.github?.value));

    container.querySelector('[data-action="export-json"]').addEventListener("click", () => {
      triggerDownload("devskits-contact.json", JSON.stringify({ profile, groups }, null, 2), "application/json");
      window.DevSkitsDesktop.notify("JSON export downloaded", "ok");
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.contact = render;
})();
