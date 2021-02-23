const userEmail = document.URL.split('/');
let profile = new Vue({
    el: '#profile',
    data: {
        email: userEmail[userEmail.length-1],
        user: {name: 'Cargando...'},
        alert: {normalText: ''},
        loading: {normalText: ''}
    },
    created() {
        this.loadUser(this.email);
    },
    methods: {
        loadUser(email) {
            axios.get('/api/user/get/raw/' + email)
            .then(response => {
                if(response.data.error)
                    this.user.name = 'Error al cargar el usuario'
                else
                    this.user = response.data.result
            })
            .catch();
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
            const classPos = this.user.classes.map(function(e) { return e.dateAndTime; }).indexOf(classId);
            axiosConfig.data.payout = this.user.classes[classPos].payout;
            console.log(axiosConfig.data.payout);
            axios(axiosConfig)
            .then(response => {
                console.log(response.data);
                if(response.data.error)
                    this.alert.normalText = 'Hubo un error al cambiar el pago.';
                else
                    this.loading.normalText = 'Se cambió el monto pagado.';
            });
        }
    },
    delimiters: ['[[', ']]']
});