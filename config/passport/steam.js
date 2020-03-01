const SteamStrategy = require('passport-steam').Strategy;
const User = require('../../models/user');
require('dotenv').config();
const STEAM_API_KEY = process.env.STEAM_API_KEY;

module.exports = new SteamStrategy(
    {
        returnURL: 'http://localhost:8080/auth/steam/return',
        realm: 'http://localhost:8080/',
        apiKey: STEAM_API_KEY
    },
    (identifier, profile, done) => {
        // asynchronous verification, for effect...
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