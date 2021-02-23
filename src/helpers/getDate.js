const helpers = {};
helpers.getDate = function() { // Devuelve un objeto de fecha
    const today = {
        day: parseInt(new Date().getDate()), 
        month: parseInt(new Date().getMonth()+1),
        year: parseInt(new Date().getFullYear()),
        hours: parseInt(new Date().getHours()),
        minutes: parseInt(new Date().getMinutes())
    };
    return today;
}

module.exports = helpers;