const express = require('express');
const router = express.Router();
const { getAllBrands, getBrand, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadBrandImage, handleMulterError, addNormalizedUrl } = require('../middlewares/uploadImages');

router.get('/', getAllBrands);
router.get('/:id', getBrand);

router.post('/', protect, authorize('admin'), uploadBrandImage, handleMulterError, addNormalizedUrl, createBrand);
router.put('/:id', protect, authorize('admin'), uploadBrandImage, handleMulterError, addNormalizedUrl, updateBrand);
router.delete('/:id', protect, authorize('admin'), deleteBrand);

module.exports = router;
