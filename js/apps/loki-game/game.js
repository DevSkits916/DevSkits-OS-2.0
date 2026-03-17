(() => {
  const { TILE, palette } = window.LokiGameAssets;

  class LokiGame {
    constructor(canvas, host, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.host = host;
      this.map = window.LokiGameWorld.buildMap();
      this.controls = new window.LokiGameControls(host);
      this.player = new window.LokiGamePlayer(options.saved?.player || {});
      this.npcs = window.LokiGameNPC.createNPCs(options.saved?.npcs || {});
      this.camera = { x: 0, y: 0 };
      this.running = false;
      this.last = 0;
      this.quest = { food: false, talk: false, safe: false };
      this.dialog = null;
      this.resizeObserver = null;
      this.boundStep = (ts) => this.step(ts);
    }

    start() {
      this.controls.bind();
      this.running = true;
      this.observeSize();
      requestAnimationFrame(this.boundStep);
    }

    stop() {
      this.running = false;
      this.controls.destroy();
      this.resizeObserver?.disconnect();
      this.persist();
    }

    setPaused(paused) {
      this.running = !paused;
      if (!paused) {
        this.last = 0;
        requestAnimationFrame(this.boundStep);
      }
    }

    observeSize() {
      const resize = () => {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = Math.max(320, Math.floor(rect.width - 4));
        this.canvas.height = Math.max(220, Math.floor(rect.height - 4));
      };
      resize();
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    currentObjective() {
      if (!this.quest.food) return "Find food in the market (sniff to locate).";
      if (!this.quest.talk) return "Talk to an NPC (press E nearby).";
      if (!this.quest.safe) return "Reach the Safe Zone.";
      return "All starter quests complete. Explore the city!";
    }

    step(ts) {
      if (!this.running) return;
      if (!this.last) this.last = ts;
      const dt = Math.min(0.034, (ts - this.last) / 1000);
      this.last = ts;

      this.update(dt);
      this.render();
      window.LokiGameUI.updateHud(this.host, this);
      requestAnimationFrame(this.boundStep);
    }

    update(dt) {
      this.player.update(dt, this.controls, { width: this.map.width * TILE, height: this.map.height * TILE });
      this.resolveMissions();

      const visibleZone = window.LokiGameWorld.findZone(this.player.x, this.player.y, this.map);
      this.zoneName = visibleZone?.label || "Unknown";

      this.npcs.forEach((npc) => {
        const near = npc.distanceTo(this.player) < 120;
        npc.highlighted = near && this.controls.isSniffing();
      });

      if (this.controls.consumeInteract()) {
        const nearest = this.npcs.find((npc) => npc.distanceTo(this.player) < 70);
        if (nearest) {
          nearest.applyTrust(5);
          this.dialog = nearest.talk();
          this.quest.talk = true;
        }
      }

      if (!this.controls.isSniffing() && this.dialog && Math.random() > 0.992) {
        this.dialog = null;
      }

      window.LokiGameUI.showDialogue(this.host, this.dialog);
      this.updateCamera();
    }

    resolveMissions() {
      if (!this.quest.food && this.player.x < 460 && this.player.y < 260) {
        this.quest.food = true;
        this.player.hunger = Math.min(100, this.player.hunger + 35);
      }
      if (!this.quest.safe) {
        const zone = window.LokiGameWorld.findZone(this.player.x, this.player.y, this.map);
        if (zone?.id === "safe-zone") this.quest.safe = true;
      }
    }

    updateCamera() {
      this.camera.x = this.player.x - this.canvas.width / 2;
      this.camera.y = this.player.y - this.canvas.height / 2;
      this.camera.x = Math.max(0, Math.min(this.map.width * TILE - this.canvas.width, this.camera.x));
      this.camera.y = Math.max(0, Math.min(this.map.height * TILE - this.canvas.height, this.camera.y));
    }

    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawWorld(ctx);
      this.drawNPCs(ctx);
      this.drawPlayer(ctx);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(8, this.canvas.height - 24, 220, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "12px monospace";
      ctx.fillText(`Zone: ${this.zoneName || "..."}`, 12, this.canvas.height - 11);
    }

    drawWorld(ctx) {
      const startX = Math.floor(this.camera.x / TILE);
      const startY = Math.floor(this.camera.y / TILE);
      const endX = Math.min(this.map.width, startX + Math.ceil(this.canvas.width / TILE) + 2);
      const endY = Math.min(this.map.height, startY + Math.ceil(this.canvas.height / TILE) + 2);
      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const tile = this.map.tiles[y][x];
          ctx.fillStyle = palette[tile] || palette.grass;
          ctx.fillRect(x * TILE - this.camera.x, y * TILE - this.camera.y, TILE, TILE);
          ctx.strokeStyle = "rgba(0,0,0,0.08)";
          ctx.strokeRect(x * TILE - this.camera.x, y * TILE - this.camera.y, TILE, TILE);
        }
      }
    }

    drawNPCs(ctx) {
      this.npcs.forEach((npc) => {
        const sx = npc.x - this.camera.x;
        const sy = npc.y - this.camera.y;
        const colors = { friendly: "#71d47e", neutral: "#f3d278", hostile: "#ef6c6c" };
        ctx.fillStyle = colors[npc.mood] || colors.neutral;
        ctx.beginPath();
        ctx.arc(sx, sy, npc.radius, 0, Math.PI * 2);
        ctx.fill();
        if (npc.highlighted) {
          ctx.strokeStyle = palette.sniffRing;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(sx, sy, npc.radius + 9, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    }

    drawPlayer(ctx) {
      const sx = this.player.x - this.camera.x;
      const sy = this.player.y - this.camera.y;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = "#b57943";
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9d6130";
      ctx.beginPath();
      ctx.ellipse(-9, -9, 5, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(9, -9, 5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#191919";
      ctx.fillRect(10, 0, 3, 3);
      if (this.player.anim === "moving") {
        ctx.fillStyle = "#7d4f2b";
        ctx.fillRect(-10, 10, 5, 3);
        ctx.fillRect(6, 10, 5, 3);
      }
      if (this.player.sniffPulse > 0.01) {
        ctx.strokeStyle = palette.sniffRing;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 26 + this.player.sniffPulse * 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (this.player.barkPulse > 0.01) {
        ctx.strokeStyle = palette.barkRing;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + (1 - this.player.barkPulse) * 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    persist() {
      const npcState = this.npcs.reduce((acc, npc) => {
        acc[npc.id] = { trust: npc.trust, mood: npc.mood };
        return acc;
      }, {});
      const snapshot = {
        player: { x: this.player.x, y: this.player.y, hunger: this.player.hunger, stamina: this.player.stamina },
        npcs: npcState
      };
      localStorage.setItem("devskits-loki-game-save", JSON.stringify(snapshot));
    }

    static loadSave() {
      try {
        return JSON.parse(localStorage.getItem("devskits-loki-game-save") || "{}");
      } catch (err) {
        return {};
      }
    }
  }

  window.LokiGameEngine = LokiGame;
})();
