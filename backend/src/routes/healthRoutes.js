const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

/**
 * @desc    Health Check - Verifica estado del servidor y base de datos MySQL
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', async (req, res) => {
    const memUsage = process.memoryUsage();

    const healthData = {
        status: 'ok',
        uptime: `${Math.floor(process.uptime())}s`,
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        database: {
            dialect: 'mysql',
            status: 'checking...'
        },
        memory: {
            used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
        }
    };

    try {
        // sequelize.authenticate() ejecuta un SELECT 1+1 para verificar la conexión
        // Equivalente a comprobar mongoose.connection.readyState === 1
        await sequelize.authenticate();

        healthData.database.status = 'connected';

        return res.status(200).json(healthData);

    } catch (error) {
        // MySQL no disponible → 503 Service Unavailable
        healthData.status = 'degraded';
        healthData.database.status = 'disconnected';
        healthData.database.error = error.message;

        return res.status(503).json({
            ...healthData,
            message: 'Base de datos MySQL no disponible'
        });
    }
});

module.exports = router;
