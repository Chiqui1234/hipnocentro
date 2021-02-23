const helpers = {};
const User = require('../models/user');

helpers.itHasPassword = async (req, res, next) => { // middleware
    const email = req.body.email;
    const user = await User.findOne({email: email});
    if(user) {
        if(user.password) {
            next();
        } else {
            // req.flash('error', 'Tu cuenta no tiene contraseña. Estamos trabajando en eso...'); // Próximamente, en este caso iremos a /user/:email/changePassword
            res.redirect('/user/sign-in');
        }
    } else {
        // req.flash('error', 'Este usuario no existe.')
        res.redirect('/user/sign-up');
    }
};

module.exports = helpers;