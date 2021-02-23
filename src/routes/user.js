const   router = require('express').Router(),
        User = require('../models/user'),
        passport = require('passport'),
        { itHasPassword } = require('../helpers/itHasPassword'),
        { isLogin } = require('../helpers/isLogin'),
        { isAdmin } = require('../helpers/isAdmin'),
        { isTerapist } = require('../helpers/isTerapist'),
        { validUser } = require('../helpers/validUser'),
        { isUserExists } = require('../helpers/isUserExists'), 
        { registerUser } = require('../helpers/registerUser'),
        { setDateToString } = require('../helpers/setDateToString'),
        { sendEmail } = require('../helpers/sendEmail');

router.get('/user/sign-in', (req, res) => {
    res.render('user/sign-in');
});

router.post('/user/sign-in', itHasPassword, passport.authenticate('local', {
    successRedirect: '/panel',
    failureRedirect: '/user/sign-in',
    failureFlash: true
}), (req, res) => {
    console.log(req.body.passport);
});

router.get('/user/sign-up', (req, res) => {
    res.render('user/sign-up');
});

router.post('/user/sign-up', validUser, async (req, res) => {
    const { name, email, password1 } = req.body;
    const date = setDateToString();
    const user = await registerUser(name, email, 'Ninguno', password1, date);
    // await sendEmail(email, req.body.subject, req.body.message);
    if(user.isExists)
        res.redirect('/user/sign-in');
    if(!user.isExists && user.registered) // ya está registrado
        res.redirect('/user/sign-in'); 
    req.login(user, function(err) {
        if (err) res.redirect('/user/sign-in');
        res.redirect('/panel');
    });
});

router.get('/user/sign-out', isLogin, (req, res) => {
    req.logout();
    // req.flash('success_msg', 'Has cerrado tu sesión. ¡Vuelve cuándo quieras!');
    res.redirect('/');
})

router.get('/user/changePassword/:email/:password', async (req, res) => { // deprecated (sin reemplazo)
    const { email, password } = req.params;
    const user = await User.findOne({email: email});
    user.password = await user.encryptPassword(password);
    await user.save();
    // OJO, password tendría que enviarse por un formulario y habría que enviar un email al usuario para que acceda aquí vía token. Esto es a modo debug
    res.send('password changed');
});

// Perfiles de usuarios
router.get('/user/:email', isLogin, isTerapist, async (req, res) => {
    res.render('user/profile');
});

module.exports = router;