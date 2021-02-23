const   router = require('express').Router(),
        { isLogin } = require('../helpers/isLogin'),
        { isAdmin } = require('../helpers/isAdmin');

router.get('/', (req, res) => {
    res.render('panel/index');
});

router.get('/home', (req, res) => {
    res.render('panel/index');
});

router.get('/release-notes', isLogin, isAdmin, (req, res) => {
    res.render('panel/releaseNotes');
});

router.get('/wordpress/allEvents', (req, res) => {
    res.render('wordpress/allEvents');
});

module.exports = router;