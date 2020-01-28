const installApp = document.querySelector(".installApp");
const btn = installApp.querySelector("button");
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installApp.style = "";
});

btn.addEventListener('click', (e) => {
  installApp.style.display = 'none';
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

if (window.matchMedia('(display-mode: standalone)').matches) {
  installApp.style.display = "none";
}