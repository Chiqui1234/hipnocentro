const   helpers = {};
const   csv = require('csv-parser'),
        fs = require('fs');

helpers.parseCsv = function(pathToFile) {
    fs.createReadStream(pathToFile)
        .pipe(csv())
        .on('data', function(data){
            try {
                return data;
            }
            catch(err) {
                console.error('Can\'t stat "data" from csv.');
                return false;
            }
        })
        .on('end',function(){
            // Nada :P
    });  
}