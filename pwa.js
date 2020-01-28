let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  deferredPrompt = e;
  showInstallPromotion();
  }
);

function showInstallPromotion() {
  const installApp = document.createElement("div");
  installApp.className = "installApp";

  const text = document.createElement("span");
  text.innerHTML = "Access files offline with the app!";
  const btn = document.createElement("button");
  btn.innerHTML = "Install";

  btn.addEventListener('click', (e) => {
    installApp.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice
      .then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
  });

  installApp.append(text, btn);
  document.body.append(installApp);
}