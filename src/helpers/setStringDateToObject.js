const helpers = {};
// Recibe un string y devuelve un objeto {day, month, year, hours, minutes}
helpers.setStringDateToObject = function(stringDate) {
    return {
        day: parseInt(stringDate.charAt(0) + stringDate.charAt(1)),
        month: parseInt(stringDate.charAt(3) + stringDate.charAt(4)),
        hours: parseInt(stringDate.charAt(12) + stringDate.charAt(13)),
        minutes: parseInt(stringDate.charAt(15) + stringDate.charAt(16))
    }
};

module.exports = helpers;