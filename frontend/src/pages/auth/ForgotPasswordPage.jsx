import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import { Card, Input, Button } from '../../components/common';
import { forgotPassword } from '../../services/authService';
import { toast } from 'react-toastify';

/**
 * Schema de validación
 */
const schema = yup.object().shape({
    email: yup
        .string()
        .required('El email es obligatorio')
        .email('Ingrese un email válido'),
});

/**
 * ForgotPasswordPage Component
 * Página para solicitar recuperación de contraseña
 */
const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // Llamar al servicio de recuperación de contraseña
            const response = await forgotPassword(data.email);

            setSubmitted(true);

            toast.success(response.message || 'Email de recuperación enviado exitosamente', {
                position: 'bottom-right',
                autoClose: 5000,
            });
        } catch (error) {
            console.error('Error en forgot password:', error);
            toast.error(error.error || 'Error al procesar la solicitud. Intenta nuevamente.', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    // Vista de confirmación
    if (submitted) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <Card>
                        <div className="text-center">
                            <div className="mb-6">
                                <FaCheckCircle className="mx-auto text-6xl text-success-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-secondary-900 mb-3">
                                ¡Solicitud Enviada!
                            </h2>

                            <p className="text-secondary-600 mb-6">
                                Si tu email está registrado en nuestro sistema, recibirás un correo con las instrucciones para restablecer tu contraseña.
                            </p>

                            <p className="text-sm text-secondary-500 mb-6">
                                Por favor, revisa tu bandeja de entrada y la carpeta de spam.
                            </p>

                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => navigate('/login')}
                                >
                                    Volver al Login
                                </Button>

                                <Button
                                    variant="ghost"
                                    fullWidth
                                    onClick={() => setSubmitted(false)}
                                >
                                    Enviar de nuevo
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Formulario de solicitud
    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                        ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="text-secondary-600">
                        Ingresa tu email y te enviaremos instrucciones para recuperarla
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <Input
                            label="Email"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                            placeholder="tu@email.com"
                            icon={<FaEnvelope />}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={loading}
                            disabled={loading}
                        >
                            Enviar enlace de recuperación
                        </Button>

                        <div className="text-center pt-4 border-t border-secondary-200">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-primary-700 hover:text-primary-800 font-medium"
                            >
                                Volver al login
                            </button>
                        </div>
                    </form>
                </Card>

                <div className="mt-6 text-center">
                    <p className="text-sm text-secondary-600">
                        ¿No tienes cuenta?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-primary-700 hover:text-primary-800 font-medium"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
