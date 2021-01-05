var express = require('express');

var app = express();

var User = require('../models/user');

app.get('/', (req, res, next) => {
    User.find({/* where to execute query */}, 'name email img role' /* Fields to retrieve */)
        .exec( (err, users) => { // We could avoid using exec, but will need it later
        if (err){
            return res.status(500).json({
                ok: false,
                msg: 'DB Error: Couldn\'t retrieve users',
                errors: err
            })
        }
        res.status(200).json({
            ok: true,
            users: users
        });
    });
});

module.exports = app;