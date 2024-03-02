var userFormEl = document.querySelector('#user-form');
var historyButtonsEl = document.querySelector('#history-buttons');
var cityInputEl = document.querySelector('#cityname');
var forecastContainerEl = document.querySelector('#forecast-container');
var citySearchTerm = document.querySelector('#city-search-term');
var app_id = '260e9b6795e2166dad8db2bb1059d931';

var longitude = 0;
var latitude = 0;

coords = [];

cityInputEl.value = "San Antonio";

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityname = cityInputEl.value.trim();
  if (cityname) {
    getCityForecast(cityname);

    forecastContainerEl.textContent = '';
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
  data = await response.json();
  longitude = data[0].lon;
  latitude = data[0].lat;                
}

const getCityForecast = async function (city) {
    
  await setCityLonLat(city);

  //let apiUrl = 'http://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&cnt=5&appid=' + app_id;
  console.log(longitude);
  console.log(latitude);

  let currentDayApiUrl = ('http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=' + app_id);
  
  //let currentDayApiUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=44.34&lon=10.99&appid=' + app_id;

  await fetch(currentDayApiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log("HERE");
        response.json().then(function (data) {
          console.log(longitude);
          console.log(data);
          //displayRepos(data, user);
        });
      } else {
        alert('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      alert('Unable to connect to GitHub');
    });
};

var getCityWeather = function (city) {
  var apiUrl = 'https://api.github.com/search/repositories?q=' + language + '+is:featured&sort=help-wanted-issues';

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        displayRepos(data.items, language);
      });
    } else {
      alert('Error: ' + response.statusText);
    }
  });
};

var displayRepos = function (repos, searchTerm) {
  if (repos.length === 0) {
    forecastContainerEl.textContent = 'No repositories found.';
    return;
  }

  citySearchTerm.textContent = searchTerm;

  for (var i = 0; i < repos.length; i++) {
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
  }
};

userFormEl.addEventListener('submit', formSubmitHandler);
historyButtonsEl.addEventListener('click', buttonClickHandler);
