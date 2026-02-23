const { body } = require('express-validator');

/**
 * Validaciones para crear un servicio
 */
const createServiceValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('El título del servicio es requerido')
        .isLength({ min: 3, max: 200 })
        .withMessage('El título debe tener entre 3 y 200 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 3000 })
        .withMessage('La descripción no puede exceder 3000 caracteres'),

    body('longDescription')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('La descripción extendida no puede exceder 10000 caracteres'),

    body('price')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El precio no puede exceder 50 caracteres')
];

/**
 * Validaciones para actualizar un servicio
 * Todos los campos son opcionales
 */
const updateServiceValidator = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('El título debe tener entre 3 y 200 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 3000 })
        .withMessage('La descripción no puede exceder 3000 caracteres'),

    body('longDescription')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('La descripción extendida no puede exceder 10000 caracteres'),

    body('price')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El precio no puede exceder 50 caracteres')
];

module.exports = {
    createServiceValidator,
    updateServiceValidator
};
