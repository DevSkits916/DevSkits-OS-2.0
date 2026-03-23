(() => {
  const { copyText, escapeHtml, safeOpen } = window.DevSkitsAppHelpers;
  const icon = (name, label = "") => window.DevSkitsBranding.icon(name, "brand-icon", label);

  function methodValue(method) {
    return method.value || method.copyValue || method.url || '';
  }

  function renderMethod(method, featured = false) {
    return `
      <article class="donate-card${featured ? ' featured' : ''}" data-method-id="${escapeHtml(method.id)}">
        <div class="donate-card__header">
          <strong>${icon(method.icon || 'donate', method.label)}</strong>
          ${featured ? '<span class="tag">Featured</span>' : ''}
        </div>
        <p>${escapeHtml(method.description || '')}</p>
        <div class="donate-card__value">${escapeHtml(methodValue(method))}</div>
        <div class="badges donate-actions">
          ${method.url ? `<button class="link-btn" data-action="open" data-method-id="${escapeHtml(method.id)}">${escapeHtml(method.openLabel || 'Open')}</button>` : ''}
          ${method.copyValue || method.value ? `<button class="copy-btn" data-action="copy" data-method-id="${escapeHtml(method.id)}">Copy</button>` : ''}
        </div>
      </article>`;
  }

  function render(container) {
    const { profile, supportMethods } = window.DevSkitsSystemData;
    const featured = supportMethods.find((method) => method.featured) || supportMethods[0];
    const others = supportMethods.filter((method) => method.id !== featured?.id);

    container.innerHTML = `
      <div class="donate-app">
        <section class="donate-hero">
          <div>
            <h3>${icon('donate', 'Support DevSkits')}</h3>
            <p>Help ${escapeHtml(profile.brand)} keep shipping retro builds, polished OS upgrades, and experimental browser projects.</p>
            <small>Every bit of support helps with time, tools, hosting, and the next round of DevSkits ideas.</small>
          </div>
          <div class="donate-hero__status" role="status" aria-live="polite">Choose a support method.</div>
        </section>

        ${featured ? `
          <section class="donate-featured-wrap">
            <header>
              <h4>Main support option</h4>
            </header>
            ${renderMethod(featured, true)}
          </section>` : ''}

        <section class="donate-grid-wrap">
          <header>
            <h4>More ways to help</h4>
          </header>
          <div class="donate-grid">
            ${others.map((method) => renderMethod(method)).join('')}
          </div>
        </section>

        <section class="donate-note-row">
          <article class="project-card donate-note-card">
            <strong>Why support matters</strong>
            <p>DevSkits OS is built to feel like a personal machine, not just a landing page. Support helps keep that world expanding with cleaner apps, better polish, and more experiments.</p>
          </article>
          <article class="project-card donate-note-card">
            <strong>Thank you</strong>
            <p>Whether you donate, share a link, or just spend time exploring the OS, you are helping the project grow. Thanks for being part of it.</p>
          </article>
        </section>
      </div>`;

    const status = container.querySelector('.donate-hero__status');
    const setStatus = (message) => { status.textContent = message; };

    container.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const method = supportMethods.find((entry) => entry.id === button.dataset.methodId);
      if (!method) return;

      if (button.dataset.action === 'open' && method.url) {
        safeOpen(method.url);
        setStatus(`${method.label} opened.`);
        return;
      }

      if (button.dataset.action === 'copy') {
        await copyText(method.copyValue || method.value || '', `${method.label} copied to clipboard`);
        setStatus(`${method.label} copied to clipboard.`);
      }
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.donate = render;
})();
