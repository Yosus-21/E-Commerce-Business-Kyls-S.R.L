const express = require('express');
const router = express.Router();

// Importar middlewares
const {
    protect,
    isAdmin,
    uploadCategoryImage,
    handleMulterError,
    validateRequest
} = require('../middlewares');

// Importar validadores
const {
    createCategoryValidator,
    updateCategoryValidator
} = require('../validators');

// Importar controladores
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías activas
 * @access  Public
 */
router.get('/',
    getCategories
);

/**
 * @route   GET /api/categories/:slug
 * @desc    Obtener categoría por slug
 * @access  Public
 */
router.get('/:slug',
    getCategory
);

// ====================================
// RUTAS PROTEGIDAS - ADMIN
// ====================================

/**
 * @route   POST /api/categories
 * @desc    Crear nueva categoría
 * @access  Private/Admin
 */
router.post('/',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    uploadCategoryImage,          // 3. Procesar upload de imagen
    handleMulterError,            // 4. Manejar errores de Multer
    createCategoryValidator,      // 5. Validar datos
    validateRequest,              // 6. Procesar validaciones
    createCategory               // 7. Controller
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Actualizar categoría
 * @access  Private/Admin
 */
router.put('/:id',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    uploadCategoryImage,          // 3. Procesar upload de imagen (opcional)
    handleMulterError,            // 4. Manejar errores de Multer
    updateCategoryValidator,      // 5. Validar datos
    validateRequest,              // 6. Procesar validaciones
    updateCategory               // 7. Controller
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar categoría (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    deleteCategory               // 3. Controller
);

module.exports = router;
