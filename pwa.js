(() => {
  const installButton = document.getElementById("installButton");
  const banner = document.getElementById("pwaBanner");
  const message = document.getElementById("pwaBannerMessage");
  const action = document.getElementById("pwaBannerAction");
  const dismiss = document.getElementById("pwaBannerDismiss");
  let installPrompt = null;
  let waitingWorker = null;

  function announce(text, actionLabel = "") {
    message.textContent = text;
    action.textContent = actionLabel;
    action.hidden = !actionLabel;
    banner.hidden = false;
  }

  function hideBanner() {
    banner.hidden = true;
    action.hidden = true;
    waitingWorker = null;
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function hasInstallableOrigin() {
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    return window.location.protocol === "https:" || (window.location.protocol === "http:" && isLocalhost);
  }

  if (isStandalone()) installButton.hidden = true;

  function showInstallHelp() {
    const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent);
    announce(isAppleMobile
      ? "To keep this trip close, tap Share in Safari, then Add to Home Screen."
      : "Open your browser menu and choose Install app or Add to Home Screen. The trip guide works offline after it has loaded once.");
  }

  installButton.addEventListener("click", async () => {
    if (isStandalone()) {
      announce("Your trip companion is already installed.");
      return;
    }
    if (!hasInstallableOrigin()) {
      announce("To install the app and use its offline mode, open it from HTTPS or localhost—not a file preview.");
      return;
    }
    if (!installPrompt) {
      showInstallHelp();
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
    announce("Installed. Your Uttarakhand guide is ready on your home screen.");
  });

  window.addEventListener("online", () => {
    if (waitingWorker) announce("A refreshed version of your trip guide is ready.", "Reload");
    else hideBanner();
  });
  window.addEventListener("offline", () => announce("You’re offline. Your itinerary is saved; external maps and photos may need a connection."));
  if (!navigator.onLine) announce("You’re offline. Your itinerary is saved; external maps and photos may need a connection.");

  action.addEventListener("click", () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  });
  dismiss.addEventListener("click", hideBanner);

  if ("serviceWorker" in navigator && hasInstallableOrigin()) {
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController && waitingWorker) window.location.reload();
      hadController = true;
    });

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./", updateViaCache: "none" });
        if (registration.waiting && navigator.serviceWorker.controller) {
          waitingWorker = registration.waiting;
          announce("A refreshed version of your trip guide is ready.", "Reload");
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorker = registration.waiting;
              if (waitingWorker) announce("A refreshed version of your trip guide is ready.", "Reload");
            }
          });
        });
      } catch {
        // The guide remains usable when service workers are unavailable (for example, file:// previews).
      }
    }, { once: true });
  }
})();
