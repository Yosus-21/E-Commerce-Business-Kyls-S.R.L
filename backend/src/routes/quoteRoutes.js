const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares');
const {
    generateQuote,
    getMyQuotes,          // ← era getUserQuotes en el router anterior
    getQuote,
    downloadQuotePDF,     // ← era getQuotePDF en el router anterior
    deleteQuote,
    getAllQuotes,
    updateQuoteStatus,
    getDashboardStats
} = require('../controllers/quoteController');

/**
 * Rutas de cotizaciones
 */

// @route   GET /api/quotes/stats/dashboard
// @desc    Obtener estadísticas para dashboard BI (Admin)
// @access  Private/Admin
router.get('/stats/dashboard', protect, authorize('admin'), getDashboardStats);

// @route   GET /api/quotes/admin/all
// @desc    Obtener todas las cotizaciones con filtros (Admin)
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), getAllQuotes);

// @route   POST /api/quotes
// @desc    Generar nueva cotización desde el carrito
// @access  Private
router.post('/', protect, generateQuote);

// @route   GET /api/quotes/user
// @desc    Obtener todas las cotizaciones del usuario autenticado
// @access  Private
router.get('/user', protect, getMyQuotes);

// @route   PATCH /api/quotes/:id/status
// @desc    Actualizar estado de cotización (Admin)
// @access  Private/Admin
router.patch('/:id/status', protect, authorize('admin'), updateQuoteStatus);

// @route   GET /api/quotes/:id/pdf
// @desc    Descargar PDF de cotización
// @access  Private
router.get('/:id/pdf', protect, downloadQuotePDF);

// @route   GET /api/quotes/:id
// @desc    Obtener cotización por ID
// @access  Private
router.get('/:id', protect, getQuote);

// @route   DELETE /api/quotes/:id
// @desc    Eliminar cotización
// @access  Private
router.delete('/:id', protect, deleteQuote);

module.exports = router;
