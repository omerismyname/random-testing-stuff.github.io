const apiURL = "https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/44418"

function mostFrequent(arr) {
  let counts = {};
  let compare = 0;
  let mostFrequent_ = 0;
  for(var i = 0, len = arr.length; i < len; i++){
    var abbr = arr[i];
    if(counts[abbr] === undefined){
      counts[abbr] = 1;
    }
    else {
      counts[abbr] = counts[abbr] + 1;
    }

    if (counts[abbr] > compare) {
      compare = counts[abbr];
      mostFrequent_ = i;
       }
    }
  return mostFrequent_;
}

fetch(apiURL, {
  cache: "no-cache"
})
.then(response => response.json())
.then(data => {
  let abbrs = [];
  for (let source of data.consolidated_weather) {
    abbrs.push(source.weather_state_abbr);
  }
  modeSource = data.consolidated_weather[mostFrequent(abbrs)];
  box = document.querySelector(".main-container .imgbox");
  let icon = document.createElement("img");
  icon.src = "https://www.metaweather.com/static/img/weather/" + modeSource.weather_state_abbr + ".svg";
  box.appendChild(icon);
  let loader = document.querySelector(".loader");

  setTimeout(() => {loader.style.opacity = "0";}, 5);
  setTimeout(() => {box.parentNode.style.opacity = "1"; box.parentNode.style.display = "block";}, 10);
  setTimeout(() => {loader.style.display = "none";}, 5010);
})
.catch(() => console.log("Error accessing Weather API"));