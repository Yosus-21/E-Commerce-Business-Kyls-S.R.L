import API from './api';

/**
 * Cart Service
 * Maneja todas las peticiones relacionadas con el carrito de compras
 * Todos los endpoints requieren autenticación
 */

/**
 * Obtener el carrito del usuario autenticado
 * @returns {Promise<Object>} Datos del carrito
 */
export const getCart = async () => {
    try {
        const response = await API.get('/cart');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener carrito' };
    }
};

/**
 * Agregar producto al carrito
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a agregar
 * @returns {Promise<Object>} Carrito actualizado
 */
export const addToCart = async (productId, quantity) => {
    try {
        const response = await API.post('/cart/add', { productId, quantity });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al agregar producto al carrito' };
    }
};

/**
 * Actualizar cantidad de un item en el carrito
 * @param {string} itemId - ID del item en el carrito
 * @param {number} quantity - Nueva cantidad
 * @returns {Promise<Object>} Carrito actualizado
 */
export const updateCartItem = async (itemId, quantity) => {
    try {
        const response = await API.put(`/cart/update/${itemId}`, { quantity });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar item del carrito' };
    }
};

/**
 * Eliminar un item del carrito
 * @param {string} itemId - ID del item en el carrito
 * @returns {Promise<Object>} Carrito actualizado
 */
export const removeFromCart = async (itemId) => {
    try {
        const response = await API.delete(`/cart/remove/${itemId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar item del carrito' };
    }
};

/**
 * Vaciar el carrito completo
 * @returns {Promise<Object>} Confirmación
 */
export const clearCart = async () => {
    try {
        const response = await API.delete('/cart/clear');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al vaciar carrito' };
    }
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};
