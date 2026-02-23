const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Obtener perfil del usuario actual
 * @route   GET /api/users/profile
 * @access  Private
 */
exports.getProfile = asyncHandler(async (req, res) => {
    // Buscar usuario SIN password para prevenir fuga de datos
    const user = await User.findById(req.user._id).select('-password');

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

    // Buscar usuario
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // Actualizar campos permitidos
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Guardar cambios
    await user.save();

    // Obtener usuario actualizado SIN password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
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

    // Buscar usuario con password (select: false por defecto)
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // ====================================
    // VERIFICAR CONTRASEÑA ACTUAL
    // ====================================
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Contraseña actual incorrecta'
        });
    }

    // ====================================
    // ACTUALIZAR CONTRASEÑA
    // ====================================
    user.password = newPassword;

    // Guardar (el middleware pre-save hasheará automáticamente)
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
    });
});

/**
 * @desc    Agregar nueva dirección
 * @route   POST /api/users/addresses
 * @access  Private
 */
exports.addAddress = asyncHandler(async (req, res) => {
    const { name, street, city, state, zipCode, phone, isDefault } = req.body;

    // Buscar usuario
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // ====================================
    // SI isDefault es true, poner todas las demás en false
    // ====================================
    if (isDefault === true) {
        user.addresses.forEach(address => {
            address.isDefault = false;
        });
    }

    // Agregar nueva dirección
    user.addresses.push({
        name,
        street,
        city,
        state,
        zipCode,
        phone,
        isDefault: isDefault || false
    });

    // Guardar cambios
    await user.save();

    // Obtener usuario actualizado SIN password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(201).json({
        success: true,
        data: updatedUser,
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

    // Buscar usuario
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // Encontrar dirección por _id
    const address = user.addresses.id(addressId);

    if (!address) {
        return res.status(404).json({
            success: false,
            message: 'Dirección no encontrada'
        });
    }

    // ====================================
    // SI isDefault es true, poner todas las demás en false
    // ====================================
    if (isDefault === true) {
        user.addresses.forEach(addr => {
            if (addr._id.toString() !== addressId) {
                addr.isDefault = false;
            }
        });
    }

    // Actualizar campos
    if (name) address.name = name;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode !== undefined) address.zipCode = zipCode;
    if (phone) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;

    // Guardar cambios
    await user.save();

    // Obtener usuario actualizado SIN password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
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

    // Buscar usuario
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // Filtrar addresses para eliminar la dirección
    user.addresses = user.addresses.filter(
        address => address._id.toString() !== addressId
    );

    // Guardar cambios
    await user.save();

    // Obtener usuario actualizado SIN password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
        success: true,
        data: updatedUser,
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
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros de búsqueda
    const filters = {};
    if (search) {
        filters.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Buscar usuarios (sin password)
    const users = await User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    // Contar total
    const total = await User.countDocuments(filters);

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalUsers: total,
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
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

/**
 * @desc    Actualizar rol de usuario (Admin)
 * @route   PUT /api/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    // Validar rol
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Rol inválido. Debe ser "user" o "admin"'
        });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // Prevenir que el admin se quite sus propios privilegios
    if (user._id.toString() === req.user._id.toString() && role === 'user') {
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
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'Usuario no encontrado'
        });
    }

    // Prevenir que el admin se elimine a sí mismo
    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
            success: false,
            message: 'No puedes eliminar tu propia cuenta'
        });
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
    });
});
