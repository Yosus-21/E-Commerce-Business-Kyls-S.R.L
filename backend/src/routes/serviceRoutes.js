const express = require('express');
const router = express.Router();
const {
    getAllServices,
    getService,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadServiceImage, handleMulterError } = require('../middlewares/uploadImages');

// ====================================
// RUTAS PÚBLICAS
// ====================================
router.get('/', getAllServices);
router.get('/:id', getService);

// ====================================
// RUTAS PROTEGIDAS (ADMIN)
// ====================================
router.post(
    '/',
    protect,
    authorize('admin'),
    uploadServiceImage,
    handleMulterError,
    createService
);

router.put(
    '/:id',
    protect,
    authorize('admin'),
    uploadServiceImage,
    handleMulterError,
    updateService
);

router.delete(
    '/:id',
    protect,
    authorize('admin'),
    deleteService
);

module.exports = router;
