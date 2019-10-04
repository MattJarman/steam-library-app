const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const passport = require('passport');
const router = express.Router({strict: true});
const session = require('express-session');

const User = require('../models/User');
const Game = require('../models/Game');

router.get('/steam',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function(req, res) {
        res.redirect('/');  
    });


router.get('/steam/return',
    // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
    function(req, res, next) {
        next();
    }, 
    passport.authenticate('steam', { failureRedirect: '/' }),
    function(req, res) {
        var redirectUrl = req.session.redirect || '/';
        delete req.session.redirect;

        res.redirect(redirectUrl);
    });
  
module.exports = router;