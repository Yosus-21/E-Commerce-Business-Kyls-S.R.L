const multer = require('multer');
const path = require('path');

// ====================================
// CONFIGURACIÓN DE STORAGE
// ====================================

// Storage para productos (permite múltiples imágenes)
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        // Generar nombre único: timestamp-nombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        // Sanitizar nombre (remover caracteres especiales)
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

// Storage para categorías (permite una sola imagen)
const categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/categories/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

// Storage para marcas (permite una sola imagen - logo)
const brandStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/brands/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

// Storage para servicios (permite una sola imagen)
const serviceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/services/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

// ====================================
// FILTRO DE ARCHIVOS
// ====================================

const fileFilter = (req, file, cb) => {
    // Tipos MIME permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        // Archivo válido
        cb(null, true);
    } else {
        // Archivo inválido
        cb(new Error('Solo se permiten imágenes (jpg, png, webp)'), false);
    }
};

// ====================================
// CONFIGURACIONES DE MULTER
// ====================================

const uploadProductsConfig = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

const uploadCategoryConfig = multer({
    storage: categoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

const uploadBrandConfig = multer({
    storage: brandStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

const uploadServiceConfig = multer({
    storage: serviceStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Storage para hero/featured images
const heroStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/hero/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

const uploadHeroConfig = multer({
    storage: heroStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB para hero images
    },
    fileFilter: fileFilter
});

// Storage para partners/aliados (logos de clientes)
const partnerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/partners/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, uniqueSuffix + '-' + sanitizedName + ext);
    }
});

const uploadPartnerConfig = multer({
    storage: partnerStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB para logos
    },
    fileFilter: fileFilter
});

// ====================================
// MIDDLEWARES DE UPLOAD
// ====================================

// Upload múltiple para productos (máximo 5 imágenes)
const uploadProductImages = uploadProductsConfig.array('images', 5);

// Upload único para categorías
const uploadCategoryImage = uploadCategoryConfig.single('image');

// Upload único para marcas (logo)
const uploadBrandImage = uploadBrandConfig.single('image');

// Upload único para servicios
const uploadServiceImage = uploadServiceConfig.single('image');

// Upload único para hero/featured images
const uploadHeroImage = uploadHeroConfig.single('image');

// Upload único para partners
const uploadPartnerLogo = uploadPartnerConfig.single('logo');

// ====================================
// MIDDLEWARE DE MANEJO DE ERRORES DE MULTER
// ====================================

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Errores de Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'Archivo muy grande, máximo 5MB por imagen'
            });
        }

        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Máximo 5 imágenes permitidas'
            });
        }

        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Campo de archivo inesperado'
            });
        }

        // Otro error de Multer
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    if (err) {
        // Error del fileFilter (tipo de archivo inválido)
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    next();
};

module.exports = {
    uploadProductImages,
    uploadCategoryImage,
    uploadBrandImage,
    uploadServiceImage,
    uploadHeroImage,
    uploadPartnerLogo,
    handleMulterError
};
