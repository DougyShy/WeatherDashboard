var userFormEl = document.querySelector('#user-form');
var historyButtonsEl = document.querySelector('#history-buttons');
var cityInputEl = document.querySelector('#cityname');
var forecastContainerEl = document.querySelector('#forecast-container');
var citySearchTerm = document.querySelector('#city-search-term');

var longitude = 0;
var latitude = 0;

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityname = cityInputEl.value.trim();
  console.log("City entered");
  if (cityname) {
    getCityForecast(cityname);

    forecastContainerEl.textContent = '';
    cityInputEl.value = '';
  } else {
    alert('Please enter a valid city name.');
  }
};

var buttonClickHandler = function (event) {
  var city = event.target.getAttribute('data-city');

  if (city) {
    getCityWeather(city);

    forecastContainerEl.textContent = '';
  }
};

function setLonLat(data) {
  console.log("DATA:");
  longitude = data[0];
  latitude = data[1];
  console.log(longitude);
  console.log(latitude);
}

function getCityLonLat(city) {
  var geoApiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=260e9b6795e2166dad8db2bb1059d931';
  /*let longitude = 0;
  let latitude = 0;*/

  fetch(geoApiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          console.log("RETURN INFO HERE");
          /*longitude = data[0].lon;
          console.log(longitude);
          latitude = data[0].lat;
          console.log(latitude);*/
          setLonLat([data[0].lon, data[0].lat]);
        });
      }
    })
  console.log("LKSJFKL:JSD:KLFJSD:KLFJSD:KLFJ");
  console.log(longitude);
  return 1111;
  
}

var getCityForecast = function (city) {
  var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + city + '&limit=5&appid=260e9b6795e2166dad8db2bb1059d931';
  
  var coords = "BILLY";
  coords = getCityLonLat(city);

  console.log("SHORT LONG LAT HERE?")
  console.log(longitude);
  console.log("LONG LAT HERE?");

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log("HERE");
        response.json().then(function (data) {
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
