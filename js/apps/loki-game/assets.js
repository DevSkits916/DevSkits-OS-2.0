(() => {
  const TILE = 48;
  const palette = {
    grass: "#4f8f45",
    road: "#6f6f75",
    safe: "#4f7ed8",
    water: "#2f4b7c",
    dirt: "#8b6a46",
    hudBg: "rgba(10, 10, 16, 0.72)",
    hudText: "#ecf3ff",
    barkRing: "rgba(255, 255, 255, 0.7)",
    sniffRing: "rgba(120, 220, 255, 0.5)"
  };

  function pawIconSvg() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="38" r="13" fill="#c68f59" stroke="#553019"/><ellipse cx="18" cy="20" rx="6" ry="8" fill="#c68f59" stroke="#553019"/><ellipse cx="30" cy="16" rx="6" ry="8" fill="#c68f59" stroke="#553019"/><ellipse cx="43" cy="16" rx="6" ry="8" fill="#c68f59" stroke="#553019"/><ellipse cx="52" cy="24" rx="6" ry="8" fill="#c68f59" stroke="#553019"/></svg>`;
  }

  window.LokiGameAssets = { TILE, palette, pawIconSvg };
})();
