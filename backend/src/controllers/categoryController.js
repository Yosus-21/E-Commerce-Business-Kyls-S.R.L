const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Obtener todas las categorías activas
 * @route   GET /api/categories
 * @access  Public
 */
exports.getCategories = asyncHandler(async (req, res, next) => {
    // Buscar todas las categorías activas
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    // Contar productos por categoría
    const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
            const productCount = await Product.countDocuments({
                category: category._id,
                isActive: true
            });

            return {
                ...category.toObject(),
                productCount
            };
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
    const category = await Category.findOne({
        slug: req.params.slug,
        isActive: true
    });

    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Categoría no encontrada'
        });
    }

    // Contar productos de esta categoría
    const productCount = await Product.countDocuments({
        category: category._id,
        isActive: true
    });

    res.status(200).json({
        success: true,
        data: {
            ...category.toObject(),
            productCount
        }
    });
});

/**
 * @desc    Crear nueva categoría
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    // Crear categoría
    const category = await Category.create({
        name,
        description
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
    const { name, description } = req.body;

    // Buscar categoría
    let category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Categoría no encontrada'
        });
    }

    // Actualizar campos
    if (name) category.name = name;
    if (description !== undefined) category.description = description;

    // Guardar cambios
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
    // Buscar categoría
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(404).json({
            success: false,
            error: 'Categoría no encontrada'
        });
    }

    // Verificar que no tenga productos asociados
    const productCount = await Product.countDocuments({
        category: req.params.id
    });

    if (productCount > 0) {
        return res.status(400).json({
            success: false,
            error: `No se puede eliminar, tiene ${productCount} producto(s) asociado(s)`
        });
    }

    // Soft delete - marcar como inactiva
    category.isActive = false;
    await category.save();

    res.status(200).json({
        success: true,
        message: 'Categoría eliminada exitosamente'
    });
});
