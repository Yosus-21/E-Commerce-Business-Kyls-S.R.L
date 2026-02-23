import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Input, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const loginSchema = yup.object({
    email: yup
        .string()
        .required('El email es requerido')
        .email('Ingresa un email válido'),
    password: yup
        .string()
        .required('La contraseña es requerida'),
}).required();

/**
 * LoginPage Component
 * Página de inicio de sesión
 */
const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener la ruta previa para redirigir después del login
    const from = location.state?.from?.pathname || '/';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);

            await login(data.email, data.password);

            toast.success('¡Bienvenido de nuevo!', {
                position: 'bottom-right',
                autoClose: 2000,
            });

            // Redirigir a la página anterior o al home
            navigate(from, { replace: true });
        } catch (error) {
            const errorMessage = error.message || 'Error al iniciar sesión';

            toast.error(errorMessage, {
                position: 'bottom-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Logo / Título */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading font-bold text-primary-700 mb-2">
                        Business Kyla SRL
                    </h1>
                    <p className="text-secondary-600">
                        Inicia sesión en tu cuenta
                    </p>
                </div>

                {/* Card del formulario */}
                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="tu@email.com"
                            error={errors.email?.message}
                            required
                            {...register('email')}
                        />

                        {/* Password */}
                        <Input
                            label="Contraseña"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="******"
                        />

                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Botón de envío */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Iniciar Sesión
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-secondary-200">
                        <p className="text-center text-sm text-secondary-600">
                            ¿No tienes cuenta?{' '}
                            <Link
                                to="/register"
                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Nota adicional */}
                <p className="mt-4 text-center text-xs text-secondary-500">
                    Al iniciar sesión, aceptas nuestros términos y condiciones
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
