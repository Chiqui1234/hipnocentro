const helpers = {};

helpers.createClass = async function(user, event) { // Recibe un usuario y evento. Devuelve un objeto listo para pushear a user.classes[]
    if(event) {
        let result = {
            category: event.category,
            location: event.location,
            dateAndTime: event.dateAndTime,
            paymentMethod: user.paymentMethod,
            paymentDate: user.paymentDate?user.paymentDate:'',
            isVirtual: event.isVirtual,
            couponCode: user.couponCode,
            couponCodeSec: user.couponCodeSec,
            couponPartner: user.couponPartner,
            payout: user.payout,
            TOS: true,
            // notified (TRUE|FALSE) se updatea al enviar e-mail de notificación
        };
        return result;
    } else
        return false;
}

module.exports = helpers;