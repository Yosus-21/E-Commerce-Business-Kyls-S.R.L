import api from './api';

/**
 * Servicio para gestionar Marcas
 */

// Obtener todas las marcas
export const getAllBrands = async () => {
    const response = await api.get('/brands');
    return response.data;
};

// Obtener una marca por ID
export const getBrand = async (id) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
};

// Crear nueva marca
export const createBrand = async (brandData) => {
    const response = await api.post('/brands', brandData, {
        headers: {
            'Content-Type': brandData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
    });
    return response.data;
};

// Actualizar marca
export const updateBrand = async (id, brandData) => {
    const response = await api.put(`/brands/${id}`, brandData, {
        headers: {
            'Content-Type': brandData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
    });
    return response.data;
};

// Eliminar marca
export const deleteBrand = async (id) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
};
