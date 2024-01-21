const express = require('express');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

const apikey = "7a57186bf1039b3afc193c37be9da3f1"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd()));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/weather', (req, response) => {
    const city = req.body.city;
    console.log(city)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;

    https.get(url, (res) => {
        res.on('data', (data) => {
            const weatherData = JSON.parse(data);
            console.log(weatherData);
            response.json(weatherData)
        });
    });
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});
