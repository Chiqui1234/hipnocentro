const mongoose = require('mongoose');              //
const Schema = mongoose.Schema;

const JobSch = new Schema({
    moduleName: { // Nombre del módulo que ejecuta el cron-job
        type: String,
        required: true
    },
    count: { // Veces que se llamó el cron-job
        type: Number,
        required: true
    },
    description: String // Descripción
});

module.exports = mongoose.model('job', JobSch);