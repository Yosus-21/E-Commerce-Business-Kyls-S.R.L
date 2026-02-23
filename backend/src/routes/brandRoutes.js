const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/brandController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadBrandImage, handleMulterError } = require('../middlewares/uploadImages');

// ====================================
// RUTAS PÚBLICAS
// ====================================
router.get('/', getAllBrands);
router.get('/:id', getBrand);

// ====================================
// RUTAS PROTEGIDAS (ADMIN)
// ====================================
router.post(
    '/',
    protect,
    authorize('admin'),
    uploadBrandImage,
    handleMulterError,
    createBrand
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    uploadBrandImage,
    handleMulterError,
    updateBrand
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteBrand
);

module.exports = router;
