const mongoose = require('mongoose')

const weatherSchema = new mongoose.Schema({
    userId: String,
    city: String,
    countryCode: String,
    description: String,
    image: String,
    temperature: Number,
    feels_like: Number,
    lat: Number,
    lon: Number,
    humidity: Number,
    pressure: Number,
    wind_speed: Number,
    flag: String,
}, {timestamps: true})

const Weather = mongoose.model("Weather", weatherSchema);

module.exports = Weather;