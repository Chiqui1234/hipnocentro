const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DirectionSch = new Schema({
    province: {
        type: String,
        required: true
    },
    dir: { // La dirección exacta del lugar
        type: String,
    },
    location: { // ¿Es un hotel? ¿una plaza o galería? Si tiene nombre, lo ponemos acá
        type: String,
        required: false
    }
});

module.exports = mongoose.model('direction', DirectionSch);