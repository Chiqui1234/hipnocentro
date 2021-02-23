const helpers = {};
const User = require('../models/user');

helpers.isTerapist = async (req, res, next) => {
    const userId = req.session.passport.user;
    const user = await User.findById({_id: userId});
    if(user.rol >= 2) // Los administradores pueden ver todo lo que vean los terapeutas
        next();
    else {
        // req.flash('error_msg', 'No tienes permisos para acceder aquí. Debes ser, al menos, un terapeuta.');
        res.redirect('/');
    }
}

module.exports = helpers;