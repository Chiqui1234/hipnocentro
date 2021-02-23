const helpers = {};
const User = require('../models/user');

helpers.isAdmin = async (req, res, next) => {
    const userId = req.session.passport.user;
    const user = await User.findById({_id: userId});
    // user.rol=3;
    // user.save();
    if(user.rol == 3)
        next();
    else 
        res.redirect('/');
}

module.exports = helpers;