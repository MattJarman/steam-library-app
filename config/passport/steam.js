const SteamStrategy = require('passport-steam').Strategy;
const User = require('../../models/user');
const config = require('../');
const STEAM_API_KEY = config.steam.key;
const RETURN_URL = config.steam.returnURL;
const REALM = config.steam.realm;

module.exports = new SteamStrategy({
        returnURL: RETURN_URL,
        realm: REALM,
        apiKey: STEAM_API_KEY
    },
    (identifier, profile, done) => {
        process.nextTick(() => {
            User.findOne({ steamid: profile.id })
                .exec((err, user) => {
                    if (err) return done(err);

                    if (user) {
                        return done(null, user);
                    }

                    let newUser = new User({
                        steamid: profile.id,
                        username: profile.displayName,
                        profileUrl: profile._json.profileurl,
                        avatarMedium: profile._json.avatarmedium,
                        avatarFull: profile._json.avatarfull
                    });

                    newUser.save((err, newUser) => {
                        if (err) console.log(err);
                        done(null, newUser);
                    });
                });
        });
    }
);