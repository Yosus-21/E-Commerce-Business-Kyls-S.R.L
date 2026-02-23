import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../common';

/**
 * PrivateRoute Component
 * Protege rutas que requieren autenticación
 * Redirige a /login si el usuario no está autenticado
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Mostrar loader mientras se verifica la autenticación
    if (loading) {
        return <FullPageLoader message="Verificando sesión..." />;
    }

    // Si no está autenticado, redirigir a login
    // Guardar la ubicación actual para redirigir después del login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si está autenticado, renderizar el contenido
    return children;
};

export default PrivateRoute;
