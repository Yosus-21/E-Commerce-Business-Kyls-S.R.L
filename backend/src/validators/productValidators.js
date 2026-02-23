const { body } = require('express-validator');

/**
 * Validaciones para crear un producto
 */
const createProductValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nombre del producto es requerido')
        .isLength({ min: 3, max: 200 })
        .withMessage('Nombre debe tener entre 3 y 200 caracteres'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Descripción es requerida')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Descripción debe tener entre 10 y 2000 caracteres'),

    body('longDescription')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('La descripción extendida no puede exceder 10000 caracteres'),

    body('price')
        .notEmpty()
        .withMessage('Precio es requerido')
        .isFloat({ min: 0 })
        .withMessage('Precio debe ser mayor o igual a 0'),

    body('category')
        .notEmpty()
        .withMessage('Categoría es requerida')
        .isMongoId()
        .withMessage('ID de categoría inválido'),

    body('brand')
        .optional({ checkFalsy: true })  // Skip validation si es "", null, undefined
        .isMongoId()
        .withMessage('ID de marca inválido'),

    body('stock')
        .notEmpty()
        .withMessage('Stock es requerido')
        .isInt({ min: 0 })
        .withMessage('Stock debe ser un número entero no negativo'),

    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('El campo destacado debe ser un valor booleano'),

    body('discountPercentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0 y 100')
];

/**
 * Validaciones para actualizar un producto
 * Todos los campos son opcionales
 */
const updateProductValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Nombre debe tener entre 3 y 200 caracteres'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Descripción debe tener entre 10 y 2000 caracteres'),

    body('longDescription')
        .optional()
        .trim()
        .isLength({ max: 10000 })
        .withMessage('La descripción extendida no puede exceder 10000 caracteres'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Precio debe ser mayor o igual a 0'),

    body('category')
        .optional()
        .isMongoId()
        .withMessage('ID de categoría inválido'),

    body('brand')
        .optional({ checkFalsy: true })  // Skip validation si es "", null, undefined
        .isMongoId()
        .withMessage('ID de marca inválido'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock debe ser un número entero no negativo'),

    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('El campo destacado debe ser un valor booleano'),

    body('discountPercentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0 y 100')
];

module.exports = {
    createProductValidator,
    updateProductValidator
};
