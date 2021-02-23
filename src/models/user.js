const mongoose = require('mongoose');              //
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSch = new Schema({
    nickname:               String,                        // Nombre del usuario
    name: {
        type: String,
        required: true
    },
    email: {
        type:           String,                        // Email del usuario
        required:       true
	    // index: {
	    //     unique: true
	    // }
    },
    telephone: {
        type:           String,
        // required:       true
    },
    password: {
        type:           String,                        // Contraseña del usuario. Puede tener una cuenta sin contraseña. En este caso, sólo podrá usar su email para anotarse a eventos. Nadie (salvo terapeutas y administradores) podrá ver su perfil
        // required:       true
    },
    date: {
        type:           String,
        required:       true
    },
    classes: [{   // Seminario
        category: {    // Tipo de seminario
            type: String,
            required: true
        },
        location: { // Dirección y nombre del lugar
            type: String,
            required: true
        },
        dateAndTime: { // Fecha del seminario
            type: String
            // required: true
        },
        assist: {   // Asistencia al seminario (si|no)
            type: Boolean,
            default: false
        },
        payout: { // El monto que pagó para acceder a la clase
            type: Number,
            default: 0
        },
        paymentMethod: {
            type: String // Si este valor no existe, es porque fue el compañero de un usuario que usaba cupón para dos
        },
        paymentDate: String,
        isVirtual: { // 'presencial': false | 'virtual': true
            type: Boolean,
            required: true,
            default: true
        },
        couponCode: String, // Código del cupón
        couponCodeSec: {
            type: String, // Código de seguridad del cupón
            default: 'Ninguno'
        },
        warranty: { // Si es 'true', se puede usar la garantía
            type: Boolean,
            default: true
        },
        couponCant: Number, // El cupón es válido para una o dos personas
        couponPartner: String, // Si el cupón es para dos personas, ¿quién es el compañero?
        TOS: { // ¿Aceptó la política de privacidad en este evento?
            type: Boolean,
            default: true
        },
        notified: { // ¿El usuario fue notificado de la suscripción a este evento? Puede volverse FALSE si el email no pudo enviarse
            type: Boolean,
            default: true
        }
    }],
    newsletter: { // ¿Está subscripto al newsletter?
        type: Boolean,
        default: false
    },
    rol: { // 1 : cliente, 2 : terapeuta, 3 : administrador
        type: Number,
        default: 1
    }
});

UserSch.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

UserSch.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', UserSch);
