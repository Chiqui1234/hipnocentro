const   router = require('express').Router(),
        User = require('../models/user'),
        Category = require('../models/category'),
        Event = require('../models/event'),
        Direction = require('../models/direction');

const   csv = require('csv-parser'),
        fs = require('fs');

const urlToDatabase = process.env.URLTODATABASE || '/home/santiago/Documents/Programación/2020/hipnocentro/autopress/old-database/finalBackupBd/'; // '/' desde heroku, o la ruta completa desde localhost
// const urlToDatabase = '/home/santiago/Documentos/hipnocentro/src/public/';
// Las siguientes rutas sirven para importar el sistema viejo a éste (el nuevo)

router.get('/import/oldDirections', async (req, res) => {
    const dir = urlToDatabase + 'direcciones.csv';
    fs.createReadStream(dir)
        .pipe(csv())
        .on('data', async function(data){
            try {
                const toDatabase = new Direction({
                    sqlId: data.id,
                    province: data.provincia,
                    dir: data.linea_1,
                    location: data.linea_2
                });
                console.log(toDatabase);
                await toDatabase.save();
            }
            catch(err) {
                console.error('Imposible obtener "data" del archivo csv:', err);
            }
        })
        .on('end',function(){
            res.send('ok');
    });  
});

router.get('/convert/csvSqlToHumanCsv', async(req, res) => { // Fusiona y organiza el archivo eventos.csv y reservas.csv para que Claudio tenga acceso a la BD vieja mediante Excel
    const files = {
        reservation: urlToDatabase + 'reservas.csv',
        events: urlToDatabase + 'eventos.csv',
        output: urlToDatabase + 'output.csv'
    };
    fs.createReadStream(eventos)
    .pipe(csv())
    .on('data', async function(data){
        try {
            // getReservation(data, files) |  Relaciona y obtiene una reserva determinada. Existe un evento por fecha
            fs.writeFile(output, getReservation(data), (err) => {
                if (err) throw err;
                console.log('It\'s saved!');
            });
            console.log(data);
        }
        catch(err) {
            //
        }
    })
    .on('end',function(){
        res.send('<p>Proceso terminado. Si no se descarga el archivo automáticamente, <a href="#">clic aquí</a>.</p>');
    });  
});

router.get('/import/oldEvents', async (req, res) => {
    // Importador de los eventos de la BD vieja a MongoDB
    const myDir = urlToDatabase + 'eventos.csv';
    const directions = await Direction.find(); // El vector comienza en 0, el viejo MySQL comienza su ID en 1 (ojo!)
    const categories = ['Adelgazar', 'Dejar de fumar'];
    fs.createReadStream(myDir)
        .pipe(csv())
        .on('data', async function(data){
            try {
                let eventDirection = await Direction.findOne({sqlId: data.id_direcciones});
                let finalLocation = '';
                if(eventDirection.dir && !eventDirection.location)
                    finalLocation = eventDirection.dir;
                else
                    finalLocation = eventDirection.dir + ' | ' + eventDirection.location; // Esta variable existe para "emprolijar" un dato de entrada (la dirección del evento)
                if(eventDirection) {
                    const toDatabase = new Event({
                        sqlId: data.id,
                        category: categories[data.id_tipos-1],
                        location: finalLocation,
                        dateAndTime: data.fecha_y_hora,
                        suscribers: data.inscritos,
                        limit: data.aforo
                    });
                    console.log(toDatabase);
                    await toDatabase.save();
                }
            }
            catch(err) {
                //
            }
        })
        .on('end',function(){
            res.send('<p>Proceso terminado. Mirá los console.log apretando F12 en tu teclado.</p>');
    });  
    
});

router.get('/import/fuckYou', async(req, res) => { // una pruebita cuándo estaba enojado :)
    let newUser = new User({
        name: 'Test',
        email: 'test@gmail.com',
        telephone: '1122515262',
        newsletter: false,
        date: 'pending'
    });
    await newUser.save();
    res.send(newUser);
});

router.get('/import/oldUsers', async (req, res) => { // enviar archivo sin duplicar
    const dir = urlToDatabase + 'clientes.csv';
    let flag = false;
    fs.createReadStream(dir)
        .pipe(csv())
        .on('data', async function(data){
            // try {
                let user = await User.find({"email": data.email});
                if(user.length > 0) {
                    user[0].sqlId.push(data.id);
                    await User.updateOne(
                        {
                            "email": data.email
                        }, 
                        {
                            $set: {"sqlId": user[0].sqlId}
                        }
                    );
                    console.log('user encontrado:', user[0]);   
                } else {
                    let newUser = new User({
                        sqlId: [],
                        name: data.nombre_y_apellidos,
                        email: data.email,
                        telephone: data.telefono,
                        newsletter: data.newsletters=='sí'?true:false,
                        date: 'pending'
                    });
                    newUser.sqlId.push(data.id);
                    newUser.save();
                    console.log('user no encontrado:', newUser);
                }
            // catch(err) {
                //
            // }
        })
        .on('end',function(){
            res.send('ok');
    });   
});

router.get('/import/mergeUsers', async(req, res) => {
    let users = User.find();
    
});

router.get('/import/oldReservas', async (req, res) => {
    const dir = urlToDatabase + 'reservas.csv';
    fs.createReadStream(dir)
        .pipe(csv())
        .on('data', async function(data){
            try {
                const event = await Event.findOne({sqlId: data.id_eventos});
                let user = await User.findOne({sqlId: data.id_clientes});
                if(event && user) {
                    userDate = (user.date == 'pending' || user.date == '' || user.date == 'NULL' || user.date == null)?data.fecha_y_hora:user.date; // Si el usuario no tiene una fecha de registro, le ponemos la primera que encontramos
                    // Preparo el objeto para enviar a MongoDB
                    user.classes.push({
                        category: event.category,
                        location: event.location,
                        date: event.dateAndTime,
                        assist: true,
                        grouponCode: data.groupon_codigo, // Código del cupón
                        grouponCodeSeg: data.groupon_codigo_seg,
                        grouponCant: data.groupon_personas
                    });
                    // user.classes.push({ // ESTO FUNCIONA! YES!
                    //     category: 'test',
                    //     location: 'lote de prueba',
                    //     date: 'hoy',
                    //     assist: true
                    // });
                    await user.save();
                } else {
                    console.log(':: ERROR en Evento Nro ' + data.id_eventos + ', Usuario Nro ' + data.id_clientes + '::');
                    console.log('user:', user);
                    console.log('event:', event);
                    console.log(':: ::');
                }
            }
            catch(err) {
                console.error('Imposible obtener "data" del archivo csv:', err);
            }
        })
        .on('end',function(){
            res.send('finish');
    });  
});

module.exports = router;
