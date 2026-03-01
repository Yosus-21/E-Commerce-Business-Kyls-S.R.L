require('dotenv').config();
const { sequelize } = require('./src/models/index');

async function fixAllKeys() {
    try {
        console.log('Conectando a BD para limpiar índices duplicados...');

        // Tablas que podrían tener el problema de múltiples índices en "slug" o campos UNIQUE
        const tables = ['Categories', 'Brands', 'Products', 'Services', 'Users', 'Partners'];

        for (const table of tables) {
            try {
                const [results] = await sequelize.query(`SHOW INDEX FROM \`${table}\``);

                // Extraer nombres de índices que NO sean PRIMARY
                const allKeyNames = [...new Set(results.map(r => r.Key_name))].filter(k => k !== 'PRIMARY');

                // Excluiremos los índices que sean Foreign Keys o que parezcan útiles para relaciones
                // Sequelize usualmente nombra las Foreign Keys o podemos filtrar por columnas que terminan en Id
                // Para estar seguros, purguemos específicamente los que se llaman como las columnas "slug", "email"
                // o que tengan el patrón trillado que causó el error.
                const keysToDrop = allKeyNames.filter(k =>
                    k.includes('slug') ||
                    k.includes('UNIQUE') ||
                    k === 'email' ||
                    k.startsWith(table.toLowerCase() + '_slug')
                );

                for (const keyName of keysToDrop) {
                    try {
                        await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${keyName}\``);
                        console.log(`[${table}] Índice eliminado: ${keyName}`);
                    } catch (err) {
                        // Ignorar errores menores de Foreign Keys
                    }
                }
            } catch (err) {
                console.log(`No se pudo procesar la tabla ${table}: ${err.message}`);
            }
        }

        console.log('Limpieza masiva completada. Sequelize reconstruirá los índices necesarios de forma limpia.');
    } catch (error) {
        console.error('Error general:', error);
    } finally {
        process.exit(0);
    }
}

fixAllKeys();
