(() => {
  class NPC {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.x = config.x;
      this.y = config.y;
      this.radius = 11;
      this.trust = config.trust ?? 50;
      this.mood = config.mood ?? "neutral";
      this.dialogue = config.dialogue ?? [];
      this.dialogIndex = 0;
      this.highlighted = false;
    }

    distanceTo(player) {
      return Math.hypot(this.x - player.x, this.y - player.y);
    }

    applyTrust(delta) {
      this.trust = Math.max(0, Math.min(100, this.trust + delta));
      if (this.trust > 69) this.mood = "friendly";
      else if (this.trust < 30) this.mood = "hostile";
      else this.mood = "neutral";
    }

    talk() {
      const line = this.dialogue[this.dialogIndex % this.dialogue.length] || `${this.name} nods.`;
      this.dialogIndex += 1;
      return { speaker: this.name, line, trust: this.trust, mood: this.mood };
    }
  }

  function createNPCs(saved = {}) {
    const base = [
      { id: "chef-maria", name: "Chef Maria", x: 350, y: 150, trust: 60, mood: "friendly", dialogue: ["You look hungry, Loki.", "I saw food near the market crates."] },
      { id: "guard-jo", name: "Guard Jo", x: 720, y: 680, trust: 35, mood: "neutral", dialogue: ["Safe Zone is up ahead.", "Stay clear of the river at night."] },
      { id: "kid-sam", name: "Sam", x: 1000, y: 300, trust: 52, mood: "neutral", dialogue: ["Wanna play fetch later?", "People trust dogs who listen."] }
    ];
    return base.map((n) => new NPC({ ...n, trust: saved[n.id]?.trust ?? n.trust, mood: saved[n.id]?.mood ?? n.mood }));
  }

  window.LokiGameNPC = { NPC, createNPCs };
})();
