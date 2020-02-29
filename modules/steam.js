const request = require('request');
const User = require('../models/user');

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const OWNED_GAMES_BASE_URL = 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=';

class SteamAPI {

    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    getUserGames(steamId, includeApps = false, includeFree = false) {
        let includeFreeGames = includeFree ? 1 : 0;
        let includeAppInfo = includeApps ? 1 : 0;

        const url = OWNED_GAMES_BASE_URL
            + this.apiKey
            + '&steamid='
            + steamId
            + '&include_appinfo='
            + includeAppInfo
            + '&include_played_free_games='
            + includeFreeGames;

        return new Promise(resolve => {
            request.get(url, (err, res, body) => {
                if (err) console.error(err);

                let data = {};

                try {
                    data = JSON.parse(body);
                } catch (err) {
                    resolve(this.formResponse(
                        {},
                        res.statusCode,
                        res.statusMessage
                    ));
                }

                resolve(this.formResponse(
                    data.response,
                    res.statusCode,
                    res.statusMessage
                ));
            });
        });
    }

    formResponse(payload = null, status = 200, message = null) {
        return {
            'payload': payload,
            'status': status,
            'message': message
        }
    }
}

module.exports = SteamAPI;