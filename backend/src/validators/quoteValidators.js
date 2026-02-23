const { body, param } = require('express-validator');

/**
 * Validadores para Quote
 */

// Validar creación de cotización
const createQuoteValidator = [
    body('customerData.name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del cliente es requerido'),
    body('customerData.email')
        .trim()
        .isEmail()
        .withMessage('Email inválido'),
    body('customerData.phone')
        .trim()
        .notEmpty()
        .withMessage('El teléfono es requerido'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un producto'),
    body('items.*.product')
        .notEmpty()
        .withMessage('ID del producto es requerido'),
    body('items.*.name')
        .trim()
        .notEmpty()
        .withMessage('Nombre del producto es requerido'),
    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser mayor o igual a 0'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser al menos 1'),
    body('items.*.subtotal')
        .isFloat({ min: 0 })
        .withMessage('El subtotal debe ser mayor o igual a 0'),
    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('El monto total debe ser mayor o igual a 0'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validar actualización de estado
const updateQuoteStatusValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID de cotización inválido'),
    body('status')
        .isIn(['Generada', 'Contactado', 'Cerrada'])
        .withMessage('Estado inválido. Debe ser: Generada, Contactado o Cerrada'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Validar obtener cotización por ID
const getQuoteByIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID de cotización inválido')
];

module.exports = {
    createQuoteValidator,
    updateQuoteStatusValidator,
    getQuoteByIdValidator
};
