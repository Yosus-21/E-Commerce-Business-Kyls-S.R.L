import api from './api';

/**
 * User Service
 * Maneja operaciones relacionadas con usuarios (perfil y admin)
 */

/**
 * Obtener perfil del usuario actual
 */
export const getProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

/**
 * Actualizar perfil del usuario actual
 * @param {Object} userData - { name, phone }
 */
export const updateProfile = async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
};

/**
 * Cambiar contraseña del usuario actual
 * @param {Object} passwordData - { currentPassword, newPassword }
 */
export const updatePassword = async (passwordData) => {
    const response = await api.put('/users/password', passwordData);
    return response.data;
};

/**
 * Agregar dirección de envío
 * @param {Object} addressData - Datos de la dirección
 */
export const addAddress = async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
};

/**
 * Actualizar dirección
 * @param {string} addressId - ID de la dirección
 * @param {Object} addressData - Datos actualizados
 */
export const updateAddress = async (addressId, addressData) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
};

/**
 * Eliminar dirección
 * @param {string} addressId - ID de la dirección
 */
export const deleteAddress = async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
};

// ============================================
// MÉTODOS ADMIN
// ============================================

/**
 * Obtener todos los usuarios (Admin)
 * @param {Object} params - Query params (page, limit, search, etc.)
 */
export const getAllUsers = async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
};

/**
 * Obtener usuario por ID (Admin)
 * @param {string} userId - ID del usuario
 */
export const getUserById = async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
};

/**
 * Actualizar rol de usuario (Admin)
 * @param {string} userId - ID del usuario
 * @param {string} role - Nuevo rol ('user' o 'admin')
 */
export const updateUserRole = async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
};

/**
 * Eliminar usuario (Admin)
 * @param {string} userId - ID del usuario
 */
export const deleteUser = async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export default {
    getProfile,
    updateProfile,
    updatePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
};
