const { body } = require('express-validator');

/**
 * Validación para crear una orden
 */
const createOrderValidator = [
    body('orderItems')
        .isArray({ min: 1 })
        .withMessage('Los items de la orden deben ser un array no vacío'),
    body('orderItems.*.product')
        .notEmpty()
        .withMessage('Cada item debe tener un producto'),
    body('orderItems.*.quantity')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),
    body('shippingAddress')
        .isObject()
        .withMessage('La dirección de envío es requerida'),
    body('shippingAddress.address')
        .trim()
        .notEmpty()
        .withMessage('La dirección es requerida'),
    body('shippingAddress.city')
        .trim()
        .notEmpty()
        .withMessage('La ciudad es requerida'),
    body('shippingAddress.postalCode')
        .trim()
        .notEmpty()
        .withMessage('El código postal es requerido'),
    body('shippingAddress.country')
        .trim()
        .notEmpty()
        .withMessage('El país es requerido'),
    body('paymentMethod')
        .trim()
        .notEmpty()
        .withMessage('El método de pago es requerido'),
    body('totalPrice')
        .isFloat({ min: 0 })
        .withMessage('El precio total debe ser un número válido')
];

/**
 * Validación para actualizar estado de orden
 */
const updateOrderStatusValidator = [
    body('status')
        .trim()
        .notEmpty()
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Estado de orden inválido')
];

module.exports = {
    createOrderValidator,
    updateOrderStatusValidator
};
