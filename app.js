const express = require('express');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const userModel = require('./models/userModel')
const weatherModel = require('./models/weatherModel')
const newsModel = require('./models/newsModel')

dotenv.config()

const port = process.env.PORT || 3000
const mongoUrl = process.env.MONGO_URL

const app = express();

const apikey = "7a57186bf1039b3afc193c37be9da3f1"
const ONE_HOUR = 60 * 60 * 1000
const expire = new Date(Date.now() + ONE_HOUR);

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: expire,
    },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.render('register');
});

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ username });

        if (existingUser) {
            return res.render('register', { error: 'Username already exists!!!' })
        }

        const newUser = new userModel({
            username,
            password,
            isAdmin: false,
        });

        await newUser.save();

        req.session.username = username
        res.redirect('weather')
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
});

app.get('/login', (req, res) => {
    res.render('login', { user: "User" })
})

app.post('/loginUser', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username: username });

        if (!user || user.password != password) {
            return res.render('login', { user: "User", error: 'Invalid username or password!' });
        }

        req.session.username = username
        res.redirect('weather')
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
})

app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.get('/admin', async (req, res) => {
    return res.render("login", { user: 'Admin' })
})

app.post('/loginAdmin', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username: username });

        if (!user || user.password != password) {
            return res.render('login', { user: "Admin", error: 'Invalid username or password!' });
        } else if (!user.isAdmin) {
            return res.render('login', { user: "Admin", error: 'Not an admin!' });
        }

        req.session.username = username;
        res.redirect('adminPanel');
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message);
    }
});

app.get('/adminPanel', async (req, res) => {
    try {
        const user = req.session.username
        const users = await userModel.find();
        res.render('admin', { username: user, users: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get('/add', async (req, res) => {
    const admin = req.session.username;
    const users = await userModel.find();

    res.render('admin', { error: 'Username already exists!!!', username: admin, users: users });
})

app.post('/add', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)

    try {
        const existingUser = await userModel.findOne({ username });
        const admin = req.session.username;
        const users = await userModel.find();

        if (existingUser) {
            res.render('admin', { error: 'Username already exists!!!', username: admin, users: users });
        } else {
            console.log('adding new user')
            const newUser = new userModel({
                username,
                password,
                isAdmin: false,
            });

            await newUser.save();
            res.redirect('adminPanel');
        }
    } catch (error) {
        res.status(500).json("Internal Server Error");
    }
})

app.post("/update", async (req, res) => {
    const { userId, username, password } = req.body;
    const user = await userModel.findById(userId);
    if (password != "") {
        user.password = password;
    }
    if (username != "") {
        user.username = username;
    }
    const newUser = await user.save();
    res.redirect('adminPanel')
})

app.post("/delete", async (req, res) => {
    const { userId } = req.body
    const username = req.session.username
    const admin = await userModel.findOne({ username })

    try {
        const userIdObj = mongoose.Types.ObjectId(userId);

        if (userIdObj.equals(admin._id)) {
            return res.json("Cannot delete your own account");
        }

        await userModel.findByIdAndDelete(userId);
        res.redirect('adminPanel');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/weather', async (req, res) => {
    const username = req.session.username
    res.render('index', { username: username, data: null })
})

app.get('/weather/:city', async (req, res) => {
    const username = req.session.username
    const city = req.params.city

    let weatherData = await weatherModel.findOne({ city: city })

    res.render('index', { username: username, data: weatherData })
})

app.post('/weather', async (req, res) => {
    const city = capitalize(req.body.city);
    console.log(city)

    const username = req.session.username
    try {
        const user = await userModel.findOne({ username });

        if (!user) {
            res.render('index', { username, data: null });
            return;
        }

        const userId = user._id

        const existingWeatherData = await weatherModel.findOne({
            userId: userId,
            city: city,
            createdAt: { $gte: new Date(Date.now() - ONE_HOUR) },
        });

        if (!existingWeatherData) {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`);
            const weatherData = await response.json();

            let flag = ''
            try {
                let country_info = await fetch('https://restcountries.com/v3.1/alpha/' + weatherData.sys.country);

                if (!country_info.ok) {
                    throw new Error(`Failed to fetch country information. Status: ${country_info.status}`);
                }

                country_info = await country_info.json();

                flag = country_info[0].flags.png
            } catch (error) {
                console.error('Error fetching country information:', error);
            }

            const newWeatherData = new weatherModel({
                userId: user._id,
                city: city,
                countryCode: weatherData.sys.country,
                description: weatherData.weather[0].description,
                image: weatherData.weather[0].icon,
                temperature: Math.round(weatherData.main.temp),
                feels_like: Math.round(weatherData.main.feels_like),
                lat: weatherData.coord.lat,
                lon: weatherData.coord.lon,
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
                wind_speed: weatherData.wind.speed,
                flag: flag,
            });

            await newWeatherData.save();

            return res.redirect(`/weather/${city}`)
        } else {
            res.redirect(`/weather/${city}`)
        }
    } catch (error) {
        console.error('Error fetching user from MongoDB:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/history', async (req, res) => {
    const username = req.session.username;

    try {
        const user = await userModel.findOne({ username });

        if (!user) {
            res.render('history', { username, weatherData: null });
            return;
        }

        const userId = user._id;
        const weatherData = await weatherModel.find({ userId });

        if (!weatherData || weatherData.length === 0) {
            res.render('history', { username, weatherData: null });
        } else {
            res.render('history', { username, weatherData });
        }
    } catch (error) {
        console.error('Error fetching weather data from MongoDB:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/news', async (req, res) => {
    const username = req.session.username
    res.render('news', { username: username, newsData: null })
})

app.get('/news/:city', async (req, res) => {
    const username = req.session.username
    const city = req.params.city

    console.log(city)

    let news = await newsModel.findOne({ city: city })

    res.render('news', { username: username, newsData: news })
})

app.post('/news', async (req, res) => {
    const city = req.body.city
    const userAgent = req.get('user-agent');
    const options = {
        host: 'newsapi.org',
        path: `/v2/top-headlines?q=${city}&apiKey=4f47f53103bf442998b7cd43599e8b11`,
        headers: {
            'User-Agent': userAgent
        }
    };

    const existingNewsData = await newsModel.findOne({
        city: city,
        createdAt: { $gte: new Date(Date.now() - ONE_HOUR) },
    });

    if (!existingNewsData) {
        https.get(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', async () => {
                const newsData = JSON.parse(data);

                try {
                    const newNewsData = new newsModel({
                        city: city,
                        articles: newsData.articles.map(article => ({
                            title: article.title,
                            description: article.description,
                            author: article.author,
                            source: article.source.name,
                            url: article.url,
                            publishedAt: article.publishedAt,
                        })),
                    });

                    newNewsData.save();

                    return res.redirect(`/news/${city}`)
                } catch (error) {
                    console.error('Error saving news data to MongoDB:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            });
        });
    }
    res.redirect(`/news/${city}`)
});

app.listen(port, () => {
    console.log('server is running on port ' + port);
});

mongoose.connect(mongoUrl)
    .then(() => console.log("MongoDB connection established..."))
    .catch((error) => console.error("MongoDB connection failed:", error.message));


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}