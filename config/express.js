const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const connectMongo = require('connect-mongo')(session);
const logger = require('morgan');
const pug = require('pug');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Router Setup
const backlog = require('../controllers/backlog.js');
const library = require('../controllers/library.js');
const profile = require('../controllers/profile.js');
const auth = require('../controllers/auth.js');
const api = require('../controllers/api.js');

module.exports = function (app, passport) {
    app.use(session({
        secret: 'GNJhqm2NZmmd3X5il50z2xc2SW3YagGi',
        name: 'session',
        resave: true,
        saveUninitialized: false,
        store: new connectMongo({ url: MONGODB_URI, collection: 'sessions'}),
        cookie: { maxAge: 120 * 60 * 1000 }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static(__dirname + '/../../public'));
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Provide views folder and set view engine
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'pug');

    // Serve files to client
    app.use('/', express.static('public'));

    // Use routers
    app.use('/library', library);
    app.use('/backlog', backlog);
    app.use('/profile', profile);
    app.use('/auth', auth);
    app.use('/api', api);
    app.use(logger('dev'));

    app.get('/', function (req, res) {
        res.redirect('backlog');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
}