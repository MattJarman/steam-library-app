const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', checkAuthenticated, function(req, res) {
    if(req.session)
        req.session.redirect = req.originalUrl;

    res.render('profile', { user: req.user});
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    if(req.session)
        req.session.redirect = req.originalUrl;
        
    res.render('profile');
}

module.exports = router;