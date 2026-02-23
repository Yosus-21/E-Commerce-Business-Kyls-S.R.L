import API from './api';

/**
 * Product Service
 * Maneja todas las peticiones relacionadas con productos y categorías
 */

/**
 * Obtener lista de productos con filtros
 * @param {Object} params - Parámetros de filtrado (page, category, search, minPrice, maxPrice, sort)
 * @returns {Promise<Object>} Lista de productos con paginación
 */
export const getProducts = async (params = {}) => {
    try {
        // Construir query string desde el objeto params
        const queryString = new URLSearchParams(
            Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        ).toString();

        const url = queryString ? `/products?${queryString}` : '/products';
        const response = await API.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener productos' };
    }
};

/**
 * Obtener un producto por ID
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const getProduct = async (id) => {
    try {
        const response = await API.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener producto' };
    }
};

/**
 * Obtener lista de categorías
 * @returns {Promise<Object>} Lista de categorías
 */
export const getCategories = async () => {
    try {
        const response = await API.get('/categories');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener categorías' };
    }
};

/**
 * Crear nuevo producto (Admin)
 * @param {FormData} productData - Datos del producto con imágenes
 * @returns {Promise<Object>} Producto creado
 */
export const createProduct = async (productData) => {
    try {
        const response = await API.post('/products', productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear producto' };
    }
};

/**
 * Actualizar producto (Admin)
 * @param {string} id - ID del producto
 * @param {FormData} productData - Datos actualizados del producto
 * @returns {Promise<Object>} Producto actualizado
 */
export const updateProduct = async (id, productData) => {
    try {
        const response = await API.put(`/products/${id}`, productData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar producto' };
    }
};

/**
 * Eliminar producto (Admin)
 * @param {string} id - ID del producto
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const deleteProduct = async (id) => {
    try {
        const response = await API.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al eliminar producto' };
    }
};

export default {
    getProducts,
    getProduct,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
};
