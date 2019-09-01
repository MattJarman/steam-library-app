const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create user schema (will be used later for registering accounts)
const blacklistSchema = new Schema({
    _id: Number
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

module.exports = Blacklist;