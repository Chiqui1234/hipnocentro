const helpers = {};
const Direction = require('../models/direction');

helpers.createDirection = async function(province, dir, location) {
    const newDirection = new Direction({
        province: province,
        dir: dir,
        location: location
    });
    if(province && dir && location) { // Si validan los datos
        let direction = await Direction.findOne({dir: dir});
        if( !direction ) // Si no existe la dirección, la creamos
            await newDirection.save();
        return newDirection; /* Devuelvo la dirección de la calle, para indicar que 
                            (a) ya estaba creada
                            (b) se acaba de crear
                            */
    }
    return false; // Si no validan los datos
}

module.exports = helpers;