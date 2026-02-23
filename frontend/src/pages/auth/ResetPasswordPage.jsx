import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { Card, Input, Button } from '../../components/common';
import { resetPassword } from '../../services/authService';
import { toast } from 'react-toastify';

/**
 * Schema de validación
 */
const schema = yup.object().shape({
    password: yup
        .string()
        .required('La contraseña es obligatoria')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: yup
        .string()
        .required('Debes confirmar la contraseña')
        .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});

/**
 * ResetPasswordPage Component
 * Página para restablecer contraseña con token
 */
const ResetPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
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

            // Restablecer contraseña con el token de la URL
            const response = await resetPassword(token, data.password);

            setSuccess(true);

            toast.success(response.message || 'Contraseña restablecida exitosamente', {
                position: 'bottom-right',
            });

            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Error en reset password:', error);
            toast.error(error.error || 'Error al restablecer contraseña. El enlace puede haber expirado.', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    // Vista de éxito
    if (success) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <Card>
                        <div className="text-center">
                            <div className="mb-6">
                                <FaCheckCircle className="mx-auto text-6xl text-success-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-secondary-900 mb-3">
                                ¡Contraseña Restablecida!
                            </h2>

                            <p className="text-secondary-600 mb-6">
                                Tu contraseña ha sido actualizada exitosamente.
                            </p>

                            <p className="text-sm text-secondary-500 mb-6">
                                Serás redirigido al login en unos segundos...
                            </p>

                            <Button
                                variant="primary"
                                fullWidth
                                onClick={() => navigate('/login')}
                            >
                                Ir al Login
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Formulario de restablecimiento
    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                        Restablecer Contraseña
                    </h1>
                    <p className="text-secondary-600">
                        Ingresa tu nueva contraseña
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <Input
                            label="Nueva Contraseña"
                            type="password"
                            {...register('password')}
                            error={errors.password?.message}
                            placeholder="Mínimo 6 caracteres"
                            icon={<FaLock />}
                        />

                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            placeholder="Repite la nueva contraseña"
                            icon={<FaLock />}
                        />

                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <p className="text-sm text-primary-900">
                                <strong>Recomendaciones de seguridad:</strong>
                            </p>
                            <ul className="text-sm text-primary-800 mt-2 space-y-1 list-disc list-inside">
                                <li>Usa al menos 6 caracteres</li>
                                <li>Combina letras, números y símbolos</li>
                                <li>Evita información personal obvia</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            isLoading={loading}
                            disabled={loading}
                        >
                            Restablecer Contraseña
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

                {token && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-secondary-500">
                            Token: {token.substring(0, 8)}...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
