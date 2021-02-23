const   helpers = {};
const   User = require('../models/user');

helpers.isUserExists = async function (email) {
    const user = await User.findOne({email: email});
    if(user)
        return user;
    return false;
}    

module.exports = helpers;