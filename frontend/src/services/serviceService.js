import api from './api';

/**
 * Servicio para gestionar Servicios
 */

// Obtener todos los servicios
export const getAllServices = async (params = {}) => {
    const response = await api.get('/services', { params });
    return response.data;
};

// Obtener un servicio por ID
export const getService = async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
};

// Crear nuevo servicio
export const createService = async (serviceData) => {
    const response = await api.post('/services', serviceData, {
        headers: {
            'Content-Type': serviceData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
    });
    return response.data;
};

// Actualizar servicio
export const updateService = async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData, {
        headers: {
            'Content-Type': serviceData instanceof FormData ? 'multipart/form-data' : 'application/json',
        },
    });
    return response.data;
};

// Eliminar servicio
export const deleteService = async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
};
