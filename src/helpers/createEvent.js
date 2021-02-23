const helpers = {};
const Event = require('../models/event'),
{ createSlug } = require('../helpers/createSlug');

helpers.createEvent = async function(category, location, locationPassword, limit, date) {
    let splitedDate = date.split('-');
    let day = splitedDate[2].charAt(0) + splitedDate[2].charAt(1);
    let sortedDate = day + '-' + splitedDate[1] + '-' + splitedDate[0] + ', ' + date.split(', ')[1]; // Organizado por DD-MM-AAAA, HH:MM
    if(category && location && limit && date) {
        let newEvent = new Event({
            category: createSlug(category),
            location: location,
            dateAndTime: sortedDate,
            limit: limit
        });
        if(location.search('https://') >= 0 || location.search('http://') >= 0 || locationPassword) { // Si tiene contraseña es un evento virtual
            if(location.search('https://') == -1) // Añade 'https' en caso de que no exista en el String.
                location = 'https://' + location; // En caso de que no se haya detectado
            newEvent.locationPassword = locationPassword;
            newEvent.isVirtual = true;
        }
        let result = await newEvent.save();
        return result;
    } else return false;
}

module.exports = helpers;