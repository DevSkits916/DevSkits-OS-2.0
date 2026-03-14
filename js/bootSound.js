(() => {
  const BOOT_SOUND_DATA_URI = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAABkAMQBGAFgAZABqAGsAaABgAFQARAAxAB0ACwAA";
  const OPEN_SOUND_DATA_URI = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAABQAJgA3AEcAVABeAGQAZQBiAFsAUQBEADYAJw==";
  const CLOSE_SOUND_DATA_URI = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAZQBaAE8AQwA3ACwAIQAXAA0ABQAAAPv/9v/x";

  const sounds = {
    boot: new Audio(BOOT_SOUND_DATA_URI),
    windowOpen: new Audio(OPEN_SOUND_DATA_URI),
    windowClose: new Audio(CLOSE_SOUND_DATA_URI)
  };

  Object.values(sounds).forEach((audio) => {
    audio.preload = "auto";
    audio.volume = 0.35;
  });

  function audioEnabled() {
    return localStorage.getItem("devskits-sound") !== "off";
  }

  function playBootSound() {
    playEffect("boot");
  }

  function playEffect(type) {
    if (!audioEnabled()) return;
    const audio = sounds[type];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  window.DevSkitsBootSound = {
    playBootSound,
    playEffect
  };
})();
