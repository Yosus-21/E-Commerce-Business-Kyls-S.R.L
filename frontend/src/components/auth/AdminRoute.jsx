import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../common';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

/**
 * AdminRoute Component
 * Protege rutas que requieren autenticación Y rol de administrador
 * Redirige a /login si no está autenticado
 * Redirige a / si está autenticado pero no es admin
 */
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();
    const [hasShownToast, setHasShownToast] = useState(false);

    // Mostrar toast de acceso denegado solo una vez
    useEffect(() => {
        if (!loading && isAuthenticated && user && user.role !== 'admin' && !hasShownToast) {
            toast.error('Acceso denegado: Se requieren permisos de administrador', {
                position: 'bottom-right',
                autoClose: 4000,
            });
            setHasShownToast(true);
        }
    }, [loading, isAuthenticated, user, hasShownToast]);

    // Mostrar loader mientras se verifica la autenticación
    if (loading) {
        return <FullPageLoader message="Verificando permisos..." />;
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si está autenticado pero NO es admin, redirigir a home
    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Si es admin, renderizar el contenido
    return children;
};

export default AdminRoute;
