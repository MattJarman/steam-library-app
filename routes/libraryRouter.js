const express = require('express');
const request = require('request');
// const async = require('async');
const bodyParser = require('body-parser');
const router = express.Router({strict: true});

const User = require('../models/User');
const Game = require('../models/Game');
const Blacklist = require('../models/Blacklist');

const steam_api_key = process.env.STEAM_API_KEY;

router.use('/', express.static('public'));
router.use(bodyParser.json())

/**
 * If the user is authenticated, redirect to their steam library
 */
router.get('/', checkAuthenticated, function(req, res) {
    if(req.session)
        req.session.redirect = req.originalUrl;

    res.redirect('/library/' + req.user.steamid);
});

router.get('/:id', async function(req, res) {
    const id = req.params.id;

    if(req.session)
        req.session.redirect = req.originalUrl;

    var games;

    // Load games from session if they exist
    if(req.session.games) {
        games = req.session.games;
    } else {
        games = await getUserGames(id);
        req.session.games = games;
    }
    
    if(games !== null) {
        res.render('library', {
            games: games,
            user: req.user
        });
    } else {
        res.render('library', {
            user: req.user
        });
    }
});

async function getUserGames(steamid) {
    var games = [];
    // Make a request to steam api to grab information
    // Create steam api url for all games in user library
    var url = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=' + steam_api_key 
        + '&steamid=' + steamid + '&include_appinfo=1&include_played_free_games=1';
    
    return new Promise(function(resolve, reject) {
        // Access steam api data using url
        request.get(url,  function(err, steamRes, data) {

            if(err) reject(err);

            // Check if user exists
            // Need to check for when an empty object is returned
            if(steamRes.statusCode !== 500) {
                // Parse the data
                const obj = JSON.parse(data);

                // Check if any games were returned
                if(obj.response.games !== null && obj.response.games !== undefined) { 
                    
                    var userGames = obj.response.games;

                    // Create array of appids
                    var apps = [];

                    for(var i = 0; i < userGames.length; i++) {
                        if(userGames[i].type === "DLC") {
                            continue;
                        }

                        // Create game image url
                        var imgURL = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/' 
                            + userGames[i].appid 
                            + '/'
                            + userGames[i].img_logo_url
                            + '.jpg';

                        games.push({
                            gameInfo: userGames[i].appid,
                            name: userGames[i].name,
                            appid: userGames[i].appid,
                            playtime: userGames[i].playtime_forever,
                            imgURL: imgURL
                        });

                        // Used for querying database
                        apps.push(userGames[i].appid);
                    }

                    var index, appid;

                    Game.find({ '_id': { $in: apps } })
                    .exec(function(err, docs) {
                        for(var i = 0; i < docs.length; i++) {
                            appid = docs[i]._id;

                            index = games.findIndex(i => i.appid === appid);

                            if(index > -1)
                                games[index].gameInfo = docs[i];
                        }

                        // Sort games by playtime
                        games.sort(compare);

                        resolve(games);
                    });
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }

    if(req.session)
        req.session.redirect = req.originalUrl;

    res.render('library');
}

/**
 * Compare function
 * @param {*} a 
 * @param {*} b 
 */
function compare(a, b) {
    if(a.playtime < b.playtime)
        return 1;
    if(a.playtime > b.playtime)
        return -1;
    return 0
}

module.exports = router;