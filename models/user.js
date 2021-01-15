var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var validRoles = {
    values: [ 'ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido.'
}

var userSchema = mongoose.Schema({ // se deben especificiar los campos para el schema
    name: { 
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'Debe ingresar una contraseña']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE',
        enum: validRoles
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(uniqueValidator, {message: 'Ya se encuentra un usuario registrado con este {PATH}.'});

module.exports = mongoose.model('User', userSchema)