const apiURL = "https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/44418";
var weather;
var days = (n) => {
  if (n === 0) {
    return "Today";
  }
  else if (n === 1) { 
    return "Tomorrow";
  }
  else {
    let d = new Date().toISOString().split("T")[0].split("-");
    let date = new Date(d[0], parseInt(d[1]) - 1, parseInt(d[2]) + n).toString().split(" ");
    return date[0] + " " + date[2] + " " + date[1];
  }
};

fetch(apiURL, {
  cache: "no-cache"
})
.then(response => response.json())
.then(data => {
  weather = data.consolidated_weather;
  getWeather(0);

  let box = document.querySelector(".main-container .imgbox");
  let loader = document.querySelector(".loader");
  loader.style.opacity = "0";
  box.parentNode.parentNode.style.opacity = "1";
  setTimeout(() => {loader.style.display = "none";}, 500); // after fade out (animation lasts 0.5s)
})
.catch((e) => console.log("Error accessing Weather API\n" + e));

function getWeather(day) {
  if (0 <= day && day < 6) {
    let tw = weather[day];
    let box = document.querySelector(".main-container .imgbox");
    for (let c of box.children) {
      box.removeChild(c);
    }
    let icon = document.createElement("img");
    icon.src = "https://www.metaweather.com/static/img/weather/" + tw.weather_state_abbr + ".svg";
    box.appendChild(icon);

    document.querySelector("#min-temperature p").innerHTML = Math.round(tw.min_temp * 10) / 10 + "°C";
    document.querySelector("#max-temperature p").innerHTML = Math.round(tw.max_temp * 10) / 10 + "°C";
    document.querySelector("#pressure p").innerHTML = Math.round(tw.air_pressure) + "mb";
    document.querySelector("#wind .icon").style = "transform: rotate(" + Math.round(tw.wind_direction) + "deg)";
    document.querySelector("#wind p").innerHTML = (Math.round(tw.wind_speed * 10) / 10) + "mph";
    document.querySelector("#humidity p").innerHTML = Math.round(tw.humidity) + "%";
    document.querySelector("#visibility p").innerHTML = Math.round(tw.visibility) + " miles";

    document.querySelector(".centre-container .day").innerHTML = days(day);
  } 
};

function nextDay() {
  let ccontainer = document.querySelector(".centre-container");
  let day = parseInt(ccontainer.getAttribute("day"));
  if (day < 5) {
    day++;
    ccontainer.setAttribute("day", day);
    getWeather(day);
  }
}

function prevDay() {
  let ccontainer = document.querySelector(".centre-container");
  let day = parseInt(ccontainer.getAttribute("day"));
  if (day > 0) {
    day--;
    ccontainer.setAttribute("day", day);
    getWeather(day);
  }
}