import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 15000, // 15 segundos timeout (previene cuelgues infinitos)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Timeout del servidor
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            toast.error('El servidor está tardando en responder. Por favor, intenta nuevamente.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        }

        // Rate limit (429 Too Many Requests)
        else if (error.response?.status === 429) {
            toast.error('Demasiadas solicitudes. Espera un momento antes de continuar.', {
                position: 'bottom-right',
                autoClose: 6000,
            });
        }

        // Unauthorized (401)
        else if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Error de red
        else if (!error.response) {
            toast.error('Error de conexión. Verifica tu conexión a internet.', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        }

        return Promise.reject(error);
    }
);

export default API;
