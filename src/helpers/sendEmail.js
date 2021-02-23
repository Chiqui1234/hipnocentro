const   helpers = {};
const   nodeMailer = require('nodemailer'),
        Error = require('../models/error'),
        User = require('../models/user');
// Envía un email cuándo el usuario compra bitcoin

helpers.sendEmail = async function(receiver, subject, message) {
    console.log(`sendEmail() has receiver: ${receiver}`);
    console.log(`Auth: ${process.env.HIPNOCENTRO_NO_REPLY_EMAIL_DIR}, ${process.env.HIPNOCENTRO_NO_REPLY_EMAIL_PASS}.`);
    if(receiver.search('@') == -1)
        return false;
    let transporter = nodeMailer.createTransport({
        host: 'mail.hipnocentro.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.HIPNOCENTRO_NO_REPLY_EMAIL_DIR,
            pass: process.env.HIPNOCENTRO_NO_REPLY_EMAIL_PASS
        }
    });
    let data = {
        from: process.env.HIPNOCENTRO_NO_REPLY_EMAIL_DIR,
        to: receiver,
        subject: subject != ''?subject:'Email de Hipnocentro',
        html: message
    };
    try { // hotfix un poco chungo
    transporter.sendMail(data, async (err, res) => {
        if(err) {
            console.log('La cuenta', receiver, 'no ha recibido su email. Asunto:', subject, '\n', err);
            let error = new Error({
                name: 'nodemailer',
                text:  `La cuenta ${receiver} no ha recibido su email de asunto "${subject}". ${err}`
            });
            await error.save();
            const user = await User.findOne({email: receiver});
            console.log(`${user.email} tuvo un error al enviarle un email:
            ${err}`);
            user.classes[user.classes.length-1].notified = false;
            await user.save();
            return false;
        } else {
            console.log('E-mail enviado a', receiver);
            return true;
        }
    });
    return true;
    }
    catch(err) { // hotfix un poco chungo
        return false;
    }
}

module.exports = helpers;