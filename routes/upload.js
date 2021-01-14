var express = require('express');
var formidable = require('formidable');
var path = require('path')
var fs = require('fs');

var app = express();

var User = require('../models/user');
var Doctor = require('../models/doctor');
var Hospital = require('../models/hospital');

app.put('/:collection/:id', (req, res, next) => {
    var collection = req.params.collection;
    var id = req.params.id;

    var validCollections = ['hospitals', 'doctors', 'users'];

    if (!validCollections.includes(collection)){
        return res.status(400).json({
            ok: false,
            message: 'Not a valid collection',
            error: {
                message: 'Collection missmatch'
            }
        });
    }

    var form = formidable({
        multiples: true
    });

    form.uploadDir = path.dirname(__dirname) + '/uploads';
    form.parse(req, (err, fields, files) => {
        if(err){
            return res.status(400).json({
                ok: false,
                message: 'No file was selected',
                error: {
                    message: 'File missing'
                }
            });
        }

        var file = files.img;
        var aux = file.name.split('.');
        var extension = aux[aux.length - 1]
        var validExtensions = ['png', 'gif', 'jpg', 'jpeg']

        if (!validExtensions.includes(extension)){    
            return res.status(400).json({
                ok: false,
                message: 'This file extension is not supported',
                errors: {
                    message: 'Invalid Extension'
                }
            });
        }

        var fileName = `${id}-${ new Date().getMilliseconds() }.${extension}`;

        var basePath = `${form.uploadDir}/${collection}`;

        var destination = `${basePath}/${fileName}`;

        loadByCollection(collection, id, fileName, basePath, res);

        fs.rename(file.path, destination, (err) => { 
            if (err) { 
                return res.status(500).json({
                    ok: false,
                    message: 'Unexpected error while loading file, contact admin',
                    errors: err
                }); 
            }
        });
    });
});

function loadByCollection(collection, id, fileName, basePath, res){
    if (collection === 'users'){
        User.findById(id, (err, user) => {
            if (err){
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: failed to look for user',
                    errors: {
                        message: 'Internal DB error'
                    }
                })
            }

            if(!user){
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to find user with id: ' + id,
                    errors: { message: 'Non existent user' }
                });
            }

            if (user.img){
                var oldPath = `${basePath}/${user.img}`;

                if ( fs.existsSync(oldPath) ){
                    fs.unlinkSync(oldPath);
                }
            }

            user.img = fileName;
    
            user.save((err, updatedUser) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        message: 'Failed to updated image',
                        errors: {
                            message: 'Internal DB error'
                        }
                    })
                }
                
                updatedUser.password = '';

                return res.status(200).json({
                    ok: true,
                    message: 'Image updated correctly',
                    user: updatedUser
                });
            });
        });
    }
    if (collection === 'doctors'){
        Doctor.findById(id, (err, doctor) => {
            if (err){
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: failed to look for doctor',
                    errors: {
                        message: 'Internal DB error'
                    }
                })
            }

            if(!doctor){
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to find doctor with id: ' + id,
                    errors: { message: 'Non existent doctor' }
                });
            }

            if(doctor.img){
                var oldPath = `${basePath}/${doctor.img}`;

                if ( fs.existsSync(oldPath) ){
                    fs.unlinkSync(oldPath);
                }
            }

            doctor.img = fileName;
    
            doctor.save((err, updatedDoctor) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        message: 'Failed to updated image',
                        errors: {
                            message: 'Internal DB error'
                        }
                    })
                }
                
                updatedDoctor.password = '';

                return res.status(200).json({
                    ok: true,
                    message: 'Image updated correctly',
                    doctor: updatedDoctor
                });
            });
        });
    }
    if (collection === 'hospitals'){
        Hospital.findById(id, (err, hospital) => {
            if (err){
                return res.status(500).json({
                    ok: false,
                    message: 'DB Error: failed to look for hospital',
                    errors: {
                        message: 'Internal DB error'
                    }
                })
            }

            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    message: 'DB Error: Failed to find hospital with id: ' + id,
                    errors: { message: 'Non existent hospital' }
                });
            }

            if (hospital.img) {
                var oldPath = `${basePath}/${hospital.img}`;

                if ( fs.existsSync(oldPath) ){
                    fs.unlinkSync(oldPath);
                }
            }

            hospital.img = fileName;
    
            hospital.save((err, updatedHospital) => {
                if (err){
                    return res.status(500).json({
                        ok: false,
                        message: 'Failed to updated image',
                        errors: {
                            message: 'Internal DB error'
                        }
                    })
                }
                
                return res.status(200).json({
                    ok: true,
                    message: 'Image updated correctly',
                    hospital: updatedHospital
                });
            });
        });
    }
}

module.exports = app;