const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
// NOTA: express-mongo-sanitize eliminado (era específico de MongoDB).
// Sequelize provee protección contra SQL Injection de forma nativa
// mediante prepared statements en todas sus queries.

// Inicializar app de Express
const app = express();
app.set('trust proxy', 1);

// ====================================
// ⚡ CRÍTICO: ARCHIVOS ESTÁTICOS PRIMERO
// ====================================
// DEBE ir ANTES de CORS, helmet, y cualquier otro middleware
// para evitar que las imágenes sean interceptadas

const uploadsPath = path.join(__dirname, '../uploads');

// Crear carpeta uploads si no existe
if (!fs.existsSync(uploadsPath)) {
    try {
        fs.mkdirSync(uploadsPath, { recursive: true });
    } catch (err) {
        console.error('❌ Error al crear carpeta uploads:', err.message);
    }
}

// Logs solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
    console.log('📂 Uploads path:', uploadsPath);
}

// ✅ SERVIR ARCHIVOS ESTÁTICOS (PRIMER MIDDLEWARE)
app.use('/uploads', express.static(uploadsPath));

// ✅ TAMBIÉN servir en /api/uploads para peticiones del frontend que incluyen /api
app.use('/api/uploads', express.static(uploadsPath));

// ====================================
// MIDDLEWARES DE SEGURIDAD
// ====================================

// Helmet - Configurar headers HTTP seguros
app.use(helmet());

// CORS - Permitir requests desde frontend (local + producción)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, server-to-server, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('No permitido por CORS'));
    },
    credentials: true
}));

// Rate Limiting - Limitar requests por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos (antes 10)
    max: 1000, // 1000 peticiones (antes 100 - DEMASIADO RESTRICTIVO)
    standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.'
});
app.use('/api', limiter);

// Prevenir ataques XSS (Cross-Site Scripting)
app.use(xssClean());

// ====================================
// MIDDLEWARES GENERALES
// ====================================

// Logger HTTP (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parsers - Parsear JSON y URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====================================
// RUTAS
// ====================================

// IMPORTAR RUTAS
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const brandRoutes = require('./routes/brandRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const cartRoutes = require('./routes/cartRoutes');
// const orderRoutes = require('./routes/orderRoutes'); // Archivo no existe
const quoteRoutes = require('./routes/quoteRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const reportRoutes = require('./routes/reportRoutes');
const featuredImageRoutes = require('./routes/featuredImageRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Ruta de prueba (Soporte para cPanel /api)
const welcomeMsg = (req, res) => {
    res.json({
        success: true,
        message: 'API de Business Kyla SRL - ¡LISTA Y CONECTADA!',
        version: '1.0.0',
        database: 'PostgreSQL Conectado',
        admin_path: '/api/auth/login'
    });
};

app.get('/', welcomeMsg);
app.get('/api', welcomeMsg); // Soporte extra para cPanel

// ====================================
// 🛠️ RUTA DE INICIALIZACIÓN (TEMPORAL)
// ====================================
// Esta ruta crea las tablas y el admin inicial si la terminal está bloqueada.
/*app.get('/api/init-db', async (req, res) => {
    try {
        const { syncModels, User } = require('./models/index');

        // 1. Sincronizar tablas (crear si no existen)
        // Usamos { alter: true } para que funcione incluso si el modo es production
        const { sequelize } = require('./config/database');
        await sequelize.sync({ alter: true });

        // 2. Crear admin inicial
        const ADMIN_DATA = {
            name: 'Admin Kyla',
            email: 'admin@businesskyla.com',
            password: 'admin123',
            role: 'admin',
            isActive: true
        };

        const [user, created] = await User.findOrCreate({
            where: { email: ADMIN_DATA.email },
            defaults: ADMIN_DATA
        });

        res.json({
            success: true,
            message: 'Base de datos inicializada correctamente',
            admin_created: created,
            detail: created ? 'Usuario administrador creado' : 'El usuario ya existía'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});*/

// Montar rutas de la API
app.use('/api/health', healthRoutes); // Health check (DEBE ir primero - sin rate limit)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
// app.use('/api/orders', orderRoutes); // orderRoutes no existe
app.use('/api/users', userRoutes);
// (health route ya registrada arriba)
app.use('/api/reports', reportRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/cart', cartRoutes);
// app.use('/api/orders', orderRoutes); // orderRoutes no existe (duplicado)
app.use('/api/quotes', quoteRoutes);
app.use('/api/featured-images', featuredImageRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/contact', contactRoutes);

// ====================================
// MANEJO DE ERRORES
// ====================================

// Importar error handler
const { errorHandler } = require('./middlewares/errorHandler');

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Global error handler (DEBE IR AL FINAL)
app.use(errorHandler);

module.exports = app;
