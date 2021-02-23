// Busca y envía un email a los suscriptores apuntados de un seminario finalizado
const   helpers = {};
const   Event = require('../models/event'),
        User = require('../models/user'),
        Error = require('../models/error'),
        { getDate } = require('../helpers/getDate'),
        { setStringDateToObject } = require('../helpers/setStringDateToObject'),
        { sendEmail } = require('../helpers/sendEmail'),
        { finishedEvent } = require('../helpers/finishedEvent');

helpers.sendEmailToEvent = async function() {
    if(process.env.NODE_ENV === 'production') { // Evito enviar e-mails cuándo hago pruebas en mi PC
    const eventsQuantity = Event.countDocuments();
    const events = await Event.find().skip(eventsQuantity - 20); // Traigo los últimos 20 eventos
    const today = getDate();
    for(let i = 0;i < events.length;i++) {
        let eventDate = setStringDateToObject(events[i].dateAndTime);
        let hadNotificated = events[i].notified;
        const users = await User.find({"classes.dateAndTime": events[i].dateAndTime});

        // console.log(`\nNotificación del evento fecha ${events[i].dateAndTime} (${users.length} usuario(s)): ${events[i].notified}`);

        const availableForNotification = today.day >= eventDate.day || 
        (today.day == eventDate.day && today.hours+5 >= eventDate.hours); // No vale la pena preguntar por mes y año, ya que este script se ejecutará prácticamente todo el tiempo
        if(!hadNotificated && availableForNotification) {
            // console.log(`Este evento no tuvo notificación, y está disponible para marcar.\n`);
            if(users.length > 0) {
                const message = finishedEvent(events[i].category);
                for(let j = 0;j < users.length;j++) {
                    console.log(`El E-mail de finalización de seminario se ha enviado a ${users[j].email}.`);
                    sendEmail(users[j].email, "Finalizó tu seminario", message);
                    sendEmail(process.env.HIPNOCENTRO_ADMIN_NO_REPLY_EMAIL_DIR, "RE: Finalizó tu seminario", message); // Re-enviamos el email a no-reply, para chequear que la finalización del seminario se notificó al comprador de éste.
                }
                events[i].notified = true;
                await events[i].save();
            } else if(events[i].suscribers > users.length) {
                const error = new Error({
                    name: 'sendEmailToEvent',
                    text: `El seminario (fecha: ${events[i].dateAndTime}) terminó, pero no se encontraron los usuarios suscriptos a este evento, por lo cuál no se enviará un e-mail de notificación a éstos.`,
                    error: true
                });
                await error.save();
                console.log(error);
            }
        }
    }
    }
};

module.exports = helpers;