const mongoose = require('mongoose');

const uristring = `mongodb://localhost/${process.env.HIPNOCENTRO_DB}`;

console.log('Trying to connect to ' + uristring + '...');

mongoose.connect(uristring, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(db => console.log('Mongoose connected to: ' + uristring))
  .catch(err => console.log('Mongoose can\'t connect with: ' + uristring + '. ' + err));