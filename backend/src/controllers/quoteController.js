const { Op, fn, col, literal } = require('sequelize');
const { sequelize, Quote, QuoteItem, Cart, CartItem, Product, User } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const { generateQuotePDF } = require('../utils/pdfGenerator');
const sendEmail = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

// ====================================
// HELPER: Cargar cotización completa (Quote → QuoteItems ↗ User)
// ====================================
const loadQuoteWithItems = async (quoteId, userId = null) => {
    const where = { id: quoteId };
    if (userId) where.userId = userId;

    return await Quote.findOne({
        where,
        include: [
            {
                model: QuoteItem,
                as: 'items',
                include: [
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name', 'images'],
                        required: false   // LEFT JOIN: el producto puede haber sido eliminado
                    }
                ]
            },
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone']
            }
        ]
    });
};

/**
 * @desc    Generar cotización desde el carrito del usuario
 * @route   POST /api/quotes
 * @access  Private
 *
 * ⚙️  TRANSACCIÓN SEQUELIZE:
 *   Si falla el bulkCreate de QuoteItems o el envío de email,
 *   todos los cambios (Quote + QuoteItems) se revierten automáticamente.
 */
exports.generateQuote = asyncHandler(async (req, res) => {
    const { notes, customerData } = req.body;

    // ====================================
    // INICIAR TRANSACCIÓN
    // ====================================
    const t = await sequelize.transaction();

    try {
        // 1. Obtener el carrito con JOIN profundo (fuera de transacción, solo lectura)
        const cart = await Cart.findOne({
            where: { userId: req.user.id },
            include: [
                {
                    model: CartItem,
                    as: 'CartItems',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'stock', 'images', 'isActive']
                        }
                    ]
                }
            ]
        });

        if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'El carrito está vacío. Agrega productos antes de generar una cotización.'
            });
        }

        // 2. Validar que todos los productos están activos
        const inactiveItems = cart.CartItems.filter(
            item => !item.product || !item.product.isActive
        );
        if (inactiveItems.length > 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Hay productos inactivos en el carrito. Por favor actualízalo antes de cotizar.'
            });
        }

        // 3. Generar número único de cotización (ej: QT-20260226-001)
        const quoteNumber = await Quote.generateQuoteNumber();

        // 4. Calcular total de la cotización
        const totalAmount = parseFloat(
            cart.CartItems.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            ).toFixed(2)
        );

        // 5. Preparar customerData: combina datos del usuario con lo que envíe el body
        const user = await User.findByPk(req.user.id);
        const finalCustomerData = {
            name: customerData?.name || user.name,
            email: customerData?.email || user.email,
            phone: customerData?.phone || user.phone || '',
            company: customerData?.company || ''
        };

        // ── DENTRO DE LA TRANSACCIÓN ──────────────────────────────────────────────

        // 6. Crear registro principal de la cotización
        const quote = await Quote.create(
            {
                quoteNumber,
                userId: req.user.id,
                customerData: finalCustomerData,
                totalAmount,
                notes: notes || null,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            { transaction: t }
        );

        // 7. Preparar array de QuoteItems (snapshot de nombre/precio al momento de cotizar)
        const quoteItemsData = cart.CartItems.map(item => ({
            quoteId: quote.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
            image: item.product.images?.[0] || null
        }));

        // 8. Insertar TODOS los items de una sola vez (más eficiente que N inserts)
        await QuoteItem.bulkCreate(quoteItemsData, { transaction: t });

        // ── CONFIRMAR TRANSACCIÓN ─────────────────────────────────────────────────
        await t.commit();

        // 9. Cargar cotización completa (fuera de transacción, ya commiteada)
        //    Se hace SIEMPRE aquí para garantizar que quoteWithItems esté disponible
        //    tanto para generar el PDF como para el email y la respuesta JSON
        const quoteWithItems = await loadQuoteWithItems(quote.id);

        // 10. Generar PDF (operación de archivo — si falla, la cotización ya está guardada)
        let pdfPath = null;
        try {
            pdfPath = await generateQuotePDF(quoteWithItems);
            await quote.update({ pdfPath });
        } catch (pdfError) {
            console.error('⚠️  Error generando PDF (cotización guardada igual):', pdfError.message);
        }

        // 11. Vaciar el carrito del usuario después de generar la cotización
        await CartItem.destroy({ where: { cartId: cart.id } });
        await cart.update({ totalAmount: 0 });

        // 12. Enviar email de confirmación (no bloquea la respuesta)
        sendEmail({
            email: finalCustomerData.email,
            subject: `📋 Tu Cotización ${quoteNumber} — Business Kyla`,
            message: buildQuoteEmailHtml(quoteNumber, finalCustomerData.name, quoteWithItems)
        }).catch(err => console.error('⚠️  Error al enviar email de cotización:', err.message));

        // 13. Responder con la cotización creada (siempre tiene datos)
        // ✅ toJSON() convierte la instancia Sequelize a POJO plano
        // para que el frontend pueda acceder a .id y .quoteNumber directamente
        const responseData = quoteWithItems ? quoteWithItems.toJSON() : { id: quote.id, quoteNumber, totalAmount };

        res.status(201).json({
            success: true,
            data: responseData,
            message: `Cotización ${quoteNumber} generada exitosamente`
        });

    } catch (error) {
        // Si algo falla dentro de la transacción → ROLLBACK
        await t.rollback();
        console.error('❌ Error al generar cotización:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar la cotización',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @desc    Obtener mis cotizaciones
 * @route   GET /api/quotes
 * @access  Private
 */
exports.getMyQuotes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: quotes } = await Quote.findAndCountAll({
        where,
        include: [{ model: QuoteItem, as: 'items', attributes: ['id', 'name', 'quantity', 'price', 'subtotal'] }],
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
    });

    res.status(200).json({
        success: true,
        data: quotes,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(count / limitNum),
            totalQuotes: count,
            limit: limitNum
        }
    });
});

/**
 * @desc    Obtener detalle de una cotización
 * @route   GET /api/quotes/:id
 * @access  Private
 */
exports.getQuote = asyncHandler(async (req, res) => {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const quote = await loadQuoteWithItems(req.params.id, userId);

    if (!quote) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }

    res.status(200).json({ success: true, data: quote });
});

/**
 * @desc    Descargar PDF de una cotización
 * @route   GET /api/quotes/:id/download
 * @access  Private
 */
exports.downloadQuotePDF = asyncHandler(async (req, res) => {
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const quote = await loadQuoteWithItems(req.params.id, userId);

    if (!quote) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }

    let pdfPath = quote.pdfPath;

    // Regenerar PDF si no existe en disco
    // pdfGenerator devuelve ruta ABSOLUTA → guardarla tal cual en BD
    if (!pdfPath || !fs.existsSync(pdfPath)) {
        try {
            pdfPath = await generateQuotePDF(quote);
            await quote.update({ pdfPath });
        } catch (err) {
            console.error('Error regenerando PDF:', err.message);
            return res.status(500).json({ success: false, message: 'Error al generar el PDF' });
        }
    }

    // ✅ FIX: pdfGenerator retorna ruta absoluta (ej: C:\...\uploads\quotes\quote-QT-xxx.pdf)
    // path.join(process.cwd(), absolutePath) duplica la ruta en Windows → 404
    // Solución: si ya es absoluta, usarla directamente; si es relativa, joinear con cwd()
    const absolutePath = path.isAbsolute(pdfPath)
        ? pdfPath
        : path.join(process.cwd(), pdfPath);

    if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ success: false, message: 'Archivo PDF no encontrado en el servidor' });
    }

    res.download(absolutePath, `cotizacion-${quote.quoteNumber}.pdf`);
});

/**
 * @desc    Eliminar cotización propia
 * @route   DELETE /api/quotes/:id
 * @access  Private
 */
exports.deleteQuote = asyncHandler(async (req, res) => {
    const quote = await Quote.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!quote) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }

    // Eliminar PDF si existe
    if (quote.pdfPath) {
        const abs = path.join(process.cwd(), quote.pdfPath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
    }

    // QuoteItems se eliminan en CASCADE (definido en index.js)
    await quote.destroy();

    res.status(200).json({ success: true, message: 'Cotización eliminada exitosamente' });
});

// ====================================
// ADMIN
// ====================================

/**
 * @desc    Obtener todas las cotizaciones (Admin)
 * @route   GET /api/quotes/admin
 * @access  Private/Admin
 */
exports.getAllQuotes = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;

    // Búsqueda en quoteNumber
    if (search) {
        where.quoteNumber = { [Op.like]: `%${search}%` };
    }

    const { count, rows: quotes } = await Quote.findAndCountAll({
        where,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone']
            },
            {
                model: QuoteItem,
                as: 'items',
                attributes: ['id', 'name', 'quantity', 'price', 'subtotal']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset,
        distinct: true
    });

    res.status(200).json({
        success: true,
        data: quotes,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(count / limitNum),
            totalQuotes: count,
            limit: limitNum
        }
    });
});

/**
 * @desc    Actualizar estado de una cotización (Admin)
 * @route   PUT /api/quotes/:id/status
 * @access  Private/Admin
 */
exports.updateQuoteStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const validStatuses = ['Generada', 'Contactado', 'Cerrada'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Estado inválido. Debe ser: ${validStatuses.join(', ')}`
        });
    }

    const quote = await Quote.findByPk(req.params.id);
    if (!quote) {
        return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
    }

    quote.status = status;
    if (notes !== undefined) quote.notes = notes;
    await quote.save();

    res.status(200).json({
        success: true,
        data: quote,
        message: `Estado actualizado a "${status}"`
    });
});

/**
 * @desc    Estadísticas del dashboard de cotizaciones (Admin)
 * @route   GET /api/quotes/stats
 * @access  Private/Admin
 *
 * ⚙️  Reemplaza los aggregate pipelines de MongoDB con:
 *   - sequelize.fn('SUM' / 'COUNT') para totales y agrupaciones
 *   - sequelize.query() para la consulta de tendencia mensual
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {

    // ── CONSULTA 1: Totales globales ──────────────────────────────────────────
    // Equivalente a $group: { _id: null, total: { $sum: '$totalAmount' } }
    const globalTotals = await Quote.findOne({
        attributes: [
            [fn('COUNT', col('id')), 'totalQuotes'],
            [fn('SUM', col('total_amount')), 'totalRevenue'],
            [fn('AVG', col('total_amount')), 'avgQuoteValue']
        ],
        raw: true
    });

    // ── CONSULTA 2: Cotizaciones por estado ───────────────────────────────────
    // Equivalente a $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } }
    const byStatus = await Quote.findAll({
        attributes: [
            'status',
            [fn('COUNT', col('id')), 'count'],
            [fn('SUM', col('total_amount')), 'total']
        ],
        group: ['status'],
        raw: true
    });

    // ── CONSULTA 3: Tendencia mensual (últimos 6 meses) ───────────────────────
    // Esta consulta usa DATE_FORMAT (MySQL nativo), se implementa con sequelize.query()
    // ya que fn() no tiene una forma limpia para DATE_FORMAT con parámetro de formato.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyTrend] = await sequelize.query(`
        SELECT
            TO_CHAR(created_at, 'YYYY-MM')  AS month,
            COUNT(id)                        AS count,
            SUM(total_amount)               AS total
        FROM quotes
        WHERE created_at >= :sixMonthsAgo
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY month ASC
    `, {
        replacements: { sixMonthsAgo },
        type: sequelize.QueryTypes.SELECT
    });

    // ── CONSULTA 4: Últimas 5 cotizaciones recientes ──────────────────────────
    const recentQuotes = await Quote.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 5
    });

    res.status(200).json({
        success: true,
        data: {
            totals: {
                quotes: parseInt(globalTotals.totalQuotes) || 0,
                revenue: parseFloat(globalTotals.totalRevenue) || 0,
                avgValue: parseFloat(globalTotals.avgQuoteValue) || 0
            },
            byStatus,
            monthlyTrend,
            recentQuotes
        }
    });
});

// ====================================
// HELPER: HTML para email de cotización
// ====================================
function buildQuoteEmailHtml(quoteNumber, clientName, quote) {
    const itemsRows = (quote?.items || []).map(item => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Bs. ${Number(item.price).toFixed(2)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">Bs. ${Number(item.subtotal).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;color:#333;padding:20px">
            <div style="max-width:600px;margin:0 auto">
                <div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;border-radius:10px 10px 0 0;text-align:center">
                    <h1>📋 Cotización ${quoteNumber}</h1>
                </div>
                <div style="background:#f9f9f9;padding:30px">
                    <p>Hola <strong>${clientName}</strong>,</p>
                    <p>Tu cotización ha sido generada exitosamente y está lista para revisión.</p>
                    <table style="width:100%;border-collapse:collapse;margin:20px 0">
                        <thead>
                            <tr style="background:#667eea;color:white">
                                <th style="padding:10px;text-align:left">Producto</th>
                                <th style="padding:10px;text-align:center">Cant.</th>
                                <th style="padding:10px;text-align:right">Precio</th>
                                <th style="padding:10px;text-align:right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>${itemsRows}</tbody>
                        <tfoot>
                            <tr style="background:#f0f0f0;font-weight:bold">
                                <td colspan="3" style="padding:10px;text-align:right">TOTAL:</td>
                                <td style="padding:10px;text-align:right">Bs. ${Number(quote?.totalAmount || 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <p style="color:#666;font-size:13px">⏰ Esta cotización es válida por 30 días.</p>
                    <p>Nos pondremos en contacto contigo a la brevedad para coordinar los detalles.</p>
                    <p>Equipo Business Kyla SRL</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
