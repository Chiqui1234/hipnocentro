let panel = new Vue({
    el: '#app',
    data: {
        categories: {
            items: [],
            count: 0,
            edit: {} // id de la categoría a editar
        },
        directions: {
            items: [],
            count: 0,
            edit: {} // id de la dirección a editar
        },
        events: {
            items: [],
            count: 0,
            edit: {}, // evento a editar
            customers: [] // clientes de un evento determinado
        },
        customers: {
            items: [],
            selected: {
                items: [],
                activated: false
            }, // Seleccionados para enviar e-mail
            search: {
                result: [], // Resultados de búsqueda
                filter: '',
                key: ''
            },
            count: 0, // Cantidad de clientes
            pages: 0, // Cantidad de páginas
            edit: '' // id del cliente a editar 
        },
        search: {
            filter: '',
            query: ''
        },
        alert: {
            normalText: '',
            modalText: '' // Alerta para modals
        },
        loading: {
            normalText: '',
            modalText: '' // Alerta para modals
        },
        online: true
    },
    created() {
        // this.getEvents(1);
        this.getCategories();
    },
    methods: {
        // General
        stringToColor(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            var colour = '#';
            for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
            }
            return colour;
        },
        sortByDate(items, order) {
            items.sort(function (a, b) { // Esto me hizo la magia para ordenar por fecha :)
                let result = (a.dateAndTime.split('-')[1]).localeCompare(b.dateAndTime.split('-')[1]);
                return result*(order); // Esto para ordenar de mayor a menor (y no al revés)
            });
            return items;
        },
        flushModals() {
            this.alert.modalText = '';
            this.alert.normalText = '';
            this.loading.modalText = '';
            this.loading.normalText = '';
        },
        humanize(slug) { // Las categorias en el modelo de datos 'events' se guardan como un slug, así que acá "humanizo" la categoría, para que no se muestren los slugs en el panel de control
            slug = slug.replace(/-/g, ' ');
            slug = slug.replace(/\b[a-z]/, slug[0].toUpperCase()); // Esto es más efectivo que slug[0].toUpperCase() ó slug.charAt(0).toUpperCase().
            return slug;
        },
        translatePaymentMethod(slug) {
            if(slug == 'cash') return 'Efectivo';
            if(slug == 'coupon') return 'Cupón';
            if(slug == 'credit') return 'PayPal';
            if(slug == 'bank') return 'Banco';
            if(slug == 'relapse') return 'Recaída';
        },
        togglePassword(id) {
            let tag = document.getElementById(id);
            tag.type == 'password' ? tag.type='text' : tag.type='password'
        },
        deleteFrontEndItem(items, idToSearch) { // Elimina un item del front-end, a partir de un '_id'
            let pos = items.map(function(e) { return e._id; }).indexOf(idToSearch);
            if(pos >= 0) {
                items.splice(pos, 1);
                return true;
            } else return false;
        },
        // Categorías
        getCategories() {
            this.loading.normalText = 'Cargando categorías';
            if(this.categories.items.length == 0)
                axios.get('/api/categories/get')
                .then(response => {
                    response.data.sort(function (a, b) {
                        return (a.name).localeCompare(b.name);
                    });
                    this.categories.items = [...response.data];
                    if(this.categories.items.length > 0) this.loading.normalText = '';
                });
            else this.loading.normalText = '';
        },
        createCategory() {
            const config = {
                url: '/api/category/create',
                method: 'post',
                data: {
                    category: this.categories.edit
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'No pudo crearse esta categoría. Intentelo nuevamente.';
                else {
                    this.categories.items.unshift(response.data.category);
                    this.loading.normalText = 'Categoría creada exitosamente';
                    UIkit.modal(document.getElementById('create-category')).toggle();
                }
            })
            .catch();
        },
        setDescriptionOfNewCategory() {
            this.categories.edit.description = 'Seminarios dedicados a ' + this.categories.edit.name;
        },
        editCategory() {
            const config = {
                url: '/api/category/edit',
                method: 'post',
                data: {
                    editedCategory: this.categories.edit
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.normalText = 'No pudo editarse la categoría. Intenta más tarde.';
                else
                    this.loading.normalText = 'Se editó la categoría correctamente.';
            })
            .catch();
            UIkit.modal(document.getElementById('edit-category')).toggle();
        },
        deleteCategory(id) {
            const config = {
                url: '/api/category/delete/' + id,
                method: 'get'
            };
            axios(config)
            .then(response => {
                if(response.data.error) 
                    this.alert.modalText = 'No se pudo eliminar esta categoría, intente más tarde.';
                else {
                    this.deleteFrontEndItem(this.categories.items, id);
                    this.loading.normalText = 'Se eliminó correctamente la categoría.';
                    UIkit.modal(document.getElementById('edit-category')).toggle();
                }
            })
        },
        // Direcciones
        getDirections() {
            this.loading.normalText = 'Cargando direcciones';
            if(this.directions.items.length == 0)
                axios.get('/api/directions/get/')
                .then(response => {
                    this.directions.items = [...response.data]; // Array.from()
                    this.directions.items.sort(function (a, b) {
                        return (a.province).localeCompare(b.province);
                    });
                    
                    if(this.directions.items.length > 0) this.loading.normalText = '';
                });
            else this.loading.normalText = ''; // Se cancela el aviso, en caso de que ya se hayan cargado
        },
        createDirection() {
            const config = {
                url: '/api/direction/create',
                method: 'post',
                data: {
                    direction: this.directions.edit
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'No se pudo crear esta dirección. Intentelo nuevamente.';
                else {
                    this.loading.normalText = 'Dirección creada correctamente.';
                    this.directions.items.unshift(response.data.direction);
                    UIkit.modal(document.getElementById('create-direction')).toggle();
                }
            })
        },
        deleteDirection(id) {
            let i = 0;
            axios.get('/api/direction/delete/' + id)
            .then(response => {
                if(response.data.error)
                    this.alert.normalText = 'No pudo eliminarse la dirección. Intentelo nuevamente.';
                else {
                    this.deleteFrontEndItem(this.directions.items, id);
                    this.loading.normalText = 'Se eliminó la dirección exitosamente.';
                    UIkit.modal(document.getElementById('edit-direction')).toggle();
                }
            })
        },
        // Eventos
        getEvents(limit) {
            this.loading.normalText = 'Cargando eventos';
            if(this.events.items.length == 0)
                axios.get('/api/event/get/' + (limit * 15) )
                .then(response => {
                    this.events.items = this.sortByDate(response.data.result, -1);
                    if(this.events.items.length > 0) this.loading.normalText = '';
                });
            else this.loading.normalText = '';
        },
        getEventById(id) {
            let i = 0;
            while(this.events.items[i]._id != id)
                i++;
            if(this.events.items[i]._id == id) {
                this.events.edit = this.events.items[i];
            } else {
                this.alert.normalText = 'No se encontró este evento';
            }
        },
        createEvent() {
            this.events.edit = {
                category: 'adelgazar',
                limit: '',
                suscribers: 0,
                date: '',
                time: '',
                location: "Av. de las Naciones, s/n Playa de San Juan" + ", " + "Alicante",
                locationPassword: '',
                isVirtual: false
            }
        },
        saveEvent() {
            let config = {
                url: '/api/event/create',
                method: 'post',
                data: {
                    event: this.events.edit
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'No se pudo crear el evento. Intentelo nuevamente.';
                else {
                    this.loading.modalText = 'El evento se creo correctamente';
                    this.events.edit.dateAndTime = this.events.edit.date + ', ' + this.events.edit.time;
                    this.events.items.unshift(this.events.edit);
                }
            });
        },
        editEvent(id) {
            const config = {
                url: `/api/event/edit/${id}`,
                method: 'post',
                data: {
                    editedEvent: this.events.edit
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'No pudo editarse este evento. Intentelo nuevamente.';
                else
                    this.loading.modalText = 'Se editó el evento correctamente.';
            });
        },
        getCustomersFromEvent(date) {
            this.events.customers = [];
            this.loading.modalText = 'Cargando clientes';
            axios.get('/api/event/get/customers/' + date)
            .then(response => {
                this.events.customers = [...response.data];
                if(this.events.customers.length > 0) this.loading.modalText = '';
                let eventPos = this.events.items.map(function(e) { return e.dateAndTime; }).indexOf(date); // Para actualizar el contador de suscriptores
                this.events.items[eventPos].suscribers = this.events.customers.length;
                for(let i = 0;i < this.events.customers.length;i++) {
                    this.events.customers[i].classes[0].color = this.stringToColor(this.events.customers[i].classes[0].couponCode);
                    console.log(this.events.customers[i].classes[0].color);
                }
            });
            if(this.events.customers.length > 0)
                this.loading.modalText = '';
            else
                this.loading.modalText = 'No hay clientes que mostrar';
        },
        changeAssist(userId, userPos, classId) { // Para marcar que asistió (asistencia del usuario) (toggle)
            let axiosConfig = {
                url: '/api/user/edit/assist',
                method: 'post',
                data: {
                    userId: userId,
                    classId: classId
                }
            };
            axios(axiosConfig) // Llamo a la API para cambiar su asistencia
            .then(response => {
                console.log(response.data);
                if(response.data.error)
                    this.alert.modalText = 'Hubo un error al cambiar la asistencia de ' + this.events.customers[userPos].name + '.'
                else {
                    this.loading.modalText = 'Se cambió la asistencia correctamente.';
                    this.events.customers[userPos].classes[0].assist = response.data.result;
                }
            });
        },
        changePayout(userId, classId) { // 'classId' es una fecha
            let axiosConfig = {
                url: '/api/user/edit/payout',
                method: 'post',
                data: {
                    userId: userId,
                    classId: classId,
                    payout: 0
                }
            };
            let i = 0;    
            while(this.events.customers[i]._id != userId) // Busco al usuario
                i++;
            if(this.events.customers[i]._id == userId) { // Si el usuario existe
                axiosConfig.data.payout = this.events.customers[i].classes[0].payout;
                axios(axiosConfig)
                .then(response => {
                    if(response.data.error)
                        this.alert.modalText = 'Hubo un error al cambiar el pago de ' + this.events.customers[i].name + '.';
                    else
                        this.loading.modalText = 'Se cambió el monto pagado por ' + this.events.customers[i].name + '.';
                });
            }
        },
        deleteEvent(id) {
            axios.get('/api/event/delete/' + id)
            .then(response => {
                let i = 0;
                if(!response.data.error && this.events.edit._id == response.data.id) {
                    this.deleteFrontEndItem(this.events.items, id);
                    this.events.edit = {};
                    this.loading.normalText = 'Se eliminó exitosamente el evento.';
                } else {
                    this.alert.normalText = 'No pudo eliminarse el evento';
                }
                UIkit.modal(document.getElementById('edit-event')).toggle();
            });
        },
        deleteUserFromEvent(userId, classId) {
            axios.get('/api/user/delete/classFromUser/' + classId)
            .then(response => {
                let i = 0;
                if(response.data.error)
                    this.alert.modalText = `No se pudo eliminar a ${this.customers.items[i].name} del seminario.`;
                else {
                    this.loading.modalText = `Se eliminó correctamente a ${this.customers.items[i].name} del seminario`;
                    let userPos = this.deleteFrontEndItem(this.customers.items, userId);
                }
            })
            .catch(this.alert.modalText = 'Hubo un error de red.');
        },
        // Usuarios
        getCustomers(limit) {
            this.loading.normalText = 'Cargando clientes';
            if(this.customers.items.length == 0)
                axios.get('/api/user/get/' + limit )
                .then(response => {
                    if(response.data.error)
                        this.alert.normalText = 'No se pudieron encontrar todos los usuarios';
                    else {
                        this.customers.items = [...response.data.result];
                        this.customers.items = this.customers.items.reverse();
                        this.loading.normalText = '';
                    }
                });
            else this.loading.normalText = '';
        },
        editSuscription(userId, classId) {
            let config = {
                method: 'post',
                url: '/api/user/edit/suscription',
                data: {
                    userId: userId,
                    classId: classId,
                    data: {
                        couponCode: document.getElementById(`couponCode_${userId}`).innerText,
                        couponCodeSec: document.getElementById(`couponCodeSec_${userId}`)?document.getElementById(`couponCodeSec_${userId}`).innerText:''
                    }
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = `No se puede editar la suscripción. ¿Quizá el teléfono está mal escrito?`
                else {
                    let userPos = this.events.customers.map(function(e) { return e._id; }).indexOf(userId);
                    this.loading.modalText = `Has editado correctamente la suscripción de ${this.events.customers[userPos].name}.`;
                    // console.log(response.data.result);
                }
            })
            .catch();
        },
        sendSuscriptionEmail(userId, classId) {
            let config = {
                method: 'post',
                url: '/api/user/notify',
                data: {
                    userId: userId,
                    classId: classId
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'El servicio de email no pudo re-enviar el correo';
                else {
                    this.loading.modalText = 'El email fue enviado correctamente.';
                    this.events.customers.classes[0].notified = true;
                }
            })
            .catch(function() {this.alert.modalText = 'El sistema no se pudo conectar con el servicio de e-mails'});
        },
        deleteUserFromEvent(userId, classId, generalClassId) {
            axios.get('/api/user/delete/classFromUser/' + classId)
            .then(response => {
                let userPos = this.events.customers.map(function(e) { return e._id; }).indexOf(userId);
                console.log(`response.data ${response.data.error}`)
                if(!response.data.error && this.events.customers[userPos]._id == userId) {
                    this.events.customers.splice(userPos, 1);
                    this.loading.modalText = 'Usuario eliminado de la clase correctamente';
                    let eventPos = this.events.items.map(function(e) { return e._id}).indexOf(generalClassId);
                    this.events.items[eventPos].suscribers--;
                } else {
                    this.alert.modalText = 'No se pudo eliminar este usuario de la clase';
                }
            })
            .catch();
        },
        deleteUser(userId) {
            let config = {
                method: 'delete',
                url: '/api/user',
                data: {
                    userId: userId
                }
            };
            axios(config)
            .then(response => {
                if(response.data.error)
                    this.alert.normalText = `No pudo eliminarse este usuario.`;
                else {
                    let userPos = this.deleteFrontEndItem(this.customers.items, userId);
                    this.loading.normalText = `Se eliminó el usuario`;
                }
            })
            .catch();
        },
        searchCustomers() {
            console.log('searchCustomers()');
            this.customers.search.result = []; // Reset de la info
            this.loading.modalText = '';
            this.alert.modalText = '';
            let axiosConf = {
                url: '/api/user/search',
                method: 'POST',
                data: {
                    filter: this.customers.search.filter,
                    key: this.customers.search.key
                }
            };
            axios(axiosConf)
            .then(response => {
                if(response.data.error)
                    this.alert.modalText = 'Hay un error en la búsqueda o no se encontraron coincidencias.';
                else {
                    this.customers.search.result = [...response.data.result];
                    this.loading.modalText = 'Los datos se descargaron correctamente.';
                }
            })
            .catch();
        },
        // E-mails
        getDestinations() {
            let destinations = [];
            for(let i = 0;i < this.events.customers.length;i++) {
                console.log(`Se revisa ${this.events.customers[i].email}`);
                if(this.customers.selected.items[i]) {
                    console.log(`Se añade ${this.events.customers[i].email}`);
                    destinations.push({email: this.events.customers[i].email});
                }
            }
            if(destinations.length == 0) // Si no hay ninguno seleccionado, se envía a todos
                for(let i = 0;i < this.events.customers.length;i++)
                    destinations.push({email: this.events.customers[i].email});
            console.log(destinations);
            return destinations;
        },
        emailWizard() {
            if(!this.customers.selected.activated) { // Primer paso
                this.customers.selected.items.length = this.events.customers.length;
                this.customers.selected.activated = true;
            } else { // Segundo paso
                this.alert.modalText = '';
                this.loading.modalText = '';
                let destinations = this.getDestinations();
                if(document.getElementById('emailTxt').value.length >= 10) {
                    let config = {
                        url: '/api/user/notify/custom',
                        method: 'POST',
                        data: {
                            destinations: destinations,
                            message: document.getElementById('emailTxt').value
                        }
                    };
                    console.log(config);
                    axios(config)
                    .then(response => {
                        // if(response.data.error)
                        //     this.alert.modalText = 'No se ha podido enviar el correo electrónico a ningún destinatario. Intenta más tarde.';
                        // else {
                            this.loading.modalText = 'Se ha enviado el correo exitosamente.';
                        // }
                    })
                    .catch();
                } else
                    this.alert.modalText = 'Has escrito un mensaje muy corto.';
            }
        },
        shutdownEmailWizard() {
            this.customers.selected.activated = false
            this.loading.modalText = '';
            this.alert.modalText = '';
        }
    },
    delimiters: ['[[', ']]']
});
// for(let i = 0;i < response.data.length;i++) {
    //     Vue.set(this.directions, i, response.data[i]); // Si hiciera 'this.customers[i] = response.data[i]', los valores cambian pero esa parte del DOM no sería reactiva, por eso uso 'Vue.set()' --> https://es.vuejs.org/v2/guide/list.html#Cuidados
    // }
setInterval(function() {
    if(!window.navigator.onLine) {
        panel.alert.normalText = 'No tienes internet';
        this.online = window.navigator.onLine;
    }
}, 3000);

// for(let i = 0;i < response.data.length;i++)
//                     Vue.set(this.customers, i, response.data[i]); // Si hiciera 'this.customers[i] = response.data[i]', los valores cambian pero esa parte del DOM no sería reactiva, por eso uso 'Vue.set()' --> https://es.vuejs.org/v2/guide/list.html#Cuidados