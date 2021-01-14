var express = require('express');
var Doctor = require('../models/doctor');
var mdAuthentication = require('../middlewares/authentication');
const hospital = require('../models/hospital');

var app = express();

// ===========================================================
// == DOCTORS GET
// ===========================================================
app.get('/', (req, res) => {
    var offset = Number(req.query.offset) || 0;

    Doctor.find({})
        .skip(offset)
        .limit(5)
        .populate('user', 'name email')
        .populate('hospital')
        .exec((err, doctors) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: Failed to retrieve doctors',
                    errors: err
                });
            }

            Doctor.countDocuments({}, (err, count) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        message: 'DB Error: Couldn\'t count doctors',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    cant: count,
                    doctors: doctors
                });
            });
        }
    );
});

// ===========================================================
// == DOCTOR POST
// ===========================================================
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save( (err, savedDoctor) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to create doctor',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            doctor: savedDoctor
        });
    });
});

// ===========================================================
// == DOCTOR PUT
// ===========================================================
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    var body;

    Doctor.findById(id, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Error while looking for doctor',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to find doctor with id: ' + id,
                errors: { message: 'Non existent doctor' }
            });
        }

        body = req.body;

        if (body.name) {doctor.name = body.name;}

        if (body.hospital) {doctor.hospital = body.hospital;}

        doctor.user = req.user._id;

        doctor.save( (err, savedDoctor) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to update doctor',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                doctor: savedDoctor
            });
        });
    });
});

// ===========================================================
// == DOCTOR DELETE
// ===========================================================
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;

    Doctor.findOneAndRemove(id, (err, deletedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'DB Error: Failed to delete doctor',
                errors: err
            });
        }

        if (!deletedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'DB Error: Failed to delete doctor with id: ' + id,
                errors: { message: 'Non existent doctor' }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: deletedDoctor
        });
    });
});

module.exports = app;