const Partner = require('../models/Partner');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener todos los aliados activos (público)
 * @route   GET /api/partners
 * @access  Public
 */
exports.getActivePartners = asyncHandler(async (req, res) => {
    const partners = await Partner.getActive();

    res.status(200).json({
        success: true,
        count: partners.length,
        data: partners
    });
});

/**
 * @desc    Obtener todos los aliados (admin)
 * @route   GET /api/partners/all
 * @access  Private/Admin
 */
exports.getAllPartners = asyncHandler(async (req, res) => {
    const partners = await Partner.find().sort({ order: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        count: partners.length,
        data: partners
    });
});

/**
 * @desc    Crear nuevo aliado
 * @route   POST /api/partners
 * @access  Private/Admin
 */
exports.createPartner = asyncHandler(async (req, res) => {
    // Verificar que se subió un archivo
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Por favor sube un logo'
        });
    }

    const { name, order } = req.body;

    // Construir path del logo
    const logoPath = `partners/${req.file.filename}`;

    // Crear aliado
    const partner = await Partner.create({
        name,
        logo: logoPath,
        order: order || 0,
        isActive: true
    });

    res.status(201).json({
        success: true,
        data: partner,
        message: 'Aliado creado exitosamente'
    });
});

/**
 * @desc    Actualizar aliado
 * @route   PUT /api/partners/:id
 * @access  Private/Admin
 */
exports.updatePartner = asyncHandler(async (req, res) => {
    let partner = await Partner.findById(req.params.id);

    if (!partner) {
        return res.status(404).json({
            success: false,
            message: 'Aliado no encontrado'
        });
    }

    const { name, order, isActive } = req.body;

    // Actualizar campos
    partner.name = name || partner.name;
    partner.order = order !== undefined ? order : partner.order;
    partner.isActive = isActive !== undefined ? isActive : partner.isActive;

    await partner.save();

    res.status(200).json({
        success: true,
        data: partner,
        message: 'Aliado actualizado exitosamente'
    });
});

/**
 * @desc    Eliminar aliado
 * @route   DELETE /api/partners/:id
 * @access  Private/Admin
 */
exports.deletePartner = asyncHandler(async (req, res) => {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
        return res.status(404).json({
            success: false,
            message: 'Aliado no encontrado'
        });
    }

    // Eliminar archivo del sistema si existe
    const logoFullPath = path.join(__dirname, '../../uploads', partner.logo);
    if (fs.existsSync(logoFullPath)) {
        try {
            fs.unlinkSync(logoFullPath);
        } catch (error) {
            console.error('Error al eliminar archivo de logo:', error);
        }
    }

    // Eliminar de la base de datos
    await partner.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Aliado eliminado exitosamente'
    });
});
