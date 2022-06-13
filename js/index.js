const searchInput = document.getElementById("search_input");
const matchList = document.getElementById("match_list");
const WeatherUI = document.getElementById("weatherContent");
const alertMessage = document.getElementById("alert_message");
const load = document.getElementById("loading");

//篩選name或code
async function getText(Text) {
    const res = await fetch("https://raw.githubusercontent.com/peterrr2/openWeather/master/json/weather.json");
    let data = await res.json();
    let searchText = new RegExp(`^${Text}`);
    let matchData = data.filter((value) => {
        value.name = value.name.toUpperCase();
        return value.name.match(searchText) || value.code.match(searchText)
    })
    matchCity(matchData);
}
//將篩選出的印出來
function matchCity(cityName) {
    let print = "";
    cityName.forEach(value => {
        print += `
        <div class="match_value" id="match_value" data-id="${value.name}">
            <h3 class="cityName">${value.name}(${value.code})</h3>
        </div>
        `
    })
    matchList.innerHTML = print
}

//溫度單位轉換
function tempUnit(temp) {
    return Math.floor(temp - 273.15)
}
//風速單位轉換
function windUnit(wind) {
    return Math.floor(wind * 1.6)
}

// 目前時間轉換
function currentTime(timezone) {
    let localHour = timezone * 1000;
    let date = new Date().getTime();
    let hour = Math.floor(((date + localHour) / (1000 * 60 * 60)) % 24)
    let min = Math.floor(((date + localHour) / (1000 * 60)) % 60);
    hour = (hour<10)?"0"+hour:hour;
    min = (min<10)?"0"+min:min;
    return hour+":"+min
}

//fetch api
async function cityWeather(countryName) {
    const api_key = "44259a4fa5f2816591abed71fc516a78";
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${countryName}&appid=${api_key}&lang=zh_tw`;
    const res = await fetch(api);

    //進入loading畫面
    load.classList.add("show");
    WeatherUI.classList.remove("show")

    //有異常時顯示錯誤訊息
    if (res.status !== 200) {
        load.classList.remove("show")
        alertMessage.classList.add("show");
        setTimeout(() => {
            alertMessage.classList.remove("show")
        }, 2000)
        WeatherUI.innerHTML = "";
    }
    else {
        //刪除loading畫面
        setTimeout(() => {
            load.classList.remove("show")
            WeatherUI.classList.add("show")
        }, 1000)
        const data = await res.json();
        const { weather, main, visibility, wind, timezone, name } = data
        WeatherUI.innerHTML = `
        <div class="title">
        <h2>${name}</h2>
        <p>${currentTime(timezone)}</p>
        </div>
        <div class="content">
            <div class="icon">
            <img src="http://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="weather_icon">
            <h1 class="temp">${tempUnit(main.temp)}<sup>o</sup>C</h1>
            </div>
            <h2 class="des">${weather[0].description}</h2>
        </div>
        <div class="detail">
            <div class="wind detail_item">
                <h4>風速</h4>
                <p class="num">${windUnit(wind.speed)}km/hour</p>
            </div>
            <div class="humidity detail_item">
                <h4>濕度</h4>
                <p class="num">${main.humidity}%</p>
            </div>
            <div class="vis detail_item">
                <h4>能見度</h4>
                <p class="num">${visibility / 1000}km</p>
            </div>
            <div class="pressure detail_item">
                <h4>氣壓</h4>
                <p class="num">${main.pressure}hPa</p>
            </div>
            <div class="feel_temp detail_item">
                <h4>體感溫度</h4>
                <p class="num">${tempUnit(main.feels_like)}<sup>o</sup>C</p>
            </div>
        </div>
        `;
    }
}

//搜尋欄
searchInput.addEventListener("keyup", function (e) {
    if (searchInput.value !== "") {
        if (e.key === "Enter") {
            cityWeather(searchInput.value)
        }
        else {
            searchInput.classList.add("change");
            matchList.classList.add("show");
            getText(searchInput.value.toUpperCase());
        }
    }
    else {
        searchInput.classList.remove("change");
        matchList.classList.remove("show");
    }
})

//搜尋列表
matchList.addEventListener("click", function (e) {
    const country = e.target.dataset.id;
    cityWeather(country);
    searchInput.classList.remove("change")
    matchList.classList.remove("show");
    searchInput.value = "";
})