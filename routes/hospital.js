var express = require('express');
var Hospital = require('../models/hospital');
var mdAuthentication = require('../middlewares/authentication');

var app = express();

// ===========================================================
// == HOSPITAL GET
// ===========================================================
app.get('/', (req, res) => {
    var offset = Number(req.query.offset) || 0;

    Hospital.find({})
        .skip(offset)
        .limit(5)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err){
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: Failed to retrieve hospitals',
                    errors: err
                });
            }

            Hospital.countDocuments({}, (err, count) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        message: 'DB Error: Couldn\'t count hospitals',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    cant: count,
                    hospitals: hospitals 
                });
            });
        }
    );
});

// ===========================================================
// == HOSPITAL POST
// ===========================================================
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, savedHospital) => {
        if (err){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to create hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: savedHospital
        })
    });
});

// ===========================================================
// == HOSPITAL UPDATE
// ===========================================================
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    var body;

    Hospital.findById(id, (err, hospital) => {
        if (err){
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Error while looking for hospitals',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to find hospital with id: ' + id,
                errors: { message: 'Non existent hospital' }
            });
        }

        body = req.body;

        if (body.name) hospital.name = body.name;
        
        hospital.user = req.user._id;

        hospital.save( (err, savedHospital ) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to update hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: savedHospital
            });
        });
    });
});

// ===========================================================
// == HOSPITAL DELETE
// ===========================================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;

    Hospital.findOneAndRemove(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'DB Error: failed to delete hospital',
                errors: err
            });
        }

        if(!deletedHospital){
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to delete hospital with id: ' + id,
                errors: { message: 'Non existent hospital' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: deletedHospital
        })
    });
});

module.exports = app;