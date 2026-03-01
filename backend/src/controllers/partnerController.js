const { Partner } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener todos los aliados activos (público)
 * @route   GET /api/partners
 * @access  Public
 */
exports.getActivePartners = asyncHandler(async (req, res) => {
    // Reemplaza Partner.getActive() (método estático de Mongoose)
    const partners = await Partner.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: partners.length,
        data: partners
    });
});

/**
 * @desc    Obtener todos los aliados (Admin)
 * @route   GET /api/partners/all
 * @access  Private/Admin
 */
exports.getAllPartners = asyncHandler(async (req, res) => {
    // Partner.find().sort({ order: 1, createdAt: -1 }) → findAll con order
    const partners = await Partner.findAll({
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

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
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Por favor sube un logo' });
    }

    const { name, website, order } = req.body;

    const partner = await Partner.create({
        name,
        logo: req.file.url,   // ← ruta normalizada
        website: website || null,
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
    // findById() → findByPk()
    const partner = await Partner.findByPk(req.params.id);

    if (!partner) {
        return res.status(404).json({ success: false, message: 'Aliado no encontrado' });
    }

    const { name, website, order, isActive } = req.body;

    if (name !== undefined) partner.name = name;
    if (website !== undefined) partner.website = website;
    if (order !== undefined) partner.order = order;
    if (isActive !== undefined) partner.isActive = isActive;

    // Actualizar logo si se sube uno nuevo
    if (req.file) {
        if (partner.logo) {
            const oldPath = path.join(process.cwd(), partner.logo);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); }
                catch (err) { console.error('Error al eliminar logo anterior:', err.message); }
            }
        }
        partner.logo = req.file.url;   // ← ruta normalizada
    }

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
    // findById() → findByPk()
    const partner = await Partner.findByPk(req.params.id);

    if (!partner) {
        return res.status(404).json({ success: false, message: 'Aliado no encontrado' });
    }

    // Eliminar archivo de logo del disco
    if (partner.logo) {
        const absPath = path.join(process.cwd(), partner.logo);
        if (fs.existsSync(absPath)) {
            try { fs.unlinkSync(absPath); }
            catch (err) { console.error('Error al eliminar archivo de logo:', err.message); }
        }
    }

    // partner.deleteOne() → partner.destroy()
    await partner.destroy();

    res.status(200).json({ success: true, message: 'Aliado eliminado exitosamente' });
});
