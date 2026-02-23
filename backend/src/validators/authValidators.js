const { body } = require('express-validator');

/**
 * Validaciones para registro de usuario
 */
const registerValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Nombre requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre debe tener entre 2 y 100 caracteres'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email requerido')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Contraseña requerida')
        .isLength({ min: 6 })
        .withMessage('Contraseña debe tener mínimo 6 caracteres'),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{8,15}$/)
        .withMessage('Teléfono debe tener entre 8 y 15 dígitos')
];

/**
 * Validaciones para login de usuario
 */
const loginValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email requerido')
        .isEmail()
        .withMessage('Email inválido'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Contraseña requerida')
];

module.exports = {
    registerValidator,
    loginValidator
};
