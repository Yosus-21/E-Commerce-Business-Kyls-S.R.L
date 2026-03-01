/**
 * imageHelper.js
 * Helper global para construir URLs completas de imágenes del backend.
 *
 * Variables de entorno requeridas en .env del frontend:
 *   VITE_BACKEND_URL=http://localhost:5000      ← desarrollo
 *   VITE_BACKEND_URL=https://kyla.com.bo        ← producción cPanel
 */

// URL base del servidor de archivos estáticos
// Elimina trailing slash si lo tiene (evita dobles slashes)
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
    .replace(/\/$/, '');

// Placeholder cuando no hay imagen
const PLACEHOLDER = 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen';

/**
 * Convierte una ruta parcial de la BD a una URL completa de imagen.
 *
 * Casos manejados:
 *   null / undefined / ''              → imagen placeholder
 *   'https://...' o 'http://...'       → se retorna intacta (imagen externa)
 *   '/uploads/products/img.jpg'        → http://localhost:5000/uploads/products/img.jpg
 *   'uploads/brands/logo.png'          → http://localhost:5000/uploads/brands/logo.png
 *   ['img1.jpg', 'img2.jpg']           → primera imagen válida del array
 *
 * @param {string|string[]|null|undefined} path - Ruta(s) desde la BD
 * @param {string} [fallback] - URL alternativa si path es vacío
 * @returns {string} URL completa lista para <img src="...">
 */
export const getImageUrl = (path, fallback = PLACEHOLDER) => {
    // Arrays → usar la primera imagen válida
    if (Array.isArray(path)) {
        const first = path.find(p => p && String(p).trim() !== '');
        return getImageUrl(first, fallback);
    }

    // Nulo / vacío → placeholder
    if (!path || String(path).trim() === '') {
        return fallback;
    }

    const str = String(path).trim();

    // URL externa completa → retornar sin modificar
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return str;
    }

    // Normalizar backslashes de Windows → forward-slashes
    const normalized = str.replace(/\\/g, '/');

    // Asegurar un único slash entre BACKEND_URL y la ruta
    // Evita: http://localhost:5000//uploads/img.jpg
    const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;

    return `${BACKEND_URL}${cleanPath}`;
};

/**
 * Convierte un array de rutas a un array de URLs completas.
 * Útil para galerías de productos.
 *
 * @param {string[]|null|undefined} images
 * @param {string} [fallback]
 * @returns {string[]}
 */
export const getImageUrls = (images, fallback = PLACEHOLDER) => {
    if (!Array.isArray(images) || images.length === 0) return [fallback];
    const urls = images
        .filter(img => img && String(img).trim() !== '')
        .map(img => getImageUrl(img, fallback));
    return urls.length > 0 ? urls : [fallback];
};

// Alias para retrocompatibilidad con código existente que use getProductImage
export const getProductImage = getImageUrl;

export default getImageUrl;
