let suscribersApp = new Vue({
    el: '#suscriptionApp',
    data: {
        events: [],
        users: [
            {name: '', telephone: '', email: '', paymentMethod: 'coupon', valid: false, validPayment: false, couponCode: '', couponCodeSec: '', couponPartner: '', paymentDate: '', payout: 0}
        ],
        system: {
            selectedEvent: 0,
            //selectedEventObject: {}, // Acá se guarda el evento seleccionado en el formulario. Útil por si el cliente desea cambiar de seminario desde el formulario mismo
            selectedUser: 0,
            usersQuantity: 0, // Por defecto es uno, pueden ser dos (para añadir compañero)
            userSaved: false,
            step: 0, /* 0: registro de datos, 1: método de pago, 2: registro de segundo compañero, 3: ventana de pago exitoso */
            payPalUser: '', // Usado para indicar el dueño de la cuenta PayPal
            loadingGif: false // Habilita un gif en caso de que se esté cargando algo muy lentamente
        },
        alert: {modalText: ''},     // Notificaciones para el usuario
        loading: {modalText: ''}    // Notificaciones para el usuario
    },
    created() {

    },
    methods: {
        // General
        checkAllAndSubmit() { // En el back-end, se va a determinar el compañero por código de cupón
            if(this.system.usersQuantity == 2) { // Los datos del pago los tiene user[1] (cuándo se agregan dos usuarios). Debo copiarlos al user[0]
                this.users[0].couponCode = this.users[1].couponCode;
                this.users[0].couponCodeSec = this.users[1].couponCodeSec;
                this.users[0].paymentMethod = this.users[1].paymentMethod;
                // Enlazo compañeros 👇
                this.users[0].couponPartner = this.users[1].name;
                this.users[1].couponPartner = this.users[0].name;
                if(env == 'dev') console.log('Se copiaron los métodos de pago exitosamente.');
            }
            let saveUser = () => {
                let config = {
                    data: {
                        user: this.users[this.system.selectedUser],
                        eventId: this.events[this.system.selectedEvent]._id,
                        paymentMethod: this.events[this.system.selectedUser].paymentMethod
                    },
                    url: baseUrl + '/api/user/add/class',
                    method: 'post'
                };
                axios(config)
                .then((response) => {
                    if(response.data.error) {
                        this.alert.modalText = `${this.system.usersQuantity == 2?`No se pudo guardar ninguna reserva.`:`No se pudo guardar la reserva de ${this.users[0].name}.`}`;
                    } else {
                        if(response.data.result == 'Ya estabas registrado aquí, no puedes hacerlo nuevamente.') // Si ya estaba registrado
                            document.getElementById('blockWhenUserIsAlreadyRegistered').style.display = 'none'; // Oculto un texto que podría confundir
                        this.system.userSaved = true;
                        this.loading.modalText += ' ' + response.data.result;
                        this.system.step++; // Llegamos al último paso, mostrando el resúmen (step 4)
                        document.getElementById('paypal-button-container').innerHTML = ''; // Borro los botones de paypal, para que se instancien nuevos en caso de que un cliente quiera registrarse en otro seminario
                    }
                    this.system.loadingGif = false;
                })
                .catch(this.system.loadingGif = true);
                setTimeout(function() {
                    if(env != 'dev') 
                        document.getElementById('main-header').style.zIndex = '1';
                }, 5000);
            };
            // !this.system.error && this.system.usersQuantity == 2
            // Selecciono user[0], compruebo y guardo
            this.system.selectedUser = 0;
            if(this.checkUser())
                saveUser();
            else this.alert.modalText = 'Parece que has cambiado un dato que invalidó tu reserva. ¡Prueba de nuevo!';
            // Selecciono user[1] (si existe), compruebo y guardo
            if(this.system.usersQuantity == 2) {
                this.system.selectedUser = 1;
                if(this.checkUser())
                    saveUser();
            }
        },
        humanize(string) {
            if(string)
                return string.replace(/-/g, ' ').replace(/\b[a-z]/, string.charAt(0).toUpperCase());
            else return string;
        },
        translatePayment(paymentMethod) {
            if(paymentMethod == 'cash') return 'Efectivo';
            if(paymentMethod == 'coupon') return 'Cupón';
            if(paymentMethod == 'credit') return 'Tarjeta de débito/crédito';
            if(paymentMethod == 'relapse') return 'Recaída';
        },
        generateCouponCode() {
            return parseInt(Math.random()*100000000);
        },
        resetAll() {
            for(let i = 0;i < this.users.length;i++) this.users.pop(); // Borro los usuarios
            this.users.push({name: '', telephone: '', email: '', paymentMethod: 'coupon', valid: false, validPayment: false, couponCode: '', couponCodeSec: '', couponPartner: '', paymentDate: '', payout: 0}); // Añado un usuario base
            this.system.selectedUser = 0; // Selecciono el primer usuario base
            this.system.step = 0; // Vuelvo al primer paso
            this.alert.modalText = ''; // Reseteo notificaciones
            this.loading.modalText = ''; // Reseteo notificaciones
        },
        goBack() { // Hacer que esta función pueda ir hasta un paso determinado
            if(this.system.step > 0) this.system.step--;
        },
        goNext() { // Hacer que esta función pueda ir hasta un paso determinado
            if(this.system.step < 3) this.system.step++;
        },
        // Eventos
        reloadEvents() {
            this.events = eventsApp.events;
            this.system.selectedEvent = eventsApp.system.selectedEvent;
        },
        // Usuarios
        // checkSuscribersQuantity() { // Nota: los suscriptores y el límite se actualiza con la función getEvent()
        //     let updatedEvent = eventsApp.getActualEvent();
        //     console.log(`checkSuscribersQuantity() > updatedEvent: ${updatedEvent}`);
        //     if(updatedEvent) {
        //         eventsApp.events[this.system.selectedEvent] = updatedEvent;
        //         if(eventsApp.events[this.system.selectedEvent].suscribers > eventsApp.events[this.system.selectedEvent].limit/2)
        //             this.loading.modalText = '¡Apúntate! Más de la mitad del cupo para este seminario ya está lleno.';
        //         else if(eventsApp.events[this.system.selectedEvent].suscribers >= eventsApp.events[this.system.selectedEvent].limit) {
        //             this.alert.modalText = 'Se acaba de llenar el cupo de personas en este seminario.';
        //             console.log(`checkSuscribersQuantity() > events.splice()`);
        //             eventsApp.events.splice(this.system.selectedEvent, 1);
        //         }
        //     } else this.alert.modalText = 'Error al cargar el aforo del seminario.';
        // },
        checkSuscribersQuantity() {
            return true;
        },
        // Usuarios
        isValidEmail(email) {
            var re = /\S+@\S+\.\S+/;
            let result = re.test(email);
            return result;
        },
        checkUser() {
            this.alert.modalText = '';
            if( this.users[this.system.selectedUser].name.split(' ').length < 2 )
                this.alert.modalText = 'Por favor, escribe tu nombre y apellido.';
            else if( this.users[this.system.selectedUser].telephone.length < 9)
                this.alert.modalText = 'El teléfono debe tener al menos 9 caracteres.';
            else if( !this.isValidEmail(this.users[this.system.selectedUser].email) )   
                this.alert.modalText = 'Introduce un e-mail válido.';
            //
            if(this.alert.modalText == '') {
                this.users[this.system.selectedUser].valid = true;
                return true;
            } else {
                this.users[this.system.selectedUser].valid = false;
                return false;
            }
        },
        // Pagos
        loadPaymentWindow() {
            let userIsValid = this.checkUser();
            if(env == 'dev') console.log(`El usuario es ${userIsValid?'válido':'inválido'}.`);
            if(userIsValid) {
                //this.saveUser(); // Si el usuario es válido, lo guardamos de antemano para tener sus datos
                this.alert.modalText = '';
                this.loading.modalText = 'Todos tus datos son válidos.';
                if(this.system.usersQuantity > this.users.length) { // Si el usuario seleccionó que irá con compañero, debemos crear un compañero en el array
                    this.users.push({name: '', telephone: '', email: '', paymentMethod: this.users[0].paymentMethod, valid: false, validPayment: false, couponCode: '', couponCodeSec: '', couponPartner: '', paymentDate: '', payout: 0}); // Añado un usuario base
                    this.system.selectedUser = 1; // Seleccionamos este usuario que acabamos de crear
                }
                this.goNext();
            } else {
                this.system.selectedUser = 0;
                this.alert.modalText = 'Revisa que tu e-mail, teléfono, nombre y apellido estén bien escritos.';
                this.loading.modalText = '';
                this.goBack();
            }
        },
        checkPayment() { // Pagos y Garantía
            const config = {
                url: baseUrl + '/api/user/warranty',
                data: {
                    email: this.users[this.system.selectedUser].email,
                    couponCodeToSearch: this.users[this.system.selectedUser].couponCode
                },
                method: 'post'
            };
            this.alert.modalText = ''; // Reseteamos las buenas notificaciones, para no confundir
            this.loading.modalText = ''; // Ídem
            if( this.users[this.system.selectedUser].paymentMethod == 'coupon' &&
            this.users[this.system.selectedUser].couponCode.length > 1 &&
            this.users[this.system.selectedUser].couponCodeSec.length > 1 )
                this.users[this.system.selectedUser].validPayment = true;
            else if( this.users[this.system.selectedUser].paymentMethod == 'relapse' ) {
                axios(config)
                .then(response => {
                    if(response.data.error)
                        this.alert.modalText = response.data.result;
                    else
                        this.loading.modalText = response.data.result;
                    this.users[this.system.selectedUser].validPayment = !response.data.error;
                })
                .catch();
            } else if( this.users[this.system.selectedUser].paymentMethod == 'credit' ) {
                this.loading.modalText = 'Ahora cliquea "Pagar con PayPal"';
                this.alert.modalText = '';
            } else {
                this.users[this.system.selectedUser].validPayment = false; // El chequeo de PayPal se ejecuta dentro del código y estándares proporcionados por ellos. Desde allí se cambia a 'true', si corresponde
                this.alert.modalText = 'Escribe correctamente los datos.'; // Nueva línea escrita 21/12/2020 12:27
            }
            if(this.users[0].paymentMethod != 'coupon' && this.users[0].paymentMethod != 'relapse') this.users[0].couponCode = this.generateCouponCode();
        },
        togglePayPalWindow() {
            document.getElementById('suscriptionWindow').style.zIndex = document.getElementById('suscriptionWindow').style.zIndex == -1?1:-1;
            document.getElementById('payPalWindow').style.left = document.getElementById('payPalWindow').style.left == '-100%'?'0':'-100%';
            // Uso usersQuantity porque es una unidad mayor que selectedUser. Dado que el pago se almacena en el último usuario registrado, usar usersQuantity en el caso de PayPal es vital porque el pago se realiza cuándo selectedUser == 1. Esto no afecta cuándo se registra sólo un usuario, pero sí cuándo hay dos: si hay dos personas a punto de registrarse y usara selectedUser, couponCode y paymentDate se guardarían en el primer usuario. Esto rompería con el estándar de guardar el pago en el último usuario, en los casos que se guardan dos personas o más.
            if( document.getElementById('paypal-button-container').innerHTML == '' ) {
                // Si aún no pagaron, llamamos a la función
                if(this.users[this.system.usersQuantity-1].payout != 10 &&
                this.users[this.system.selectedUser].paymentMethod == 'cash') // Seña por si se quiere pagar con efectivo
                    payPal(10);
                else if(this.users[this.system.usersQuantity-1].payout != 50 || // PayPal para 1
                this.users[this.system.usersQuantity-1].payout != 90) // PayPal para 2
                    payPal(this.system.usersQuantity == 1?'50':'90'); // Llamo a PayPal y envío el precio en éuros de la reserva
            }
        }
    },
    delimiters: ['[[', ']]']
})