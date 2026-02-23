const express = require('express');
const router = express.Router();

// Importar middlewares
const {
    protect,
    isAdmin,
    uploadProductImages,
    handleMulterError,
    validateRequest
} = require('../middlewares');

// Importar validadores
const {
    createProductValidator,
    updateProductValidator
} = require('../validators');

// Importar controladores
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// ====================================
// MIDDLEWARE DE PARSEO DE FORMDATA
// ====================================

/**
 * Middleware para parsear datos de FormData antes de validar
 * FormData convierte todo a string, este middleware normaliza los tipos
 */
const parseProductData = (req, res, next) => {
    // Convertir isFeatured a booleano
    if (req.body.isFeatured !== undefined) {
        req.body.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }

    // Convertir discountPercentage a número
    if (req.body.discountPercentage !== undefined) {
        const discount = Number(req.body.discountPercentage);
        req.body.discountPercentage = isNaN(discount) ? undefined : discount;
    }

    // Convertir price a número
    if (req.body.price !== undefined) {
        const price = Number(req.body.price);
        req.body.price = isNaN(price) ? undefined : price;
    }

    // Convertir stock a número
    if (req.body.stock !== undefined) {
        const stock = Number(req.body.stock);
        req.body.stock = isNaN(stock) ? undefined : stock;
    }

    // Limpiar brand vacíos (evitar CastError de ObjectId)
    if (req.body.brand === '' || req.body.brand === 'null' || req.body.brand === 'undefined') {
        delete req.body.brand;
    }

    next();
};

// ====================================
// RUTAS PÚBLICAS
// ====================================

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros y paginación
 * @access  Public
 * @params  Query: page, limit, category, search, minPrice, maxPrice, brand, sort, featured
 */
router.get('/',
    getProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Obtener producto por ID (incluye productos relacionados)
 * @access  Public
 */
router.get('/:id',
    getProduct
);

// ====================================
// RUTAS PROTEGIDAS - ADMIN
// ====================================

/**
 * @route   POST /api/products
 * @desc    Crear nuevo producto
 * @access  Private/Admin
 * @type    multipart/form-data
 */
router.post('/',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    uploadProductImages,          // 3. Procesar upload de imágenes (máximo 5)
    handleMulterError,            // 4. Manejar errores de Multer
    parseProductData,             // 5. ✅ NUEVO: Parsear FormData a tipos correctos
    createProductValidator,       // 6. Validar datos (ahora con tipos correctos)
    validateRequest,              // 7. Procesar validaciones
    createProduct                 // 8. Controller
);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto
 * @access  Private/Admin
 * @type    multipart/form-data
 */
router.put('/:id',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    uploadProductImages,          // 3. Procesar upload de imágenes (opcional)
    handleMulterError,            // 4. Manejar errores de Multer
    parseProductData,             // 5. ✅ NUEVO: Parsear FormData a tipos correctos
    updateProductValidator,       // 6. Validar datos (ahora con tipos correctos)
    validateRequest,              // 7. Procesar validaciones
    updateProduct                 // 8. Controller
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id',
    protect,                      // 1. Autenticación
    isAdmin,                      // 2. Verificar rol admin
    deleteProduct                 // 3. Controller
);

module.exports = router;
