const   helpers = {};
const   Client = require('../models/user'),
        Event = require('../models/event');

helpers.createSuscription = async function(location, name, email, telephone, grouponCode, grouponCant) {
    const newClient = new Client({
        name: name,
        email: email,
        telephone: telephone
    });
    const eventQuery = await Event.findOne({location: location}); // Busco el evento para extraer la fecha y hora
    if( eventQuery ) { // Se encontró el evento, por lo que haremos un push de ese evento al usuario 
        const date = eventQuery.dateAndTime;
        const user = await Client.findOne({email: email});
        if( user ) { // Si el usuario ya existe
            const newClass = ({
                category: 'Adelgazar', // La categoría la tengo que obtener buscando "location" en db.events, de forma directa (es comparar dos strings)
                location: location,
                date: date,
                grouponCode: grouponCode,
                grouponCant: grouponCant
            });
            console.log(newClass);
            await Client.findOneAndUpdate({email: email}, {$push: {classes: newClass}});
        } else { // Si el usuario NO existe, lo creamos y luego hacemos el push
            await newClient.save();
            await Client.findOneAndUpdate({email: email}, {$push: {classes: newClass}});
        }  
        return user?user:newClient; // Devuelvo user si ya existía, caso contrario devuelvo newClient (el nuevo usuario)
    }
    return false; // Si no se encontró el evento devuelvo false
};

module.exports = helpers;