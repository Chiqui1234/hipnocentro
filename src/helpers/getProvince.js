const helpers = {};
const Direction = require('../models/direction');

helpers.getProvince = async function(direction) {
    let province = direction.split(',');
    province = province[province.length-1];
    console.log(province);
    return province;
};

module.exports = helpers;