// Plantilla para suscripción de emails
const helpers = {};
helpers.suscriptionEmail = function(user, event) {
    console.log(event);
    let eventPassword = !event.locationPassword || event.locationPassword == 'Ninguna'?'Ninguna':event.locationPassword;
    let passwordIfIsVirtual = eventPassword != 'Ninguna'?`<li>Contraseña: ${eventPassword}</li>`:''; // Contiene la contraseña, que se mostrará sólamente si tiene (si no tiene, puede ser un evento presencial o que efectivamente no tenga ninguna contraseña).
    if(passwordIfIsVirtual != '') { // Si es virtual, metemos también el tutorial para instalar Zoom
        passwordIfIsVirtual += '<li><a href="https://youtu.be/Jq5xFQ5wmjI">Tutorial para instalar Zoom</a></li>';
    }
    const dejarDeFumar = event.category == 'dejar-de-fumar' || event.category == 'Dejar De fumar'?`
    <h3 style="color: rgb(238, 145, 24);">Recomendaciones para aumentar el éxito de tu sesión:</h3>
    <ol>
    <li>Una semana antes de acudir a la sesión contabiliza el total de cigarrillos que fumas a diario</li>
    <li>Del total de cigarrillos fumados selecciona los cigarrillos que para ti serían importantes en tu día.</li>
    <li>Los cigarrillos que no son importantes debes abandonarlos y solo consumir los importantes, al menos una semana antes.</li>
    </ol>
    <p>Llegar al día de tu sesión de hipnosis para dejar de fumar consumiendo la menor cantidad de cigarrillos te ayudará a nivel físico sino también a nivel psicológico.</p>
    <p>Ten en cuenta que <strong>el código de reserva te servirá para utilizar la garantía de un año, exclusivo de los seminarios para Dejar de fumar</strong>.</p>
    `:''; // Texto extra si el seminario es para "Dejar de fumar"
    const eventLink = event.isVirtual ? `<a href="${event.location}">Link a la clase virtual</a>` : `<a href="https://www.google.com/maps/place/${event.location.replace(/\s+/g, '+')},+España">${event.location}</a>`; // Cambio de link y texto según tipo de evento (virtual o no)
    const couponPartner = (user.couponPartner && user.couponPartner.length > 0) ? '<li>Tu compañero: ' + user.couponPartner + '</li>' : '';
    const couponCode = user.couponCode == process.env.HIPNOCENTRO_WARRANTY_CODE ? 'Garantía' : user.couponCode;
    const couponCodeSec = (user.couponCodeSec && user.couponCodeSec.length > 0) ? '<li>Cód. de seguridad: ' + user.couponCodeSec + '</li>' : '';
    const emailContent = `
    <style>
        a { color: rgb(238, 145, 24); text-decoration: none; margin: 0 5px 0 5px }
        a:hover { text-decoration: underline }
    </style>
    <div style="width: 90%;margin: 10px auto;padding-bottom: 10px;border-bottom: 2px solid rgb(238, 145, 24);">
        <img src="https://www.hipnocentro.com/2020/wp-content/uploads/2020/06/cabecera_email_hipnocentro.jpg" width="100%" />
        <h1 style="color: rgb(61, 64, 135);">Tu suscripción al evento se ha realizado con éxito</h1>
        <ul>
            <li>Lugar: ${eventLink}</li>
            ${passwordIfIsVirtual}
            <li>Fecha y horario: ${event.dateAndTime}</li>
            <li>Te has registrado como: ${user.name}</li>
            ${couponPartner}
            <li>Código de reserva: ${couponCode}</li>
            ${couponCodeSec}
        </ul>
        ${dejarDeFumar}
        <p>Si necesitas pedir más información o necesitas pagar virtualmente por el seminario, por favor llámanos al <a href="tel:620980239"><strong>620980239</strong></a>, estaremos para responderte.</p>
        <p>Muchas gracias,<br />
        <a href="mailto:info@hipnocentro.com">info@hipnocentro.com</a><br />
        <a href="https://hipnocentro.com">www.hipnocentro.com</a>.</p>
    </div>`; // Contenido del email que se enviará al usuario, una vez que se registre la clase en su cuenta
    return emailContent;
};

module.exports = helpers;