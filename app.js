/**
 * TO DO:
 * - Create a backlog page
 * - Add achievement support
 * - Add howlongtobeat integration
 * - Add OpenCritic integration
 * - Choose random game that hasn't been played in a while
 * - Add dropdown on user name hover
 */

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT;

const app = express();

require('./config/passport')(passport);
require('./config/express')(app, passport);

function listen() {
    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}.`);
    });
}

function connect() {
    mongoose.connect(MONGODB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
    });

    let db = mongoose.connection;

    db.once('open', () => {
        console.log('Connected to database.');
        listen();
    });
}

connect();