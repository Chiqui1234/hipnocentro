const   router = require('express').Router();
const   fs = require('fs'),
        User = require('../../models/user'),
        Event = require('../../models/event'),
        { isUserExists } = require('../../helpers/isUserExists'),
        { registerUser } = require('../../helpers/registerUser'),
        { sendEmail } = require('../../helpers/sendEmail'),
        { setDateToString } = require('../../helpers/setDateToString'),
        { createSlug } = require('../../helpers/createSlug'),
        { getProvince } = require('../../helpers/getProvince');
const cors = require('cors');

// Obtiene un usuario desde su email
router.get('/api/user/get/:email', async (req, res) => {
    const { email } = req.params;
    let result = [];
    if(email) {
        result = await User.findOne({email: email});
        res.send(result);
    } else res.send('No se halla el email');
});

// Obtiene un rango de usuarios
router.get('/api/getUsers/:limit', async (req, res) => {
    let { limit } = req.params; // El límite se cuenta desde el último registro
    let result = [];
    const userCount = await User.countDocuments();
    if(limit > userCount) // Este if() para no skipear en negativo
        limit = userCount;
    if(limit == 0)
        result = await User.find();
    if(limit > 0)
        result = await User.find().skip(userCount - limit);
    res.send(result);
});

// Obtiene todos los terapeutas
router.get('/api/getTerapists', async (req, res) => {
    const result = await User.find({rol: 2});
    res.send(result);
});

// Obtiene todos los administradores
router.get('/api/getAdmins', async (req, res) => {
    const result = await User.find({rol: 3});
    res.send(result);
});

router.post('/api/user/save',  async (req, res) => {
    const { user } = req.body;
    const date = new Date().getDate() + '/' + new Date().getMonth() + '/' + new Date().getFullYear();
    let isSaved = [];
    if(user) {
        isSaved = await registerUser(user.names, user.email, user.telephone, false, date); // Si quiero agregar una clase, tengo que hacerlo en otra ruta
        res.send(isSaved?true:false);
    } else {
        res.send(false);
    }
});

router.post('/api/class/suscribe/user',  async (req, res) => { // Agrega una clase al usuario y suma al contador de suscriptores de esa clase
    const { user, classId } = req.body;
    console.log('input (' + classId + '): ', user)
    let dbUser = await User.findOne({email: user.email}), userPartner = await User.findOne({"classes.couponCode": user.couponCode}), event = await Event.findById({_id: classId});
    let eventPassword = !event.locationPassword || event.locationPassword == 'Ninguna'?'Ninguna':event.locationPassword;
    const date = setDateToString();
    const emailContent = `
    <h1>Tu suscripción al evento se ha realizado con éxito</h1>
    <ul>
        <li>Lugar: ${event.location}</li>
        <li>Fecha y horario: ${event.dateAndTime}</li>
        <li>Contraseña: ${eventPassword}</li>
    </ul>
    <p>Si necesitas pedir más información o necesitas pagar virtualmente por el seminario, por favor llámanos al <a href="tel:620980239"><strong>620980239</strong></a>, estaremos para responderte.</p>
    <p>¡Nos vemos!</p> 
    `; // Contenido del email que se enviará al usuario, una vez que se registre la clase en su cuenta
    try {
        console.log('try');
        if(!dbUser) { // Si no hay usuario, lo creo
            dbUser = await registerUser(user.name, user.email, user.telephone, '', date, `
            <h1>Bienvenido a Hipnocentro</h1>
            <p>Ojalá podamos vernos en algún seminario de hipnosis en breve. Experimentarás beneficios reales en poco tiempo y estarás de la mano de grandes expertos en toda España</p>
            <p>Si necesitas información sobre los seminarios, visita <a href="https://hipnocentro.com">nuestra página principal</a>.</p>`);
        }
        if(userPartner) { // Si hay compañero, le tengo que poner el nombre del usuario que me llega ahora
            userPartner.classes[userPartner.classes.length-1].couponPartner = user.name;
            await User.updateOne({email: userPartner.email}, {userPartner});
            console.log('userPartner:', userPartner);
        }
            // Pusheo de la clase (sólo se añadirá si no lo tiene repetido)
            dbUser.classes.push({
                category: event.category,
                location: event.location,
                isVirtual: event.isVirtual,
                dateAndTime: event.dateAndTime,
                paymentMethod: user.paymentMethod, // 'user.paymentMethod' siempre vale lo mismo que vale user[0] en el front-end
                couponCode: user.couponCode, // Sólo el primer usuario puede generar un código de cupón, y se lo pasa a su compañero (si existe) en el front-end
                couponCodeSec: user.couponCodeSec, // El primer usuario tiene el código de cupón, y luego se lo pasa al segundo usuario (si existe) en el front-end
                couponCant: user.couponCant, // El primer usuario tiene el código de cupón, y luego se lo pasa al segundo usuario (si existe) en el front-end
                couponPartner: userPartner && userPartner.name?userPartner.name:'' // Si existe compañero, lo ponemos
            });
        if(dbUser.classes.length == 0 || (dbUser.classes[dbUser.classes.length-1].dateAndTime != event.dateAndTime) ) { // Si no tiene clases o no se está suscribiendo dos veces al mismo evento, simplemente la pusheo
            await User.updateOne({email: user.email}, dbUser); // Guardo el usuario, habiendole añadido la clase antes.
            dbUser = await User.findOne({email: user.email});
            console.log('dbUser después del último findOne():', dbUser);
            if(dbUser.classes.length == 0 || dbUser.classes[dbUser.classes.length-1].dateAndTime != event.dateAndTime) // Si no se guardó la clase en el user, devuelvo false papu
                res.send(false); 
            else { // Si se guardó todo bien, hago +1 a las suscripciones del evento y devuelvo true
                event.suscribers++; // También, añado mi usuario al acumulador de suscriptores
                await event.save(); // Guardanding...
                await sendEmail(user.email, 'Hipnocentro: Tu suscripción al seminario', emailContent); // Le enviamos un email al usuario para notificar su suscripción
                res.send(true);
            }   
        } else { // Si es una clase repetida, simplemente reenvío el email y devuelvo true como si nada :)
            await sendEmail(user.email, 'Hipnocentro: Tu suscripción al seminario', emailContent); // Le enviamos un email al usuario para notificar su suscripción
            res.send(true);
        }
    } catch(err) {
        console.log('catch', err);
        res.send(false);
    }
});

router.get('/api/user/delete/classFromUser/:id', async(req, res) => {
    const { id } = req.params;
    const userToDeleteFromClass = await User.findOne({"classes._id": id});
    let i = 0;
    while(userToDeleteFromClass.classes[i]._id != id)
        i++;
    // Actualizo el contador del evento
    const event = await Event.findOne({dateAndTime: userToDeleteFromClass.classes[i].dateAndTime});
    event.suscribers--;
    await event.save();
    // Ahora elimino el evento del usuario
    if(userToDeleteFromClass.classes[i]._id == id) {
        userToDeleteFromClass.classes.splice(i, 1);
        await userToDeleteFromClass.save();
        res.send({alert: 'ok'});
    } else {
        console.log('No se encuentra la clase');
        res.send({alert: 'No se pudo eliminar el evento del usuario'});
    }
});

router.post('/api/user/edit/assist', async (req,res) => {
    const { userId, classId } = req.body;
    // Voy a la clase del usuario con fecha:classId y cambio su asistencia
    const user = await User.findById({_id: userId});
    let i = 0;
    while(user.classes[i].dateAndTime != classId && i < user.classes.length)
        i++;
    if(user.classes[i].dateAndTime == classId) { // Compruebo que esa clase exista
        user.classes[i].assist = !user.classes[i].assist;
        await user.save();
        res.send({error: false});
    } else res.send({error: true});
    console.log('La asistencia cambió a:', user.classes[i].assist);
});

router.post('/api/user/edit/payout', async (req, res) => {
    const { userId, classId, payout } = req.body;
    const user = await User.findById({_id: userId});
    if(payout.length >= 2 || payout == 0) {
        let i = 0;
        while(user.classes[i].dateAndTime != classId && i < user.classes.length)
            i++;
        if(user.classes[i].dateAndTime == classId) { // Compruebo que esa clase exista
            user.classes[i].payout = payout;
            await user.save();
            res.send({error: false});
        } else {
            res.send({error: true}); // Si, esto es medio choto pero no puedo mandar los headers extra luego del primer res.send()
        }
    } else {
        res.send({error: true}); // Si, esto es medio choto pero no puedo mandar los headers extra luego del primer res.send()
    }
});

router.post('/api/user/search', async (req, res) => {
    const { filter } = req.body;
    let result = [];
    if(filter.selected == 'names') {
        result = await User.find({name: {'$regex': `${filter.value}`, '$options': 'i'}}); // 'i' es para 'insensitive case'
        res.send(result);
    } else if(filter.selected == 'telephone') {
        result = await User.find({telephone: {'$regex': `${filter.value}`, '$options': 'i'} });
        res.send(result);
    } else if(filter.selected == 'email') {
        result = await User.find({email: {'$regex': `${filter.value}`, '$options': 'i'} });
        res.send(result);
    }else if(filter.selected == 'category') {       // Se busca por categoría
        result = await User.find({
            "classes.category": createSlug(filter.value)
        });
        for(let i = 0;i < result.length;i++) {
            for(let j = 0;j < result[i].classes.length;j++) {
                if( result[i].classes[j].category != filter.value ) // filter.value es un slug
                    result[i].classes.splice(j, 1);
            }
            // console.log(`${result[i].name} con ${result[i].classes.length} clases.`);
            if(result[i].classes.length == 0) { // Si este usuario no tiene clases relacionadas a esta provincia
                console.log('splice');
                result.splice(i, 1); // Lo saco :)
            }
        }
        res.send(result);
    } else if(filter.selected == 'province') { // Se busca por provincia
        result = await User.find({"classes.location": {'$regex': `${filter.value}`, '$options': 'i'} });
        for(let i = 0;i < result.length;i++) {
            for(let j = 0;j < result[i].classes.length;j++) {
                let province = getProvince(result[i].classes[j].location);
                if( result[i].classes[j].isVirtual || province != filter.value )
                    result[i].classes.splice(j, 1);
            }
            // console.log(`${result[i].name} con ${result[i].classes.length} clases.`);
            if(result[i].classes.length == 0) { // Si este usuario no tiene clases relacionadas a esta provincia
                console.log('splice');
                result.splice(i, 1); // Lo saco :)
            }
        }
        res.send(result);
    }
});

// CONTADOR
router.get('/api/count/users', async (req, res) => {
    const result = {
        usersCount: await User.countDocuments() 
    };
    res.send(result);
});

module.exports = router;