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
const path = require('path');
const pug = require('pug');
const logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const SteamStrategy = require('passport-steam').Strategy;
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const steam_api_key = process.env.STEAM_API_KEY;

// Database setup
mongoose.connect(MONGODB_URI, {
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

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: 'http://localhost:8080/auth/steam/return',
    realm: 'http://localhost:8080/',
    apiKey: steam_api_key
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// Init app
const app = express();

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
// Need to change this
app.use(session({
    secret: 'GNJhqm2NZmmd3X5il50z2xc2SW3YagGi',
    name: 'session',
    resave: true,
    saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));

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
app.use(logger('dev'));

app.get('/', function(req, res) {
    res.render('backlog', { user: req.user});
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
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}
