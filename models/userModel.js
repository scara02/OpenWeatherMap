const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({ 
    username: {type: String, maxLength: 50, minLength: 2, required: true},
    password: {type: String, minLength: 2, required: true},
    isAdmin: {type: Boolean},
}, {timestamps: true})

const User = mongoose.model("Users", userSchema);

module.exports = User;