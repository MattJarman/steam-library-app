const express = require('express');
const path = require('path');
const router = express.Router();

const Game = require('../models/game');

router.get('/search', function(req, res) {
    Game.find({ name : { '$regex': req.query.app, '$options': 'i' }, type: 'game' })
    .select('name appid')
    .sort({ _id : 1 })
    .limit(10)
    .exec(function(err, games) {
        res.send(games);
    });
});

module.exports = router;