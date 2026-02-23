const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

/**
 * @desc    Health Check - Verifica estado del servidor y BD
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
    const healthData = {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date(),
        database: {
            state: mongoose.connection.readyState,
            status: getDbStatus(mongoose.connection.readyState),
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        }
    };

    // Si la BD no está conectada, retornar 503 Service Unavailable
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            ...healthData,
            status: 'degraded',
            message: 'Base de datos no disponible',
        });
    }

    res.status(200).json(healthData);
});

/**
 * Helper para convertir readyState a texto legible
 */
function getDbStatus(readyState) {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[readyState] || 'unknown';
}

module.exports = router;
