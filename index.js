document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    console.log(city)

    await fetch('/weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            city: city
        })
    })
        .then(res => res.json())
        .then(data => {
            writeData(data)
            initMap(data.coord.lat, data.coord.lon)
        })
        .catch(error => console.log(error))
});

async function writeData(data) {
    console.log('writing')
    document.getElementById('weatherInfo').innerHTML = `   
<div class="card">
    <div class="card-header bg-info text-white">
        <h3 class="my-2">Weather Information</h3>
    </div>
    <div class="card-body">
        <p style="margin-bottom: 1.5%;">Location: ${data.name}, ${data.sys.country}</p>
        <p style="margin-bottom: 1%;">Weather: ${data.weather[0].description}   &nbsp
            <img src='http://openweathermap.org/img/wn/${data.weather[0].icon}.png' class="border"
                style="width: 40px; border-radius: 10px;"></p>
        <p>Temperature: ${Math.round(data.main.temp)}℃;</p>
        <p>Feels-like temperature: ${Math.round(data.main.feels_like)}℃</p>
        <p>Latitude and Longitude: (${data.coord.lat}, ${data.coord.lon})</p>
        <p>Humidity: ${data.main.humidity}% </p>
        <p>Pressure: ${data.main.pressure} hPa </p>
        <p class='m-0'>Wind speed: ${data.wind.speed} m/s</p>
    </div>
</div>`
}

let map;
let marker;

async function initMap(lat = 51.1801, lng = 71.446) {
    const { Map } = await google.maps.importLibrary("maps");
    const center = { lat: lat, lng: lng };
    const map = new Map(document.getElementById("map"), {
        zoom: 8,
        center: center,
    });

    var t = new Date().getTime();
    var waqiMapOverlay = new google.maps.ImageMapType({
        getTileUrl: function (coord, zoom) {
            return 'https://tiles.aqicn.org/tiles/usepa-aqi/' + zoom + "/" + coord.x + "/" + coord.y + ".png?token=3b0a3e5e2447ea458e976957fc1d1f92ff51690a";
        },
        name: "Air  Quality",
    });

    map.overlayMapTypes.insertAt(0, waqiMapOverlay);
}

initMap()