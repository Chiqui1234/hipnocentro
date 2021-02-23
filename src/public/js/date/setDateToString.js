// Setea la fecha y hora de hoy y la devuelve
function setDateToString() {
    const   date = new Date();
    const   result = {
                date: {    
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    day: date.getDate()
                },
                time: {
                    hour: date.getHours(),
                    minutes: date.getMinutes()
                }
    };
    return result;    
}