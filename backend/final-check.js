/**
 * final-check.js
 * ─────────────────────────────────────────────────────────────────────────────
 * QA Script — Verificación rápida de integridad MySQL post-migración
 * Ejecutar con: node final-check.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// ── Conexión directa (sin importar los modelos para evitar efectos secundarios) ──
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
    }
);

// ── Tablas a verificar con umbral mínimo esperado ─────────────────────────────
// min: 0 = tabla puede estar vacía (ej: CartItems si no hay compras)
// min: 1 = debe tener al menos 1 registro para considerar el sistema funcional
const TABLES = [
    { name: 'Users', min: 1, critical: true },
    { name: 'Categories', min: 1, critical: true },
    { name: 'Brands', min: 0, critical: false },
    { name: 'Products', min: 1, critical: true },
    { name: 'Services', min: 0, critical: false },
    { name: 'Carts', min: 0, critical: false },
    { name: 'CartItems', min: 0, critical: false },
    { name: 'Quotes', min: 0, critical: false },
    { name: 'QuoteItems', min: 0, critical: false },
    { name: 'FeaturedImages', min: 0, critical: false },
    { name: 'Partners', min: 0, critical: false },
    { name: 'UserAddresses', min: 0, critical: false },
];

// ── Colores de consola ─────────────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

const pad = (str, len) => String(str).padEnd(len, ' ');

// ── Verificaciones adicionales de integridad relacional ───────────────────────
const INTEGRITY_CHECKS = [
    {
        label: 'CartItems sin producto (productId = NULL)',
        sql: 'SELECT COUNT(*) AS cnt FROM CartItems WHERE productId IS NULL',
        expectZero: false, // puede haber si se borró un producto (SET NULL)
    },
    {
        label: 'QuoteItems sin producto (productId = NULL)',
        sql: 'SELECT COUNT(*) AS cnt FROM QuoteItems WHERE productId IS NULL',
        expectZero: false,
    },
    {
        label: 'Cotizaciones sin ítems (huérfanas)',
        sql: `SELECT COUNT(*) AS cnt FROM Quotes q
                WHERE NOT EXISTS (SELECT 1 FROM QuoteItems qi WHERE qi.quoteId = q.id)`,
        expectZero: true, // Toda cotización debería tener al menos 1 ítem
    },
    {
        label: 'Usuarios Admin activos',
        sql: "SELECT COUNT(*) AS cnt FROM Users WHERE role = 'admin' AND isActive = 1",
        expectZero: false, // Debe haber al menos 1 admin
        minValue: 1,
    },
    {
        label: 'Productos activos con stock > 0',
        sql: 'SELECT COUNT(*) AS cnt FROM Products WHERE isActive = 1 AND stock > 0',
        expectZero: false,
    },
    {
        label: 'Slugs duplicados en Products',
        sql: 'SELECT COUNT(*) AS cnt FROM (SELECT slug, COUNT(*) c FROM Products GROUP BY slug HAVING c > 1) t',
        expectZero: true,
    },
    {
        label: 'Slugs duplicados en Categories',
        sql: 'SELECT COUNT(*) AS cnt FROM (SELECT slug, COUNT(*) c FROM Categories GROUP BY slug HAVING c > 1) t',
        expectZero: true,
    },
    {
        label: 'Slugs duplicados en Brands',
        sql: 'SELECT COUNT(*) AS cnt FROM (SELECT slug, COUNT(*) c FROM Brands GROUP BY slug HAVING c > 1) t',
        expectZero: true,
    },
];

// ═════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log(`\n${C.bold}${C.cyan}═══════════════════════════════════════════════════${C.reset}`);
    console.log(`${C.bold}${C.cyan}  Business Kyla SRL — QA Final Check (MySQL)${C.reset}`);
    console.log(`${C.bold}${C.cyan}═══════════════════════════════════════════════════${C.reset}\n`);

    // ── Conexión ──────────────────────────────────────────────────────────────
    try {
        await sequelize.authenticate();
        console.log(`${C.green}✅ Conexión a MySQL establecida${C.reset}`);
        console.log(`   Host: ${process.env.DB_HOST || 'localhost'} | DB: ${process.env.DB_NAME}\n`);
    } catch (err) {
        console.error(`${C.red}❌ No se pudo conectar a MySQL: ${err.message}${C.reset}`);
        process.exit(1);
    }

    // ── Conteo de tablas ──────────────────────────────────────────────────────
    console.log(`${C.bold}📊 CONTEO DE REGISTROS POR TABLA${C.reset}`);
    console.log('─'.repeat(48));
    console.log(`${pad('Tabla', 20)} ${pad('Registros', 12)} Estado`);
    console.log('─'.repeat(48));

    let criticalFails = 0;
    const tableResults = [];

    for (const table of TABLES) {
        try {
            const [[row]] = await sequelize.query(`SELECT COUNT(*) AS cnt FROM \`${table.name}\``);
            const count = parseInt(row.cnt);
            const ok = count >= table.min;
            const icon = ok ? `${C.green}✅` : table.critical ? `${C.red}❌` : `${C.yellow}⚠️ `;
            const label = ok ? 'OK' : table.critical ? 'CRÍTICO — tabla vacía inesperada' : 'Vacía (aceptable)';

            console.log(`${pad(table.name, 20)} ${pad(count, 12)} ${icon} ${label}${C.reset}`);
            if (!ok && table.critical) criticalFails++;
            tableResults.push({ table: table.name, count, ok });
        } catch (err) {
            console.log(`${pad(table.name, 20)} ${pad('ERROR', 12)} ${C.red}❌ ${err.message}${C.reset}`);
            if (table.critical) criticalFails++;
        }
    }

    // ── Verificaciones de integridad ──────────────────────────────────────────
    console.log(`\n${C.bold}🔍 VERIFICACIONES DE INTEGRIDAD${C.reset}`);
    console.log('─'.repeat(55));

    let integrityFails = 0;

    for (const check of INTEGRITY_CHECKS) {
        try {
            const [[row]] = await sequelize.query(check.sql);
            const count = parseInt(row.cnt);
            let icon, status;

            if (check.minValue !== undefined) {
                const ok = count >= check.minValue;
                icon = ok ? `${C.green}✅` : `${C.red}❌`;
                status = ok ? `OK (${count})` : `FALLO — se esperaba ≥ ${check.minValue}, hay ${count}`;
                if (!ok) integrityFails++;
            } else if (check.expectZero) {
                icon = count === 0 ? `${C.green}✅` : `${C.red}❌`;
                status = count === 0 ? 'OK' : `FALLO — hay ${count} registros problemáticos`;
                if (count !== 0) integrityFails++;
            } else {
                icon = count > 0 ? `${C.green}✅` : `${C.yellow}⚠️ `;
                status = count > 0 ? `${count} registro(s)` : 'Sin datos (aceptable si es sistema nuevo)';
            }

            console.log(`  ${icon} ${pad(check.label, 42)} ${status}${C.reset}`);
        } catch (err) {
            console.log(`  ${C.red}❌ ${check.label}: ${err.message}${C.reset}`);
        }
    }

    // ── Resumen final ───────────────────────────────────────────────────────
    console.log(`\n${C.bold}═══════════════════════════════════════════════════${C.reset}`);

    const totalRegistros = tableResults.reduce((s, r) => s + r.count, 0);
    console.log(`📦 Total de registros en toda la BD: ${C.bold}${totalRegistros}${C.reset}`);

    if (criticalFails === 0 && integrityFails === 0) {
        console.log(`\n${C.green}${C.bold}🎉 SISTEMA LISTO PARA PRODUCCIÓN${C.reset}`);
        console.log(`${C.green}   Todas las tablas críticas tienen datos y la integridad relacional es correcta.${C.reset}`);
    } else {
        if (criticalFails > 0) {
            console.log(`\n${C.red}${C.bold}❌ ${criticalFails} tabla(s) crítica(s) vacías — revisar antes de producción${C.reset}`);
        }
        if (integrityFails > 0) {
            console.log(`${C.red}${C.bold}❌ ${integrityFails} verificación(es) de integridad fallida(s)${C.reset}`);
        }
    }

    console.log(`${C.bold}═══════════════════════════════════════════════════${C.reset}\n`);

    await sequelize.close();
    process.exit(criticalFails + integrityFails > 0 ? 1 : 0);
}

main().catch(err => {
    console.error(`${C.red}Error fatal:${C.reset}`, err.message);
    process.exit(1);
});
