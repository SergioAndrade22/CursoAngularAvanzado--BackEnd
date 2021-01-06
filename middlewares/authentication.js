var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ===========================================================
// == VERIFY TOKEN
// ===========================================================
exports.verifyToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err){
            return res.status(401).json({
                ok: false,
                msg: 'Required autenthication',
                errors: err
            });
        }

        req.user = decoded.user;

        next();
    })
}