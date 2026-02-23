// Exportar todos los middlewares desde un solo archivo
module.exports = {
    ...require('./auth'),
    ...require('./admin'),
    ...require('./errorHandler'),
    ...require('./uploadImages'),
    ...require('./validateRequest')
};
