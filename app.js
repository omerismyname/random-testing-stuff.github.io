const container = document.querySelector("main");

let dir = window.location.href.split("?dir=");
let url = "";
if (dir.length > 1 && dir[1] != "") {
  url = (dir[1].slice(-1) == "/") ? dir[1] : dir[1] + "/";
}

const options = {
  method: "GET"
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
      let arr = dir[1].split("/");
      let str = "";
      for (let i = arr.length - 1; i > 0; i--) {
        if (arr[i] == "") {arr.pop()} else {break}
      }
      for (let i = 0; i < arr.length - 1; i++) {
        str += arr[i] + "/";
      }
      back.href = "/?dir=" + str;
    }
    for (const d of data) {
      const link = document.createElement("a");
      let fsize_str = "";
      const [icon_src, icon_alt] = (d.type == "dir") ? ["/icons/folder.svg", "folder"] : ["/icons/file.svg", "file"];

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
        fsize_str = '<span class="size">'+ (size + unit) + '</span>';
      }


      link.innerHTML = '<div class="item"><img class="icon" src="' + icon_src + '" alt="' + icon_alt + '"></img><span class="name">' + d.name + '</span>' + fsize_str + '</div>';

      container.appendChild(link);

      link.href = (d.type == "dir") ? "?dir=" + d.path : "/" + d.path;
    }
  })
  .catch(error => console.log("Error while fetching data\n" + error));