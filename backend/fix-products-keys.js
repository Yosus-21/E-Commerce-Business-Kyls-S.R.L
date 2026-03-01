const { sequelize } = require('./src/models/index');

async function fixKeys() {
    try {
        console.log('Conectando a BD para limpiar indices duplicados de Products...');
        const [results] = await sequelize.query('SHOW INDEX FROM `Products`');

        // Obtener nombres unicos de indices que no son PRIMARY
        const keyNames = [...new Set(results.map(r => r.Key_name))].filter(k => k !== 'PRIMARY');

        for (const keyName of keyNames) {
            try {
                await sequelize.query(`ALTER TABLE \`Products\` DROP INDEX \`${keyName}\``);
                console.log('Índice eliminado:', keyName);
            } catch (err) {
                console.error(`No se pudo eliminar el índice ${keyName}:`, err.message);
            }
        }
        console.log('Todos los índices duplicados y secundarios eliminados. Sequelize los reconstruirá sanos en el próximo arranque.');
    } catch (error) {
        console.error('Error general:', error);
    } finally {
        process.exit(0);
    }
}

fixKeys();
