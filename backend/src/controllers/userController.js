const { Op } = require('sequelize');
const { User, UserAddress } = require('../models/index');
const asyncHandler = require('../utils/asyncHandler');

// ====================================
// PERFIL PROPIO
// ====================================

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
    // El defaultScope ya excluye password; incluimos las direcciones
    const user = await User.findByPk(req.user.id, {
        include: [{ association: 'addresses' }]
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Actualizar perfil del usuario
 * @route   PUT /api/users/profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Actualizar solo los campos permitidos
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    // Recargar sin password (defaultScope)
    const updated = await User.findByPk(user.id, {
        include: [{ association: 'addresses' }]
    });

    res.status(200).json({
        success: true,
        data: updated,
        message: 'Perfil actualizado exitosamente'
    });
});

/**
 * @desc    Cambiar contraseña del usuario
 * @route   PUT /api/users/password
 * @access  Private
 */
exports.updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Necesitamos el password → scope withPassword
    const user = await User.scope('withPassword').findByPk(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
    }

    // Asignar nueva contraseña (el hook beforeSave la hasheará)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
});

// ====================================
// CRUD DE DIRECCIONES (UserAddress)
// ====================================

/**
 * @desc    Agregar nueva dirección
 * @route   POST /api/users/addresses
 * @access  Private
 */
exports.addAddress = asyncHandler(async (req, res) => {
    const { name, street, city, state, zipCode, phone, isDefault } = req.body;

    // Si la nueva dirección es la predeterminada,
    // poner todas las existentes en isDefault = false
    if (isDefault === true) {
        await UserAddress.update(
            { isDefault: false },
            { where: { userId: req.user.id } }
        );
    }

    // Crear la nueva dirección vinculada al usuario
    const address = await UserAddress.create({
        userId: req.user.id,
        name,
        street,
        city,
        state,
        zipCode,
        phone,
        isDefault: isDefault || false
    });

    // Retornar usuario completo con todas sus direcciones
    const user = await User.findByPk(req.user.id, {
        include: [{ association: 'addresses' }]
    });

    res.status(201).json({
        success: true,
        data: user,
        message: 'Dirección agregada exitosamente'
    });
});

/**
 * @desc    Actualizar dirección existente
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
exports.updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const { name, street, city, state, zipCode, phone, isDefault } = req.body;

    // Buscar la dirección verificando que pertenezca al usuario actual
    const address = await UserAddress.findOne({
        where: { id: addressId, userId: req.user.id }
    });

    if (!address) {
        return res.status(404).json({ success: false, message: 'Dirección no encontrada' });
    }

    // Si se marca como predeterminada, quitar ese flag a las demás
    if (isDefault === true) {
        await UserAddress.update(
            { isDefault: false },
            { where: { userId: req.user.id, id: { [Op.ne]: addressId } } }
        );
    }

    // Actualizar solo los campos enviados
    if (name !== undefined) address.name = name;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    const user = await User.findByPk(req.user.id, {
        include: [{ association: 'addresses' }]
    });

    res.status(200).json({
        success: true,
        data: user,
        message: 'Dirección actualizada exitosamente'
    });
});

/**
 * @desc    Eliminar dirección
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;

    // Verificar que la dirección existe y pertenece al usuario
    const address = await UserAddress.findOne({
        where: { id: addressId, userId: req.user.id }
    });

    if (!address) {
        return res.status(404).json({ success: false, message: 'Dirección no encontrada' });
    }

    await address.destroy();

    const user = await User.findByPk(req.user.id, {
        include: [{ association: 'addresses' }]
    });

    res.status(200).json({
        success: true,
        data: user,
        message: 'Dirección eliminada exitosamente'
    });
});

// ====================================
// MÉTODOS ADMIN
// ====================================

/**
 * @desc    Obtener todos los usuarios (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Construir cláusula WHERE dinámica
    const where = { isActive: true };
    if (search) {
        where[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows: users } = await User.findAndCountAll({
        where,
        // defaultScope excluye password; no necesitamos attributes adicionales
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
    });

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(count / limitNum),
            totalUsers: count,
            limit: limitNum
        }
    });
});

/**
 * @desc    Obtener usuario por ID (Admin)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id, {
        include: [{ association: 'addresses' }]
    });

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Actualizar rol de usuario (Admin)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Rol inválido. Debe ser "user" o "admin"'
        });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Prevenir que el admin se quite sus propios privilegios
    if (user.id === req.user.id && role === 'user') {
        return res.status(400).json({
            success: false,
            message: 'No puedes quitarte tus propios privilegios de administrador'
        });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
        success: true,
        data: user,
        message: `Usuario actualizado a rol "${role}" exitosamente`
    });
});

/**
 * @desc    Eliminar usuario (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Prevenir que el admin se elimine a sí mismo
    if (user.id === req.user.id) {
        return res.status(400).json({
            success: false,
            message: 'No puedes eliminar tu propia cuenta'
        });
    }

    // Soft delete: cambiar a inactivo para evitar errores de Foreign Keys (ej: Quotes)
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Usuario eliminado exitosamente' });
});
