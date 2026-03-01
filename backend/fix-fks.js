/**
 * fix-fks.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script ONE-SHOT para recrear CartItems y QuoteItems con productId allowNull:true
 * Ejecutar UNA SOLA VEZ con: node fix-fks.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SEGURO DE EJECUTAR: CartItems y QuoteItems no tienen datos críticos todavía
 * (los datos del carrito son temporales, las cotizaciones se regeneran)
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();

// Importar la conexión y los modelos ya con las correcciones de allowNull:true
const { sequelize, CartItem, QuoteItem } = require('./src/models/index');

const main = async () => {
    console.log('\n🔧 fix-fks.js — Recreando tablas con productId nullable\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida\n');

        // ── CartItems ──────────────────────────────────────────────────────────
        console.log('🗑️  DROP + CREATE de CartItems...');
        await CartItem.sync({ force: true });
        console.log('✅ CartItems recreada con productId NULL\n');

        // ── QuoteItems ─────────────────────────────────────────────────────────
        console.log('🗑️  DROP + CREATE de QuoteItems...');
        await QuoteItem.sync({ force: true });
        console.log('✅ QuoteItems recreada con productId NULL\n');

        console.log('═══════════════════════════════════════════');
        console.log('🎉 Listo. Ahora ejecuta: npm run dev');
        console.log('═══════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

main();
