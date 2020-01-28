const installApp = document.querySelector(".installApp");
const btn = installApp.querySelector("button");
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installApp.style = "flex";
});

btn.addEventListener('click', (e) => {
  installApp.style.display = "";
  if (deferredPrompt) {deferredPrompt.prompt();}
  deferredPrompt.userChoice
  .then(choiceResult => {
    if (choiceResult.outcome === 'accepted') {
      console.log('Added to home screen');
      window.navigator.serviceWorker.controller.postMessage(["loadAllFiles"]);
    }
    deferredPrompt = null;
  });
});