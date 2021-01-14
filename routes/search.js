var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

app.get('/collection/:collection/:term', (req, res, next) => {
    var collection = req.params.collection;

    var term = req.params.term;

    var regex = RegExp(term, 'i');

    var func;

    switch (collection) {
        case 'users':
            func = searchUsers;
            break;
        case 'hospitals':
            func = searchHospitals;
            break;
        case 'doctors':
            func = searchDoctors;
            break;
        default:
            return res.status(400).json({
                ok: false,
                message:  `No such collection ${collection} on DB`,
                error: {
                    message: 'Invliad search parameter'
                }
            });
    }

    func(regex).then( response => {
        return res.status(200).json({
            ok: true,
            [collection]: response          // using [collection] evaluates the value of the variable before creating the property
        });
    });
});

app.get('/full/:term', (req, res, next) => {
    var term = req.params.term;

    var regex = new RegExp( term, 'i');

    Promise.all([
        searchHospitals(regex), 
        searchDoctors(regex),
        searchUsers(regex)]
        ).then( responses => {
            res.status(200).json({
                ok: true,
                hospitals: responses[0],
                doctors: responses[1],
                users: responses[2]
            });
        });
});

function searchHospitals (regex) {
    return new Promise( (resolve, reject ) => {
        Hospital.find({name: regex})
            .populate('user', 'name email')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Coldn\'t load hospitals:', err);
                } else{
                    resolve(hospitals);
                }
        });

    });
}

function searchDoctors (regex) {
    return new Promise( (resolve, reject ) => {
        Doctor.find({name: regex})
            .populate('user', 'name email')
            .populate('hospital')
            .exec( (err, doctors) => {
                if (err) {
                    reject('Coldn\'t load doctors:', err);
                } else{
                    resolve(doctors);
                }
        });

    });
}

function searchUsers (regex) {
    return new Promise( (resolve, reject ) => {
        User.find({}, 'name email role')
            .or([{ name: regex }, {email: regex}]).exec( (err, users) => {
            if (err) {
                reject('Coldn\'t load users:', err);
            } else{
                resolve(users);
            } 
        });
    });
}

module.exports = app;