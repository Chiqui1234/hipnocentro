const helpers = {};
const Category = require('../models/category'),
{ createSlug } = require('../helpers/createSlug');

helpers.createCategory = async function(category, description) {
    const newCategory = new Category({
        name: category,
        description: description,
        slug: createSlug(category)
    });
    if(category == '' || category.length <= 3)
        return false;
    if(!description || description == '' || description.length <= category.length)
        newCategory.description = 'Categoría dedicada a los seminarios de ' + category + '.';
    await newCategory.save();
    return newCategory;
}

module.exports = helpers;