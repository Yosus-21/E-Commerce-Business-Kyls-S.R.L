const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todos los servicios
 * @route   GET /api/services
 * @access  Public
 */
exports.getAllServices = asyncHandler(async (req, res, next) => {
    const { isActive } = req.query;

    // Construir filtros
    const filters = {};
    if (isActive !== undefined) {
        filters.isActive = isActive === 'true';
    } else {
        filters.isActive = true; // Por defecto solo activos
    }

    const services = await Service.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: services.length,
        data: services
    });
});

/**
 * @desc    Obtener un servicio por ID o slug
 * @route   GET /api/services/:id
 * @access  Public
 */
exports.getService = asyncHandler(async (req, res, next) => {
    let service;

    // Intentar buscar por ID primero, luego por slug
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        service = await Service.findById(req.params.id);
    } else {
        service = await Service.findOne({ slug: req.params.id, isActive: true });
    }

    if (!service) {
        return res.status(404).json({
            success: false,
            message: 'Servicio no encontrado'
        });
    }

    // Incrementar contador de vistas
    service.views += 1;
    await service.save();

    res.status(200).json({
        success: true,
        data: service
    });
});

/**
 * @desc    Crear nuevo servicio
 * @route   POST /api/services
 * @access  Private/Admin
 */
exports.createService = asyncHandler(async (req, res, next) => {
    const { title, description, longDescription, price, features } = req.body;

    // Preparar datos del servicio
    const serviceData = {
        title,
        description,
        longDescription,
        price
    };

    // Si se subió una imagen, agregar la ruta
    if (req.file) {
        serviceData.image = `/uploads/services/${req.file.filename}`;
    }

    // Parsear features si viene como string JSON
    if (features) {
        try {
            serviceData.features = typeof features === 'string'
                ? JSON.parse(features)
                : features;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Formato de características inválido'
            });
        }
    }

    // Crear servicio
    const service = await Service.create(serviceData);

    res.status(201).json({
        success: true,
        data: service,
        message: 'Servicio creado exitosamente'
    });
});

/**
 * @desc    Actualizar servicio
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
exports.updateService = asyncHandler(async (req, res, next) => {
    const { title, description, longDescription, price, features } = req.body;

    // Buscar servicio
    let service = await Service.findById(req.params.id);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: 'Servicio no encontrado'
        });
    }

    // Si hay nueva imagen, eliminar la anterior
    if (req.file) {
        // Eliminar imagen anterior si existe
        if (service.image) {
            await deleteFile(service.image);
        }
        // Actualizar con nueva imagen
        service.image = `/uploads/services/${req.file.filename}`;
    }

    // Actualizar campos
    if (title) service.title = title;
    if (description !== undefined) service.description = description;
    if (longDescription !== undefined) service.longDescription = longDescription;
    if (price !== undefined) service.price = price;

    // Actualizar features si se proporcionan
    if (features) {
        try {
            service.features = typeof features === 'string'
                ? JSON.parse(features)
                : features;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Formato de características inválido'
            });
        }
    }

    // Guardar cambios
    await service.save();

    res.status(200).json({
        success: true,
        data: service,
        message: 'Servicio actualizado exitosamente'
    });
});

/**
 * @desc    Eliminar servicio (soft delete)
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
exports.deleteService = asyncHandler(async (req, res, next) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: 'Servicio no encontrado'
        });
    }

    // Soft delete - marcar como inactivo
    service.isActive = false;
    await service.save();

    res.status(200).json({
        success: true,
        message: 'Servicio eliminado exitosamente'
    });
});
