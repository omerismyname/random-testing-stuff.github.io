const container = document.querySelector("main");

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const dir = params.get("dir") || "";

async function app() {
  const responses = await queryWorker("onlineQuery", "cachedQuery");
  let online = navigator.onLine || true;
  const usingCached = responses[1] || false;

  if (!online && !usingCached) {
    loadOfflinePage();
  } 
  else {
    if (!online && usingCached) {
      document.querySelector("header p").innerHTML = "Offline";
      document.querySelector("header").style.backgroundColor = "mediumpurple";
    }
    const options = {
      method: "GET"
    };
  
    fetch("https://api.github.com/repos/omerismyname/random-testing-stuff/contents/" + dir, options)
      .then(response => {
        if (response.ok) {
          return response;
        }
      })
      .then(response => response.json())
      .then(data => {
        if (dir != "") {addBackButton();}
    
        for (const d of data) {
          const link = createElement("a");
          const item = createElement("div", "item");
          
          const icon = createElement("img", "icon");
          const name = createElement("span", "name");
    
          [icon.src, icon.alt] = (d.type === "dir") ? ["/icons/folder.svg", "folder"] : ["/icons/file.svg", "file"];
    
          name.innerHTML = d.name;
          
          item.append(icon, name);
    
          if (d.type === "file") {
            const size = createElement("span", "size");
            size.innerHTML = formatSize(d.size);
            item.appendChild(size);
          }
          
          link.appendChild(item);
          container.appendChild(link);
          
          link.href = (d.type === "dir") ? "?dir=" + d.path : "/" + d.path;
        }
      })
      .catch(err => {
        console.log("Error while fetching data\n" + err);
        online = false;
        loadOfflinePage();
      });
  }
}


function createElement(type = "div", className = "") {
  const element = document.createElement(type);
  if (className) {element.className = className;}
  
  return element;
}


function formatSize(size = 0, unit = "B") {
  if (size >= 1000) {
    if (size >= 1000000) {
      if (size >= 1000000000) {
        size = Math.round(size / 100000000) / 10;
        unit = "GB"
      } else {
        size = Math.round(size / 100000) / 10;
        unit = "MB"
      }
    } else {
      size = Math.round(size / 100) / 10;
      unit = "KB";
    }
  }
  return size + unit;
}

function addBackButton() {
  const back = document.querySelector("main .back");
  back.style.display = "block";

  back.href = "/?dir=" + dir.split('/').slice(0, -1).join('/');
}

function loadOfflinePage() {
  document.querySelector("header p").innerHTML = "Offline";
  document.querySelector("header").style.backgroundColor = "mediumpurple";

  const cannotLoad = createElement("div", "cannotLoad");
  const noConnectionImage = createElement("img");
  const message = createElement("span");  
  const backBtn = createElement("button");
  const backBtnLink = createElement("a");

  noConnectionImage.src = "icons/wifi-off.svg";
  message.innerHTML = "Sorry, these files can't be loaded since you're offline.";

  backBtn.innerHTML = "Go back";
  backBtnLink.href = "/?dir=" + dir.split('/').slice(0, -1).join('/');
  
  backBtnLink.appendChild(backBtn);
  cannotLoad.append(noConnectionImage, message, backBtnLink);
  document.body.appendChild(cannotLoad);
}

async function queryWorker(...queries) {
  return new Promise(res => {
    navigator.serviceWorker.onmessage = e => {
      const responses = [];
      for ([i,d] of e.data.entries()) {
        if (d.name === queries[i]) {
          responses.push(d.value);
        }
      }
      res(responses);
    }
    navigator.serviceWorker.controller.postMessage(queries);
  });
}

window.onload = app;

window.ononline = () => {
  document.querySelector("header p").innerHTML = "Online";
  document.querySelector("header").style = "";
}

window.onoffline = () => {
  document.querySelector("header p").innerHTML = "Offline";
  document.querySelector("header").style.backgroundColor = "mediumpurple";
}