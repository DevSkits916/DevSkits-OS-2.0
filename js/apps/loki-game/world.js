(() => {
  const { TILE } = window.LokiGameAssets;

  const ZONES = [
    { id: "market", x: 0, y: 0, w: 18, h: 12, label: "Downtown Market" },
    { id: "riverwalk", x: 18, y: 0, w: 18, h: 12, label: "Riverwalk" },
    { id: "safe-zone", x: 26, y: 12, w: 10, h: 8, label: "Safe Zone" }
  ];

  function buildMap(width = 36, height = 20) {
    const tiles = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => {
      if (x > 25 && y > 11) return "safe";
      if ((y === 5 || y === 6) && x > 2 && x < 34) return "road";
      if (x > 14 && x < 20 && y > 1 && y < 18) return "road";
      if (x < 4 && y > 11) return "water";
      if ((x + y) % 9 === 0) return "dirt";
      return "grass";
    }));
    return { width, height, tiles, zones: ZONES };
  }

  function worldToTile(value) {
    return Math.floor(value / TILE);
  }

  function findZone(x, y, map) {
    const tx = worldToTile(x);
    const ty = worldToTile(y);
    return map.zones.find((zone) => tx >= zone.x && tx < zone.x + zone.w && ty >= zone.y && ty < zone.y + zone.h);
  }

  window.LokiGameWorld = { buildMap, findZone };
})();
