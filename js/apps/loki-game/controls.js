(() => {
  class Controls {
    constructor(root) {
      this.root = root;
      this.keys = new Set();
      this.sniffing = false;
      this.barkQueued = false;
      this.interactQueued = false;
      this.touchAxis = { x: 0, y: 0 };
      this.touchSprint = false;
      this.unsub = [];
    }

    bind() {
      const down = (e) => {
        this.keys.add(e.key.toLowerCase());
        if (e.key.toLowerCase() === " ") this.barkQueued = true;
        if (e.key.toLowerCase() === "e") this.interactQueued = true;
        if (e.key.toLowerCase() === "q") this.sniffing = true;
      };
      const up = (e) => {
        this.keys.delete(e.key.toLowerCase());
        if (e.key.toLowerCase() === "q") this.sniffing = false;
      };
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      this.unsub.push(() => window.removeEventListener("keydown", down));
      this.unsub.push(() => window.removeEventListener("keyup", up));
      this.bindTouchControls();
    }

    bindTouchControls() {
      const pad = this.root.querySelector("[data-role='joypad']");
      const knob = this.root.querySelector("[data-role='joyknob']");
      const bark = this.root.querySelector("[data-action='bark']");
      const sniff = this.root.querySelector("[data-action='sniff']");
      const sprint = this.root.querySelector("[data-action='sprint']");
      if (!pad || !knob) return;

      let active = null;
      const moveKnob = (x, y) => {
        const rect = pad.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const max = rect.width * 0.35;
        const dist = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(max, dist);
        const nx = (dx / dist) * clamped;
        const ny = (dy / dist) * clamped;
        knob.style.transform = `translate(${nx}px, ${ny}px)`;
        this.touchAxis = { x: nx / max, y: ny / max };
      };

      const reset = () => {
        knob.style.transform = "translate(0px, 0px)";
        this.touchAxis = { x: 0, y: 0 };
      };

      const onDown = (e) => {
        active = e.pointerId;
        pad.setPointerCapture(active);
        moveKnob(e.clientX, e.clientY);
      };
      const onMove = (e) => { if (e.pointerId === active) moveKnob(e.clientX, e.clientY); };
      const onUp = (e) => { if (e.pointerId === active) { active = null; reset(); } };

      pad.addEventListener("pointerdown", onDown);
      pad.addEventListener("pointermove", onMove);
      pad.addEventListener("pointerup", onUp);
      pad.addEventListener("pointercancel", onUp);

      bark?.addEventListener("pointerdown", () => { this.barkQueued = true; });
      sniff?.addEventListener("pointerdown", () => { this.sniffing = true; });
      sniff?.addEventListener("pointerup", () => { this.sniffing = false; });
      sprint?.addEventListener("pointerdown", () => { this.touchSprint = true; });
      sprint?.addEventListener("pointerup", () => { this.touchSprint = false; });

      this.unsub.push(() => {
        pad.removeEventListener("pointerdown", onDown);
        pad.removeEventListener("pointermove", onMove);
        pad.removeEventListener("pointerup", onUp);
        pad.removeEventListener("pointercancel", onUp);
      });
    }

    getMoveAxis() {
      const x = (this.keys.has("d") ? 1 : 0) - (this.keys.has("a") ? 1 : 0) + this.touchAxis.x;
      const y = (this.keys.has("s") ? 1 : 0) - (this.keys.has("w") ? 1 : 0) + this.touchAxis.y;
      return { x, y };
    }

    isSprinting() {
      return this.keys.has("shift") || this.touchSprint;
    }

    isSniffing() { return this.sniffing; }

    consumeBark() {
      const bark = this.barkQueued;
      this.barkQueued = false;
      return bark;
    }

    consumeInteract() {
      const hit = this.interactQueued;
      this.interactQueued = false;
      return hit;
    }

    destroy() { this.unsub.forEach((fn) => fn()); this.unsub = []; }
  }

  window.LokiGameControls = Controls;
})();
