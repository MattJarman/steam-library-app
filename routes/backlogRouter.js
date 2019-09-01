const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', function(req, res) {
    if(req.session)
        req.session.redirect = req.originalUrl;
        
    res.render('backlog', { user: req.user});
});

module.exports = router;