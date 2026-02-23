import api from './api';

/**
 * Partner/Aliados Service
 * Gestiona las operaciones con logos de clientes
 */

// Obtener aliados activos (público)
export const getAllActive = async () => {
    const response = await api.get('/partners');
    return response.data;
};

// Obtener todos los aliados (admin)
export const getAll = async () => {
    const response = await api.get('/partners/all');
    return response.data;
};

// Crear nuevo aliado (admin)
export const uploadPartner = async (formData) => {
    const response = await api.post('/partners', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Actualizar aliado (admin)
export const updatePartner = async (id, data) => {
    const response = await api.put(`/partners/${id}`, data);
    return response.data;
};

// Eliminar aliado (admin)
export const deletePartner = async (id) => {
    const response = await api.delete(`/partners/${id}`);
    return response.data;
};

export default {
    getAllActive,
    getAll,
    uploadPartner,
    updatePartner,
    deletePartner
};
