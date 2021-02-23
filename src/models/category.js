const mongoose = require('mongoose');              //
const Schema = mongoose.Schema;

const CategorySch = new Schema({
    slug: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('category', CategorySch);