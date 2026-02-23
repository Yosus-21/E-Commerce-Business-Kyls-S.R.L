const fs = require('fs').promises;
const path = require('path');

/**
 * Eliminar un archivo del sistema de archivos
 * @param {string} filePath - Ruta relativa del archivo (ej: '/uploads/categories/imagen.jpg')
 */
exports.deleteFile = async (filePath) => {
    try {
        // Convertir ruta relativa a ruta absoluta
        const fullPath = path.join(__dirname, '../..', filePath);
        await fs.unlink(fullPath);
        console.log(`✓ Archivo eliminado: ${filePath}`);
    } catch (error) {
        // No lanzar error si el archivo no existe
        if (error.code !== 'ENOENT') {
            console.error('Error eliminando archivo:', error);
        }
    }
};

/**
 * Verificar si un archivo existe
 * @param {string} filePath - Ruta relativa del archivo
 * @returns {Promise<boolean>}
 */
exports.fileExists = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../..', filePath);
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
};
