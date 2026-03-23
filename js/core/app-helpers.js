(() => {
  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeOpen(url) {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyText(value, successLabel = "Copied to clipboard") {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(String(value ?? ""));
      window.DevSkitsDesktop?.notify?.(successLabel, "ok");
      return true;
    } catch (error) {
      window.DevSkitsDesktop?.notify?.("Copy failed", "warn");
      return false;
    }
  }

  function downloadText(filename, text, type = "text/plain") {
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(new Blob([text], { type }));
    link.href = objectUrl;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  function formatTimestamp(value) {
    if (!value) return "never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "never";
    return date.toLocaleString();
  }

  function registerApp(id, render, aliases = []) {
    const registry = window.DevSkitsAppRegistry = window.DevSkitsAppRegistry || {};
    registry[id] = render;
    aliases.forEach((alias) => {
      if (alias && alias !== id) registry[alias] = render;
    });
    return render;
  }

  window.DevSkitsAppHelpers = {
    copyText,
    downloadText,
    escapeHtml,
    formatTimestamp,
    registerApp,
    safeOpen
  };
})();
