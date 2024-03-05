var userFormEl = document.querySelector('#user-form');
var historyButtonsEl = document.querySelector('#history-buttons');
var cityInputEl = document.querySelector('#cityname');
var currentContainerEl = document.querySelector('#current-container');
var forecastContainerEl = document.querySelector('#forecast-container');
var historyContainerEl = document.querySelector('#history-buttons');

var app_id = '260e9b6795e2166dad8db2bb1059d931';

var longitude = 0;
var latitude = 0;

var currentDate = dayjs();

var citySearchHistory = [];
if (localStorage.getItem("history") === null) {
  console.log("EMPTY");
} else {
  citySearchHistory = JSON.parse(localStorage.getItem("history"));
}
//console.log(JSON.parse(localStorage.getItem("history")));

/*if (localStorage.getItem("history") !== null) {
  console.log("NOT EMPTY");
  citySearchHistory = JSON.parse(localStorage.getItem("history"));
  console.log(citySearchHistory);
} else {
  console.log("EMPTY")
  citySearchHistory = [];
  localStorage.setItem("history", JSON.stringify(citySearchHistory));
}*/

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

var buttonClickHandler = function (event) {
  var city = event.target.getAttribute('data-city');
  forecastContainerEl.replaceChildren();

  if (city) {
    getCityForecast(city);
  }
};

const loadCityHistory = function (cityHistory) {
  
  cityHistory[0] ? cityInputEl.value = cityHistory[0] : cityInputEl.value = "San Antonio";
  historyContainerEl.replaceChildren();
  
  for(i = 0; i < cityHistory.length; i++) {
    let cityHistoryEl = document.createElement("button");
    cityHistoryEl.setAttribute("data-city", cityHistory[i]);
    cityHistoryEl.setAttribute("class", "btn");
    cityHistoryEl.textContent = cityHistory[i];
    historyButtonsEl.appendChild(cityHistoryEl);
  }
}

async function setCityLonLat(city) {
  console.log(city);
  var geoApiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=3&appid=' + app_id;

  response = await fetch(geoApiUrl);
  console.log(response);
  if (response.ok) {
    data = await response.json();
    console.log(data.length);
    if(data.length > 0) {
      
      longitude = data[0].lon;
      latitude = data[0].lat;
      
      console.log(city);
      addCityToSearchHistory(city);
      loadCityHistory(citySearchHistory);

    } else {
      cityInputEl.value = "";
      alert('Invalid or unavailable city name request. Please try again.');
    } 
  }               
};

const addCityToSearchHistory = function (city) {
  if (citySearchHistory.length < 10) {
    citySearchHistory.unshift(city);
    console.log("HERE: " + citySearchHistory);
    console.log(citySearchHistory);
  } else {
    citySearchHistory.pop();
    citySearchHistory.unshift(city);
  }
  console.log(citySearchHistory);
  localStorage.setItem("history", JSON.stringify(citySearchHistory));  
}

const getCityForecast = async function (city) {
    
  await setCityLonLat(city);

  let currentDayApiUrl = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + app_id;
  let forecastApiUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&units=imperial&appid=' + app_id;

  fetch(currentDayApiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log("HERE");
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

var displayFiveDay = function (data) {

  // starting at 0 gives current day - will look into later - this works for now
  for (i=7; i<=39; i = i + 8) {
    
    let futureDate = dayjs.unix(data['list'][i]['dt']);
    let futureIconURL = 'https://openweathermap.org/img/wn/' + data['list'][i]['weather'][0]['icon'] + '@2x.png'
    let futureTemp = data['list'][i]['main']['temp'];
    let futureWind = data['list'][i]['wind']['speed'];
    let futureHumidity = data['list'][i]['main']['humidity'];
    
    var forecastEl = document.createElement("ul");
    var forecastDateEl = document.createElement("li");
    var forecastIconEl = document.createElement("img");
    var forecastTempEl = document.createElement("li");
    var forecastWindEl = document.createElement("li");
    var forecastHumidityEl = document.createElement("li");

    forecastDateEl.textContent = futureDate.format("M/D/YYYY");
    forecastIconEl.setAttribute("src", futureIconURL);
    forecastIconEl.setAttribute("class", "weatherIcon");
    forecastTempEl.textContent = "Temp: " + futureTemp + " °F";
    forecastWindEl.textContent = "Wind: " + futureWind + " MPH";
    forecastHumidityEl.textContent = "Humidity: " + futureHumidity + " %";

    forecastEl.appendChild(forecastDateEl);
    forecastEl.appendChild(forecastIconEl);
    forecastEl.appendChild(forecastTempEl);
    forecastEl.appendChild(forecastWindEl);
    forecastEl.appendChild(forecastHumidityEl);
    forecastContainerEl.appendChild(forecastEl);
  }

}

// since only on day is being shown here I decided to experiment with innerHTML
var displayCurrentWeather = function (data) {
  console.log("DATA: ");
  console.log (data);

  const weatherIconURL = 'https://openweathermap.org/img/wn/' + data['weather'][0]['icon'] + '@2x.png'  

  currentContainerEl.innerHTML = "<h1>" + data['name'] + " (" + dayjs().format("M/D/YYYY") + ")" + "<img class='weatherIcon' src='" + weatherIconURL + "'/></h1>" +
                                 "<h2>- Temp: " + data['main']['temp'] + "°&nbspF</h2><h2>- Wind: &nbsp" + data['wind'].speed + "&nbsp MPH</h2><h2>- Humidity: &nbsp" + data['main']['humidity'] + "&nbsp%";
  
};

userFormEl.addEventListener('submit', formSubmitHandler);
historyButtonsEl.addEventListener('click', buttonClickHandler);

historyContainerEl.replaceChildren();
loadCityHistory(citySearchHistory);


























  /*for (var i = 0; i < repos.length; i++) {
    var repoName = repos[i].owner.login + '/' + repos[i].name;

    var repoEl = document.createElement('a');
    repoEl.classList = 'list-item flex-row justify-space-between align-center';
    repoEl.setAttribute('href', './single-repo.html?repo=' + repoName);

    var titleEl = document.createElement('span');
    titleEl.textContent = repoName;

    repoEl.appendChild(titleEl);

    var statusEl = document.createElement('span');
    statusEl.classList = 'flex-row align-center';

    if (repos[i].open_issues_count > 0) {
      statusEl.innerHTML =
        "<i class='fas fa-times status-icon icon-danger'></i>" + repos[i].open_issues_count + ' issue(s)';
    } else {
      statusEl.innerHTML = "<i class='fas fa-check-square status-icon icon-success'></i>";
    }

    repoEl.appendChild(statusEl);

    forecastContainerEl.appendChild(repoEl);
  }*/