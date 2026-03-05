const { fn, col, literal } = require('sequelize');
const { sequelize, Product, Service, Category, Brand, User, Quote } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Generar catálogo PDF de productos
 * @route   GET /api/reports/catalog
 * @access  Private/Admin
 */
exports.generateCatalog = asyncHandler(async (req, res) => {
    const { categoryId, includeInactive, type, brand, brandId } = req.query;

    // type allowed values: 'products', 'services', 'all' (default: 'all')
    const filterType = type || 'all';

    // Construir filtros de productos
    const productWhere = {};
    if (!includeInactive) productWhere.isActive = true;
    if (categoryId) productWhere.categoryId = categoryId;

    // Filtro por marca (Soporta ambos query params por retrocompatibilidad)
    const targetBrandId = brandId || brand;
    if (targetBrandId) {
        productWhere.brandId = targetBrandId;
    }

    let products = [];
    if (filterType === 'all' || filterType === 'products') {
        products = await Product.findAll({
            where: productWhere,
            include: [
                { model: Brand, as: 'brand', attributes: ['id', 'name'], required: false },
                { model: Category, as: 'category', attributes: ['id', 'name'] }
            ],
            order: [
                ['categoryId', 'ASC'],
                ['name', 'ASC']
            ]
        });
    }

    let services = [];
    if (filterType === 'all' || filterType === 'services') {
        const serviceWhere = {};
        if (!includeInactive) serviceWhere.isActive = true;
        services = await Service.findAll({
            where: serviceWhere,
            order: [['title', 'ASC']]
        });
    }

    // HELPER para resolver rutas de imágenes
    const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
    const resolveImagePath = (imagesField) => {
        let imagesArr = [];
        if (Array.isArray(imagesField)) {
            imagesArr = imagesField;
        } else if (typeof imagesField === 'string') {
            try { imagesArr = JSON.parse(imagesField); }
            catch { imagesArr = [imagesField]; }
        }

        for (const imgPath of imagesArr) {
            if (!imgPath || imgPath.startsWith('http://') || imgPath.startsWith('https://')) continue;
            const cleanPath = imgPath.replace(/\\/g, '/').replace(/^\/uploads\//, '').replace(/^uploads\//, '');
            const absolutePath = path.join(UPLOADS_ROOT, cleanPath);
            if (fs.existsSync(absolutePath)) return absolutePath;
        }
        return null;
    };

    // INICIAR PDF
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=catalogo-business-kyla.pdf');
    doc.pipe(res);

    // FUENTES ESTÁNDAR
    const fontRegular = 'Helvetica';
    const fontBold = 'Helvetica-Bold';

    // PORTADA / HEADER PROFESIONAL
    const logoPath = path.join(__dirname, '../../uploads/logo.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, { fit: [120, 60], align: 'center' }).moveDown(0.5);
    } else {
        doc.moveDown(1);
    }

    doc
        .font(fontBold)
        .fontSize(24)
        .fillColor('#1f2937')
        .text('BUSINESS KYLA S.R.L.', { align: 'center' })
        .moveDown(0.2)
        .font(fontRegular)
        .fontSize(14)
        .fillColor('#6b7280')
        .text('Catálogo Oficial de Productos y Servicios', { align: 'center' })
        .moveDown(0.2)
        .fontSize(10)
        .fillColor('#9ca3af')
        .text(`Fecha de generación: ${new Date().toLocaleDateString('es-BO')}`, { align: 'center' })
        .moveDown(1);

    // Separador
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#e5e7eb').stroke().moveDown(1.5);

    const PAGE_WIDTH = 612 - 100;

    // SECCIÓN PRODUCTOS
    if (products.length > 0) {
        doc.font(fontBold).fontSize(16).fillColor('#111827').text('NUESTROS PRODUCTOS').moveDown(1);

        let currentCategory = null;

        products.forEach((product) => {
            // Manejar "%, " u otros caracteres rotos removiendo comas/porcentajes inusuales si vienen sucios en BD, 
            // aunque usar Helvetica ya evita problemas de encoding.
            const rawCatName = product.category?.name || 'Sin categoría';
            const catName = rawCatName.replace(/^%,\s*/, '').trim(); // Limpia prefijos raros

            if (catName !== currentCategory) {
                if (currentCategory !== null) doc.moveDown(0.5);
                currentCategory = catName;

                doc
                    .font(fontBold)
                    .fontSize(12)
                    .fillColor('#4f46e5')
                    .text(`Categoría: ${catName}`)
                    .moveDown(0.5);
            }

            // Layout Producto
            const startY = doc.y;
            const imgPath = resolveImagePath(product.images);
            let textX = 50;
            const imgSize = 70;

            // Evitar saltos de página a mitad de un ítem
            if (startY + imgSize + 20 > 792 - 50) {
                doc.addPage();
            }

            if (imgPath) {
                try {
                    doc.image(imgPath, 50, doc.y, { fit: [imgSize, imgSize], align: 'center', valign: 'center' });
                    textX = 50 + imgSize + 15;
                } catch { textX = 50; }
            }

            // Nombre
            doc.font(fontBold).fontSize(11).fillColor('#1f2937').text(product.name, textX, doc.y, { width: PAGE_WIDTH - (textX - 50) });

            // Marca y Descripción (Truncada)
            doc.moveDown(0.2);
            doc.font(fontRegular).fontSize(9).fillColor('#6b7280');
            if (product.brand?.name) {
                doc.text(`Marca: ${product.brand.name}`, { continued: true }).text('  |  ', { continued: true });
            }

            let desc = "";
            let rawDesc = "";
            if (product.specifications) {
                try {
                    const specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
                    if (Array.isArray(specs) && specs.length > 0) {
                        rawDesc = specs.map(s => `${s.key}: ${s.value}`).join(' • ');
                    }
                } catch {
                    rawDesc = product.description || "";
                }
            } else {
                rawDesc = product.description || "";
            }
            // Truncar descripción muy larga a 2 líneas aprox
            desc = rawDesc.length > 120 ? rawDesc.substring(0, 117) + "..." : rawDesc;

            if (desc) {
                doc.text(desc, { width: PAGE_WIDTH - (textX - 50) });
            } else {
                doc.text(" "); // Asegurar salto de línea
            }

            // Precio
            doc.moveDown(0.3);
            doc.font(fontBold).fontSize(10).fillColor('#10b981').text(`Bs. ${Number(product.price).toFixed(2)}`);

            // Mover al final de este bloque
            const endY = Math.max(doc.y, startY + imgSize);
            doc.y = endY;
            doc.moveDown(0.8);

            // Separador tenue entre ítems
            doc.moveTo(textX, doc.y).lineTo(562, doc.y).strokeColor('#f3f4f6').stroke().moveDown(0.8);
        });

        doc.moveDown(1);
    }

    // SECCIÓN SERVICIOS
    if (services.length > 0) {
        if (products.length > 0) {
            doc.addPage();
            // Header minimizado si es pág nueva
            doc.font(fontBold).fontSize(14).fillColor('#6b7280').text('BUSINESS KYLA S.R.L.', { align: 'right' }).moveDown(1);
        }

        doc.font(fontBold).fontSize(16).fillColor('#111827').text('NUESTROS SERVICIOS').moveDown(1);

        services.forEach((service) => {
            const startY = doc.y;
            const imgPath = resolveImagePath(service.image || service.imageUrl ? [service.image || service.imageUrl] : []);
            let textX = 50;
            const imgSize = 70;

            if (startY + imgSize + 20 > 792 - 50) {
                doc.addPage();
            }

            if (imgPath) {
                try {
                    doc.image(imgPath, 50, doc.y, { fit: [imgSize, imgSize] });
                    textX = 50 + imgSize + 15;
                } catch { textX = 50; }
            }

            // Título
            doc.font(fontBold).fontSize(12).fillColor('#1f2937').text(service.title, textX, doc.y);
            doc.moveDown(0.2);

            // Descripción (Truncada a ~150 chars)
            let desc = service.description || '';
            if (desc.length > 150) desc = desc.substring(0, 147) + '...';
            doc.font(fontRegular).fontSize(10).fillColor('#4b5563').text(desc, { width: PAGE_WIDTH - (textX - 50) });
            doc.moveDown(0.3);

            // Precio o 'A convenir'
            const svcPrice = service.price ? (isNaN(service.price) ? service.price : `Bs. ${Number(service.price).toFixed(2)}`) : 'Precio a convenir';
            doc.font(fontBold).fontSize(10).fillColor('#10b981').text(svcPrice);

            const endY = Math.max(doc.y, startY + imgSize);
            doc.y = endY;
            doc.moveDown(0.8);

            // Separador tenue entre ítems
            doc.moveTo(textX, doc.y).lineTo(562, doc.y).strokeColor('#f3f4f6').stroke().moveDown(0.8);
        });
    }

    // PIE DE PÁGINA (Footer en todas las páginas, manejable vía eventos pero lo ponemos simple al final)
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(562, doc.y).strokeColor('#e5e7eb').stroke().moveDown(0.5);
    doc
        .font(fontRegular)
        .fontSize(8)
        .fillColor('#9ca3af')
        .text('Business Kyla S.R.L. — Todos los precios están en Bolivianos (Bs.) y están sujetos a confirmación.', { align: 'center' });

    doc.end();
});


/**
 * @desc    Resumen ejecutivo / Dashboard Admin
 * @route   GET /api/reports/dashboard
 * @access  Private/Admin
 *
 * Estructura del JSON de respuesta:
 * {
 *   inventory: { totalProducts, activeProducts, totalCategories, totalBrands },
 *   users:     { totalUsers },
 *   quotes:    { total, revenue, avgValue },
 *   monthly:   { totalQuotes, totalValue, generatedQuotes, contactedQuotes, closedQuotes },
 *   quoteTrend:          [{ date, count }]        — últimos 30 días
 *   topProducts:         [{ name, totalQuantity }] — top 5 más cotizados (por cantidad en QuoteItems)
 *   categoryDistribution:[{ name, count }]         — productos por categoría
 *   topClients:          [{ name, email, quoteCount }] — top 5 por número de cotizaciones
 *   topViewedProducts:   [{ id, name, price, views, images }]
 *   lowStockProducts:    [{ id, name, stock }]
 * }
 */
exports.getDashboard = asyncHandler(async (req, res) => {
    const { Op, fn, col, literal } = require('sequelize');
    const { QuoteItem } = require('../models/index');

    try {
        // ── Período del mes actual ─────────────────────────────────────────────
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // ── Período de los últimos 30 días ─────────────────────────────────────
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // ====================================================================
        // CONSULTAS EN PARALELO — máximo rendimiento, sin N+1
        // Equivalente a los aggregate pipelines de MongoDB pero con Sequelize
        // ====================================================================
        const [
            totalProducts,
            activeProducts,
            totalCategories,
            totalBrands,
            totalUsers,
            totalQuotes,
            quoteRevenueRaw,
            monthlyByStatus,
            rawQuoteTrend,
            topClients,
            topProductsRaw,
            categoryDistributionRaw,
            topViewedProducts,
            lowStockProducts
        ] = await Promise.all([

            // ── Inventario ──────────────────────────────────────────────────
            Product.count(),
            Product.count({ where: { isActive: true } }),
            Category.count({ where: { isActive: true } }),
            Brand.count({ where: { isActive: true } }),

            // ── Usuarios ────────────────────────────────────────────────────
            User.count(),

            // ── Cotizaciones globales ────────────────────────────────────────
            Quote.count(),

            // ── Suma total de ingresos ───────────────────────────────────────
            // Si la tabla está vacía, devuelve { total: null }. COALESCE no siempre es estable en dialectos agnósticos
            Quote.findOne({
                attributes: [
                    [fn('SUM', col('total_amount')), 'total']
                ],
                raw: true
            }),

            // ── Cotizaciones del mes actual, agrupadas por estado ────────────
            Quote.findAll({
                where: {
                    createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
                },
                attributes: [
                    'status',
                    [fn('COUNT', col('id')), 'count'],
                    [fn('SUM', col('total_amount')), 'total']
                ],
                group: ['status'],
                raw: true
            }),

            // ── Tendencia diaria (últimos 30 días) ───────────────────────────
            sequelize.query(`
                SELECT
                    TO_CHAR(created_at, 'DD/MM')  AS date,
                    COUNT(id)                      AS count,
                    SUM(total_amount)             AS total
                FROM quotes
                WHERE created_at >= :thirtyDaysAgo
                GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `, {
                replacements: { thirtyDaysAgo },
                type: sequelize.QueryTypes.SELECT
            }),

            // ── Top 5 clientes por cotizaciones (SAFE JSON QUERY) ────────────
            sequelize.query(`
                SELECT
                    customer_data->>'name'  AS name,
                    customer_data->>'email' AS email,
                    COUNT(id)               AS quote_count,
                    SUM(total_amount)       AS total_value
                FROM quotes
                WHERE customer_data IS NOT NULL
                GROUP BY 
                    customer_data->>'email', 
                    customer_data->>'name'
                ORDER BY quote_count DESC
                LIMIT 5
            `, { type: sequelize.QueryTypes.SELECT }),

            // ── Top 5 productos más cotizados (desde QuoteItems) ─────────────
            QuoteItem.findAll({
                attributes: [
                    'productId',
                    'name',
                    [fn('SUM', col('quantity')), 'total_quantity'],
                    [fn('COUNT', col('QuoteItem.id')), 'times_quoted']
                ],
                group: [col('product_id'), 'QuoteItem.name'],
                order: [[literal('total_quantity'), 'DESC']],
                limit: 5,
                raw: true
            }),

            // ── Distribución de productos activos por categoría ──────────────
            Product.findAll({
                where: { isActive: true },
                attributes: [
                    [col('category.name'), 'name'],
                    [fn('COUNT', col('Product.id')), 'count']
                ],
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: [],
                    required: true
                }],
                group: [col('category.id'), col('category.name')],
                order: [[literal('count'), 'DESC']],
                raw: true
            }),

            // ── Top 5 productos más vistos ───────────────────────────────────
            Product.findAll({
                where: { isActive: true },
                attributes: ['id', 'name', 'price', 'views', 'images'],
                include: [{ model: Category, as: 'category', attributes: ['name'] }],
                order: [['views', 'DESC']],
                limit: 5
            }),

            // ── Productos con bajo stock (≤ 5 unidades) ──────────────────────
            Product.findAll({
                where: { isActive: true, stock: { [Op.lte]: 5 } },
                attributes: ['id', 'name', 'stock'],
                order: [['stock', 'ASC']],
                limit: 10
            })
        ]);

        // ====================================================================
        // NORMALIZACIÓN SEGURA Y FALLBACK A 0 (Evita NaN o NULL)
        // ====================================================================

        const monthlyQuotes = {
            generatedQuotes: 0,
            contactedQuotes: 0,
            closedQuotes: 0,
            totalQuotes: 0,
            totalValue: 0
        };

        (monthlyByStatus || []).forEach(row => {
            const count = parseInt(row.count, 10) || 0;
            const total = parseFloat(row.total) || 0;
            monthlyQuotes.totalQuotes += count;
            monthlyQuotes.totalValue += total;

            if (row.status === 'Generada') monthlyQuotes.generatedQuotes = count;
            if (row.status === 'Contactado') monthlyQuotes.contactedQuotes = count;
            if (row.status === 'Cerrada') monthlyQuotes.closedQuotes = count;
        });

        const quoteTrend = (rawQuoteTrend || []).map(row => ({
            date: row.date,
            count: parseInt(row.count, 10) || 0,
            total: parseFloat(row.total) || 0
        }));

        const topProducts = (topProductsRaw || []).map(p => ({
            name: p.name,
            totalQuantity: parseInt(p.total_quantity, 10) || 0,
            timesQuoted: parseInt(p.times_quoted, 10) || 0,
            productId: p.productId
        }));

        const categoryDistribution = (categoryDistributionRaw || []).map(c => ({
            name: c.name,
            count: parseInt(c.count, 10) || 0
        }));

        const topClientsList = (topClients || []).map(c => ({
            name: c.name || 'Desconocido',
            email: c.email || 'Sin correo',
            quoteCount: parseInt(c.quote_count, 10) || 0,
            totalValue: parseFloat(c.total_value) || 0
        }));

        // Revenue global (Fallback seguro a 0 si la tabla está vacía)
        const totalRevenue = quoteRevenueRaw && quoteRevenueRaw.total ? parseFloat(quoteRevenueRaw.total) : 0;
        const avgValue = totalQuotes > 0 ? (totalRevenue / totalQuotes) : 0;

        // ── RESPUESTA JSON FINAL ─────────────────────────────────────────────
        res.status(200).json({
            success: true,
            data: {
                inventory: {
                    totalProducts: totalProducts || 0,
                    activeProducts: activeProducts || 0,
                    totalCategories: totalCategories || 0,
                    totalBrands: totalBrands || 0
                },
                users: {
                    totalUsers: totalUsers || 0
                },
                quotes: {
                    total: totalQuotes || 0,
                    revenue: totalRevenue,
                    avgValue: avgValue
                },
                monthly: monthlyQuotes,
                quoteTrend,
                topProducts,
                categoryDistribution,
                topClients: topClientsList,
                topViewedProducts: topViewedProducts || [],
                lowStockProducts: lowStockProducts || []
            }
        });

    } catch (error) {
        console.error('[DASHBOARD ERROR]:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar métricas del dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
