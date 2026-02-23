const { body } = require('express-validator');

/**
 * Validaciones para crear una categoría
 */
const createCategoryValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nombre de la categoría es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre debe tener entre 2 y 100 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descripción no puede exceder 500 caracteres')
];

/**
 * Validaciones para actualizar una categoría
 * Todos los campos son opcionales
 */
const updateCategoryValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre debe tener entre 2 y 100 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descripción no puede exceder 500 caracteres')
];

module.exports = {
    createCategoryValidator,
    updateCategoryValidator
};
