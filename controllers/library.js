const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router({ strict: true });
const SteamAPI = require('../modules/steam');

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
    if (req.session) {
        req.session.redirect = req.originalUrl;
    }

    res.redirect('/library/' + req.user.steamid);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;

    // if(req.session) {
    //     req.session.redirect = req.originalUrl;
    // }

    let games = [];

    // Load games from session if they exist
    if (req.session.games && id == req.user.steamid) {
        games = req.session.games;

        res.render('library', {
            'games': games,
            'user': req.user
        });

        return;
    }

    let response = await api.getUserGames(id, true, true);

    if (response.status == HTTP_OK) {
        games = mapGameData(response.payload.games);
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
    let gameData = data;
    let games = [];


    for (let i = 0; i < gameData.length; i++) {
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

    return sortGames(games);
}

// Need to put this function into a helper class
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if (req.session) {
        req.session.redirect = req.originalUrl;
    }

    res.render('library');
}

function sortGames(games) {
    return games.sort((a, b) => {
        if (a.playtime < b.playtime)
            return 1;

        if (a.playtime > b.playtime)
            return -1

        return 0;
    });
}

module.exports = router;