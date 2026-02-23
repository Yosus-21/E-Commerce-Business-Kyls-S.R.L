const Brand = require('../models/Brand');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todas las marcas
 * @route   GET /api/brands
 * @access  Public
 */
exports.getAllBrands = asyncHandler(async (req, res, next) => {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: brands.length,
        data: brands
    });
});

/**
 * @desc    Obtener una marca por ID o slug
 * @route   GET /api/brands/:id
 * @access  Public
 */
exports.getBrand = asyncHandler(async (req, res, next) => {
    let brand;

    // Intentar buscar por ID primero, luego por slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        brand = await Brand.findById(req.params.id);
    } else {
        brand = await Brand.findOne({ slug: req.params.id, isActive: true });
    }

    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Marca no encontrada'
        });
    }

    res.status(200).json({
        success: true,
        data: brand
    });
});

/**
 * @desc    Crear nueva marca
 * @route   POST /api/brands
 * @access  Private/Admin
 */
exports.createBrand = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    // Validar que se haya subido una imagen
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'La imagen de la marca es requerida'
        });
    }

    // Crear marca
    const brand = await Brand.create({
        name,
        description,
        image: `/uploads/brands/${req.file.filename}`
    });

    res.status(201).json({
        success: true,
        data: brand,
        message: 'Marca creada exitosamente'
    });
});

/**
 * @desc    Actualizar marca
 * @route   PUT /api/brands/:id
 * @access  Private/Admin
 */
exports.updateBrand = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    // Buscar marca
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Marca no encontrada'
        });
    }

    // Si hay nueva imagen, eliminar la anterior
    if (req.file) {
        // Eliminar imagen anterior si existe
        if (brand.image) {
            await deleteFile(brand.image);
        }
        // Actualizar con nueva imagen
        brand.image = `/uploads/brands/${req.file.filename}`;
    }

    // Actualizar campos
    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;

    // Guardar cambios
    await brand.save();

    res.status(200).json({
        success: true,
        data: brand,
        message: 'Marca actualizada exitosamente'
    });
});

/**
 * @desc    Eliminar marca (soft delete)
 * @route   DELETE /api/brands/:id
 * @access  Private/Admin
 */
exports.deleteBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
        return res.status(404).json({
            success: false,
            message: 'Marca no encontrada'
        });
    }

    // Verificar si tiene productos asociados
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({
        brand: req.params.id
    });

    if (productCount > 0) {
        return res.status(400).json({
            success: false,
            message: `No se puede eliminar, tiene ${productCount} producto(s) asociado(s)`
        });
    }

    // Soft delete - marcar como inactiva
    brand.isActive = false;
    await brand.save();

    res.status(200).json({
        success: true,
        message: 'Marca eliminada exitosamente'
    });
});
