import api from './api';

/**
 * Servicio para gestionar Cotizaciones
 */

// Generar nueva cotización (devuelve JSON con la cotización creada, NO un blob)
export const generateQuote = async (customerData) => {
    const response = await api.post('/quotes', { customerData });
    return response.data;
};

// Obtener cotizaciones del usuario
export const getUserQuotes = async () => {
    const response = await api.get('/quotes/user');
    return response.data;
};

// Obtener cotización por ID
export const getQuote = async (id) => {
    const response = await api.get(`/quotes/${id}`);
    return response.data;
};

// Descargar PDF de cotización y disparar descarga en el browser
export const downloadQuotePDF = async (quoteId, quoteNumber = '') => {
    const response = await api.get(`/quotes/${quoteId}/pdf`, {
        responseType: 'blob'
    });
    // Crear enlace temporal para disparar la descarga
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `cotizacion-${quoteNumber || quoteId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Eliminar cotización
export const deleteQuote = async (id) => {
    const response = await api.delete(`/quotes/${id}`);
    return response.data;
};

// ========== ADMIN METHODS ==========

/**
 * Obtener todas las cotizaciones con filtros (Admin)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise}
 */
export const getAllQuotes = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const response = await api.get(`/quotes/admin/all?${params.toString()}`);
    return response.data;
};

/**
 * Actualizar estado de cotización (Admin)
 * @param {string} id - ID de la cotización
 * @param {string} status - Nuevo estado (Generada/Contactado/Cerrada)
 * @param {string} notes - Notas opcionales
 * @returns {Promise}
 */
export const updateQuoteStatus = async (id, status, notes = '') => {
    const response = await api.patch(`/quotes/${id}/status`, { status, notes });
    return response.data;
};

/**
 * Obtener estadísticas del dashboard (Admin)
 * @returns {Promise}
 */
export const getDashboardStats = async () => {
    const response = await api.get('/quotes/stats/dashboard');
    return response.data;
};

export default {
    generateQuote,
    getUserQuotes,
    getQuote,
    downloadQuotePDF,
    deleteQuote,
    getAllQuotes,
    updateQuoteStatus,
    getDashboardStats
};

