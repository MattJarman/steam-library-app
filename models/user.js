const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create user schema (will be used later for registering accounts)
const userSchema = new Schema({
    steamid: String,
    username: String,
    profileUrl: String,
    avatarMedium: String,
    avatarFull: String,
    backlog: [
        { type: Number, ref: 'Game' }
    ],
    completed: [
        { type: Number, ref: 'Game' }
    ],
    updated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;