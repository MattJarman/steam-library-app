const User = require('../models/user');
const steam = require('./passport/steam');

module.exports = function(passport) {
    // Passport session setup.
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .exec((err, user) => {
                done(null, user);
            });
    });

    passport.use(steam);
}