(() => {
  function hudMarkup() {
    return `
      <div class="loki-hud">
        <div><strong>LOKI: Streets of Sacramento</strong></div>
        <div class="loki-bars">
          <label>Hunger <span data-bind="hunger"></span></label>
          <div class="bar"><span data-bar="hunger"></span></div>
          <label>Stamina <span data-bind="stamina"></span></label>
          <div class="bar"><span data-bar="stamina"></span></div>
        </div>
        <p data-bind="objective"></p>
      </div>
      <div class="loki-dialog hidden" data-role="dialog"></div>
      <div class="loki-touch" data-role="touch">
        <div class="joypad" data-role="joypad"><div class="joyknob" data-role="joyknob"></div></div>
        <div class="touch-buttons">
          <button data-action="bark">Bark</button>
          <button data-action="sniff">Sniff</button>
          <button data-action="sprint">Sprint</button>
        </div>
      </div>
    `;
  }

  function updateHud(root, game) {
    const hunger = Math.round(game.player.hunger);
    const stamina = Math.round(game.player.stamina);
    root.querySelector("[data-bind='hunger']").textContent = `${hunger}%`;
    root.querySelector("[data-bind='stamina']").textContent = `${stamina}%`;
    root.querySelector("[data-bar='hunger']").style.width = `${hunger}%`;
    root.querySelector("[data-bar='stamina']").style.width = `${stamina}%`;
    root.querySelector("[data-bind='objective']").textContent = `Objective: ${game.currentObjective()}`;
  }

  function showDialogue(root, payload) {
    const node = root.querySelector("[data-role='dialog']");
    if (!payload) {
      node.classList.add("hidden");
      node.innerHTML = "";
      return;
    }
    node.classList.remove("hidden");
    node.innerHTML = `<strong>${payload.speaker}</strong><p>${payload.line}</p><small>Trust: ${Math.round(payload.trust)} • Mood: ${payload.mood}</small>`;
  }

  window.LokiGameUI = { hudMarkup, updateHud, showDialogue };
})();
