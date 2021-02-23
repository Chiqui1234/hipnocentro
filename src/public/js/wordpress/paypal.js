// Render the PayPal button into #paypal-button-container
function payPal(eur) {
    paypal.Buttons({
        // Crear transacción
        createOrder: function(data, actions) {
            document.getElementById('payPalNotification').style.display = 'block';
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: eur
                    }
                }]
            });
        },
        // Finalizar transacción
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                if(env == 'dev') console.log(details);
                document.getElementById('payPalNotification').innerHTML = `<p>Todo correcto. ☑</p>`
                setTimeout(() => {
                    suscribersApp.users[suscribersApp.system.selectedUser].validPayment = true;
                    suscribersApp.users[suscribersApp.system.selectedUser].couponCode = details.id;
                    suscribersApp.users[suscribersApp.system.selectedUser].paymentDate = details.update_time;
                    suscribersApp.users[suscribersApp.system.selectedUser].payout = details.purchase_units[0].amount.value;
                    suscribersApp.system.payPalUser = `${details.payer.name.given_name} ${details.payer.name.surname}.`; // Nombre y apellido del titular de la cuenta de PayPal
                    // document.getElementById('formPayPalBtn').style.display = 'none';
                    suscribersApp.togglePayPalWindow(); // Cierro la ventana de PayPal
                    suscribersApp.alert.modalText = '';
                }, 1000);
            });
        },
        // Manejo de errores
        onError: function(err) {
            suscribersApp.alert.modalText = 'Error en el pago de PayPal. Por favor, háblanos en la página de Contacto.';
            suscribersApp.togglePayPalWindow(); // Cierro la ventana de PayPal
            if(env == 'dev') console.log(err);
        }
    }).render('#paypal-button-container');
}
// add "&debug=true" if you need PayPal's debugging