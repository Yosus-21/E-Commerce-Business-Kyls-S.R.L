/**
 * Middleware global de manejo de errores
 * Debe ser el ÚLTIMO middleware en app.js
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error en consola (para desarrollo)
    console.error('Error:', err);

    // ====================================
    // ERRORES ESPECÍFICOS DE MONGOOSE
    // ====================================

    // Error de CastError - ID de MongoDB inválido
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado';
        error.message = message;
        error.statusCode = 404;
    }

    // Error de duplicado (E11000) - Clave única duplicada
    if (err.code === 11000) {
        // Extraer el campo duplicado del error
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `El ${field} '${value}' ya existe`;
        error.message = message;
        error.statusCode = 400;
    }

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        // Extraer todos los mensajes de error
        const messages = Object.values(err.errors).map(val => val.message);
        error.message = 'Errores de validación';
        error.errors = messages;
        error.statusCode = 400;
    }

    // ====================================
    // RESPUESTA DE ERROR
    // ====================================

    const statusCode = error.statusCode || 500;
    const response = {
        success: false,
        error: error.message || 'Error del servidor'
    };

    // Agregar array de errores si existe (para ValidationError)
    if (error.errors) {
        response.errors = error.errors;
    }

    // Incluir stack trace solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = { errorHandler };
