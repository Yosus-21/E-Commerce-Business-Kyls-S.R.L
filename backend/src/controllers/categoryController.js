const { Op } = require('sequelize');
const { Category, Product } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Obtener todas las categorías activas con conteo de productos
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']],
        // Incluir subcategorías (auto-referencia parentId)
        include: [
            {
                model: Category,
                as: 'children',
                where: { isActive: true },
                required: false,
                attributes: ['id', 'name', 'slug']
            }
        ]
    });

    // Contar productos activos por categoría
    // Product.count() con where equivale a countDocuments() de Mongoose
    const categoriesWithCount = await Promise.all(
        categories.map(async (cat) => {
            const productCount = await Product.count({
                where: { categoryId: cat.id, isActive: true }
            });
            return { ...cat.toJSON(), productCount };
        })
    );

    res.status(200).json({
        success: true,
        count: categoriesWithCount.length,
        data: categoriesWithCount
    });
});

/**
 * @desc    Obtener una categoría por slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
exports.getCategory = asyncHandler(async (req, res, next) => {
    const identifier = req.params.slug;
    const whereClause = !isNaN(identifier)
        ? { id: identifier, isActive: true }
        : { slug: identifier, isActive: true };

    const category = await Category.findOne({
        where: whereClause,
        include: [
            {
                model: Category,
                as: 'parent',
                attributes: ['id', 'name', 'slug'],
                required: false
            },
            {
                model: Category,
                as: 'children',
                where: { isActive: true },
                required: false,
                attributes: ['id', 'name', 'slug']
            }
        ]
    });

    if (!category) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    }

    const productCount = await Product.count({
        where: { categoryId: category.id, isActive: true }
    });

    res.status(200).json({
        success: true,
        data: { ...category.toJSON(), productCount }
    });
});

/**
 * @desc    Crear nueva categoría
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
    const { name, description, parentId } = req.body;

    const category = await Category.create({
        name,
        description,
        parentId: parentId || null
    });

    res.status(201).json({
        success: true,
        data: category,
        message: 'Categoría creada exitosamente'
    });
});

/**
 * @desc    Actualizar categoría
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res, next) => {
    const { name, description, parentId, isActive } = req.body;

    // findByPk equivale a findById() de Mongoose
    const category = await Category.findByPk(req.params.id);

    if (!category) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    }

    // Evitar que una categoría se establezca como su propio padre (auto-referencia)
    if (parentId && parseInt(parentId) === category.id) {
        return res.status(400).json({
            success: false,
            error: 'Una categoría no puede ser su propio padre'
        });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
        success: true,
        data: category,
        message: 'Categoría actualizada exitosamente'
    });
});

/**
 * @desc    Eliminar categoría (soft delete)
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
        return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
    }

    // Verificar que no tenga productos activos asociados
    const productCount = await Product.count({
        where: { categoryId: req.params.id, isActive: true }
    });

    if (productCount > 0) {
        return res.status(400).json({
            success: false,
            error: `No se puede eliminar, tiene ${productCount} producto(s) asociado(s)`
        });
    }

    // Soft delete: marcar como inactiva
    category.isActive = false;
    await category.save();

    res.status(200).json({ success: true, message: 'Categoría eliminada exitosamente' });
});
