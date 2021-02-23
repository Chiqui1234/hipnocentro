let eventsApp = new Vue({
    el: '#events',
    data: {
        events: [],
        system: {
            selectedEvent: 0
        }
    },
    created() {
        this.getAvailableEvents();
        if(env != 'dev') {
            document.getElementById('events').style.position = 'relative';
            document.getElementById('events').style.zIndex = '9999';
        }
    },
    methods: {
        // General
        humanize(string) {
            return string.replace(/-/g, ' ').replace(/\b[a-z]/, string.charAt(0).toUpperCase());
        },
        // Eventos
        setEvent(i) {
            if(env != 'dev') 
                document.getElementById('main-header').style.zIndex = '-1'; // Desaparecer el header de wordpress
            this.system.selectedEvent = i;
            suscribersApp.reloadEvents();
        },
        getActualEvent() { // Obtiene el evento al que se está por suscribir el usuario
            let event = {};
            console.log('Método getEvent() iniciado.');
            axios.get(baseUrl + '/api/event/getOne/' + this.events[this.system.selectedEvent]._id)
            .then(response => {
                if(!response.data.error) event = response.data.result;
                console.log(`getActualEvent() gets: ${response.data.result}
                Error: ${response.data.error}`);
                // Si hay un error, mejor dejar el evento tal cuál está y seguir
            })
            .catch();
            return event;
        },
        getAvailableEvents() {
            axios.get(baseUrl + '/api/event/get/20/available')
            .then(response => {
                if(!response.data.error) {
                    this.events = response.data.result;
                    for(let i = 0;i < this.events.length;i++) {
                        this.events[i].category = this.humanize(this.events[i].category);
                        if(this.events[i].isVirtual) this.events[i].location = 'Virtual (Internet)';
                        else {
                            let shortLocation = this.events[i].location.split(',');
                            this.events[i].location = shortLocation[shortLocation.length-1];
                        }
                    }
                }
                if(this.events.length == 0)
                    this.events.push({category: '-', location: 'No hay seminarios disponibles', dateAndTime: '-'})
            })
            .catch(() => {
                this.events.push({
                    category: 'Error',
                    location: 'No pudieron cargarse los eventos.',
                    dateAndTime: '-'
                });
            })
        },
        // Usuarios
        isValidEmail(email) {
            var re = /\S+@\S+\.\S+/;
            let result = re.test(email);
            return result;
        },
        checkUser() {
            if( this.users[this.system.selectedUser].name.length > 3 &&
             this.users[this.system.selectedUser].telephone.length > 6 &&
             this.isValidEmail(this.users[this.system.selectedUser].email ) ) {   
                this.users[this.system.selectedUser].valid = true;
             } else {
                this.users[this.system.selectedUser].valid = false;
                this.system.lastStep = false; // Si el usuario está mal, hay que permanecer en el primer paso
             }
        },
    },
    delimiters: ['[[', ']]']
})