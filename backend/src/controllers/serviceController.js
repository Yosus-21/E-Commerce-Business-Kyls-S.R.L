const { Service } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile } = require('../utils/fileHelper');

/**
 * @desc    Obtener todos los servicios
 * @route   GET /api/services
 * @access  Public
 */
exports.getAllServices = asyncHandler(async (req, res, next) => {
    const { isActive } = req.query;

    // Construir cláusula WHERE: por defecto solo activos
    const where = {
        isActive: isActive !== undefined ? isActive === 'true' : true
    };

    const services = await Service.findAll({
        where,
        order: [['createdAt', 'DESC']]
    });

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
    const param = req.params.id;

    // ID numérico → findByPk; cualquier otro valor → buscar por slug
    if (!isNaN(param)) {
        service = await Service.findByPk(param);
    } else {
        service = await Service.findOne({ where: { slug: param, isActive: true } });
    }

    if (!service) {
        return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Incrementar vistas
    service.views += 1;
    await service.save();

    res.status(200).json({ success: true, data: service });
});

/**
 * @desc    Crear nuevo servicio
 * @route   POST /api/services
 * @access  Private/Admin
 */
exports.createService = asyncHandler(async (req, res, next) => {
    const { title, description, longDescription, price, features } = req.body;

    const serviceData = { title, description, longDescription, price };

    // Imagen subida con Multer
    if (req.file) {
        serviceData.image = req.file.url;   // ← ruta normalizada
    }

    // features es DataTypes.JSON en el modelo.
    // Puede llegar como string JSON (desde FormData) o como array (desde JSON body).
    if (features !== undefined) {
        try {
            serviceData.features = typeof features === 'string'
                ? JSON.parse(features)
                : features;
        } catch {
            return res.status(400).json({ success: false, message: 'Formato de características inválido' });
        }
    }

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

    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    // Gestionar imagen
    if (req.file) {
        if (service.image) await deleteFile(service.image);
        service.image = req.file.url;   // ← ruta normalizada
    }

    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (longDescription !== undefined) service.longDescription = longDescription;
    if (price !== undefined) service.price = price;

    // features: DataTypes.JSON acepta array directamente
    if (features !== undefined) {
        try {
            service.features = typeof features === 'string'
                ? JSON.parse(features)
                : features;
        } catch {
            return res.status(400).json({ success: false, message: 'Formato de características inválido' });
        }
    }

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
    const service = await Service.findByPk(req.params.id);

    if (!service) {
        return res.status(404).json({ success: false, message: 'Servicio no encontrado' });
    }

    service.isActive = false;
    await service.save();

    res.status(200).json({ success: true, message: 'Servicio eliminado exitosamente' });
});
