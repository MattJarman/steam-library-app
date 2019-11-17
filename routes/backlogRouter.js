const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../models/user');

router.get('/', checkAuthenticated, function(req, res) {
    if(req.session)
        req.session.redirect = req.originalUrl;
    
    // Get user's backlog from db;

    User.findById(req.user._id)
    .populate('backlog')
    .exec(function(err, user) {
        if(err) console.error(err);

        if(user) {
            res.render('backlog', { 
                backlog: user.backlog,
                user: req.user 
            });
        } else {
            res.render('backlog', {
                user: req.user
            });
        }
    });
        
    
});

router.post('/add-games', checkAuthenticated, function(req, res) {
    var games = Array.isArray(req.body.game) ? req.body.game : [req.body.game]

    var query = { _id: req.user._id };
    var update = { $addToSet: { 'backlog': { $each: games } } };

    User.findOneAndUpdate(query, update, { upsert: true })
    .exec(function(err, user) {
        if(err) console.log(err);
        res.redirect('/backlog');
    });
});


router.post('/remove-games', checkAuthenticated, function(req, res) {
    var toDelete = req.body.toDelete;

    var query = { _id: req.user._id };
    var update = { $pull: { 'backlog': { $in: toDelete } } }

    if(toDelete) {
        User.findOneAndUpdate(query, update, { upsert: true })
        .exec(function(err, user) {
            if(err) console.log(err);

            let response = {
                status  : 200,
                success : 'Games successfully deleted'
            }

            res.end(JSON.stringify(response));
        });
    }
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if(req.session)
        req.session.redirect = req.originalUrl;

    res.render('backlog');
}

module.exports = router;
