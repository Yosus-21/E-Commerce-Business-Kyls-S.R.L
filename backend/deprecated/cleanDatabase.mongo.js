// Script para limpiar la base de datos manteniendo solo el usuario admin
// Ejecutar con: node cleanDatabase.js

const mongoose = require('mongoose');
require('dotenv').config();

const cleanDatabase = async () => {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;

        // 1. Obtener el usuario admin
        const usersCollection = db.collection('users');
        const adminUser = await usersCollection.findOne({ role: 'admin' });

        if (!adminUser) {
            console.error('❌ No se encontró usuario admin');
            process.exit(1);
        }

        console.log(`✅ Usuario admin encontrado: ${adminUser.email}`);

        // 2. Limpiar todas las colecciones excepto usuarios
        const collections = await db.listCollections().toArray();

        for (const collection of collections) {
            const collectionName = collection.name;

            if (collectionName === 'users') {
                // Borrar todos los usuarios EXCEPTO el admin
                const result = await db.collection(collectionName).deleteMany({
                    _id: { $ne: adminUser._id }
                });
                console.log(`🧹 Usuarios eliminados (excepto admin): ${result.deletedCount}`);
            } else {
                // Borrar toda la colección
                const result = await db.collection(collectionName).deleteMany({});
                console.log(`🧹 ${collectionName}: ${result.deletedCount} documentos eliminados`);
            }
        }

        console.log('\n✅ Base de datos limpiada exitosamente');
        console.log(`📧 Usuario admin preservado: ${adminUser.email}`);

    } catch (error) {
        console.error('❌ Error limpiando base de datos:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        process.exit(0);
    }
};

cleanDatabase();
