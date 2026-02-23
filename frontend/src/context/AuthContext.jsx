import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

/**
 * Context de Autenticación
 */
const AuthContext = createContext(null);

/**
 * Provider de Autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Verificar si existe token y obtener usuario
     * Se ejecuta al cargar la aplicación
     */
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authService.getProfile();
                setUser(response.data.user);
                setError(null);
            } catch (err) {
                // Si el token es inválido, limpiar localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                console.error('Error al verificar autenticación:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Iniciar sesión
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.login(email, password);

            // Guardar token en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Actualizar estado
            setUser(response.data.user);

            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al iniciar sesión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Registrar nuevo usuario
     * @param {Object} userData - Datos del usuario (name, email, password, phone)
     */
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.register(userData);

            // Guardar token en localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Actualizar estado
            setUser(response.data.user);

            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al registrar usuario';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Cerrar sesión
     */
    const logout = () => {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Limpiar estado
        setUser(null);
        setError(null);
    };

    /**
     * Actualizar perfil del usuario
     * @param {Object} profileData - Datos a actualizar
     */
    const updateUserProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.updateProfile(profileData);

            // Actualizar usuario en estado y localStorage
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar perfil';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualizar contraseña del usuario
     * @param {Object} passwordData - currentPassword y newPassword
     */
    const updateUserPassword = async (passwordData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await authService.updatePassword(passwordData);

            return response;
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar contraseña';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Limpiar errores
     */
    const clearError = () => {
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUserProfile,
        updateUserPassword,
        clearError,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook personalizado para consumir el contexto de autenticación
 * @returns {Object} Contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }

    return context;
};

export default AuthContext;
