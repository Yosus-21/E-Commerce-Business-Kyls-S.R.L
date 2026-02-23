/**
 * Async Handler Wrapper
 * Envuelve funciones async para capturar errores automáticamente
 * y pasarlos al middleware de manejo de errores
 * 
 * Esto elimina la necesidad de try-catch en cada controlador
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
