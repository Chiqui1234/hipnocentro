const helpers = {};
// Setea la fecha y hora de hoy y la devuelve
helpers.setDateToString = function() {
    const   date = new Date();
    const   result = {    
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    day: date.getDate(),
                    hours: date.getHours(),
                    minutes: date.getMinutes()
            };
    return `${result.day}/${result.month}/${result.year}, ${result.hours}:${result.minutes}`;
}

module.exports = helpers;