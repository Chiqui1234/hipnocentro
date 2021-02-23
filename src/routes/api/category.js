const   router = require('express').Router();
const   Category = require('../../models/category'),
        { createCategory } = require('../../helpers/createCategory'),
        { isLogin } = require('../../helpers/isLogin'),
        { isAdmin } = require('../../helpers/isAdmin');;

router.post('/api/category/create', isLogin, isAdmin, async(req, res) => {
    const { category } = req.body;
    const newCategory = await createCategory(category.name, category.description);
    if(newCategory)
        res.send({error: false, category: newCategory});
    else res.send({error: true, category: null});
});

router.post('/api/category/edit', isLogin, isAdmin, async(req, res) => {
    const { editedCategory } = req.body;
    const result = await Category.updateOne({_id: editedCategory._id}, editedCategory);
    res.send({error: !result.ok});
});

router.get('/api/category/delete/:id', isLogin, isAdmin, async(req, res) => {
    const { id } = req.params;
    const result = await Category.deleteOne({_id: id});
    res.send({error: !result.ok});
});

module.exports = router;