var mongoose = require('mongoose');

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
        default: 'USER_ROLE'
    }
});

module.exports = mongoose.model('User', userSchema)