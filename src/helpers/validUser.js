const helpers = {};
const emailValidator = require('email-validator');

// Si el nuevo usuario NO tiene sus datos completos o las contraseñas no coinciden, te envío al sign-up de nuevo

helpers.validUser = async (req, res, next) => { // middleware
    const errors = [];
    const { email, password1, password2 } = req.body;
    if(!emailValidator.validate(email))
        errors.push({text: 'Completa el email.'});
    if(password1 == '' || password2 == '' || password1.length < 8 || password2.length < 8)
        errors.push({text: 'Inserta la contraseña, de 8 caracteres o más.'});
    if(password1 != password2)
        errors.push({text: 'Las contraseñas no coinciden.'});
    //
    if(errors.length > 0)
        res.render('user/sign-up', {
            errors,
            email
        });
    else
        next();
}    
module.exports = helpers;