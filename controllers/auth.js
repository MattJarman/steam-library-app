const express = require('express');
const passport = require('passport');
const router = express.Router({ strict: true });

router.get('/steam',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    });

router.get('/steam/return',
    // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail 
    (req, res, next) => {
        next();
    },
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        var redirectUrl = req.session.redirect || '/';
        delete req.session.redirect;

        res.redirect(redirectUrl);
    });

module.exports = router;