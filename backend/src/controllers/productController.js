const { Op } = require('sequelize');
const { Product, Category, Brand } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todos los productos con filtros y paginación
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 12,
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        sort = '-createdAt',
        isFeatured
    } = req.query;

    // ====================================
    // CONSTRUIR CLÁUSULA WHERE DINÁMICA
    // ====================================
    const where = { isActive: true };

    // Filtrar por categoría (FK numérico)
    if (category) where.categoryId = category;

    // Filtrar por marca (FK numérico)
    if (brand) where.brandId = brand;

    // Búsqueda por nombre (Op.like = equivalente a $regex case-insensitive)
    if (search) where.name = { [Op.like]: `%${search}%` };

    // Filtrar por rango de precio
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = Number(minPrice);
        if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // Filtrar por destacados
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

    // ====================================
    // ORDENAMIENTO
    // Sequelize usa arrays: [campo, 'ASC'|'DESC']
    // ====================================
    const orderMap = {
        'price': [['price', 'ASC']],
        '-price': [['price', 'DESC']],
        'createdAt': [['createdAt', 'ASC']],
        '-createdAt': [['createdAt', 'DESC']],
        'featured': [['isFeatured', 'DESC'], ['createdAt', 'DESC']]
    };
    const order = orderMap[sort] || [['createdAt', 'DESC']];

    // ====================================
    // PAGINACIÓN
    // ====================================
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // ====================================
    // EJECUTAR QUERY CON JOINS (include)
    // Equivalente al .populate() de Mongoose
    // ====================================
    const { count, rows: products } = await Product.findAndCountAll({
        where,
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug']
            },
            {
                model: Brand,
                as: 'brand',
                attributes: ['id', 'name', 'slug', 'logo'],
                required: false   // LEFT JOIN: producto sin marca no se descarta
            }
        ],
        order,
        limit: limitNum,
        offset,
        distinct: true   // Necesario para que count sea correcto con includes
    });

    const totalPages = Math.ceil(count / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts: count,
                limit: limitNum,
                hasNextPage,
                hasPrevPage
            }
        }
    });
});

/**
 * @desc    Obtener producto por ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id, {
        include: [
            { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'logo'], required: false }
        ]
    });

    if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Incrementar contador de vistas
    product.views += 1;
    await product.save();

    // Buscar productos relacionados (misma categoría, excluyendo el actual, máx 4)
    const relatedProducts = await Product.findAll({
        where: {
            categoryId: product.categoryId,
            id: { [Op.ne]: product.id },   // Op.ne equivale a $ne de Mongoose
            isActive: true
        },
        attributes: ['id', 'name', 'price', 'images', 'slug'],
        limit: 4
    });

    res.status(200).json({
        success: true,
        data: { product, relatedProducts }
    });
});

/**
 * @desc    Crear nuevo producto
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res) => {
    const {
        name, description, longDescription,
        price, stock, isFeatured, discountPercentage, specifications
    } = req.body;

    // ✅ Aceptar tanto 'category'/'brand' como 'categoryId'/'brandId'
    // El frontend puede enviar cualquiera de las dos formas
    const categoryId = req.body.categoryId || req.body.category;
    const brandId = req.body.brandId || req.body.brand || null;

    // Validar que llegó la categoría
    if (!categoryId) {
        return res.status(400).json({
            success: false,
            message: 'La categoría es obligatoria (envía categoryId o category)'
        });
    }

    // Parsear specifications si viene como string JSON
    let specs = {};
    if (req.body.specifications) {
        try {
            specs = typeof specifications === 'string'
                ? JSON.parse(specifications)
                : specifications;
        } catch {
            return res.status(400).json({
                success: false,
                message: 'El formato de specifications es inválido. Debe ser un JSON válido.'
            });
        }
    }

    // Procesar imágenes subidas con Multer
    const images = req.files && req.files.length > 0
        ? req.files.map(f => f.url)   // ← ruta normalizada por addNormalizedUrl
        : [];

    // Validar que la categoría existe
    const categoryExists = await Category.findByPk(categoryId);
    if (!categoryExists) {
        return res.status(404).json({ success: false, message: `Categoría con id ${categoryId} no encontrada` });
    }

    // Validar marca si se envió
    if (brandId) {
        const brandExists = await Brand.findByPk(brandId);
        if (!brandExists) {
            return res.status(404).json({ success: false, message: `Marca con id ${brandId} no encontrada` });
        }
    }

    const product = await Product.create({
        name,
        description,
        longDescription: longDescription || null,
        price,
        categoryId,
        brandId: brandId || null,
        stock,
        images,
        specifications: specs,
        isFeatured: isFeatured === 'true' || isFeatured === true || false,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0
    });

    // Recargar con asociaciones para la respuesta
    const created = await Product.findByPk(product.id, {
        include: [
            { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug'], required: false }
        ]
    });

    res.status(201).json({
        success: true,
        data: created,
        message: 'Producto creado exitosamente'
    });
});

/**
 * @desc    Actualizar producto
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Actualizar campos básicos
    if (req.body.name !== undefined) product.name = req.body.name;
    if (req.body.description !== undefined) product.description = req.body.description;
    if (req.body.longDescription !== undefined) product.longDescription = req.body.longDescription;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
    if (req.body.discountPercentage !== undefined) product.discountPercentage = req.body.discountPercentage;

    // Validar y actualizar categoría
    if (req.body.category) {
        const categoryExists = await Category.findByPk(req.body.category);
        if (!categoryExists) {
            return res.status(404).json({ success: false, message: 'La categoría especificada no existe' });
        }
        product.categoryId = req.body.category;
    }

    // Validar y actualizar marca (opcional)
    if (req.body.brand) {
        const brandExists = await Brand.findByPk(req.body.brand);
        if (!brandExists) {
            return res.status(404).json({ success: false, message: 'La marca especificada no existe' });
        }
        product.brandId = req.body.brand;
    }

    // Actualizar specifications si se enviaron
    if (req.body.specifications) {
        try {
            product.specifications = typeof req.body.specifications === 'string'
                ? JSON.parse(req.body.specifications)
                : req.body.specifications;
        } catch {
            return res.status(400).json({
                success: false,
                message: 'El formato de specifications es inválido. Debe ser un JSON válido.'
            });
        }
    }

    // Actualizar imágenes si se subieron nuevas
    if (req.files && req.files.length > 0) {
        // Eliminar imágenes anteriores del disco
        if (product.images && product.images.length > 0) {
            for (const imagePath of product.images) {
                await deleteFile(imagePath);
            }
        }
        product.images = req.files.map(f => f.url);   // ← ruta normalizada
    }

    await product.save();

    // Recargar con asociaciones
    const updated = await Product.findByPk(product.id, {
        include: [
            { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
            { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug'], required: false }
        ]
    });

    res.status(200).json({
        success: true,
        data: updated,
        message: 'Producto actualizado exitosamente'
    });
});

/**
 * @desc    Eliminar producto (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Soft delete: marcar como inactivo (no borra el registro)
    product.isActive = false;
    await product.save();

    res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
});
