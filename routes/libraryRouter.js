const express = require('express');
const request = require('request');
// const async = require('async');
const bodyParser = require('body-parser');
const router = express.Router({strict: true});
const SteamAPI = require('../modules/steamAPI');

const User = require('../models/user');
const Game = require('../models/game');

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const BASE_IMG_URL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/';
const HTTP_OK = 200;

router.use('/', express.static('public'));
router.use(bodyParser.json());

const api = new SteamAPI(STEAM_API_KEY);

/**
 * Authenticate user
 */
router.get('/', checkAuthenticated, (req, res) => {
    if(req.session) {
        req.session.redirect = req.originalUrl;
    }

    res.redirect('/library/' + req.user.steamid);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;

    if(req.session) {
        req.session.redirect = req.originalUrl;
    }

    let games = [];

    // Load games from session if they exist
    if(req.session.games && id == req.user.steamid) {
        games = req.session.games;

        res.render('library', {
            'games': games,
            'user': req.user
        });

        return;
    } 

    let response = await api.getUserGames(id, true, true);

    if(response.status == HTTP_OK) {
        games = mapGameData(games.payload);
        req.session.games = games;

        res.render('library', {
            'games': games,
            'user': req.user
        });

        return;
    }

    res.render('library', {
        'user': req.user
    });
});

function mapGameData(data) {
    let gameData = Object.keys(data);
    let games = [];

    for(let i = 0; i < gameData.length; i++) {
        let imgURL = BASE_IMG_URL
        + gameData[i].appid 
        + '/'
        + gameData[i].img_logo_url
        + '.jpg';

        games.push({
            'appid': gameData[i].appid,
            'name': gameData[i].name,
            'playtime': gameData[i].playtime_forever,
            'imgURL': imgURL
        });
    }
    
    return games;
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if(req.session) {
        req.session.redirect = req.originalUrl;
    }

    res.render('library');
}

module.exports = router;