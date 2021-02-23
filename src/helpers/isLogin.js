const helpers = {};

helpers.isLogin = (req, res, next) => { // middleware
    if(req.isAuthenticated()) { // fx desde passport
        // console.log('isAuthenticated: ', req.isAuthenticated());
        return next();
    }
    // req.flash('error', 'Tienes que iniciar sesión para ver esta página');
    res.redirect('/user/sign-in');
};

module.exports = helpers;