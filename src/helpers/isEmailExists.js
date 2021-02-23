const   helpers = {};
const   emailValidator = require('email-validator'),
        User = require('../models/user');

helpers.isEmailExists = async function (email) {
    if(emailValidator.validate(email)) return email;
    return false;
}    

module.exports = helpers;