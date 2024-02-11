const mongoose = require('mongoose')

let newsSchema = new mongoose.Schema({
    city: String,
    articles: [{
        title: String,
        description: String,
        author: String,
        source: String,
        url: String,
        publishedAt: Date,
    }],
}, {timestamps: true})

const News = mongoose.model("News", newsSchema);

module.exports = News;