// Exportar todos los validadores desde un solo archivo
module.exports = {
    ...require('./authValidators'),
    ...require('./productValidators'),
    ...require('./categoryValidators'),
    ...require('./orderValidators')
};
