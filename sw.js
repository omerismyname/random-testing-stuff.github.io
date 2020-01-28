const cacheName = "dynamic-cache-v1";
const precacheResources = [
  "index.html",
  "main.css",
  "app.js",
  "pwa.js",
  "favicon.ico",
  "favicon.png",
  "icon-72.png",
  "icon-144.png",
  "icon-192.png",
  "icon-512.png",
  "icons/wifi-off.svg",
  "icons/corner-down-left.svg",
  "icons/file.svg",
  "icons/folder.svg"
];
let online = true;
let usingCached = true;

self.addEventListener("install", e => {
  console.log("Installing");
  e.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(precacheResources);
      })
      .catch(err => {
        console.error("Error while installing: ", err)
      })
  );
  loadAllFiles();
});

self.addEventListener("activate", e => {
  const cacheKeeplist = [cacheName];
  
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
  console.log("Activated");
});

self.addEventListener('fetch', event => {
  if (event.request.method != 'GET') return;

  event.respondWith(caches.match(event.request)
    .then(response => {
      online = true;
      usingCached = true;
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          return caches.open(cacheName)
          .then(cache => {
            cache.put(event.request.url, networkResponse.clone());
            return networkResponse;
          })
        })
        .catch(err => {
          return caches.open(cacheName)
            .then(cache => {
              online = false;
              return cache.match('index.html');
            });
        });
      if (!response) {
        usingCached = false;
      }
      return response || fetchPromise;
    })
  );
});

self.addEventListener("message", e => {
  let responses = [];
  for (const d of e.data) {
    if (d === "onlineQuery") {
      responses.push({name: "onlineQuery", value: online});
    }
    if (d === "cachedQuery") {
      responses.push({name: "cachedQuery", value: usingCached});
    }
    if (d === "loadAllFiles") {
      loadAllFiles();
    }
  }
  e.source.postMessage(responses);
});

function loadAllFiles() {
  fetch("https://cool-api.herokuapp.com/parsedTree?files")
    .then(response => response.json())
    .then(files => {
      for (const file of files) {
        caches.open(cacheName)
          .then(cache => {
            cache.match(file)
              .then(cacheMatched => {
                if (!cacheMatched) {
                  cache.add(file);
                }
              })
          })
      }
    })
    .catch(err => console.log("Could not fetch files.\n" + err))
}