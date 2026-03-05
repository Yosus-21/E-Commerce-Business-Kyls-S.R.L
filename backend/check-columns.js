require('dotenv').config();
const { sequelize } = require('./src/config/database');

(async () => {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'quote_items'
        `);
        console.log('COLUMNS:' + JSON.stringify(results.map(r => r.column_name)));
    } catch (err) {
        console.error('ERROR:' + err.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
})();
