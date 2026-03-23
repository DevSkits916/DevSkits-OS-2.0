(() => {
  const monoStroke = "currentColor";

  const icons = {
    github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M12 .6a12 12 0 0 0-3.79 23.39c.6.12.82-.26.82-.58v-2.24c-3.34.72-4.04-1.41-4.04-1.41-.55-1.37-1.33-1.73-1.33-1.73-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.06 1.83 2.79 1.3 3.47.99.11-.78.42-1.3.76-1.6-2.67-.3-5.48-1.33-5.48-5.94 0-1.31.46-2.38 1.23-3.22-.13-.3-.54-1.54.11-3.2 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.9.12 3.2.76.84 1.23 1.9 1.23 3.22 0 4.62-2.82 5.64-5.5 5.94.44.37.82 1.08.82 2.19v3.24c0 .32.22.71.83.58A12 12 0 0 0 12 .6Z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M13.7 22v-8.3h2.8l.42-3.24h-3.22V8.4c0-.94.27-1.57 1.62-1.57h1.72V3.95c-.84-.09-1.69-.13-2.54-.12-2.52 0-4.24 1.54-4.24 4.38v2.45H8v3.24h2.25V22h3.45Z"/></svg>`,
    reddit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M24 11.7a2.4 2.4 0 0 0-4.1-1.7 11.2 11.2 0 0 0-6.7-2.2l1.1-5 3.5.8a1.9 1.9 0 1 0 .4-1.5l-4-.9c-.4-.1-.7.2-.8.5L12.1 8A11.4 11.4 0 0 0 5 10.2 2.4 2.4 0 1 0 2.8 14v.3c0 4 4.2 7.3 9.3 7.3 5.1 0 9.3-3.3 9.3-7.3V14a2.4 2.4 0 0 0 2.6-2.3Zm-16.2 1.6a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm7.5 4.7c-.9.9-2.3 1.3-4.1 1.3-1.8 0-3.2-.4-4.1-1.3a.5.5 0 0 1 .7-.7c.7.7 1.8 1 3.4 1s2.7-.3 3.4-1a.5.5 0 1 1 .7.7Zm-.1-4.7a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M18.9 2h3.7l-8.1 9.3L24 22h-7.5l-5.8-7-6 7H1l8.6-10L0 2h7.7l5.3 6.4L18.9 2Zm-1.3 17.8h2L6.6 4.1h-2l13 15.7Z"/></svg>`,
    gofundme: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M12 2c4.8 0 8.8 3.4 9.8 8h-2.7a7.1 7.1 0 0 0-13.8 0H2.2A10.1 10.1 0 0 1 12 2Zm0 20a10 10 0 0 1-9.8-8h2.7a7.1 7.1 0 0 0 13.8 0h3A10 10 0 0 1 12 22Zm-3.4-6.6V8.7h4.8a2.8 2.8 0 1 1 0 5.5h-2.4v1.2H8.6Zm2.4-3.2h2.2a1 1 0 1 0 0-2h-2.2v2Z"/></svg>`,
    venmo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M18.8 3.6c.6 1 .9 2.1.9 3.3 0 5-4.2 11.4-7.6 15h-5L4.3 5.6h4.3l1.5 12c2-2.7 4.9-7.6 4.9-10.7 0-1.2-.3-2-.8-2.8l4.6-.5Z"/></svg>`,
    cashapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M14.7 3.2h-2.8l-.7 2.3c-2.6.3-4.5 2-4.5 4.3 0 2.7 2.4 3.8 4.6 4.6l-1 3.4c-1.5-.5-2.8-1.4-3.8-2.3l-1.8 2.5c1.4 1.2 3.3 2.2 5 2.6l-.6 2.2h2.8l.6-2.2c2.8-.3 4.9-2.1 4.9-4.6 0-2.8-2.3-4-4.8-4.9l1-3.2c1.1.4 2 .9 2.9 1.7l1.7-2.4a9.5 9.5 0 0 0-4-2l.5-2Zm-2.7 7.5c-1-.4-1.8-.9-1.8-1.6 0-.7.6-1.2 1.6-1.4l-.8 3Zm.8 6 .9-3.3c1 .4 1.8.9 1.8 1.7s-.7 1.4-2 1.6h-.7Z"/></svg>`,
    chime: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M12 1.8A10.2 10.2 0 1 0 22.2 12 10.2 10.2 0 0 0 12 1.8Zm0 2.4A7.8 7.8 0 1 1 4.2 12 7.8 7.8 0 0 1 12 4.2Zm3.8 11.3H9.2V8.6h2.3v4.8h4.3v2.1Z"/></svg>`,
    paypal: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M7.2 3h8.1c2.8 0 4.8 2 4.3 4.8-.6 3.5-3 5.2-6.7 5.2h-2.4l-.8 4.8H5.9L7.2 3Zm2 2.3-.9 5.4h2.5c2.3 0 3.7-.8 4-2.8.3-1.8-.8-2.6-3.2-2.6H9.2Zm-3.2 8.1h2.9L8 21H5l1-7.6Z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M2 5h20v14H2V5Zm2 2v1l8 5 8-5V7l-8 5-8-5Z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="m6.6 2 3.2 3.2-1.8 2.7a15.6 15.6 0 0 0 8.1 8.1l2.7-1.8L22 17.4l-2.9 2.9c-.7.7-1.7 1-2.6.7A20.6 20.6 0 0 1 3 7.5c-.3-.9 0-1.9.7-2.6L6.6 2Z"/></svg>`,
    person: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5Z"/></svg>`,
    location: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M12 2a7 7 0 0 0-7 7c0 5.1 7 13 7 13s7-7.9 7-13a7 7 0 0 0-7-7Zm0 10.2A3.2 3.2 0 1 1 12 5.8a3.2 3.2 0 0 1 0 6.4Z"/></svg>`,
    contact: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M4 4h16v16H4V4Zm2 2v12h12V6H6Zm2.3 2.8a2.7 2.7 0 1 1 5.4 0 2.7 2.7 0 0 1-5.4 0Zm7.7 6.9H8c.2-1.8 1.7-3 4-3s3.8 1.2 4 3Z"/></svg>`,
    donate: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M13.1 2h-2v2.1c-3 .3-5 2.2-5 4.8 0 3 2.5 4.2 4.9 4.9v4c-1.7-.2-3.1-.9-4.2-1.9l-1.4 1.8c1.6 1.4 3.4 2.2 5.6 2.4V22h2v-1.9c3.1-.4 5.2-2.4 5.2-5 0-3.1-2.5-4.4-5.2-5.1V6c1.1.2 2.2.7 3.1 1.5l1.4-1.8c-1.3-1.1-2.8-1.8-4.5-2V2Zm-2 7.5c-1.7-.5-2.9-1.1-2.9-2.4 0-1.2 1-2 2.9-2.2v4.6Zm2 8.5v-4.8c1.9.6 3.2 1.2 3.2 2.7 0 1.3-1 2-3.2 2.1Z"/></svg>`,
    external: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M14 3h7v7h-2V6.4l-7.3 7.3-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M8 8h12v14H8V8Zm-4-6h12v4H6v12H4V2Z"/></svg>`,
    browser: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M2 4h20v16H2V4Zm2 4v10h16V8H4Zm2.8 2.3a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z"/></svg>`,
    notes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M5 2h11l5 5v15H5V2Zm10 1.8V8h4.2L15 3.8ZM8 11h8v1.8H8V11Zm0 4h8v1.8H8V15Z"/></svg>`,
    document: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="${monoStroke}" d="M6 2h9l5 5v15H6V2Zm8 2v4h4l-4-4Z"/></svg>`
  };

  const logos = {
    devskits31: `<svg viewBox="0 0 520 220" role="img" aria-label="DevSkits 3.1 logo" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="520" height="220" fill="none"/>
      <g fill="none" stroke="currentColor" stroke-width="4">
        <path d="M54 170c28-56 70-94 123-108" opacity=".35"/>
        <path d="M466 168c-11-58-53-104-131-116" opacity=".35"/>
        <path d="M66 180h388" opacity=".45"/>
      </g>
      <text x="260" y="108" fill="currentColor" text-anchor="middle" font-size="76" font-weight="700" font-family="Georgia, 'Times New Roman', serif" letter-spacing="1.5">DevSkits</text>
      <rect x="200" y="132" width="120" height="58" rx="12" fill="none" stroke="currentColor" stroke-width="4"/>
      <text x="260" y="174" fill="currentColor" text-anchor="middle" font-size="48" font-weight="700" font-family="'Courier New', monospace">3.1</text>
      <g transform="translate(42 28)" fill="none" stroke="currentColor" stroke-width="4">
        <path d="M0 46h44l22-10v36H0z" opacity=".7"/>
        <path d="M11 41V16h44v15" opacity=".7"/>
        <path d="M27 16v31M42 16v26" opacity=".7"/>
      </g>
    </svg>`
  };

  function icon(name, cls = "brand-icon", label = "") {
    const svg = icons[name] || icons.document;
    return `<span class="${cls}" aria-hidden="true" data-icon="${name}">${svg}</span>${label ? `<span>${label}</span>` : ""}`;
  }

  window.DevSkitsBranding = { icons, logos, icon };
})();
