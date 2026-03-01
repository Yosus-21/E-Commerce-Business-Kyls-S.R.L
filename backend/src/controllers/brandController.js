const { Op } = require('sequelize');
const { Brand, Product } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todas las marcas activas
 * @route   GET /api/brands
 * @access  Public
 */
exports.getAllBrands = asyncHandler(async (req, res, next) => {
    const brands = await Brand.findAll({
        where: { isActive: true },
        order: [['name', 'ASC']]
    });

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
    const param = req.params.id;

    // En MySQL los IDs son enteros, no ObjectIds hexadecimales.
    // Si el parámetro es numérico → buscar por PK; si no → buscar por slug.
    if (!isNaN(param)) {
        brand = await Brand.findByPk(param);
    } else {
        brand = await Brand.findOne({ where: { slug: param, isActive: true } });
    }

    if (!brand) {
        return res.status(404).json({ success: false, message: 'Marca no encontrada' });
    }

    res.status(200).json({ success: true, data: brand });
});

/**
 * @desc    Crear nueva marca
 * @route   POST /api/brands
 * @access  Private/Admin
 */
exports.createBrand = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'La imagen de la marca es requerida' });
    }

    const brand = await Brand.create({
        name,
        description,
        logo: req.file.url   // ← ruta normalizada por addNormalizedUrl middleware
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

    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
        return res.status(404).json({ success: false, message: 'Marca no encontrada' });
    }

    // Gestionar imagen: eliminar la anterior si se sube una nueva
    if (req.file) {
        if (brand.logo) await deleteFile(brand.logo);
        brand.logo = req.file.url;   // ← ruta normalizada
    }

    if (name !== undefined) brand.name = name;
    if (description !== undefined) brand.description = description;

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
    const brand = await Brand.findByPk(req.params.id);

    if (!brand) {
        return res.status(404).json({ success: false, message: 'Marca no encontrada' });
    }

    // Verificar productos activos asociados
    const productCount = await Product.count({ where: { brandId: req.params.id, isActive: true } });

    if (productCount > 0) {
        return res.status(400).json({
            success: false,
            message: `No se puede eliminar, tiene ${productCount} producto(s) asociado(s)`
        });
    }

    brand.isActive = false;
    await brand.save();

    res.status(200).json({ success: true, message: 'Marca eliminada exitosamente' });
});
