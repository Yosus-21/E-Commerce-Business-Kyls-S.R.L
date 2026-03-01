const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

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

        // 4. Buscar usuario por PK (equivalente a findById en Mongoose)
        //    El defaultScope de User excluye el password automáticamente
        const user = await User.findByPk(decoded.id);

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

        // 6. Adjuntar usuario al objeto request (sin password por el defaultScope)
        req.user = user;

        // 7. Continuar al siguiente middleware
        next();
    } catch (error) {
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

        return res.status(401).json({
            success: false,
            error: 'No autorizado'
        });
    }
};

/**
 * Middleware de autorización basada en roles
 * @param {...string} roles - Roles permitidos (ej: 'admin', 'user')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado, usuario no encontrado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}. Tu rol actual es: ${req.user.role}`
            });
        }

        next();
    };
};

module.exports = { protect, authorize };
