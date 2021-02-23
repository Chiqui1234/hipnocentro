const helpers = {};
const User = require('../models/user'),
{ isUserExists } = require('../helpers/isUserExists'),
{ sendEmail } = require('../helpers/sendEmail');

helpers.registerUser = async function(user, date, welcomeEmail) { // 'welcomeEmail' (true/false) sirve para enviar un email al recién registrado
    const isUser = await isUserExists(user.email);
    // console.log(`isUserExists: ${user}`);
    if(isUser) {
        isUser.isExists = true;
        isUser.registered = false;
        return isUser; // Esto es la v2!
    } else { // Si el usuario no existe, lo creo
        const newUser = new User({
            name: user.name,
            email: user.email, 
            telephone: user.telephone,
            date: date,
            classes: []
        });
        if(user.password1)
            if(user.password1.length > 4)
                newUser.password = await newUser.encryptPassword(password1);
        if(welcomeEmail)
            await sendEmail(email, '¡Bienvenido a Hipnocentro!', welcomeEmail);
        await newUser.save();
        return newUser;
    }
}

module.exports = helpers;