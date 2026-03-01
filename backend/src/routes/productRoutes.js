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
const { addNormalizedUrl } = require('../middlewares/uploadImages');

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

    // ✅ Normalizar categoryId como entero (acepta 'categoryId' o 'category')
    const rawCategory = req.body.categoryId || req.body.category;
    if (rawCategory) {
        const catInt = parseInt(rawCategory);
        req.body.categoryId = isNaN(catInt) ? undefined : catInt;
        req.body.category = req.body.categoryId; // Mantener ambos sincronizados
    }

    // ✅ Normalizar brandId como entero (acepta 'brandId' o 'brand') — OPCIONAL
    const rawBrand = req.body.brandId || req.body.brand;
    if (rawBrand && rawBrand !== '' && rawBrand !== 'null' && rawBrand !== 'undefined') {
        const brandInt = parseInt(rawBrand);
        req.body.brandId = isNaN(brandInt) ? undefined : brandInt;
        req.body.brand = req.body.brandId;
    } else {
        // Limpiar cualquier valor vacío para que el validador opcional lo ignore
        delete req.body.brandId;
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
    addNormalizedUrl,             // 5. ✅ Normalizar rutas (fix backslashes Windows)
    parseProductData,             // 6. Parsear FormData a tipos correctos
    createProductValidator,       // 7. Validar datos
    validateRequest,              // 8. Procesar validaciones
    createProduct                 // 9. Controller
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
    addNormalizedUrl,             // 5. ✅ Normalizar rutas (fix backslashes Windows)
    parseProductData,             // 6. Parsear FormData a tipos correctos
    updateProductValidator,       // 7. Validar datos
    validateRequest,              // 8. Procesar validaciones
    updateProduct                 // 9. Controller
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
