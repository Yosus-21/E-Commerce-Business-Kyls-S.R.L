//require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const { syncModels } = require('./models/index');

// Configurar puerto
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // 1. Conectar a MySQL con Sequelize
        await connectDB();

        // 2. Sincronizar modelos (crear/actualizar tablas en MySQL)
        await syncModels();

        // 3. Iniciar servidor Express
        const server = app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 Puerto: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT} `);
            console.log('='.repeat(50));
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
            } else {
                console.error('❌ Error del servidor:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar servidor
startServer();

// Manejo de rechazos de promesas no manejados
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    console.log('🔄 Cerrando servidor...');
    process.exit(1);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    console.log('🔄 Cerrando servidor...');
    process.exit(1);
});
