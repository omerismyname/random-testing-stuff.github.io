const apiURL = "https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/44418"

fetch(apiURL, {
  cache: "no-cache"
})
.then(response => response.json())
.then(data => {
  let box = document.querySelector(".main-container .imgbox");
  let icon = document.createElement("img");
  icon.src = "https://www.metaweather.com/static/img/weather/" + data.consolidated_weather[0].weather_state_abbr + ".svg";
  box.appendChild(icon);

  let loader = document.querySelector(".loader");
  loader.style.opacity = "0";
  box.parentNode.style.opacity = "1";
  setTimeout(() => {loader.style.display = "none";}, 500); // after fade out (animation lasts 0.5s)
})
.catch(() => console.log("Error accessing Weather API"));