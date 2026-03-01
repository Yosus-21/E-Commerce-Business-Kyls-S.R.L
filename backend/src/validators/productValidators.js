const { body } = require('express-validator');

/**
 * Validaciones para crear un producto
 * ✅ Migrado de MongoDB (isMongoId) a MySQL (isInt para IDs numéricos)
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

    // ✅ Acepta tanto 'categoryId' como 'category' (retrocompatible)
    body(['categoryId', 'category'])
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de categoría debe ser un número entero positivo'),

    // Validación custom: al menos uno de los dos debe estar presente
    body('categoryId').custom((value, { req }) => {
        const catId = req.body.categoryId || req.body.category;
        if (!catId) {
            throw new Error('La categoría es obligatoria');
        }
        return true;
    }),

    // ✅ Acepta tanto 'brandId' como 'brand' (retrocompatible) — OPCIONAL
    body(['brandId', 'brand'])
        .optional({ checkFalsy: true })  // Skip si es "", null, undefined, 0
        .isInt({ min: 1 })
        .withMessage('ID de marca debe ser un número entero positivo'),

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

    // ✅ Acepta tanto 'categoryId' como 'category'
    body(['categoryId', 'category'])
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de categoría debe ser un número entero positivo'),

    // ✅ Acepta tanto 'brandId' como 'brand' — OPCIONAL
    body(['brandId', 'brand'])
        .optional({ checkFalsy: true })
        .isInt({ min: 1 })
        .withMessage('ID de marca debe ser un número entero positivo'),

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
