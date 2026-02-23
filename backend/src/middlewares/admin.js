/**
 * Middleware de autorización de administrador
 * Verifica que el usuario autenticado tenga rol de administrador
 * DEBE usarse DESPUÉS del middleware protect
 */
const isAdmin = (req, res, next) => {
    // Verificar que existe req.user (debe venir del middleware protect)
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado, debe iniciar sesión primero'
        });
    }

    // Verificar que el usuario tiene rol de administrador
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado, se requiere rol de administrador'
        });
    }

    // Usuario es admin, continuar
    next();
};

module.exports = { isAdmin };
