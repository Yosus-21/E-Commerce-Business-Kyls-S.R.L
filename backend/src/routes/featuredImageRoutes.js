const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares');
const { uploadHeroImage, handleMulterError } = require('../middlewares/uploadImages');
const {
    getActiveImages,
    getAllImages,   
    getImageById,
    createImage,
    updateImage,
    deleteImage
} = require('../controllers/featuredImageController');

/**
 * Rutas de Imágenes Destacadas (Hero)
 */

// @route   GET /api/featured-images
// @desc    Obtener imágenes activas
// @access  Public
router.get('/', getActiveImages);

// @route   GET /api/featured-images/all
// @desc    Obtener todas las imágenes (admin)
// @access  Private/Admin
router.get('/all', protect, isAdmin, getAllImages);

// @route   GET /api/featured-images/:id
// @desc    Obtener imagen por ID
// @access  Private/Admin
router.get('/:id', protect, isAdmin, getImageById);

// @route   POST /api/featured-images
// @desc    Crear nueva imagen destacada
// @access  Private/Admin
router.post('/', protect, isAdmin, uploadHeroImage, handleMulterError, createImage);

// @route   PUT /api/featured-images/:id
// @desc    Actualizar orden o estado de imagen
// @access  Private/Admin
router.put('/:id', protect, isAdmin, updateImage);

// @route   DELETE /api/featured-images/:id
// @desc    Eliminar imagen destacada
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, deleteImage);

module.exports = router;
