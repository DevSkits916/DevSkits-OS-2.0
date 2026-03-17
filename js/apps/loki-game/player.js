(() => {
  class LokiPlayer {
    constructor(state = {}) {
      this.x = state.x ?? 120;
      this.y = state.y ?? 120;
      this.radius = 14;
      this.hunger = state.hunger ?? 82;
      this.stamina = state.stamina ?? 100;
      this.speed = 140;
      this.sprintMultiplier = 1.7;
      this.anim = "idle";
      this.facing = { x: 1, y: 0 };
      this.sniffPulse = 0;
      this.barkPulse = 0;
    }

    update(dt, controls, bounds) {
      const axis = controls.getMoveAxis();
      const moving = Math.hypot(axis.x, axis.y) > 0;
      let speed = this.speed;
      const sprinting = controls.isSprinting() && this.stamina > 0.5 && moving;
      if (sprinting) speed *= this.sprintMultiplier;

      if (moving) {
        const n = Math.hypot(axis.x, axis.y) || 1;
        this.x += (axis.x / n) * speed * dt;
        this.y += (axis.y / n) * speed * dt;
        this.facing = { x: axis.x / n, y: axis.y / n };
        this.anim = controls.isSniffing() ? "sniffing" : "moving";
      } else {
        this.anim = controls.isSniffing() ? "sniffing" : "idle";
      }

      if (sprinting) this.stamina = Math.max(0, this.stamina - 28 * dt);
      else this.stamina = Math.min(100, this.stamina + 16 * dt);
      this.hunger = Math.max(0, this.hunger - 2.1 * dt);

      this.sniffPulse = controls.isSniffing() ? Math.min(1, this.sniffPulse + dt * 5) : Math.max(0, this.sniffPulse - dt * 4);
      this.barkPulse = controls.consumeBark() ? 1 : Math.max(0, this.barkPulse - dt * 3.3);

      this.x = Math.max(this.radius, Math.min(bounds.width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(bounds.height - this.radius, this.y));
    }
  }

  window.LokiGamePlayer = LokiPlayer;
})();
