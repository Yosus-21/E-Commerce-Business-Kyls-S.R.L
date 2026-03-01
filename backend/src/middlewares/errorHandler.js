/**
 * Middleware global de manejo de errores
 * Debe ser el ÚLTIMO middleware en app.js
 * ✅ Adaptado para Sequelize/MySQL (sin errores específicos de Mongoose)
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error en consola (para desarrollo)
    console.error('Error:', err);

    // ====================================
    // ERRORES DE SEQUELIZE / MYSQL
    // ====================================

    // Error de validación de Sequelize (campo requerido, unicidad, etc.)
    if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map(e => e.message);
        error.message = messages[0] || 'Error de validación';
        error.errors = messages;
        error.statusCode = 400;
    }

    // Error de unicidad de Sequelize (UNIQUE constraint)
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors?.[0]?.path || 'campo';
        const value = err.errors?.[0]?.value || '';
        error.message = `El ${field} '${value}' ya existe`;
        error.statusCode = 400;
    }

    // Error de llave foránea de Sequelize (FK constraint)
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error.message = 'Referencia inválida: el registro relacionado no existe';
        error.statusCode = 400;
    }

    // Error de base de datos genérico de Sequelize
    if (err.name === 'SequelizeDatabaseError') {
        error.message = process.env.NODE_ENV === 'development'
            ? err.message
            : 'Error de base de datos';
        error.statusCode = 500;
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
