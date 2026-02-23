import api from './api';

/**
 * Category Service
 * Maneja todas las operaciones CRUD con categorías
 */

/**
 * Obtener todas las categorías
 */
export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

/**
 * Obtener una categoría por ID o slug
 */
export const getCategory = async (idOrSlug) => {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response.data;
};

/**
 * Crear nueva categoría (Admin)
 * @param {Object} categoryData - Datos de la categoría (name, description)
 */
export const createCategory = async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
};

/**
 * Actualizar categoría (Admin)
 * @param {string} id - ID de la categoría
 * @param {Object} categoryData - Datos actualizados (name, description)
 */
export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
};

/**
 * Eliminar categoría (Admin)
 * @param {string} id - ID de la categoría
 */
export const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
};

/**
 * Obtener productos de una categoría
 * @param {string} categoryId - ID de la categoría
 */
export const getCategoryProducts = async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}/products`);
    return response.data;
};

export default {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
};
