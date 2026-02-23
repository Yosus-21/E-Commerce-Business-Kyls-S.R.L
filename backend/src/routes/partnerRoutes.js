const express = require('express');
const router = express.Router();
const {
    getActivePartners,
    getAllPartners,
    createPartner,
    updatePartner,
    deletePartner
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadPartnerLogo, handleMulterError } = require('../middlewares/uploadImages');

/**
 * @route   GET /api/partners
 * @desc    Obtener aliados activos (público)
 * @access  Public
 */
router.get('/', getActivePartners);

/**
 * @route   GET /api/partners/all
 * @desc    Obtener todos los aliados (admin)
 * @access  Private/Admin
 */
router.get('/all', protect, authorize('admin'), getAllPartners);

/**
 * @route   POST /api/partners
 * @desc    Crear nuevo aliado
 * @access  Private/Admin
 */
router.post('/', protect, authorize('admin'), uploadPartnerLogo, handleMulterError, createPartner);

/**
 * @route   PUT /api/partners/:id
 * @desc    Actualizar aliado
 * @access  Private/Admin
 */
router.put('/:id', protect, authorize('admin'), updatePartner);

/**
 * @route   DELETE /api/partners/:id
 * @desc    Eliminar aliado
 * @access  Private/Admin
 */
router.delete('/:id', protect, authorize('admin'), deletePartner);

module.exports = router;
