const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const EventSch = new Schema({
    category: { // Depende de los registros de la colección 'category'. Ejemplo: 'Adelgazar' o 'Dejar de fumar'
        type: String,
        required: true
    },
    isVirtual: { // 'presencial': false | 'virtual': true
        type: Boolean,
        required: true,
        default: false
    },
    location: { // 'presencial': Dirección y nombre del lugar | 'virtual': Dirección URL
        type: String, // direction.dir + ', ' + direction.province
        required: true
    },
    locationPassword: { // 'virtual': contraseña de la dirección URL (para entrar a la sala)
        type: String,
        default: 'Ninguna' // tanto acá como en 'createEvent' se usa 'Ninguna' por default. Se debe chequear esto si se quiere realizar una función para salas sin contraseña en el futuro. Amén
    },
    dateAndTime: { // fecha + hora, ej: 30-04-2020 12:00
        type: String,
        required: true
    },
    suscribers: {
        type: Number,
        default: 0
    },
    limit: {
        type: Number,
        required: true
    },
    notified: { // ¿Se envió e-mail a los suscriptores al final del seminario?
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('event', EventSch);