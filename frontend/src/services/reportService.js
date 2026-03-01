import API from './api';

const reportService = {
    /**
     * Descargar catálogo en PDF
     * @param {string} type - 'products', 'services', 'all'
     * @param {string} brandId - ID de la marca (opcional)
     */
    downloadCatalog: async (type = 'all', brandId = null) => {
        let url = `/reports/catalog?type=${type}`;
        if (brandId) {
            url += `&brand=${brandId}`;
        }

        const response = await API.get(url, {
            responseType: 'blob', // Importante para archivos binarios
        });

        // Crear URL temporal para descargar
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Nombre del archivo (intentar extraer del header o generar uno)
        const contentDisposition = response.headers['content-disposition'];
        let filename = `catalogo-${type}.pdf`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch.length === 2) filename = filenameMatch[1];
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    },

    /**
     * Obtener métricas completas del dashboard admin
     * @route GET /api/reports/dashboard
     * @returns {Promise<Object>} { inventory, users, quotes, monthly, quoteTrend,
     *                              topProducts, categoryDistribution, topClients,
     *                              topViewedProducts, lowStockProducts }
     */
    getDashboardData: async () => {
        const response = await API.get('/reports/dashboard');
        return response.data;
    }
};

export default reportService;
