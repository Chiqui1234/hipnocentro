const   router = require('express').Router(),
        { isLogin } = require('../helpers/isLogin'),
        { isAdmin } = require('../helpers/isAdmin'),
        { createCategory } = require('../helpers/createCategory'),
        { createDirection } = require('../helpers/createDirection'),
        { createSuscription } = require('../helpers/createSuscription'),
        { editRol } = require('../helpers/editRol'),
        { sendEmailToEvent } = require('../helpers/sendEmailToEvent');

router.get('/panel', isLogin, isAdmin, async (req, res) => {
    sendEmailToEvent(); // Cron job
    res.render('panel/dashboard');
});

router.post('/create/category', isLogin, isAdmin, async (req, res) => {
    const { category, description } = req.body;
    const result = await createCategory(category, description);
    res.redirect('/panel');
});

router.post('/create/direction', isLogin, isAdmin, async (req, res) => {
    const { province, dir, location } = req.body;
    const direction = await createDirection(province, dir, location);
    // if(direction)
        // req.flash('error_msg', 'Dirección creada.');
    // else
        // req.flash('error_msg', 'La dirección debe tener 4 caracteres o más y ser válido.');        
    res.redirect('/panel');
});

router.post('/create/suscription', isLogin, isAdmin, async (req, res) => {
    const { location, name, email, telephone, grouponCode, grouponCant } = req.body;
    const suscription = await createSuscription(location, name, email, telephone, grouponCode, grouponCant);
    // if(suscription)
        // req.flash('success_msg', 'Suscripción creada');
    // else 
        // req.flash('error_msg', 'No se pudo crear la suscripción');
    res.redirect('/panel');
});

router.post('/edit/rol', isLogin, isAdmin, async (req, res) => {
    const { email, rol } = req.body;
    const rols = ['Cliente', 'Terapeuta', 'Administrador'];
    const user = await editRol(email, rol);
    // if(user)
        // req.flash('success_msg', 'El nuevo rol de ' + email + ' es "' + rols[user.rol] + '".');
    // else 
        // req.flash('error_msg', 'No se pudo actualizar el rol de ' + email + '. ¿El usuario existe?');
    res.redirect('/panel');
});

module.exports = router;