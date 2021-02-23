const mongoose = require('mongoose');              //
const Schema = mongoose.Schema;

const ErrorSch = new Schema({
    name: { // Categoría/Nombre del error, por ej: 'email', 'userCreation', etc; ó el módulo/software que falló, ej: 'nodemailer'
        type: String,
        required: true
    },
    text: { // Texto del error
        type: String,
        required: true
    },
    error: { // Si fue un error es TRUE, si fue un aviso/alerta es FALSE
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('error', ErrorSch);