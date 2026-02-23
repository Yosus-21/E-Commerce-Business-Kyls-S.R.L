const express = require('express');
const router = express.Router();

// Importar middlewares
const { protect, validateRequest } = require('../middlewares');

// Importar controladores
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

// ====================================
// MIDDLEWARE GLOBAL
// ====================================
// Todas las rutas del carrito requieren autenticación
router.use(protect);

// ====================================
// RUTAS DEL CARRITO
// ====================================

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario actual
 * @access  Private
 */
router.get('/',
    getCart
);

/**
 * @route   POST /api/cart/add
 * @desc    Agregar producto al carrito
 * @access  Private
 * @body    { productId, quantity }
 */
router.post('/add',
    addToCart
);

/**
 * @route   PUT /api/cart/update/:itemId
 * @desc    Actualizar cantidad de un item del carrito
 * @access  Private
 * @params  itemId - ID del item en el carrito
 * @body    { quantity }
 */
router.put('/update/:itemId',
    updateCartItem
);

/**
 * @route   DELETE /api/cart/remove/:itemId
 * @desc    Eliminar producto del carrito
 * @access  Private
 * @params  itemId - ID del item en el carrito
 */
router.delete('/remove/:itemId',
    removeFromCart
);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Vaciar carrito completamente
 * @access  Private
 */
router.delete('/clear',
    clearCart
);

module.exports = router;
