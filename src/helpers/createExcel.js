const   helpers = {},
        excelJs = require('exceljs');

/**
 * @param header (obj). Miembros 'name', 'key', 'width'
 * @param rows (array de obj). Miembros personalizados pero deben estar en el mismo órden que header{}.
 * @param metadata (obj). Miembros 'creator' y 'sheetName'.
 */
helpers.createExcel = function(header, rows, metadata) { // Ojo, crea una hoja por 'workbook'
    let workbook = new excelJs.Workbook();
    workbook.creator = metadata.creator;
    let worksheet = workbook.addWorksheet(metadata.sheetName);
    worksheet.columns = header;
    for(let i = 0;i < rows.length;i++) {
        worksheet.addRow(rows[i]);
    }
    return workbook;
}

module.exports = helpers;