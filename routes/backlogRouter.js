const express = require('express');
const path = require('path');
const router = express.Router();
const User = require('../modules/user');

router.get('/', checkAuthenticated, async (req, res) => {
    if(req.session) {
        req.session.redirect = req.originalUrl;
    }
    
    let user = new User(req.user._id);
    let backlog = await user.getBacklog();

    if(backlog) {
        res.render('backlog', {
           'backlog': backlog,
           'user': req.user 
        });

        return;
    }

    res.render('backlog', {
        'user': req.user 
     });
});

router.post('/add-games', checkAuthenticated, async (req, res) => {
    let user = new User(req.user._id);
    let inserted = await user.addGamesToBacklog(req.body.game);

    res.redirect('/backlog');
});

router.post('/remove-games', checkAuthenticated, async (req, res) => {
    let toDelete = req.body.toDelete;

    if(toDelete) {
        let user = new User(req.user._id);
        let response = await user.deleteGamesFromBacklog(toDelete);

        res.end(JSON.stringify(response));
    }
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if(req.session)
        req.session.redirect = req.originalUrl;

    res.render('backlog');
}

module.exports = router;
