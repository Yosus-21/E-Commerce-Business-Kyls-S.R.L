const express = require('express');
const router = express.Router();

// Importar middlewares
const { protect, validateRequest } = require('../middlewares');

// Importar validadores
const { registerValidator, loginValidator } = require('../validators');

// Importar controladores
const {
    register,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register',
    registerValidator,
    validateRequest,
    register
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login',
    loginValidator,
    validateRequest,
    login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Solicitar recuperación de contraseña
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:token
 * @desc    Restablecer contraseña con token
 * @access  Public
 */
router.put('/reset-password/:token', resetPassword);

// ====================================
// RUTAS PROTEGIDAS
// ====================================

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me',
    protect,
    getMe
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 * @access  Private
 */
router.post('/logout',
    protect,
    logout
);

module.exports = router;
