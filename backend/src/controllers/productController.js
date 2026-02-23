const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todos los productos con filtros y paginación
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res) => {
    // Extraer parámetros de query
    const {
        page = 1,
        limit = 12,
        category,
        brand,
        search,
        minPrice,
        maxPrice,
        sort = 'createdAt',
        isFeatured
    } = req.query;

    // ====================================
    // CONSTRUIR FILTROS DINÁMICAMENTE
    // ====================================
    const filters = { isActive: true }; // Siempre mostrar solo productos activos

    // Filtrar por categoría
    if (category) {
        filters.category = category;
    }

    // Búsqueda por nombre (regex case-insensitive)
    if (search) {
        filters.name = { $regex: search, $options: 'i' };
    }

    // Filtrar por rango de precio
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    // Filtrar por marca
    if (brand) {
        filters.brand = brand;
    }

    // Filtrar por destacados
    if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
    }

    // ====================================
    // CONFIGURAR ORDENAMIENTO
    // ====================================
    let sortBy = {};

    switch (sort) {
        case 'price':
            sortBy = { price: 1 }; // Precio ascendente
            break;
        case '-price':
            sortBy = { price: -1 }; // Precio descendente
            break;
        case 'createdAt':
            sortBy = { createdAt: 1 }; // Más antiguos primero
            break;
        case '-createdAt':
            sortBy = { createdAt: -1 }; // Más recientes primero
            break;
        case 'featured':
            sortBy = { isFeatured: -1, createdAt: -1 }; // Destacados primero, luego recientes
            break;
        default:
            sortBy = { createdAt: -1 }; // Default: más recientes primero
    }

    // ====================================
    // PAGINACIÓN
    // ====================================
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // ====================================
    // EJECUTAR QUERY
    // ====================================
    const products = await Product.find(filters)
        .populate('category', 'name slug')
        .populate('brand', 'name slug image')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum);

    // Contar total de productos que coinciden con los filtros
    const total = await Product.countDocuments(filters);

    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const currentPage = pageNum;
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
        success: true,
        data: {
            products,
            pagination: {
                currentPage,
                totalPages,
                totalProducts: total,
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
    const { id } = req.params;

    // Buscar producto y popular categoría
    const product = await Product.findById(id).populate('category', 'name slug');

    // Validar existencia y estado activo
    if (!product || !product.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    // Incrementar contador de vistas
    product.views += 1;
    await product.save();

    // Buscar productos relacionados (misma categoría, máximo 4)
    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id }, // Excluir el producto actual
        isActive: true
    })
        .limit(4)
        .select('name price images slug');

    res.status(200).json({
        success: true,
        data: {
            product,
            relatedProducts
        }
    });
});

/**
 * @desc    Crear nuevo producto
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        longDescription,
        price,
        category,
        brand,
        stock,
        isFeatured,
        discountPercentage,
        specifications
    } = req.body;

    // ====================================
    // PROCESAR SPECIFICATIONS (JSON string)
    // ====================================
    let specs = {};
    if (req.body.specifications) {
        try {
            specs = JSON.parse(req.body.specifications);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'El formato de specifications es inválido. Debe ser un JSON válido.'
            });
        }
    }

    // ====================================
    // PROCESAR IMÁGENES
    // ====================================
    const images = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            images.push(`/uploads/products/${file.filename}`);
        });
    }

    // ====================================
    // VALIDAR QUE LA CATEGORÍA EXISTE
    // ====================================
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        return res.status(404).json({
            success: false,
            message: 'Categoría no encontrada'
        });
    }

    // ====================================
    // CREAR PRODUCTO
    // ====================================    // Crear producto
    const product = await Product.create({
        name,
        description,
        longDescription: longDescription || undefined,
        price,
        category,
        brand: brand || undefined,  // Solo incluir si existe
        stock,
        images: images,
        specifications: specs,
        isFeatured: isFeatured === 'true' || isFeatured === true || false,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage) : 0
    });

    // Popular categoría antes de retornar
    await product.populate('category', 'name slug');

    res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
    });
});

/**
 * @desc    Actualizar producto
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar producto
    let product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    // ====================================
    // ACTUALIZAR CampOS
    // ====================================
    // Los datos ya vienen parseados y validados desde el middleware parseProductData

    // Actualizar campos básicos
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.longDescription !== undefined) product.longDescription = req.body.longDescription;
    if (req.body.price !== undefined) product.price = req.body.price;
    if (req.body.stock !== undefined) product.stock = req.body.stock;

    // Validar categoría si se actualiza
    if (req.body.category) {
        const categoryExists = await Category.findById(req.body.category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'La categoría especificada no existe'
            });
        }
        product.category = req.body.category;
    }

    // Actualizar marca (opcional)
    if (req.body.brand) {
        const Brand = require('../models/Brand');
        const brandExists = await Brand.findById(req.body.brand);
        if (!brandExists) {
            return res.status(404).json({
                success: false,
                message: 'La marca especificada no existe'
            });
        }
        product.brand = req.body.brand;
    }

    // Actualizar isFeatured (ya viene como booleano desde middleware)
    if (req.body.isFeatured !== undefined) {
        product.isFeatured = req.body.isFeatured;
    }

    // Actualizar descuento (ya viene como number desde middleware)
    if (req.body.discountPercentage !== undefined) {
        product.discountPercentage = req.body.discountPercentage;
    }

    // Actualizar specifications
    if (req.body.specifications) {
        try {
            product.specifications = JSON.parse(req.body.specifications);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'El formato de specifications es inválido. Debe ser un JSON válido.'
            });
        }
    }

    // ====================================
    // ACTUALIZAR IMÁGENES SI HAY NUEVAS
    // ====================================
    if (req.files && req.files.length > 0) {
        // Eliminar imágenes antiguas del filesystem
        if (product.images && product.images.length > 0) {
            for (const imagePath of product.images) {
                await deleteFile(imagePath);
            }
        }

        // Agregar nuevas imágenes
        const newImages = [];
        req.files.forEach((file) => {
            newImages.push(`/uploads/products/${file.filename}`);
        });
        product.images = newImages;
    }

    // Guardar cambios
    await product.save();

    // Popular categoría antes de retornar
    await product.populate('category', 'name slug');

    res.status(200).json({
        success: true,
        data: product,
        message: 'Producto actualizado exitosamente'
    });
});

/**
 * @desc    Eliminar producto (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar producto
    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Producto no encontrado'
        });
    }

    // Soft delete: marcar como inactivo
    product.isActive = false;
    await product.save();

    res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
    });
});
