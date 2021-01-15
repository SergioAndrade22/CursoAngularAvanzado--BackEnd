var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var User = require('../models/user');

// Google
var {OAuth2Client, UserRefreshClient} = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
var client = new OAuth2Client(CLIENT_ID);

var app = express();

// ===========================================================
// == Google Authentication via post
// ===========================================================
app.post('/google', async (req, res) => {
    var token  = req.body.token;

    var googleUser = await verify(token).catch( err => {
        return res.status(403).json({
            ok: false,
            message: 'Failed to log in, invalid token',
            errors: err
        });
    });

    User.findOne( { email: googleUser.email }, (err, dbUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'DB Error: failure while looking for user',
                errors: err
            });
        }

        if (user){
            if (dbUser.google === false){
                return res.status(400).json({
                    ok: false,
                    message: 'Not registered with Google',
                    errors: { message: 'Wrong authentication' }
                });
            } else {
                var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) // expires in 4 hours

                res.status(200).json({
                    ok: true,
                    message: 'Logged in successfully',
                    user: dbUser,
                    token: token,
                    id: dbUser.id
                });
            }
        } else {
            var user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = '';

            user.save( (err, savedUser) => {
                if (err){
                    return res.status(400).json({
                        ok: false,
                        message: 'DB Error: Failed to create user',
                        errors: err
                    });
                }
                var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) // expires in 4 hours

                res.status(200).json({
                    ok: true,
                    message: 'Logged in successfully',
                    user: savedUser,
                    token: token,
                    id: savedUser.id
                });
            });
        }
    });

    return res.status(200).json({
        ok: true,
        message: 'Logged in successfully',
        googleUser: googleUser
    });
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
// ===========================================================
// == Normal Authentication
// ===========================================================
app.post('/', (req, res) => {
    var body = req.body;

    var encryptedPass = bcryptjs.hashSync(body.password, 10);

    User.findOne({email: body.email}, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'DB Error: failure while looking for user',
                errors: err
            });
        }

        if (!user){
            return res.status(400).json({
                ok: false,
                message: 'Login Error: no user with email ' + body.email,
                errors: { message: 'Non existent user' }
            });
        }

        if(!bcryptjs.compareSync(body.password, user.password) ){
            return res.status(400).json({
                ok: false,
                message: 'Login Error: Wrong password',
                errors: { message: 'Wrong password' }
            });
        }

        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }) // expires in 4 hours

        res.status(200).json({
            ok: true,
            message: 'Logged in successfully',
            user: user,
            token: token,
            id: user.id
        });

    });

});

module.exports = app;