const container = document.querySelector("main");

const url = new URL(window.location.href);
const dir = sessionStorage.getItem("dir") || new URLSearchParams(url.search).get("dir") || "";

async function app() {
  let online = navigator.onLine;
  const usingCached = await queryWorker("cachedQuery") || false;

  if (!online && !usingCached) {
    loadOfflinePage();
  } 
  else {
    if (!online && usingCached) {
      document.querySelector("header p").innerHTML = "Offline";
      document.querySelector("header").style.backgroundColor = "mediumpurple";
    }
  
    fetch("https://cool-api.herokuapp.com/tree")
      .then(response => {
        if (response.ok) {
          return response;
        }
      })
      .then(response => response.json())
      .then(data => parseData(data))
      .then(data => {
        if (dir != "") {addBackButton();}
    
        for (const d of data) {
          const link = createElement("a");
          const item = createElement("div", "item");
          
          const icon = createElement("img", "icon");
          const name = createElement("span", "name");
    
          [icon.src, icon.alt] = (d.type === "dir" || d.type === "tree") ? ["/icons/folder.svg", "folder"] : ["/icons/file.svg", "file"];
    
          name.innerHTML = d.path.split("/").pop();
          
          item.append(icon, name);
    
          if (d.type === "file" || d.type === "blob") {
            const size = createElement("span", "size");
            size.innerHTML = formatSize(d.size);
            item.appendChild(size);
          }
          
          link.appendChild(item);
          container.appendChild(link);

          if (d.type === "dir" || d.type === "tree") {
            link.onclick = () => {
              sessionStorage.setItem('dir', d.path);
            }
            link.href = ".";
          } else {
            link.href = "/" + d.path;
          }
        }
      })
      .catch(err => {
        console.log("Error while fetching data\n" + err);
        online = false;
        loadOfflinePage();
      });
  }
}


function parseData(data) {
  const parsedDataArr = [];
  const dirLength = (dir === "") ? 0 : dir.split("/").length;
  for (const d of data) {
    if (d.path.indexOf(dir) === 0 && d.path.split("/").length === dirLength + 1) {
      parsedDataArr.push(d);
    }
  }
  return parsedDataArr;
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

  back.onclick = () => {
    sessionStorage.setItem("dir", dir.split('/').slice(0, -1).join('/'));
  }
  back.href = ".";
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
  backBtn.onclick = () => {
    sessionStorage.setItem("dir", dir.split('/').slice(0, -1).join('/'));
  }
  backBtnLink.href = ".";
  
  backBtnLink.appendChild(backBtn);
  cannotLoad.append(noConnectionImage, message, backBtnLink);
  document.body.appendChild(cannotLoad);
}

async function queryWorker(...queries) {
  return new Promise(res => {
    navigator.serviceWorker.onmessage = e => {
      const responses = [];
      for (let [i,d] of e.data.entries()) {
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