const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create user schema (will be used later for registering accounts)
const userSchema = new Schema({
    _id: Number,
    backlog: [{
        gameInfo: {type: Number, ref: 'Game'},
        name: String,
        appid: Number,
        playtime: Number,
        imgURL: String
    }],
    updated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;