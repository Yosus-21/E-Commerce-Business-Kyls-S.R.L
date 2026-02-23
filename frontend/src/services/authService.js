import API from './api';

/**
 * Authentication Service
 * Maneja todas las peticiones relacionadas con autenticación
 */

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario (name, email, password, phone)
 * @returns {Promise<Object>} Respuesta con token y datos del usuario
 */
export const register = async (userData) => {
    try {
        const response = await API.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al registrar usuario' };
    }
};

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} Respuesta con token y datos del usuario
 */
export const login = async (email, password) => {
    try {
        const response = await API.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
};

/**
 * Obtener perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del usuario
 */
export const getProfile = async () => {
    try {
        const response = await API.get('/auth/me');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener perfil' };
    }
};

/**
 * Actualizar perfil del usuario
 * @param {Object} profileData - Datos a actualizar (name, phone)
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateProfile = async (profileData) => {
    try {
        const response = await API.put('/users/profile', profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar perfil' };
    }
};

/**
 * Actualizar contraseña del usuario
 * @param {Object} passwordData - Objeto con currentPassword y newPassword
 * @returns {Promise<Object>} Confirmación de actualización
 */
export const updatePassword = async (passwordData) => {
    try {
        const response = await API.put('/users/password', passwordData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar contraseña' };
    }
};

/**
 * Solicitar recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Confirmación de envío de email
 */
export const forgotPassword = async (email) => {
    try {
        const response = await API.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al enviar email de recuperación' };
    }
};

/**
 * Restablecer contraseña con token
 * @param {string} token - Token de recuperación
 * @param {string} password - Nueva contraseña
 * @returns {Promise<Object>} Confirmación de actualización
 */
export const resetPassword = async (token, password) => {
    try {
        const response = await API.put(`/auth/reset-password/${token}`, { password });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al restablecer contraseña' };
    }
};

export default {
    register,
    login,
    getProfile,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
};
