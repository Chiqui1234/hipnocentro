let developer = new Vue({
    el: '#developer',
    data: {
        errors: {
            items: []
        }
    },
    methods: {
        getErrors() {
            axios.get('/api/errors/get')
            .then(response => {
                if(response.data.error)
                    this.errors.items.push({
                        name: 'API',
                        text: 'No se pudo contactar con la API en este momento',
                        error: true
                    });
                else
                    this.errors.items = response.data;
            })
        }
    },
    delimiters: ['__', '__']
});