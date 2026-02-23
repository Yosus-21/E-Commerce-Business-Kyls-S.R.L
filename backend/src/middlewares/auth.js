const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Protege rutas verificando el token JWT en el header Authorization
 */
const protect = async (req, res, next) => {
    let token;

    try {
        // 1. Verificar que existe header Authorization y que comienza con 'Bearer'
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Extraer token del formato "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];
        }

        // 2. Verificar que el token existe
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado, token requerido'
            });
        }

        // 3. Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Buscar usuario en la base de datos (SIN incluir password por seguridad)
        const user = await User.findById(decoded.id);

        // 5. Verificar que el usuario existe y está activo
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Usuario inactivo'
            });
        }

        // 6. Adjuntar usuario al objeto request (SIN password)
        req.user = user;

        // 7. Continuar al siguiente middleware
        next();
    } catch (error) {
        // Manejo de errores específicos de JWT
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expirado, inicie sesión nuevamente'
            });
        }

        // Error genérico
        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
};

/**
 * Middleware de autorización basada en roles
 * Verifica que el usuario tenga uno de los roles permitidos
 * @param {...string} roles - Roles permitidos (ej: 'admin', 'user')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Verificar que el usuario existe (debe pasar por protect primero)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado, usuario no encontrado'
            });
        }

        // Verificar que el rol del usuario está en la lista de roles permitidos
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}. Tu rol actual es: ${req.user.role}`
            });
        }

        // Usuario autorizado, continuar
        next();
    };
};

module.exports = { protect, authorize };
