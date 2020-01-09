const container = document.querySelector("main");

let dir = window.location.href.split("?dir=");
let url = "";
if (dir.length > 1 && dir[1] != "") {
  url = (dir[1].slice(-1) == "/") ? dir[1] : dir[1] + "/";
}

const options = {
  method: "GET", 
  headers: {
    'Authorization': "token" + ' ' + "cfaabd0b347d1798d0be307a05f73bc3cc2842bd"
  }
}

fetch("https://api.github.com/repos/omerismyname/random-testing-stuff/contents/" + url, options)
  .then(response => {
    if (response.status == 404 || response.status == 403) {
      window.location.href = "/";
    }
    else {
      return response;
    }
  })
  .then(response => response.json())
  .then(data => {
    if (url != "") {
      const back = document.querySelector("main .back");
      back.style.display = "block";
      back.onclick = function() {
        const arr = dir[1].split("/");
        let str = "";
        for (let i = arr.length - 1; i > 0; i--) {
          if (arr[i] == "") {arr.pop()} else {break}
        }
        for (let i = 0; i < arr.length - 1; i++) {
          str += arr[i] + "/";
        }
        window.location.href = "/?dir=" + str;
      }
    }
    for (const d of data) {
      let item = document.createElement("div");
      let itemType = document.createElement("img");
      let itemName = document.createElement("span");
      
      item.className = "item";
      itemType.className = "icon";
      itemName.className = "name";
      
      itemType.src = (d.type == "dir") ? "/icons/folder.svg" : "/icons/file.svg";
      itemName.innerHTML = d.name;

      
      item.appendChild(itemType);
      item.appendChild(itemName);



      if (d.type == "file") {
        let itemSize = document.createElement("span");
        itemSize.className = "size";

        let size = d.size;
        let unit = "B";
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
  
        itemSize.innerHTML = size + unit;
        item.appendChild(itemSize);
      }



      container.appendChild(item);

      item.setAttribute("path", d.path);
      item.onclick = (d.type == "dir") ? navigateFolder : navigateFile;
    }
  })
  .catch(error => console.log("Error while fetching data\n" + error));

function navigateFile() {
  window.location.href = "/" + this.getAttribute("path");
}

function navigateFolder() {
  window.location.href = "?dir=" + this.getAttribute("path");
}