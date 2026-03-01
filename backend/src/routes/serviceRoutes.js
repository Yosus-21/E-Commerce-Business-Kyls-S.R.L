const express = require('express');
const router = express.Router();
const { getAllServices, getService, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadServiceImage, handleMulterError, addNormalizedUrl } = require('../middlewares/uploadImages');

router.get('/', getAllServices);
router.get('/:id', getService);

router.post('/', protect, authorize('admin'), uploadServiceImage, handleMulterError, addNormalizedUrl, createService);
router.put('/:id', protect, authorize('admin'), uploadServiceImage, handleMulterError, addNormalizedUrl, updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
