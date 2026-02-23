const express = require('express');
const router = express.Router();

// Importar middlewares
const { protect, isAdmin, validateRequest } = require('../middlewares');

// Importar controladores
const {
    getProfile,
    updateProfile,
    updatePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require('../controllers/userController');

// ====================================
// MIDDLEWARE GLOBAL
// ====================================
// Todas las rutas de usuario requieren autenticación
router.use(protect);

// ====================================
// RUTAS DE PERFIL
// ====================================

/**
 * @route   GET /api/users/profile
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get('/profile',
    getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario
 * @access  Private
 * @body    { name, phone }
 */
router.put('/profile',
    updateProfile
);

/**
 * @route   PUT /api/users/password
 * @desc    Cambiar contraseña del usuario
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put('/password',
    updatePassword
);

// ====================================
// RUTAS DE DIRECCIONES
// ====================================

/**
 * @route   POST /api/users/addresses
 * @desc    Agregar nueva dirección
 * @access  Private
 * @body    { name, street, city, state, zipCode, phone, isDefault }
 */
router.post('/addresses',
    addAddress
);

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Actualizar dirección existente
 * @access  Private
 * @params  addressId - ID de la dirección
 * @body    { name, street, city, state, zipCode, phone, isDefault }
 */
router.put('/addresses/:addressId',
    updateAddress
);

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Eliminar dirección
 * @access  Private
 * @params  addressId - ID de la dirección
 */
router.delete('/addresses/:addressId',
    deleteAddress
);

// ====================================
// RUTAS ADMIN
// ====================================

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (Admin)
 * @access  Private/Admin
 * @query   page, limit, search
 */
router.get('/',
    isAdmin,
    getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID (Admin)
 * @access  Private/Admin
 */
router.get('/:id',
    isAdmin,
    getUserById
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Actualizar rol de usuario (Admin)
 * @access  Private/Admin
 * @body    { role }
 */
router.put('/:id/role',
    isAdmin,
    updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar usuario (Admin)
 * @access  Private/Admin
 */
router.delete('/:id',
    isAdmin,
    deleteUser
);

module.exports = router;
