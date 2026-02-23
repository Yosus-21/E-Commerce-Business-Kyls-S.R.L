/**
 * Utility function to get the full product image URL
 * @param {string} imagePath - Relative path from backend (e.g., "uploads/products/image.jpg" or "/uploads/products/image.jpg")
 * @returns {string|null} Full URL to the image or null if no path provided
 */
export const getProductImage = (imagePath) => {
    // Handle undefined, null, or empty string
    if (!imagePath) {
        return 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen';
    }

    // Si ya es una URL completa (Cloudinary/externa), retornarla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Reemplazar backslashes de Windows con slashes normales
    const normalizedPath = imagePath.replace(/\\/g, '/');

    // Obtener la URL base del servidor (sin /api)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remover /api si existe

    // Asegurar que la ruta empiece con /uploads
    let cleanPath = normalizedPath;
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }
    if (!cleanPath.startsWith('/uploads')) {
        cleanPath = '/uploads/' + cleanPath.replace(/^\//, '');
    }

    return `${baseUrl}${cleanPath}`;
};

// Mantener retrocompatibilidad con código que usa getImageUrl
export const getImageUrl = getProductImage;

export default {
    getProductImage,
    getImageUrl,
};
