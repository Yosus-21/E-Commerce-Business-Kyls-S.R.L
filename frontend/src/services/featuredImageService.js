import api from './api';

/**
 * Servicio para gestionar Imágenes Destacadas (Hero)
 */

// Obtener imágenes activas (público)
export const getAllActive = async () => {
    const response = await api.get('/featured-images');
    return response.data;
};

// Obtener todas las imágenes (admin)
export const getAll = async () => {
    const response = await api.get('/featured-images/all');
    return response.data;
};

// Obtener imagen por ID
export const getById = async (id) => {
    const response = await api.get(`/featured-images/${id}`);
    return response.data;
};

// Subir nueva imagen
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/featured-images', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Actualizar imagen (orden o estado)
export const updateImage = async (id, data) => {
    const response = await api.put(`/featured-images/${id}`, data);
    return response.data;
};

// Eliminar imagen
export const deleteImage = async (id) => {
    const response = await api.delete(`/featured-images/${id}`);
    return response.data;
};
