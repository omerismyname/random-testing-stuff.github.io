const btn = document.querySelector(".installApp > button");
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  deferredPrompt = e;
  showInstallPromotion();
});

function showInstallPromotion() {
  btn.addEventListener('click', (e) => {
    installApp.style.display = 'none';
    deferredPrompt.prompt();
    deferredPrompt.userChoice
    .then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Added to home screen');
        window.navigator.serviceWorker.controller.postMessage(["loadAllFiles"]);
      }
      deferredPrompt = null;
    });
  });
  installApp.style = "";
}