const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.error('Password comparison error:', err);
                            return done(err);
                        }
                        if (isMatch) {
                            // Update last login
                            user.lastLogin = new Date();
                            user.save().then(() => {
                                return done(null, user);
                            }).catch(saveErr => {
                                console.error('Error updating last login:', saveErr);
                                return done(null, user); // Still log in even if lastLogin update fails
                            });
                        } else {
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err));
    });
};
