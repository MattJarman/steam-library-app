/**
 * TO DO:
 * - Move views into public dir
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
const config = require('./config');
const MONGODB_URI = config.db;
const HOST = config.host;
const PORT = config.port;

const app = express();

require('./config/passport')(passport);
require('./config/express')(app, passport);

function listen() {
    app.listen(PORT, () => {
        console.log(`Server running at http://${HOST}:${PORT}/`);
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
    }).catch(error => {
        console.error(error);
    });
}

connect();