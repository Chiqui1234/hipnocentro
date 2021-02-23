const   router = require('express').Router();
const   fs = require('fs'),
        Event = require('../../models/event'),
        User = require('../../models/user'),
        Category = require('../../models/category'),
        Direction = require('../../models/direction'),
        { isLogin } = require('../../helpers/isLogin'),
        { isAdmin } = require('../../helpers/isAdmin'),
        { createCategory } = require('../../helpers/createCategory'),
        { createSlug } = require('../../helpers/createSlug'),
        { getProvince } = require('../../helpers/getProvince'),
        { createEvent } = require('../../helpers/createEvent'),
        { getDate } = require('../../helpers/getDate');

router.post('/api/event/create', isLogin, isAdmin, async (req, res) => {
    const { event } = req.body;
    const result = await createEvent(event.category, event.location, event.locationPassword, event.limit, event.date+', '+event.time);
    console.log(result);
    res.send({error: false});
});

// Obtiene todos los eventos => Será reemplazado por /api/getEvents/:limit
router.get('/api/getAllEvents', async (req, res) => {
    const result = await Event.find();
    res.send(result);
});

// Obtiene todos los eventos, con un límite
router.get('/api/event/get/:limit',  async (req, res) => {
    let { limit } = req.params;
    const quantity = await Event.countDocuments();
    let result = await Event.find().skip(quantity - limit)
    .catch(async function() {
        return await Event.find();
    });
    // Nótese que se envian eventos que tengan cupos llenos. Ésto debe controlarse desde front-end
    res.send({error: false, result: result});
});

router.get('/api/event/get/:limit/available',  async (req, res) => { // Limit sólo sirve para tomar una "muestra" de eventos a buscar en un primer momento. Si esos eventos encontrados ya se realizaron o no tienen cupo, es de esperar un menor número de eventos como resultado. Un valor seguro para usar como límite es de veinte.
    console.log('Get available events.');
    const { limit } = req.params;
    const quantity = await Event.countDocuments();
    let eventsFinded = await Event.find().skip(quantity - limit)
    .catch(async function() {await Event.find()});
    let result = [];
    eventsFinded.sort((a, b) => {
        return (a.dateAndTime.split('-')[0] - b.dateAndTime.split('-')[0]) + (a.dateAndTime.split('-')[1] - b.dateAndTime.split('-')[1]);
    });
    let today = getDate();
    for(let i = 0;i < eventsFinded.length;i++) {
        let event = {
            day: parseInt(eventsFinded[i].dateAndTime.split('-')[0]),
            month: parseInt(eventsFinded[i].dateAndTime.split('-')[1]),
            year: parseInt(eventsFinded[i].dateAndTime.substring(eventsFinded[i].dateAndTime.length-11, eventsFinded[i].dateAndTime.length-7)),
            hours: parseInt(eventsFinded[i].dateAndTime.substring(eventsFinded[i].dateAndTime.length-5, eventsFinded[i].dateAndTime.length-3)),
            minutes: parseInt(eventsFinded[i].dateAndTime.split(':')[1])
        };
        let isAvailable =    
            (eventsFinded[i].limit > eventsFinded[i].suscribers) &&
            ( (event.year > today.year) ||
            (event.month > today.month && event.year >= today.year) ||
            (event.day > today.day && event.month >= today.month && event.year >= today.year) || 
            (event.day == today.day && event.month == today.month && event.year == today.year && event.hours > today.hours) );
        if(isAvailable)
            result.push(eventsFinded[i]);
        /*console.log(`Hoy es ${today.day}-${today.month}-${today.year} a las ${today.hours}:${today.minutes}. El evento data del ${event.day}-${event.month}-${event.year} a las ${event.hours}:${event.minutes}.
        PERSONAS: ${eventsFinded[i].suscribers} / ${eventsFinded[i].limit}.
        ESTADO: ${isAvailable?'MANTENIDO':'REMOVIDO'}\n\n`);*/
    }
    if(result.length > 0)
        res.send({error: false, result: result, today: today});
    else
        res.send({error: true});
});

router.get('/api/event/get/customers/:date',  async (req, res) => { // Devuelve los usuarios que tengan :date registrado dentro del array classes[]
    const { date } = req.params;
    let usersFromEvent = await User.find({"classes.dateAndTime": date});
    // let event = await Event.findOne({dateAndTime: date});
    // console.log(event);
    for(let i = 0;i < usersFromEvent.length;i++) {
        for(let j = 0;j < usersFromEvent[i].classes.length;j++) {
            if(usersFromEvent[i].classes[j].dateAndTime != date)
                usersFromEvent[i].classes.splice(j, 1);
        }
    }
    // for(let i = 0;i < usersFromEvent.length;i++) {
    //     for(let j = 0;j < usersFromEvent[i].classes.length;j++) {
    //         console.log(`${usersFromEvent[i].name}, fecha: ${usersFromEvent[i].classes[j].dateAndTime}`);
    //     }
    // }
    // console.log(`Event date: ${event.dateAndTime}`);
    res.send(usersFromEvent);
});

// Obtiene todos los eventos de una categoría en particular, con un límite
router.get('/api/getEventsByCategory/:category/:limit',  async (req, res) => {
    let { limit } = req.params; 
    let result = []; // Acá guardaré los eventos encontrados, para enviarlos al front-end después
    const { category } = req.params;
    let slug = createSlug(category);
    const eventsQuantity = await Event.countDocuments();
    console.log('Hay ' + eventsQuantity + ' eventos, el límite es ' + (limit == 0?'"sólo seminarios activos"':limit) + ' y se busca la categoría de ' + category + ' (' + slug + ').');
    if(limit > eventsQuantity)
        limit = eventsQuantity; // porque no puedo hacer un skip negativo (en la sig. línea de código)
    
    if(limit == 0) { // Si es igual a cero, envío sólo los eventos que están activos.
        result = await Event.find({"category": slug});
    } else {
        result = await Event.find({"category": slug}).skip(await Event.countDocuments() - limit);
    }
    // Nótese que se envian eventos que tengan cupos llenos. Ésto debe controlarse desde front-end
    console.log('Se envía: ' + result);
    res.send(result);
});

router.get('/api/event/getOne/:id', async(req, res) => {
    const { id } = req.params;
    const result = await Event.findById(id);
    if(process.env.NODE_ENV != 'production') console.log(`getOne: ${result}`);
    if(result)
        res.send({error: false, result: result});
    else
        res.send({error: true, result: 'No se encuentra el evento ' + id + '.'});
});

router.post('/api/event/edit/:id', isLogin, isAdmin, async(req, res) => {
    const { id } = req.params;
    const { editedEvent } = req.body;
    if(editedEvent.category && editedEvent.limit && editedEvent.location) {
        let event = new Event({ // merge entre la info que teníamos y la nueva
            _id: id,
            category: createSlug(editedEvent.category),
            location: editedEvent.location,
            locationPassword: editedEvent.locationPassword,
            dateAndTime: editedEvent.dateAndTime,
            suscribers: editedEvent.suscribers,
            limit: editedEvent.limit, // El límite no comprueba si es menor a los suscriptos. Está hecho a propósito para que Claudio pueda quitar un evento del listado en Wordpress sin borrarlo realmente
            isVirtual: editedEvent.locationPassword != ''?true:false
        });
        let result = await Event.updateOne({_id: id}, event);
        res.send({error: !result.nModified});
    } else res.send({error: true});
});

router.get('/api/event/delete/:id', isLogin, isAdmin, async(req, res) => {
    const { id } = req.params;
    const eventToDelete = await Event.findById({_id: id});
    if(eventToDelete) {
        const usersLinkedToEvent = await User.find({"classes.dateAndTime": eventToDelete.dateAndTime});
        for(let i = 0;i < usersLinkedToEvent.length;i++) {
            for(let j = 0;j < usersLinkedToEvent[i].classes.length;j++) {
                if(usersLinkedToEvent[i].classes[j].dateAndTime == eventToDelete.dateAndTime) {
                    usersLinkedToEvent[i].classes.splice(j, 1);
                }
            }
        }
        for(let i = 0;i < usersLinkedToEvent.length;i++)
            await usersLinkedToEvent[i].save(); // Updateo los usuarios de los cuáles se les eliminó la clase
        await eventToDelete.remove();
        res.send({error: false, id: eventToDelete._id});
    } else {
        res.send({error: true});
    }
});

//
// router.post('/api/event/search', async (req, res) => {
//     const { category, isVirtual, location, suscribersSign, suscribersQuantity } = req.body;
//     console.log(category, isVirtual, location, suscribersSign, suscribersQuantity);
//     const events = await Event.find({
//         "category": category.replace(' ', '-').toLowerCase()/*,
//         "suscribers": {
//             $lt: suscribersQuantity
//         }*/
//     });
//     console.log('events: (' + category.replace(' ', '-').toLowerCase() + '): ' + events);
// });

router.post('/api/edit/category', async (req, res) => {
    const { category } = req.body;
    const oldCategory = await Category.findById({_id: category._id}); // Primero debo saber como se llama esa categoría, justo antes de editarla
    // Actualizo el nombre, descripción y slug de la categoría
    category.slug = createSlug(category.name);
    const categoryToUpdate = await Category.findOneAndUpdate({_id: category._id}, category, {new: true});
    // Ahora actualizo las categorias de los eventos
    await Event.updateMany({category: oldCategory.slug}, {category: category.slug})
    res.send(categoryToUpdate);
});

router.post('/api/delete/category', async (req, res) => {
    let { category } = req.body; // 'category.moveDeletesTo' será un string vacío si se quieren eliminar todos los eventos relacionados a dicha categoría. Caso contrario, 'moveDeletesTo' tendrá el 'slug' de una categoría existente.
    if(category.moveDeletesTo == '') { // Si 'moveDeletesTo' es vacío, los eventos no se conservan
        await Event.deleteMany({category: category.slug});
    } else {
        await Event.updateMany({category: category.slug}, {category: category.moveDeletesTo}); // Muevo los eventos a otra categoría
    }
    await Category.deleteOne({slug: category.slug});
    res.send({alert: 'Categoría eliminada.'});
});

// CONTADORES
router.get('/api/count/events', async (req, res) => {
    const result = {
        eventsCount: await Event.countDocuments()
    };
    res.send(result);
});

module.exports = router;

/* 
La garantía no es acumulable y máximo una por año. La garantía surge solamente cuándo:
- Sólo si pago (transferencia bancaria, coupón, paypal) y no asistió
- Sólo si pagó por cualquier método de pago y asistió, pero recayó
- Si es coupon para dos personas, el sistema preguntará por ambas personas

*/