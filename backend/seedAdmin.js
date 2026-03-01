/**
 * seedAdmin.js
 * Crea el usuario administrador inicial en la base de datos MySQL.
 * Uso: node seedAdmin.js
 */

require('dotenv').config();                         // Cargar .env (DB_HOST, DB_USER, etc.)
const { connectDB } = require('./src/config/database');
const { syncModels } = require('./src/models/index');
const { User } = require('./src/models/index');

const ADMIN = {
    name: 'Admin Kyla',
    email: 'admin@businesskyla.com',
    password: 'admin123',   // El hook beforeSave de bcrypt la hasheará automáticamente
    role: 'admin',
    isActive: true
};

const seed = async () => {
    try {
        // 1. Conectar a MySQL
        await connectDB();

        // 2. Sincronizar modelos (asegura que las tablas existan)
        await syncModels();

        // 3. Crear o encontrar el admin
        //    findOrCreate evita duplicados si el script se ejecuta más de una vez
        const [user, created] = await User.findOrCreate({
            where: { email: ADMIN.email },
            defaults: ADMIN
        });

        if (created) {
            console.log('✅ Usuario administrador creado exitosamente:');
            console.log(`   Nombre : ${user.name}`);
            console.log(`   Email  : ${user.email}`);
            console.log(`   Rol    : ${user.role}`);
            console.log(`   ID     : ${user.id}`);
        } else {
            console.log('ℹ️  El usuario administrador ya existe en la base de datos:');
            console.log(`   Email : ${user.email}`);
            console.log(`   ID    : ${user.id}`);
        }

    } catch (error) {
        console.error('❌ Error al crear el administrador:', error.message);
        process.exit(1);
    } finally {
        // 4. Cerrar la conexión a la BD
        const { sequelize } = require('./src/config/database');
        await sequelize.close();
        console.log('🔒 Conexión a MySQL cerrada.');
        process.exit(0);
    }
};

seed();
