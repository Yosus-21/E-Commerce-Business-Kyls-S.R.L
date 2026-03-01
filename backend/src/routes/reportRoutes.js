const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares');

// @route   GET /api/reports/catalog
// @access  Public (el frontend no requiere auth para descargar el catálogo)
router.get('/catalog', reportController.generateCatalog);

// @route   GET /api/reports/dashboard
// @desc    Resumen ejecutivo con todas las métricas MySQL (inventario, cotizaciones, tendencias)
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), reportController.getDashboard);

module.exports = router;
