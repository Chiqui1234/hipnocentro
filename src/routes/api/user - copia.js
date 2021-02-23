const   router = require('express').Router();
const   fs = require('fs'),
        User = require('../../models/user'),
        Event = require('../../models/event'),
        Error = require('../../models/error'),
        { isAdmin } = require('../../helpers/isAdmin'),
        { isLogin } = require('../../helpers/isLogin'),
        { isUserExists } = require('../../helpers/isUserExists'),
        { isEmailExists } = require('../../helpers/isEmailExists'),
        { registerUser } = require('../../helpers/registerUser'),
        { sendEmail } = require('../../helpers/sendEmail'),
        { setDateToString } = require('../../helpers/setDateToString'),
        { createSlug } = require('../../helpers/createSlug'),
        { createClass } = require('../../helpers/createClass'),
        { getProvince } = require('../../helpers/getProvince'),
        { suscriptionEmail } = require('../../helpers/suscriptionEmail');
        // { deleteOne } = require('../../models/user');

// Obtiene un usuario desde su email
router.get('/api/user/get/raw/:email', async (req, res) => {
    const { email } = req.params;
    let result = [];
    if(email) {
        result = await User.findOne({email: email});
        res.send({error: false, result: result});
    } else res.send({error: true, result: 'No se halla el email'});
});

// Obtiene un rango de usuarios
router.get('/api/user/get/:limit', async (req, res) => {
    let { limit } = req.params; // El límite se cuenta desde el último registro
    let result = [];
    const userCount = await User.countDocuments();
    if(limit > userCount) // Este if() para no skipear en negativo
        limit = userCount;
    if(limit == 0)
        result = await User.find();
    if(limit > 0)
        result = await User.find().skip(userCount - limit);
    if(result.length == limit)
        res.send({
            result: result, 
            error: false
        });
    else
        res.send({error: true});
});

router.post('/api/user/save',  async (req, res) => {
    const { user } = req.body;
    const date = new Date().getDate() + '/' + new Date().getMonth() + '/' + new Date().getFullYear();
    if(user) {
        let isSaved = await registerUser(user.name, user.email, user.telephone, false, date); // Si quiero agregar una clase, tengo que hacerlo en otra ruta
        res.send({error: isSaved?false:true});
    } else {
        res.send({error: true});
    }
});

router.post('/api/user/edit/suscription', async (req, res) => {
    const { userId, classId, data } = req.body;
    const user = await User.findById({_id: userId});
    if(user.classes && classId) { // Si hay que editar una clase
        let classPos = user.classes.map(function(e) { return e._id; }).indexOf(classId);
        if(classPos >= 0) {
            user.classes[classPos].couponCode = data.couponCode;
            user.classes[classPos].couponCodeSec = data.couponCodeSec;
            await user.save();
            res.send({error: false, result: user});
        } else res.send({error: true})
    } else res.send({error: true})
});

// router.post('/api/user/edit/:id', async(req, res) => { // Hay que editar la ruta para ver perfiles, para que se busque por ID (como acá)
//     const { id } = req.params;
//     const { name, email, telephone, newsletter, rol } = req.body;
//     let user = User.findById({_id: id});
//     if(isUserExists(email))
//         res.send({error: true, result: 'Este email lo tiene otro usuario.'});
//     else if(!isEmailExists(email))
//         res.send({error: true, result: 'Este email es inválido.'});
//     else {
//         user.name = name;
//         user.email = email;
//         user.telephone = telephone;
//         user.newsletter = newsletter == 'Sí' || newsletter == 'true'?true:false;
//         user.rol = rol;
//         await user.save();
//         res.send({error: false, result: user});
//     }
// });

router.post('/api/user/add/class', async (req, res) => {
    const { user, eventId, paymentMethod } = req.body;
    if(process.env.NODE_ENV !== 'production') console.log(`DATOS DE ENTRADA A /api/user/add/class
    user.email: ${user.email}
    eventId: ${eventId}`);
    try {
        let event = await Event.findById(eventId);
        if(event.suscribers >= event.limit) res.send({error: true, result: 'El cupo del seminario se llenó.'});
        const emailContent = suscriptionEmail(user, event);
        const date = setDateToString();
        if(user.paymentDate == '') user.paymentDate = date;
        let dbUser = await registerUser(user, date, false);  // Obtengo/Creo el usuario
        dbUser.telephone = user.telephone; // actualizamos el número telefónico
        if(process.env.NODE_ENV !== 'production') console.log(`dbUser: ${dbUser}`);
        if(dbUser.classes.length == 0 || dbUser.classes[dbUser.classes.length-1].dateAndTime != event.dateAndTime) {
            const newClass = await createClass(user, event);
            if(paymentMethod == 'relapse')
                newClass.warranty = false;
            dbUser.classes.push(newClass);
            let userUpdated = await User.updateOne({email: dbUser.email}, dbUser);
            if(userUpdated.ok == 0) // Si no pudo updatear el usuario, tiro error
                res.send({error: true, result: `No pudo actualizarse la reserva de ${user.name}.`});
            // if(process.env.NODE_ENV !== 'production') console.log(`Nueva clase: ${newClass}`);
            event = await Event.findOneAndUpdate({'dateAndTime': event.dateAndTime}, {$inc: {suscribers: 1}});
            // if(process.env.NODE_ENV != 'production') console.log(`Evento actualizado: ${event}`);
            // event.suscribers++;
            // await event.save();
            console.log(`USER.EMAIL: ${user.email}`);
            let emailStatus = await sendEmail(user.email, 'Hipnocentro: Tu suscripción al seminario', emailContent);
            console.log(`emailStatus: ${emailStatus}`);
            res.send({error: false, result: `Se guardó correctamente la reserva de ${user.name}.`});
        } else {
            if(process.env.NODE_ENV !== 'production') console.log(`La clase de ${event.category} ya estaba registrada en ${user.email}. No se vuelve a agregar.`);
            await sendEmail(user.email, 'Hipnocentro: Tu suscripción al seminario', emailContent);
            res.send({error: false, result: `Ya estabas registrado aquí, no puedes hacerlo nuevamente.`});
        }
    }
    catch(err) {
        if(process.env.NODE_ENV !== 'production') console.log(`El sistema falló exitosamente.\n${err}`);
        res.send({error: true, result: `No pudo guardarse la reserva de ${user.name}.`});
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
        res.send({error: false});
    } else {
        console.log('No se encuentra la clase');
        res.send({error: true});
    }
});

router.post('/api/user/edit/assist', async (req, res) => {
    const { userId, classId } = req.body;
    const user = await User.findById(userId);
    let i = 0;
    while(i < user.classes.length && user.classes[i]._id != classId)
        i++;
    if(user.classes[i]._id == classId) {
        user.classes[i].assist = !user.classes[i].assist;
        await user.save();
        res.send({error: false, result: user});
    } else res.send({error: true, result: user});
});

router.post('/api/user/edit/payout', async (req, res) => {
    const { userId, classId, payout } = req.body;
    const user = await User.findById({_id: userId});
    if(user && payout >= 0) {
        let i = 0;
        while(user.classes[i]._id != classId && i < user.classes.length)
            i++;
        if(user.classes[i]._id == classId) { // Compruebo que esa clase exista
            user.classes[i].payout = payout;
            await user.save();
            res.send({error: false});
        } else res.send({error: true});
    } else res.send({error: true});
});

router.post('/api/user/updatePayment', async (req, res) => { // Por ahora, sólo se usa con PayPal
    const { user, details, paymentMethod } = req.body;
    let userData = await User.findOne({email: user.email});
    if( details.intent == 'CAPTURE' && details.status == "COMPLETED" && paymentMethod == 'credit' ) {
        userData.classes[userData.classes.length-1].couponCode = details.id;
        userData.classes[userData.classes.length-1].paymentDate = details.create_time;
        userData.classes[userData.classes.length-1].payout = details.purchase_units[0].amount.value;
        console.log(userData);
        await userData.save();
        res.send({error: false});
    } else {
        const error = new Error({
            name: 'paypal',
            text: `El estado reportado por PayPal fue de "${details.status}", en un intento de "${details.intent}. ${details.payer.email_adress} no pudo pagar.`,
            error: true
        });
        await error.save();
        console.log('No se está pagando con PayPal, error.')
        res.send({error: false});
    }
});

router.post('/api/user/notify', async(req, res) => {
    const { userId, classId } = req.body; // 'classId' es el seminario en sí, no el seminario guardado dentro de user.classes[]
    const user = await User.findById(userId);
    const event = await Event.findById(classId);
    let classInUserPos = user.classes.map(function(e) { return e.dateAndTime; }).indexOf(event.dateAndTime);
    if(classInUserPos >= 0) { // Si el usuario tiene esa clase adjudicada
        const emailContent = suscriptionEmail(event);
        let emailSended = await sendEmail(user.email, '', emailContent);
        if(emailSended) {
            user.classes[classInUserPos].notified = true;
            await user.save();
            res.send({error: false});
        } else res.send({error: true});
    } else res.send({error: true});
});

router.post('/api/user/notify/custom', async(req, res) => {
    const { destinations, message } = req.body;
    if(process.env.NODE_ENV != 'production') {
        console.log(`${destinations.length} destinations.`);
        for(let i = 0;i < destinations.length;i++)
            // console.log(`/api/user/notify/custom, destinations:
            // ${destinations[i].email}`);
            console.log(`/api/user/notify/custom, destinations:
            ${destinations[i].email}`);
            console.log(message);
    }
    let result = true;
    for(let i = 0;i < destinations.length;i++) {
        let emailSended = await sendEmail(destinations[i].email, 'Aviso importante de Hipnocentro', message);
        if(process.env.NODE_ENV != 'production') console.log(`emailSended status: ${emailSended}`);
        if( !emailSended )
            result = false;
    }
    if(result) res.send({error: false});
    else res.send({error: true});
});

router.post('/api/user/search', async (req, res) => {
    const { filter, key } = req.body;
    let result = [];
    if(filter && key) {
        if(filter == 'names') {
            result = await User.find({name: {'$regex': `${key}`, '$options': 'i'}}); // 'i' es para 'insensitive case'
            res.send({result: result, error: false});
        } else if(filter == 'telephone') {
            result = await User.find({telephone: {'$regex': `${key}`, '$options': 'i'} });
            res.send({result: result, error: false});
        } else if(filter == 'email') {
            result = await User.find({email: {'$regex': `${key}`, '$options': 'i'} });
            res.send({result: result, error: false});
        } else if(filter == 'couponCode') {
            result = await User.find({"classes.couponCode": {'$regex': `${key}`, '$options': 'i'} });
            res.send({result: result, error: false});
        } else if(filter == 'category') {       // Se busca por categoría
            result = await User.find({
                "classes.category": createSlug(key)
            });
            for(let i = 0;i < result.length;i++) {
                for(let j = 0;j < result[i].classes.length;j++) {
                    if( result[i].classes[j].category != key ) // key es un slug
                        result[i].classes.splice(j, 1);
                }
                // console.log(`${result[i].name} con ${result[i].classes.length} clases.`);
                if(result[i].classes.length == 0) { // Si este usuario no tiene clases relacionadas a esta provincia
                    console.log('splice');
                    result.splice(i, 1); // Lo saco :)
                }
            }
            res.send({result: result, error: false});;
        } else if(filter == 'province') { // Se busca por provincia
            result = await User.find({"classes.location": {'$regex': `${key}`, '$options': 'i'} });
            for(let i = 0;i < result.length;i++) {
                for(let j = 0;j < result[i].classes.length;j++) {
                    let province = getProvince(result[i].classes[j].location);
                    if( result[i].classes[j].isVirtual || province != key )
                        result[i].classes.splice(j, 1);
                }
                // console.log(`${result[i].name} con ${result[i].classes.length} clases.`);
                if(result[i].classes.length == 0) { // Si este usuario no tiene clases relacionadas a esta provincia
                    console.log('splice');
                    result.splice(i, 1); // Lo saco :)
                }
            }
            res.send({result: result, error: false});
        }
    } else res.send({error: true});
});

router.delete('/api/user', isLogin, isAdmin, async(req, res) => {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if(user && user.rol < 3) {
        let result = await User.deleteOne({_id: userId});
        res.send({error: !result.ok});
    } else
        res.send({error: true});
    // Falta hacer -1 al contador de los eventos dónde estaba suscripto este usuario
});

// CONTADOR
router.get('/api/count/users', async (req, res) => {
    const result = {
        usersCount: await User.countDocuments() 
    };
    res.send(result);
});

router.post('/api/user/warranty', async(req, res) => {
    const { couponCodeToSearch } = req.body; // 'couponCodeToSearch' es como el ID de la reserva, guardada dentro de user.classes[] en MongoDB
    // const user = await User.findById({_id: userId});
    const user = await User.findOne({"classes.couponCode": couponCodeToSearch});
    console.log('/api/user/warranty, user finded:');
    console.log(user);
    console.log(`The coupon code was ${couponCodeToSearch}`);
    if(user) {
        const classPos = user.classes.map(function(e) { return e.couponCode; }).indexOf(couponCodeToSearch); // Buscamos por ID de reserva
        console.log(`classPos: ${classPos}`);
        if( classPos != -1 ) { // Si se encontró la reserva
            if( user.classes[classPos].warranty ) {
                res.send({error: false, result: '¡Genial! Acabas de utilizar la garantía en esta reserva. La garantía se puede usar sólo una vez.'});
                user.classes[classPos].warranty = false;
                await user.save();
            } else res.send({error: true, result: 'La garantía de esta reserva ya fue usada.'})
        } res.send({error: true, result: 'Este código de reserva no existe.'});
    } else res.send({error: true, result: 'Este código de reserva no existe.'});
});

module.exports = router;