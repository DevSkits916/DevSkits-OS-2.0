(() => {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function updateProgress(progressBar, progressLabel, targetPercent) {
    const current = parseInt(progressBar.style.width, 10) || 0;
    for (let step = current; step <= targetPercent; step += 1) {
      progressBar.style.width = `${step}%`;
      if (progressLabel) progressLabel.textContent = `${step}%`;
      await wait(8);
    }
  }

  function printLine(container, text) {
    const line = document.createElement("p");
    line.className = "bios-line";
    container.appendChild(line);

    return new Promise((resolve) => {
      let idx = 0;
      const timer = setInterval(() => {
        idx += 1;
        line.textContent = text.slice(0, idx);
        if (idx >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, 22);
    });
  }

  async function runSequence(options = {}) {
    const {
      onComplete = () => {},
      onBeforeDesktop = () => {},
      biosLines = [
        "Initializing DevSkits BIOS...",
        "Detecting memory...",
        "Checking storage devices...",
        "Loading system modules...",
        "Mounting DevSkits kernel..."
      ],
      systemMessages = [
        "Loading desktop environment...",
        "Loading applications...",
        "Initializing icon system...",
        "Starting DevSkits services...",
        "Preparing user interface..."
      ]
    } = options;

    const bootScreen = document.querySelector("#boot-screen");
    const biosStage = document.querySelector("#boot-stage-bios");
    const splashStage = document.querySelector("#boot-stage-splash");
    const biosContainer = document.querySelector("#bios-lines");
    const systemContainer = document.querySelector("#system-messages");
    const progressBar = document.querySelector("#splash-progress");
    const readyMessage = document.querySelector("#final-ready");
    const skipButton = document.querySelector("#boot-skip");
    const progressLabel = document.querySelector("#splash-percent");

    if (!bootScreen || !biosStage || !splashStage) {
      onComplete();
      return;
    }

    bootScreen.classList.remove("hidden", "boot-complete");
    biosStage.classList.remove("hidden");
    splashStage.classList.add("hidden");

    let cancelled = false;
    const cleanup = () => document.removeEventListener("keydown", escSkip);

    const skip = () => {
      cancelled = true;
      cleanup();
      bootScreen.classList.add("hidden");
      onComplete();
    };

    const escSkip = (e) => {
      if (e.key === "Escape") skip();
    };

    skipButton.onclick = skip;
    document.addEventListener("keydown", escSkip);

    biosContainer.innerHTML = "";
    for (const line of biosLines) {
      if (cancelled) return;
      await printLine(biosContainer, line);
      await wait(180);
    }

    if (cancelled) return;
    await wait(420);

    biosStage.classList.add("hidden");
    splashStage.classList.remove("hidden");
    systemContainer.innerHTML = "";
    progressBar.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "0%";
    readyMessage.classList.add("hidden");

    for (let i = 0; i < systemMessages.length; i += 1) {
      if (cancelled) return;
      const row = document.createElement("p");
      row.className = "system-message";
      systemContainer.appendChild(row);

      const message = systemMessages[i];
      for (let charIndex = 0; charIndex <= message.length; charIndex += 1) {
        if (cancelled) return;
        row.textContent = message.slice(0, charIndex);
        await wait(9);
      }

      await updateProgress(progressBar, progressLabel, Math.round(((i + 1) / systemMessages.length) * 100));
      await wait(180);
    }

    if (cancelled) return;
    readyMessage.classList.remove("hidden");
    await wait(560);

    onBeforeDesktop();
    bootScreen.classList.add("boot-complete");
    await wait(720);
    bootScreen.classList.add("hidden");
    cleanup();
    onComplete();
  }

  window.DevSkitsBoot = {
    runSequence
  };
})();
