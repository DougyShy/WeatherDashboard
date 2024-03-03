var userFormEl = document.querySelector('#user-form');
var historyButtonsEl = document.querySelector('#history-buttons');
var cityInputEl = document.querySelector('#cityname');
var forecastContainerEl = document.querySelector('#forecast-container');
var currentContainerEl = document.querySelector('#current-container');
var currentWeatherContainer = document.querySelector('.currentDay')

var app_id = '260e9b6795e2166dad8db2bb1059d931';

var longitude = 0;
var latitude = 0;

cityInputEl.value = "San Antonio";
var currentDate = dayjs();

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityname = cityInputEl.value.trim();
  if (cityname) {
    getCityForecast(cityname);

    //cityInputEl.value = '';
  } else {
    alert('Please enter a city name.');
  }
};

var buttonClickHandler = function (event) {
  var city = event.target.getAttribute('data-city');

  if (city) {
    getCityWeather(city);

    forecastContainerEl.textContent = '';
  }
};

async function setCityLonLat(city) {
   var geoApiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=3&appid=' + app_id;

  response = await fetch(geoApiUrl);
  if (response.ok) {
    data = await response.json();
    longitude = data[0].lon;
    latitude = data[0].lat;
  }                
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
      alert('Unable to connect to GitHub');
    });

  fetch(forecastApiUrl)
  .then(function (response) {
    if (response.ok) {
      console.log("HERE FOR FORECAST");
      response.json().then(function (data) {
        //console.log(data['wind'].speed);
        displayFiveDay(data);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  })
  .catch(function (error) {
    alert('Unable to connect to GitHub');
  });
};

var displayFiveDay = function (data) {
  console.log("DATA: ");
  console.log (data);
  let tomorrow = dayjs().add(1, 'day');


  //console.log(tomorrow.format("MM:DD:YYYY"));
  for (i=7; i<=39; i = i + 8) {
    let futureDate = dayjs.unix(data['list'][i]['dt']);
    let futureTemp = data['list'][i]['main']['temp'];
    console.log(futureDate.format("MM/DD/YYYY"));
    console.log(futureTemp);

  }

}

var displayCurrentWeather = function (data) {
  console.log("DATA: ");
  console.log (data);

  const weatherIconURL = 'https://openweathermap.org/img/wn/' + data['weather'][0]['icon'] + '@2x.png'  

  currentContainerEl.innerHTML = "<h1>" + data['name'] + " (" + dayjs().format("M/D/YYYY") + ")" + "<img class='weatherIcon' src='" + weatherIconURL + "'/></h1>" +
                                 "<h2>- Temp: " + data['main']['temp'] + "°&nbspF</h2><h2>- Wind: &nbsp" + data['wind'].speed + "&nbsp MPH</h2><h2>- Humidity: &nbsp" + data['main']['humidity'] + "&nbsp%";
  
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
};

userFormEl.addEventListener('submit', formSubmitHandler);
historyButtonsEl.addEventListener('click', buttonClickHandler);
