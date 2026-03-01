const { Sequelize } = require('sequelize');

// ====================================
// INSTANCIAR SEQUELIZE CON MYSQL
// ====================================
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            // Usar timestamps automáticos (createdAt, updatedAt) en todos los modelos
            timestamps: true,
            // Evitar que Sequelize pluralice los nombres de tablas de forma extraña
            underscored: false
        }
    }
);

// ====================================
// FUNCIÓN DE CONEXIÓN
// ====================================
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL conectado exitosamente con Sequelize');

        // En modo desarrollo, sincronizar modelos (alter: true = actualizar columnas sin borrar datos)
        // Los modelos se sincronizan desde src/models/index.js
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔄 Sincronizando modelos con MySQL...');
        }
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
