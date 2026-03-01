const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares');
const { uploadHeroImage, handleMulterError, addNormalizedUrl } = require('../middlewares/uploadImages');
const { getActiveImages, getAllImages, getImageById, createImage, updateImage, deleteImage } = require('../controllers/featuredImageController');

router.get('/', getActiveImages);
router.get('/all', protect, isAdmin, getAllImages);
router.get('/:id', protect, isAdmin, getImageById);

router.post('/', protect, isAdmin, uploadHeroImage, handleMulterError, addNormalizedUrl, createImage);
router.put('/:id', protect, isAdmin, uploadHeroImage, handleMulterError, addNormalizedUrl, updateImage);
router.delete('/:id', protect, isAdmin, deleteImage);

module.exports = router;
