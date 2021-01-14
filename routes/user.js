var express = require('express');
var bcryptjs = require('bcryptjs');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var User = require('../models/user');

// ===========================================================
// == GET ALL USERS
// ===========================================================
app.get('/', (req, res) => {
    var offset = Number(req.query.offset) || 0;

    User.find({/* where to execute query */}, 'name email img role' /* Fields to retrieve */)
        .skip(offset)
        .limit(5)
        .exec( (err, users) => { // We could avoid using exec, but will need it later
        if (err){
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Couldn\'t retrieve users',
                errors: err
            });
        }

        User.countDocuments({}, (err, count)=>{
            if (err){
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: Couldn\'t count users',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                cant: count,
                users: users
            });
        });
    });
});

// ===========================================================
// == POST A NEW USER
// ===========================================================
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: bcryptjs.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save( (err, savedUser) => {
        if (err){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to create user',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: savedUser,
            caller: req.user
        });
    });
});

// ===========================================================
// == UPDATE USER
// ===========================================================
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    var body;

    User.findById(id, (err, user) => {
        if (err){
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Error while looking for users',
                errors: err
            });
        }
        if (!user){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to find user with id: ' + id,
                errors: { message: 'Non existent user' }
            });
        }

        body = req.body;

        user.name = body.name;
        user.email = body.email;

        user.save( (err, savedUser) => {
            if (err){
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to update user',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                user: savedUser
            });
        });
    });
});

// ===========================================================
// == DELETE USER
// ===========================================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;

    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err){
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Failed to delete user',
                errors: err
            });
        }

        if (!deletedUser){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to find user with id: ' + id,
                errors: { message: 'No such user in the database'}
            });
        }

        res.status(200).json({
            ok: true,
            user: deletedUser
        })
    });
})

module.exports = app;