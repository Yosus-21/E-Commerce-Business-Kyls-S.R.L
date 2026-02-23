const mongoose = require('mongoose');

/**
 * 🔐 Conexión Robusta a MongoDB con Auto-Reconexión
 * Previene el "zombie mode" y garantiza estabilidad
 */
const connectDB = async () => {
  try {
    // ⚙️ Opciones de conexión optimizadas para Windows
    const options = {
      serverSelectionTimeoutMS: 30000,   // 30s timeout (antes 5s - muy corto para Windows)
      socketTimeoutMS: 45000,             // 45s socket timeout (keep-alive)
      maxPoolSize: 50,                    // 50 conexiones máximo (antes 10 - se agotaba)
      minPoolSize: 10,                    // 10 conexiones mínimo (antes 2)
      retryWrites: true,                  // Reintentar escrituras fallidas
      w: 'majority',                      // Write concern para mayor consistencia
      family: 4,                          // Forzar IPv4 (evita delays en resolución localhost)
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    console.log('='.repeat(60));
    console.log('✅ MongoDB conectado exitosamente');
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    console.log(`🔌 Estado: ${conn.connection.readyState} (1=conectado)`);
    console.log('='.repeat(60));

    // ====================================
    // 🎯 EVENT LISTENERS - Monitoreo de Conexión
    // ====================================

    // 🟢 Conexión exitosa
    mongoose.connection.on('connected', () => {
      console.log('🟢 MongoDB: Conexión establecida');
    });

    // 🔴 Desconexión detectada
    mongoose.connection.on('disconnected', () => {
      console.warn('🔴 MongoDB: Desconectado. Mongoose intentará reconectar automáticamente...');
    });

    // 🟡 Reconexión exitosa
    mongoose.connection.on('reconnected', () => {
      console.log('🟡 MongoDB: Reconectado exitosamente');
    });

    // ❌ Error en la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB: Error de conexión:', err.message);
      // No hacer process.exit() aquí para permitir reconexión automática
    });

    // 🔵 Reconectando
    mongoose.connection.on('reconnectFailed', () => {
      console.error('🔵 MongoDB: Falló la reconexión. Reinicia el servidor manualmente.');
    });

    // 🚨 Manejar cierre graceful del proceso
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('👋 MongoDB: Conexión cerrada por terminación de la app');
        process.exit(0);
      } catch (err) {
        console.error('Error al cerrar conexión MongoDB:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('='.repeat(60));
    console.error('❌ ERROR CRÍTICO: No se pudo conectar a MongoDB');
    console.error('📝 Mensaje:', error.message);
    console.error('🔍 Verifica:');
    console.error('   1. Que MongoDB Atlas esté activo');
    console.error('   2. Que MONGO_URI en .env sea correcta');
    console.error('   3. Que tu IP esté en la whitelist de MongoDB Atlas');
    console.error('   4. Que tengas conexión a internet');
    console.error('='.repeat(60));

    // Salir solo en el primer intento fallido
    process.exit(1);
  }
};

module.exports = connectDB;
