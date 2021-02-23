const   express = require('express'),
        exphbs = require('express-handlebars'),
        methodOverride = require('method-override'),
        passport = require('passport');
// Inicialización
const app = express();
require('./config/database');
require('./config/passport');
// CORS
app.use(function(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
        var allowedOrigins = ['https://www.hipnocentro.com', 'https://hipnocentro.com', 'https://panel.hipnocentro.com'];
        var origin = req.headers.origin;
        if(allowedOrigins.indexOf(origin) != -1)
            res.setHeader('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', true);
        return next();
    } else return next();
});
// Forzado de HTTPS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https')
            // the statement for performing our redirection
            return res.redirect('https://' + req.headers.host + req.url);
        else
            return next();
    } else return next();
});
// Configuración de puerto
app.set('port', process.env.PORT || 3000);
// Vistas
app.set('views', __dirname + '/views');
app.engine('.hbs', exphbs({                                             // Declaro Handlebars cómo motor para vistas
    defaultLayout: 'main',
    layoutsDir: app.get('views') + '/layouts',
    partialsDir: app.get('views') + '/partials',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');                                         //
//
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));                                     // Para utilizar DEL o PUT en <form>
app.use(require('cookie-session')({
    secret: 'pepe',
    resave: true,
    saveUninitialized: true,
    path: '/',
    cookie: { secure: false },
    maxAge: null
}));
app.use(passport.initialize());
app.use(passport.session());
// Archivos estáticos
app.use('/', express.static(__dirname + '/public'));
app.use('/wordpress', express.static(__dirname + '/public')); // para testeos
app.use('/user', express.static(__dirname + '/public'));
app.use('/api', express.static(__dirname + '/public'));
app.use('/panel', express.static(__dirname + '/public'));
// Ruteo
app.use(
    require('./routes/main'),
    require('./routes/panel'),
    require('./routes/user'),
    require('./routes/api'),
    require('./routes/api/category'),
    require('./routes/api/direction'),
    require('./routes/api/event'),
    require('./routes/api/user')
);

// Apertura
app.listen(app.get('port'), () => {
    console.log('Server opened in port', app.get('port'));
});