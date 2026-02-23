const FeaturedImage = require('../models/FeaturedImage');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener imágenes activas (público)
 * @route   GET /api/featured-images
 * @access  Public
 */
exports.getActiveImages = asyncHandler(async (req, res) => {
    const images = await FeaturedImage.getActive();

    res.status(200).json({
        success: true,
        count: images.length,
        data: images
    });
});

/**
 * @desc    Obtener todas las imágenes (admin)
 * @route   GET /api/featured-images/all
 * @access  Private/Admin
 */
exports.getAllImages = asyncHandler(async (req, res) => {
    const images = await FeaturedImage.getAll();

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
    const image = await FeaturedImage.findById(req.params.id);

    if (!image) {
        return res.status(404).json({
            success: false,
            message: 'Imagen no encontrada'
        });
    }

    res.status(200).json({
        success: true,
        data: image
    });
});

/**
 * @desc    Crear nueva imagen destacada
 * @route   POST /api/featured-images
 * @access  Private/Admin
 */
exports.createImage = asyncHandler(async (req, res) => {
    // Validar que se subió una imagen
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Por favor sube una imagen'
        });
    }

    // Obtener path relativo de la imagen
    const imagePath = `hero/${req.file.filename}`;

    // Crear documento
    const image = await FeaturedImage.create({
        image: imagePath,
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
    let image = await FeaturedImage.findById(req.params.id);

    if (!image) {
        return res.status(404).json({
            success: false,
            message: 'Imagen no encontrada'
        });
    }

    // Solo actualizar orden e isActive (no la imagen en sí)
    const updateData = {};

    if (req.body.order !== undefined) {
        updateData.order = req.body.order;
    }

    if (req.body.isActive !== undefined) {
        updateData.isActive = req.body.isActive;
    }

    image = await FeaturedImage.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

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
    const image = await FeaturedImage.findById(req.params.id);

    if (!image) {
        return res.status(404).json({
            success: false,
            message: 'Imagen no encontrada'
        });
    }

    // Eliminar archivo físico
    const imagePath = path.join(__dirname, '../../uploads', image.image);

    if (fs.existsSync(imagePath)) {
        try {
            fs.unlinkSync(imagePath);
        } catch (error) {
            console.error('Error al eliminar archivo físico:', error);
            // Continuar con la eliminación del documento aunque falle el archivo
        }
    }

    // Eliminar documento de la base de datos
    await image.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
    });
});
