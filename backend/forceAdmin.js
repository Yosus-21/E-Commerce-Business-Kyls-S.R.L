/**
 * forceAdmin.js
 * Crea o reemplaza el admin usando SQL directo (sin validaciones del modelo).
 * Uso: node forceAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('./src/config/database');

const ADMIN = {
    name: 'Admin Kyla',
    email: 'admin@businesskyla.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
};

(async () => {
    try {
        // 1. Conectar a MySQL
        await connectDB();
        console.log('📡 Conexión establecida.\n');

        // 2. Hashear la contraseña MANUALMENTE (sin depender de hooks del modelo)
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(ADMIN.password, salt);
        console.log('🔐 Hash generado:', hashed.substring(0, 29) + '...');

        // 3. Verificar que el hash funciona
        const valid = await bcrypt.compare(ADMIN.password, hashed);
        console.log('✅ Verificación bcrypt.compare:', valid, '\n');

        // 4. Upsert via SQL directo — REPLACE INTO funciona como INSERT + DELETE si existe
        //    (equivale a: si existe con ese email → elimina y recrea)
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await sequelize.query(
            `INSERT INTO Users (name, email, password, role, isActive, createdAt, updatedAt)
             VALUES (:name, :email, :password, :role, :isActive, :now, :now)
             ON DUPLICATE KEY UPDATE
               password  = VALUES(password),
               role      = VALUES(role),
               isActive  = VALUES(isActive),
               updatedAt = VALUES(updatedAt)`,
            {
                replacements: {
                    name: ADMIN.name,
                    email: ADMIN.email,
                    password: hashed,
                    role: ADMIN.role,
                    isActive: 1,
                    now
                },
                type: sequelize.QueryTypes.INSERT
            }
        );

        // 5. Verificar que quedó correcto
        const [rows] = await sequelize.query(
            'SELECT id, name, email, role, isActive, LEFT(password,7) AS pwdPrefix FROM Users WHERE email = :email',
            { replacements: { email: ADMIN.email }, type: sequelize.QueryTypes.SELECT }
        );

        if (rows) {
            console.log('✅ Usuario admin guardado correctamente:');
            console.log('   ID       :', rows.id);
            console.log('   Nombre   :', rows.name);
            console.log('   Email    :', rows.email);
            console.log('   Rol      :', rows.role);
            console.log('   Activo   :', rows.isActive);
            console.log('   PwdHash  :', rows.pwdPrefix + '... ← debe empezar con $2a$ o $2b$');
            console.log('\n🚀 Ya puedes iniciar sesion con:');
            console.log('   Email   : admin@businesskyla.com');
            console.log('   Password: admin123');
        } else {
            console.log('❌ No se pudo verificar el usuario después de la inserción.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Conexión cerrada.');
        process.exit(0);
    }
})();
