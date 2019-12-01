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
const request = require('request');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const pug = require('pug');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const SteamStrategy = require('passport-steam').Strategy;
const connectMongo = require('connect-mongo')(session);
require('dotenv').config();

const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Database setup
mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true 
});

const db = mongoose.connection;
const Schema = mongoose.Schema;

db.once('open', function() {
    console.log('Connected to database.');
});

// Router Setup
const backlog = require('./routes/backlogRouter.js');
const library = require('./routes/libraryRouter.js');
const profile = require('./routes/profileRouter.js');
const auth = require('./routes/authRouter.js');
const api = require('./routes/apiRouter.js');

// Passport session setup.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id)
    .exec(function(err, user) {
        done(null, user);
    });
});

passport.use(new SteamStrategy({
    returnURL: 'http://localhost:8080/auth/steam/return',
    realm: 'http://localhost:8080/',
    apiKey: STEAM_API_KEY
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
        User.findOne({steamid: profile.id})
            .exec(function(err, user) {
                if(err) console.log(err);
                if(user) {
                    done(null, user);
                } else {
                    new User({ 
                        steamid: profile.id,
                        username: profile.displayName,
                        profileUrl: profile._json.profileurl,
                        avatarMedium: profile._json.avatarmedium,
                        avatarFull: profile._json.avatarfull
                    })
                    .save(function(err, newUser) {
                        done(null, newUser);
                    });
                }
            });
        });
    }
));

// Init app
const app = express();

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(session({
    secret: 'GNJhqm2NZmmd3X5il50z2xc2SW3YagGi',
    name: 'session',
    resave: true,
    saveUninitialized: false,
    store: new connectMongo({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 120 * 60 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

// Provide views folder and set view engine
app.set('views', path.join(__dirname, '/views'));
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

app.get('/', function(req, res) {
    res.redirect('backlog');
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// Don't need this yet
// app.get('/profile', ensureAuthenticated, function(req, res){
//     console.log(req);
//     res.render('profile', { user: req.user });

//   });

// Server setup
const port = 8080;
const server = app.listen(port, function() {
    console.log('Listening on port', port);
});

// Simple route middleware to ensure user is authenticated.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}
