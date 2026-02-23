const { validationResult } = require('express-validator');

/**
 * Middleware para procesar errores de express-validator
 * Debe usarse DESPUÉS de los validadores de express-validator
 */
const validateRequest = (req, res, next) => {
    // Obtener resultados de validación
    const errors = validationResult(req);

    // Si hay errores de validación
    if (!errors.isEmpty()) {
        // Formatear errores en un formato consistente
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return res.status(400).json({
            success: false,
            error: 'Errores de validación',
            errors: formattedErrors
        });
    }

    // No hay errores, continuar
    next();
};

module.exports = { validateRequest };
