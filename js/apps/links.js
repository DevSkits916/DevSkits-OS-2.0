(() => {
  const { copyText, escapeHtml, safeOpen } = window.DevSkitsAppHelpers;
  const icon = (name, label = "") => window.DevSkitsBranding.icon(name, "brand-icon", label);
  const PROFILE_LIMIT = 4;

  function safeRouteOpen(item) {
    if (!item?.url) return;
    if (item.type === 'app' || item.url.startsWith('devskits://')) {
      window.DevSkitsWindowManager.openApp(item.url.replace('devskits://', ''));
      return;
    }
    safeOpen(item.url);
  }

  function linkValue(item) {
    return item.value || item.copyValue || item.url || '';
  }

  function cardTemplate(item) {
    const value = linkValue(item);
    const canCopy = Boolean(item.copyValue || item.value);
    const actionLabel = item.type === 'app' || item.url?.startsWith('devskits://') ? 'Launch' : 'Open';

    return `
      <article class="link-card" data-link-id="${escapeHtml(item.id)}">
        <div class="link-card__main">
          <div class="link-card__icon" aria-hidden="true">${icon(item.icon || 'document')}</div>
          <div class="link-card__body">
            <strong>${escapeHtml(item.label)}</strong>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
            ${value ? `<small>${escapeHtml(value)}</small>` : ''}
          </div>
        </div>
        <div class="link-card__actions">
          <button class="link-btn" data-action="open" data-link-id="${escapeHtml(item.id)}">${actionLabel}</button>
          ${canCopy ? `<button class="copy-btn" data-action="copy" data-link-id="${escapeHtml(item.id)}">Copy</button>` : ''}
        </div>
      </article>`;
  }

  function render(container) {
    const { profile, links } = window.DevSkitsSystemData;
    const grouped = links.reduce((map, item) => {
      const key = item.category || 'Other';
      map[key] = map[key] || [];
      map[key].push(item);
      return map;
    }, {});

    container.innerHTML = `
      <div class="links-app">
        <section class="links-hero">
          <div class="links-hero__identity">
            <div class="links-avatar" aria-hidden="true">${icon('person')}</div>
            <div>
              <h3>${escapeHtml(profile.name)} / ${escapeHtml(profile.brand)}</h3>
              <p>${escapeHtml(profile.title)}</p>
              <small>${escapeHtml(profile.headline)}</small>
            </div>
          </div>
          <div class="links-hero__actions">
            <button class="link-btn" data-action="copy-all-contact">Copy all contact info</button>
            <button class="link-btn" data-action="open-main">Open main profiles</button>
          </div>
        </section>

        <section class="links-toolbar">
          <label class="links-search">
            <span>Find:</span>
            <input type="search" class="start-search" id="links-search" placeholder="Search links, contact info, or support options" aria-label="Search links" />
          </label>
          <div class="links-status" role="status" aria-live="polite">Ready.</div>
        </section>

        <div class="links-sections">
          ${Object.entries(grouped).map(([group, items]) => `
            <section class="links-section" data-section="${escapeHtml(group)}">
              <header>
                <h4>${escapeHtml(group)}</h4>
                <small>${items.length} item${items.length === 1 ? '' : 's'}</small>
              </header>
              <div class="links-list">
                ${items.map(cardTemplate).join('')}
              </div>
            </section>`).join('')}
        </div>
      </div>`;

    const search = container.querySelector('#links-search');
    const status = container.querySelector('.links-status');

    function setStatus(message) {
      status.textContent = message;
    }

    function applyFilter() {
      const query = (search.value || '').trim().toLowerCase();
      let visibleCount = 0;

      container.querySelectorAll('.links-section').forEach((section) => {
        let sectionVisible = 0;
        section.querySelectorAll('.link-card').forEach((card) => {
          const item = links.find((entry) => entry.id === card.dataset.linkId);
          const haystack = [item?.label, item?.description, item?.copyValue, item?.value, item?.searchText, item?.category]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          const visible = !query || haystack.includes(query);
          card.classList.toggle('hidden', !visible);
          if (visible) {
            sectionVisible += 1;
            visibleCount += 1;
          }
        });
        section.classList.toggle('hidden', sectionVisible === 0);
      });

      setStatus(query ? `${visibleCount} result${visibleCount === 1 ? '' : 's'} for “${search.value.trim()}”.` : 'Ready.');
    }

    async function handleAction(action, id) {
      const item = links.find((entry) => entry.id === id);
      if (!item) return;
      if (action === 'open') {
        safeRouteOpen(item);
        setStatus(`${item.label} opened.`);
        return;
      }
      if (action === 'copy') {
        await copyText(linkValue(item), `${item.label} copied to clipboard`);
        setStatus(`${item.label} copied to clipboard.`);
      }
    }

    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.linkId;

      if (id) {
        handleAction(action, id);
        return;
      }

      if (action === 'copy-all-contact') {
        const contactLines = links
          .filter((item) => item.category === 'Contact')
          .map((item) => `${item.label}: ${linkValue(item)}`)
          .join('\n');
        copyText(contactLines, 'All contact info copied');
        setStatus('All contact info copied to clipboard.');
        return;
      }

      if (action === 'open-main') {
        const profiles = links.filter((item) => item.primaryProfile).slice(0, PROFILE_LIMIT);
        profiles.forEach((item, index) => {
          window.setTimeout(() => safeRouteOpen(item), index * 120);
        });
        setStatus(`Opened ${profiles.length} main profile${profiles.length === 1 ? '' : 's'}.`);
      }
    });

    search.addEventListener('input', applyFilter);
    search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        search.value = '';
        applyFilter();
      }
    });
  }

  window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
  window.DevSkitsAppRegistry.links = render;
})();
