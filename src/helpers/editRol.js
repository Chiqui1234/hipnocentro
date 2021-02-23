const helpers = {};
const User = require('../models/user');

helpers.editRol = async function(email, rol) {
    let user = await User.findOne({email: email});
    if(user) {
        user.rol = rol;
        await user.save();
    }
    user = await User.findOne({email: email}); // Vuelvo a consultar a la BD, para verificar el cambio de rol
    return user.rol==rol?user:false;
}

module.exports = helpers;