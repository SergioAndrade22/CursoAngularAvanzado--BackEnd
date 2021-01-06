var express = require('express');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

app.post('/', (req, res) => {
    var body = req.body;

    var encryptedPass = bcryptjs.hashSync(body.password, 10);

    User.findOne({email: body.email}, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'DB Error: failure while looking for user',
                errors: err
            });
        }

        if (!user){
            return res.status(400).json({
                ok: false,
                msg: 'Login Error: no user with email ' + body.email,
                errors: { message: 'Non existent user' }
            });
        }

        if(!bcryptjs.compareSync(body.password, user.password) ){
            return res.status(400).json({
                ok: false,
                msg: 'Login Error: Wrong password',
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