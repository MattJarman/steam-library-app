const express = require('express');
const router = express.Router();
const User = require('../modules/user');

router.get('/', checkAuthenticated, async (req, res) => {
    if (req.session) {
        req.session.redirect = req.originalUrl;
    }

    let user = new User(req.user._id);
    let backlog = await user.getApps('backlog');
    let completed = await user.getApps('completed');

    res.render('backlog', {
        'backlog': backlog.payload,
        'completed': completed.payload,
        'user': req.user
    });
});

router.post('/add-games', checkAuthenticated, async (req, res) => {
    let user = new User(req.user._id);
    let toInsert = [].concat(req.body.game || []);
    let inserted = await user.addGamesToBacklog(toInsert);

    res.redirect('/backlog');
});

router.post('/remove-games', checkAuthenticated, async (req, res) => {
    let toDelete = req.body.toDelete;

    res.setHeader('content-type', 'text/javascript');

    if (toDelete) {
        let user = new User(req.user._id);
        let response = await user.deleteGames(toDelete);

        res.end(JSON.stringify(response));
    }
});

router.post('/move-games', checkAuthenticated, async (req, res) => {
    let data = req.body

    res.setHeader('content-type', 'text/javascript');

    let user = new User(req.user._id);
    let response = await user.moveGame(data);

    res.end(JSON.stringify(response));
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if (req.session) {
        req.session.redirect = req.originalUrl;
    }

    res.render('backlog');
}

module.exports = router;
