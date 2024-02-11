document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    console.log(city)

    if (city) {
        await fetch('/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: city
            })
        })
            .then(res => {
                location.replace(res.url)
            })
            .catch(error => console.log(error))
    }
});

let map;
let marker;

async function initMap(lat = 51.1801, lng = 71.446) {
    lat = parseFloat(document.getElementById('lat').textContent)
    lng = parseFloat(document.getElementById('lon').textContent)

    const { Map } = await google.maps.importLibrary("maps");
    const center = { lat: lat, lng: lng };
    const map = new Map(document.getElementById("map"), {
        zoom: 8,
        center: center,
    });

    const marker = new google.maps.Marker({
        position: center,
        map: map,
    });
}

initMap()