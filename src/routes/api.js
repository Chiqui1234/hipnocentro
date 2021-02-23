const   router = require('express').Router(),
        User = require('../models/user'),
        Event = require('../models/event'),
        Category = require('../models/category'),
        Error = require('../models/error'),
        fs = require('fs'),
        excelJs = require('exceljs'),
        { createExcel } = require('../helpers/createExcel');

router.get('/api/excel/createFrom/event/:eventId',  async (req, res) => { // Encuentra un evento por ID y lista todos sus suscriptores
    const { eventId } = req.params;
    const eventFinded = await Event.findById(eventId);
    const possibleSuscriber = await User.find({"classes.dateAndTime": eventFinded.dateAndTime});
    if(possibleSuscriber && possibleSuscriber.length > 0) {
        let header = [
            {
                header: 'Nombre',
                key: 'name',
                width: 24
            },
            {
                header: 'Email',
                key: 'email',
                width: 32
            },
            {
                header: 'Teléfono',
                key: 'telephone',
                width: 18
            },
            {
                header: 'Método de pago',
                key: 'paymentMethod',
                width: 18
            },
            {
                header: 'Monto €',
                key: 'payout',
                width: 8
            },
            {
                header: 'Código',
                key: 'couponCode',
                width: 18
            },
            {
                header: 'Cód. seguridad',
                key: 'couponCodeSec',
                width: 12
            },
            {
                header: 'Acompañante',
                key: 'couponPartner',
                width: 24
            }
        ];
        let rows = [];
        for(let i = 0;i < possibleSuscriber.length;i++) {
            for(let j = 0;j < possibleSuscriber[i].classes.length;j++) {
                if(possibleSuscriber[i].classes[j].dateAndTime == eventFinded.dateAndTime) {
                    if(possibleSuscriber[i].classes[j].paymentMethod == 'cash') possibleSuscriber[i].classes[j].paymentMethod = 'Efectivo';
                    if(possibleSuscriber[i].classes[j].paymentMethod == 'bank') possibleSuscriber[i].classes[j].paymentMethod = 'Transferencia bancaria';
                    if(possibleSuscriber[i].classes[j].paymentMethod == 'credit') possibleSuscriber[i].classes[j].paymentMethod = 'PayPal';
                    if(possibleSuscriber[i].classes[j].paymentMethod == 'coupon') possibleSuscriber[i].classes[j].paymentMethod = 'Cupón';
                    if(possibleSuscriber[i].classes[j].paymentMethod == 'relapse') possibleSuscriber[i].classes[j].paymentMethod = 'Recaída';
                    rows.push([ // Fijate que van en mismo órden que el header
                        possibleSuscriber[i].name,
                        possibleSuscriber[i].email,
                        possibleSuscriber[i].telephone,
                        possibleSuscriber[i].classes[j].paymentMethod,
                        possibleSuscriber[i].classes[j].payout,
                        possibleSuscriber[i].classes[j].couponCode,
                        possibleSuscriber[i].classes[j].couponCodeSec,
                        possibleSuscriber[i].classes[j].couponPartner == ''?'Ninguno':possibleSuscriber[i].classes[j].couponPartner
                    ]);
                }
            }
        }
        let workbook = createExcel(header, rows, {creator: 'Panel de Hipnocentro', sheetName: 'Suscriptores de ' + (eventFinded.category.replace(/-/g, ' ')).replace(/\b[a-z]/, eventFinded.category.charAt(0).toUpperCase()) });
        if(workbook) {
            for(let i = 0;i < rows.length;i++) { // El Excel comienza en uno, no en cero
                let cell = 'A' + (i+1+1);
                workbook.worksheets[0].getCell(cell).value = { // +1 porque la primer fila es el header
                    text: rows[i][0], // [0][0] es 'name'
                    hyperlink: 'https://panel.hipnocentro.com/user/'+rows[i][1], // [0][1] es 'email'
                    tooltip: 'Ver perfil del usuario'
                };
                console.log(cell + ': ' + rows[i][0]);
            }
            let url = 'xlsx/' + (eventFinded.category.replace(/-/g, ' ')).replace(/\b[a-z]/, eventFinded.category.charAt(0).toUpperCase()) + ', ' + eventFinded.dateAndTime + '.xlsx';
            await workbook.xlsx.writeFile(url);
            // write to a new buffer
            const buffer = await workbook.xlsx.writeBuffer();
            // res.send(workbook);
            fs.writeFile(url, buffer, function(err) {
                if(err) console.log(err)
                else res.download(url);
            });
        } else res.send(false);
    } else {
        console.warn('No hay suscriptores de este evento.');
        res.send(false);
    }
});

router.get('/api/excel/createFrom/user/:userId',  async (req, res) => { // Encuentra un evento por ID y lista todos sus suscriptores
    const { userId } = req.params;
    const user = await User.findById(userId);
    let header = [
        {
            header: user.name, // Corresponde también a 'Categoría'
            key: 'name',
            width: 24
        },
        {
            header: user.email, // Corresponde también a 'Lugar'
            key: 'email',
            width: 48
        },
        {
            header: user.telephone, // Corresponde también a 'Fecha'
            key: 'telephone',
            width: 18
        },
        {
            header: user.classes.length + ' Seminario(s)', // Corresponde también a 'Método de pago'
            key: 'classes',
            width: 24
        },
        {
            width: 8 // Corresponde también a 'Monto €'
        },
        {
            width: 12 // Corresponde también a 'Código'
        },
        {
            width: 12 // Corresponde también a 'Cód. seguridad'
        },
        {
            width: 8 // Corresponde también a 'Asistencia'
        },
        {
            width: 32 // Corresponde también a 'Compañero'
        }
    ];
    let rows = [
        [],
        ['Categoría', 'Lugar', 'Fecha', 'Método de pago', 'Monto €', 'Código', 'Cód. seguridad', 'Asistencia', 'Compañero']
    ];
    for(let i = 0;i < user.classes.length;i++) {
        if(user.classes[i].paymentMethod == 'cash') user.classes[i].paymentMethod = 'Efectivo';
        if(user.classes[i].paymentMethod == 'bank') user.classes[i].paymentMethod = 'Transferencia bancaria';
        if(user.classes[i].paymentMethod == 'credit') user.classes[i].paymentMethod = 'PayPal';
        if(user.classes[i].paymentMethod == 'coupon') user.classes[i].paymentMethod = 'Cupón';
        if(user.classes[i].paymentMethod == 'relapse') user.classes[i].paymentMethod = 'Recaída';
        rows.push([
            (user.classes[i].category.replace(/-/g, ' ')).replace(/\b[a-z]/, user.classes[i].category.charAt(0).toUpperCase()),
            user.classes[i].location,
            user.classes[i].dateAndTime,
            user.classes[i].paymentMethod,
            user.classes[i].payout,
            user.classes[i].couponCode,
            user.classes[i].couponCodeSec,
            user.classes[i].assist,
            user.classes[i].couponPartner == ''?'Ninguno':user.classes[i].couponPartner
        ]);
    }
    let workbook = createExcel(header, rows, {creator: 'Panel de Hipnocentro', sheetName: 'Perfil de ' + user.name});
    if(workbook) {
        let url = 'xlsx/Perfil de ' + user.name + '.xlsx';
        await workbook.xlsx.writeFile(url);
        // write to a new buffer
        const buffer = await workbook.xlsx.writeBuffer();
        // res.send(workbook);
        fs.writeFile(url, buffer, function(err) {
            if(err) console.log(err)
            else res.download(url);
        });
    } else res.send(false);
});

router.get('/api/categories/get', async (req, res) => { // Obtiene las categorías disponibles
    const result = await Category.find();
    res.send(result);
});

router.get('/api/errors/get', async(req, res) => {
    const result = await Error.find();
    res.send(result);
})

module.exports = router;