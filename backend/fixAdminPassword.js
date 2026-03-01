/**
 * fixAdminPassword.js
 * Repara el password del admin si fue guardado en texto plano.
 *
 * Uso: node fixAdminPassword.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./src/config/database');
const { sequelize } = require('./src/config/database');
// Importar modelos para que los hooks queden registrados
require('./src/models/index');
const { User } = require('./src/models/index');

const ADMIN_EMAIL = 'admin@businesskyla.com';
const ADMIN_PASSWORD = 'admin123';

const fix = async () => {
    try {
        await connectDB();

        // 1. Traer el usuario con su password actual
        const user = await User.scope('withPassword').findOne({
            where: { email: ADMIN_EMAIL }
        });

        if (!user) {
            console.log('⚠️  No se encontró el admin. Ejecuta primero: node seedAdmin.js');
            process.exit(0);
        }

        const storedPwd = user.password;
        const isAlreadyHashed = storedPwd && storedPwd.startsWith('$2');

        console.log('🔍 Password almacenado:', storedPwd);
        console.log('🔐 ¿Ya está hasheado?:', isAlreadyHashed);

        if (isAlreadyHashed) {
            // Verificar si el hash corresponde a la contraseña
            const match = await bcrypt.compare(ADMIN_PASSWORD, storedPwd);
            if (match) {
                console.log('✅ El password ya es correcto y está bien hasheado.');
                console.log('   El problema puede estar en el authController. Revisa los logs.');
            } else {
                console.log('❌ El hash existe pero NO corresponde a "admin123".');
                console.log('   Forzando re-hasheo...');
                await forceRehash(user);
            }
        } else {
            console.log('❌ Password en texto plano detectado. Hasheando ahora...');
            await forceRehash(user);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('🔒 Conexión cerrada.');
        process.exit(0);
    }
};

const forceRehash = async (user) => {
    // Hashear manualmente y actualizar con UPDATE directo (bypassea validaciones de longitud)
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Usamos sequelize.query para UPDATE directo sin pasar por el modelo
    // (evita que la validación len:[6,255] rechace el hash de 60 chars)
    await sequelize.query(
        'UPDATE Users SET password = ? WHERE email = ?',
        { replacements: [hashed, user.email] }
    );

    console.log('✅ Password hasheado y actualizado correctamente.');
    console.log('   Hash guardado:', hashed.substring(0, 20) + '...');
    console.log('');
    console.log('🚀 Ya puedes iniciar sesión con:');
    console.log('   Email   : admin@businesskyla.com');
    console.log('   Password: admin123');
};

fix();
