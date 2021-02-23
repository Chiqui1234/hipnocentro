const helpers = {};

helpers.createSlug = function(category) { // Transforma la categoría escrito por un humano (con mayúsculas, espacios, etc) a un slug (todo minúscula y sin espacios)
    let slug = category.toLowerCase();
    slug = category.replace(/\s+/g, '-').toLowerCase();
    return slug;
}

module.exports = helpers;