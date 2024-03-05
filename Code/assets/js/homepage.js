// Grab necessary document elements
var userFormEl = document.querySelector('#user-form');
var historyButtonsEl = document.querySelector('#history-buttons');
var cityInputEl = document.querySelector('#cityname');
var currentContainerEl = document.querySelector('#current-container');
var forecastContainerEl = document.querySelector('#forecast-container');
var historyContainerEl = document.querySelector('#history-buttons');

// shouldn't store API like this but it's a free one with no CC attached, so....
var app_id = '260e9b6795e2166dad8db2bb1059d931';

// location of city being queried
var longitude = 0;
var latitude = 0;

// today for reference in functions
var currentDate = dayjs();

// Check to see if user has a search history using local storage if not start one
var citySearchHistory = [];
if (localStorage.getItem("history") === null) {
} else {
  citySearchHistory = JSON.parse(localStorage.getItem("history"));
}

// Main City Search Button
var formSubmitHandler = function (event) {
  event.preventDefault();

  forecastContainerEl.replaceChildren();

  var cityname = cityInputEl.value.trim();
  if (cityname) {
    getCityForecast(cityname);
  } else {
    alert('Please enter a city name.');
  }
  
};

// History button search 
var buttonClickHandler = function (event) {
  var city = event.target.getAttribute('data-city');
  forecastContainerEl.replaceChildren();

  if (city) {
    getCityForecast(city);
  }
};

// Load history container 
const loadCityHistory = function (cityHistory) {
  
  cityHistory[0] ? cityInputEl.value = cityHistory[0] : cityInputEl.value = "";
  historyContainerEl.replaceChildren();
  
  for(i = 0; i < cityHistory.length; i++) {
    let cityHistoryEl = document.createElement("button");
    cityHistoryEl.setAttribute("data-city", cityHistory[i]);
    cityHistoryEl.setAttribute("class", "btn");
    cityHistoryEl.textContent = cityHistory[i];
    historyButtonsEl.appendChild(cityHistoryEl);
  }
}

// Set city location longitude and latitude using additional api - works for major cities but gets weird for smaller or lesser known locals - but.... it's free
// made async because I was running into coding issues with respect to code being implemented before the fetch finished. This seemed to fix the problem and I learned a little
async function setCityLonLat(city) {
  var geoApiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=3&appid=' + app_id;

  response = await fetch(geoApiUrl);
  if (response.ok) {
    data = await response.json();
    if(data.length > 0) {
      
      longitude = data[0].lon;
      latitude = data[0].lat;
      
      addCityToSearchHistory(city);
      loadCityHistory(citySearchHistory);

    } else {
      cityInputEl.value = "";
      alert('Invalid or unavailable city name request. Please try again.');
    } 
  }               
};

// Add most recent search to local storage search history
const addCityToSearchHistory = function (city) {
  if (citySearchHistory.length < 10) {
    citySearchHistory.unshift(city);
  } else {
    citySearchHistory.pop();
    citySearchHistory.unshift(city);
  }

  localStorage.setItem("history", JSON.stringify(citySearchHistory));  
}

// another async function that seems to make the page react better with fetches from this API. This is the more complicated function of grabbing a 5 day forecast and orgainizing the info for the user
const getCityForecast = async function (city) {
    
  await setCityLonLat(city);

  let currentDayApiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + app_id;
  let forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + app_id;

  fetch(currentDayApiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayCurrentWeather(data);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to OpenWeather API');
    });

  fetch(forecastApiUrl)
  .then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        displayFiveDay(data);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  })
  .catch(function (error) {
    alert('Unable to connect to OpenWeather API');
  });
};

// This basically builds the forecast container - tried to use column-gap for white space between days like in mock-up but kept adding last element to another row - will mess with later
var displayFiveDay = function (data) {

  // starting at 0 gives current day - will look into later - this works for now
  for (i=7; i<=39; i = i + 8) {
    
    // get individual day forecasts
    let futureDate = dayjs.unix(data['list'][i]['dt']);
    let futureIconURL = 'https://openweathermap.org/img/wn/' + data['list'][i]['weather'][0]['icon'] + '@2x.png'
    let futureTemp = data['list'][i]['main']['temp'];
    let futureWind = data['list'][i]['wind']['speed'];
    let futureHumidity = data['list'][i]['main']['humidity'];
    
    // create forecast elements
    var forecastEl = document.createElement("ul");
    var forecastDateEl = document.createElement("li");
    var forecastIconEl = document.createElement("img");
    var forecastTempEl = document.createElement("li");
    var forecastWindEl = document.createElement("li");
    var forecastHumidityEl = document.createElement("li");

    // add forecast info to appropriate elements
    forecastDateEl.textContent = futureDate.format("M/D/YYYY");
    forecastIconEl.setAttribute("src", futureIconURL);
    forecastIconEl.setAttribute("class", "weatherIcon");
    forecastTempEl.textContent = "Temp: " + futureTemp + " °F";
    forecastWindEl.textContent = "Wind: " + futureWind + " MPH";
    forecastHumidityEl.textContent = "Humidity: " + futureHumidity + " %";

    // build forecast element with list item data and dynamically append a list item to the ul and forecast container
    forecastEl.appendChild(forecastDateEl);
    forecastEl.appendChild(forecastIconEl);
    forecastEl.appendChild(forecastTempEl);
    forecastEl.appendChild(forecastWindEl);
    forecastEl.appendChild(forecastHumidityEl);
    forecastContainerEl.appendChild(forecastEl);
  }

}

// since only one day is being shown here I decided to experiment with innerHTML
var displayCurrentWeather = function (data) {

  const weatherIconURL = 'https://openweathermap.org/img/wn/' + data['weather'][0]['icon'] + '@2x.png'  

  currentContainerEl.innerHTML = "<h1>" + data['name'] + " (" + dayjs().format("M/D/YYYY") + ")" + "<img class='weatherIcon' src='" + weatherIconURL + "'/></h1>" +
                                 "<h2>- Temp: " + data['main']['temp'] + "°&nbspF</h2><h2>- Wind: &nbsp" + data['wind'].speed + "&nbsp MPH</h2><h2>- Humidity: &nbsp" + data['main']['humidity'] + "&nbsp%";
  
};

userFormEl.addEventListener('submit', formSubmitHandler);
historyButtonsEl.addEventListener('click', buttonClickHandler);

historyContainerEl.replaceChildren();
loadCityHistory(citySearchHistory);
