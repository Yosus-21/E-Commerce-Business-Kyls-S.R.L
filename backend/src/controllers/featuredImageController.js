const { FeaturedImage } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener imágenes activas (público)
 * @route   GET /api/featured-images
 * @access  Public
 */
exports.getActiveImages = asyncHandler(async (req, res) => {
    // Reemplaza el método estático FeaturedImage.getActive() de Mongoose
    const images = await FeaturedImage.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: images.length,
        data: images
    });
});

/**
 * @desc    Obtener todas las imágenes (Admin)
 * @route   GET /api/featured-images/all
 * @access  Private/Admin
 */
exports.getAllImages = asyncHandler(async (req, res) => {
    // Reemplaza FeaturedImage.getAll() de Mongoose
    const images = await FeaturedImage.findAll({
        order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: images.length,
        data: images
    });
});

/**
 * @desc    Obtener imagen por ID
 * @route   GET /api/featured-images/:id
 * @access  Private/Admin
 */
exports.getImageById = asyncHandler(async (req, res) => {
    // findById(id) → findByPk(id)
    const image = await FeaturedImage.findByPk(req.params.id);

    if (!image) {
        return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    res.status(200).json({ success: true, data: image });
});

/**
 * @desc    Crear nueva imagen destacada
 * @route   POST /api/featured-images
 * @access  Private/Admin
 */
exports.createImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Por favor sube una imagen' });
    }

    const image = await FeaturedImage.create({
        title: req.body.title || null,
        subtitle: req.body.subtitle || null,
        imageUrl: req.file.url,     // ← ruta normalizada
        linkUrl: req.body.linkUrl || null,
        order: req.body.order || 0,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    res.status(201).json({
        success: true,
        message: 'Imagen destacada creada exitosamente',
        data: image
    });
});

/**
 * @desc    Actualizar imagen destacada (orden o estado)
 * @route   PUT /api/featured-images/:id
 * @access  Private/Admin
 */
exports.updateImage = asyncHandler(async (req, res) => {
    // findByIdAndUpdate() se reemplaza por findByPk() + asignación + save()
    const image = await FeaturedImage.findByPk(req.params.id);

    if (!image) {
        return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    if (req.body.order !== undefined) image.order = req.body.order;
    if (req.body.isActive !== undefined) image.isActive = req.body.isActive;
    if (req.body.title !== undefined) image.title = req.body.title;
    if (req.body.subtitle !== undefined) image.subtitle = req.body.subtitle;
    if (req.body.linkUrl !== undefined) image.linkUrl = req.body.linkUrl;

    // Si se sube nueva imagen, reemplazar el archivo anterior
    if (req.file) {
        if (image.imageUrl) {
            const oldPath = path.join(process.cwd(), image.imageUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        image.imageUrl = req.file.url;   // ← ruta normalizada
    }

    await image.save();

    res.status(200).json({
        success: true,
        message: 'Imagen actualizada exitosamente',
        data: image
    });
});

/**
 * @desc    Eliminar imagen destacada
 * @route   DELETE /api/featured-images/:id
 * @access  Private/Admin
 */
exports.deleteImage = asyncHandler(async (req, res) => {
    const image = await FeaturedImage.findByPk(req.params.id);

    if (!image) {
        return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }

    // Eliminar archivo físico del disco
    if (image.imageUrl) {
        const absPath = path.join(process.cwd(), image.imageUrl);
        if (fs.existsSync(absPath)) {
            try { fs.unlinkSync(absPath); }
            catch (err) { console.error('Error al eliminar archivo físico:', err.message); }
        }
    }

    // image.deleteOne() → image.destroy()
    await image.destroy();

    res.status(200).json({ success: true, message: 'Imagen eliminada exitosamente' });
});
