const   router = require('express').Router();
const   fs = require('fs'),
        Direction = require('../../models/direction'),
        { isLogin } = require('../../helpers/isLogin'),
        { isAdmin } = require('../../helpers/isAdmin');
const   { createDirection } = require('../../helpers/createDirection');

// Obtiene todas las direcciones
router.get('/api/getAllDirections', async (req, res) => {
    const allDirections = await Direction.find();
    res.send(allDirections);
});

// Obtiene las direcciones, con o sin límite
router.get('/api/directions/get', async (req, res) => {
    let result = await Direction.find();
    res.send(result);
});

router.post('/api/direction/edit/:id', isLogin, isAdmin, async (req, res) => {
    const { id } = req.params;
    const dirToUpdate = {
        province: req.body.province,
        dir: req.body.dir,
        location: req.body.location
    };
    await Direction.update({_id: id}, dirToUpdate);
    res.redirect('/panel');
});

router.post('/api/direction/create', isLogin, isAdmin, async(req, res) => {
    const { direction } = req.body;
    if(direction.province && direction.dir && direction.location) {
        const result = await createDirection(direction.province, direction.dir, direction.location);
        console.log(result);
        if(result) res.send({error: false, direction: result});
        else res.send({error: true});
    } else res.send({error: true});
});

router.get('/api/direction/delete/:id', isLogin, isAdmin, async(req, res) => {
    const { id } = req.params;
    let direction = await Direction.findById(id);
    if(direction) {
        await Direction.deleteOne({_id: id});
        res.send({error: false});
    } else res.send({error: true});
})

// CONTADOR
router.get('/api/count/directions', async (req, res) => {
    const result = {
        directionsCount: await Direction.countDocuments()
    };
    res.send(result);
});

module.exports = router;