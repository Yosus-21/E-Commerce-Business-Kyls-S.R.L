const Quote = require('../models/Quote');
const Cart = require('../models/Cart');
const asyncHandler = require('../utils/asyncHandler');
const { generateQuotePDF } = require('../utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Generar nueva cotización desde el carrito
 * @route   POST /api/quotes
 * @access  Private
 */
exports.generateQuote = asyncHandler(async (req, res) => {
    const { customerData } = req.body;

    // ====================================
    // VALIDAR DATOS DEL CLIENTE
    // ====================================
    if (!customerData || !customerData.name || !customerData.email || !customerData.phone) {
        return res.status(400).json({
            success: false,
            message: 'Datos del cliente incompletos. Se requiere nombre, email y teléfono'
        });
    }

    // ====================================
    // BUSCAR CARRITO CON PRODUCTOS
    // ====================================
    const cart = await Cart.findOne({ user: req.user._id })
        .populate('items.product', 'name price images isActive');

    if (!cart || cart.items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Carrito vacío. Agrega productos antes de generar una cotización'
        });
    }

    // ====================================
    // VALIDAR PRODUCTOS ACTIVOS
    // ====================================
    for (const item of cart.items) {
        const product = item.product;

        if (!product || !product.isActive) {
            return res.status(400).json({
                success: false,
                message: `El producto "${item.product ? item.product.name : 'desconocido'}" ya no está disponible`
            });
        }
    }

    // ====================================
    // GENERAR NÚMERO ÚNICO DE COTIZACIÓN
    // ====================================
    const quoteNumber = await Quote.generateQuoteNumber();

    // ====================================
    // CREAR ARRAY DE ITEMS CON SNAPSHOT
    // ====================================
    const quoteItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        image: item.product.images[0] || null
    }));

    // ====================================
    // CALCULAR TOTAL
    // ====================================
    const totalAmount = cart.totalAmount;

    // ====================================
    // CREAR COTIZACIÓN EN DB
    // ====================================
    const quote = await Quote.create({
        quoteNumber,
        user: req.user._id,
        customerData: {
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            company: customerData.company || null
        },
        items: quoteItems,
        totalAmount,
        status: 'Generada'  // Usar el valor correcto del enum
    });

    // ====================================
    // GENERAR PDF
    // ====================================
    try {
        const pdfPath = await generateQuotePDF(quote);
        quote.pdfPath = pdfPath;
        await quote.save();
    } catch (error) {
        console.error('Error generando PDF:', error);
        // Continuar aunque PDF falle (se puede regenerar después)
    }

    // ====================================
    // RETORNAR PDF AL CLIENTE
    // ====================================
    if (quote.pdfPath && fs.existsSync(quote.pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cotizacion-${quoteNumber}.pdf"`);

        const pdfStream = fs.createReadStream(quote.pdfPath);
        pdfStream.pipe(res);
    } else {
        // Fallback: retornar datos JSON si PDF no se generó
        res.status(201).json({
            success: true,
            data: quote,
            message: 'Cotización creada (PDF no disponible)'
        });
    }
});

/**
 * @desc    Obtener cotizaciones del usuario autenticado
 * @route   GET /api/quotes/user
 * @access  Private
 */
exports.getUserQuotes = asyncHandler(async (req, res) => {
    const quotes = await Quote.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .select('-pdfPath'); // No exponer rutas internas

    res.status(200).json({
        success: true,
        count: quotes.length,
        data: quotes
    });
});

/**
 * @desc    Obtener cotización por ID
 * @route   GET /api/quotes/:id
 * @access  Private
 */
exports.getQuote = asyncHandler(async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({
            success: false,
            message: 'Cotización no encontrada'
        });
    }

    // Verificar que la cotización pertenezca al usuario
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para ver esta cotización'
        });
    }

    res.status(200).json({
        success: true,
        data: quote
    });
});

/**
 * @desc    Descargar PDF de cotización existente
 * @route   GET /api/quotes/:id/pdf
 * @access  Private
 */
exports.getQuotePDF = asyncHandler(async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({
            success: false,
            message: 'Cotización no encontrada'
        });
    }

    // Verificar permisos
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para descargar esta cotización'
        });
    }

    // Verificar si el PDF existe
    if (!quote.pdfPath || !fs.existsSync(quote.pdfPath)) {
        // Regenerar PDF si no existe
        try {
            const pdfPath = await generateQuotePDF(quote);
            quote.pdfPath = pdfPath;
            await quote.save();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al generar PDF'
            });
        }
    }

    // Retornar PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cotizacion-${quote.quoteNumber}.pdf"`);

    const pdfStream = fs.createReadStream(quote.pdfPath);
    pdfStream.pipe(res);
});

/**
 * @desc    Eliminar cotización
 * @route   DELETE /api/quotes/:id
 * @access  Private
 */
exports.deleteQuote = asyncHandler(async (req, res) => {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({
            success: false,
            message: 'Cotización no encontrada'
        });
    }

    // Verificar permisos
    if (quote.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'No tienes permiso para eliminar esta cotización'
        });
    }

    // Eliminar archivo PDF si existe
    if (quote.pdfPath && fs.existsSync(quote.pdfPath)) {
        fs.unlinkSync(quote.pdfPath);
    }

    // Eliminar cotización de DB
    await quote.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Cotización eliminada exitosamente'
    });
});

/**
 * @desc    Obtener todas las cotizaciones con filtros (Admin)
 * @route   GET /api/quotes/admin/all
 * @access  Private/Admin
 */
exports.getAllQuotes = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10, startDate, endDate, search } = req.query;

    // Construir query
    const query = {};

    // Filtro por estado
    if (status) {
        query.status = status;
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Búsqueda por número de cotización o nombre de cliente
    if (search) {
        query.$or = [
            { quoteNumber: new RegExp(search, 'i') },
            { 'customerData.name': new RegExp(search, 'i') },
            { 'customerData.email': new RegExp(search, 'i') }
        ];
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Ejecutar queries
    const [quotes, total] = await Promise.all([
        Quote.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Quote.countDocuments(query)
    ]);

    res.status(200).json({
        success: true,
        data: quotes,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Actualizar estado de cotización (Admin)
 * @route   PATCH /api/quotes/:id/status
 * @access  Private/Admin
 */
exports.updateQuoteStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
        return res.status(404).json({
            success: false,
            message: 'Cotización no encontrada'
        });
    }

    quote.status = status;
    if (notes !== undefined) {
        quote.notes = notes;
    }

    await quote.save();

    res.status(200).json({
        success: true,
        data: quote,
        message: 'Estado actualizado exitosamente'
    });
});

/**
 * @desc    Obtener estadísticas del dashboard (BI)
 * @route   GET /api/quotes/stats/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Estadísticas mensuales
    const monthlyStats = await Quote.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                totalQuotes: { $sum: 1 },
                totalValue: { $sum: '$totalAmount' },
                generatedQuotes: {
                    $sum: { $cond: [{ $eq: ['$status', 'Generada'] }, 1, 0] }
                },
                contactedQuotes: {
                    $sum: { $cond: [{ $eq: ['$status', 'Contactado'] }, 1, 0] }
                },
                closedQuotes: {
                    $sum: { $cond: [{ $eq: ['$status', 'Cerrada'] }, 1, 0] }
                }
            }
        }
    ]);

    // 2. Top 5 Productos más cotizados
    const topProducts = await Quote.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                timesQuoted: { $sum: 1 },
                totalQuantity: { $sum: '$items.quantity' },
                totalValue: { $sum: '$items.subtotal' }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
    ]);

    // 3. Top 5 Clientes más activos
    const topClients = await Quote.aggregate([
        {
            $group: {
                _id: '$user',
                quoteCount: { $sum: 1 },
                totalValue: { $sum: '$totalAmount' },
                lastQuoteDate: { $max: '$createdAt' }
            }
        },
        { $sort: { quoteCount: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },
        {
            $project: {
                _id: 1,
                name: '$userInfo.name',
                email: '$userInfo.email',
                quoteCount: 1,
                totalValue: 1,
                lastQuoteDate: 1
            }
        }
    ]);

    // 4. Distribución por categorías
    const categoryDistribution = await Quote.aggregate([
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$productInfo.category',
                count: { $sum: 1 },
                totalValue: { $sum: '$items.subtotal' }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                name: '$categoryInfo.name',
                count: 1,
                totalValue: 1
            }
        },
        { $sort: { count: -1 } }
    ]);

    // 5. Tendencia de cotizaciones (últimos 30 días)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const quoteTrend = await Quote.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 },
                totalValue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Contar productos únicos cotizados este mes
    const uniqueProductsStats = await Quote.aggregate([
        {
            $match: {
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product'
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            monthly: monthlyStats[0] || {
                totalQuotes: 0,
                totalValue: 0,
                generatedQuotes: 0,
                contactedQuotes: 0,
                closedQuotes: 0
            },
            uniqueProducts: uniqueProductsStats[0]?.count || 0,
            topProducts,
            topClients,
            categoryDistribution,
            quoteTrend
        }
    });
});

