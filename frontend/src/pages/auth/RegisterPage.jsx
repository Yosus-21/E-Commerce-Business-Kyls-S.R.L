import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Card, Input, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const registerSchema = yup.object({
    name: yup
        .string()
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: yup
        .string()
        .required('El email es requerido')
        .email('Ingresa un email válido'),
    phone: yup
        .string()
        .required('El teléfono es requerido')
        .matches(/^[0-9]{8,}$/, 'Ingresa un número de teléfono válido (mínimo 8 dígitos)'),
    password: yup
        .string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: yup
        .string()
        .required('Confirma tu contraseña')
        .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
}).required();

/**
 * RegisterPage Component
 * Página de registro de nuevos usuarios
 */
const RegisterPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);

            // Preparar datos para enviar (sin confirmPassword)
            const { confirmPassword, ...userData } = data;

            await registerUser(userData);

            toast.success('¡Cuenta creada exitosamente! Bienvenido', {
                position: 'bottom-right',
                autoClose: 2000,
            });

            // Redirigir al home después de registro exitoso
            navigate('/', { replace: true });
        } catch (error) {
            const errorMessage = error.message || 'Error al crear la cuenta';

            // Detectar errores específicos del backend
            if (errorMessage.toLowerCase().includes('existe')) {
                toast.error('Este email ya está registrado', {
                    position: 'bottom-right',
                });
            } else {
                toast.error(errorMessage, {
                    position: 'bottom-right',
                });
            }
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
                        Crea tu cuenta para comenzar
                    </p>
                </div>

                {/* Card del formulario */}
                <Card>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Nombre */}
                        <Input
                            label="Nombre Completo"
                            type="text"
                            placeholder="Juan Pérez"
                            error={errors.name?.message}
                            required
                            {...register('name')}
                        />

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="tu@email.com"
                            error={errors.email?.message}
                            required
                            {...register('email')}
                        />

                        {/* Teléfono */}
                        <Input
                            label="Teléfono"
                            type="tel"
                            placeholder="77123456"
                            error={errors.phone?.message}
                            required
                            {...register('phone')}
                        />

                        {/* Password */}
                        <Input
                            label="Contraseña"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            required
                            {...register('password')}
                        />

                        {/* Confirmar Password */}
                        <Input
                            label="Confirmar Contraseña"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            required
                            {...register('confirmPassword')}
                        />

                        {/* Botón de envío */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            isLoading={isLoading}
                            disabled={isLoading}
                        >
                            Crear Cuenta
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 pt-6 border-t border-secondary-200">
                        <p className="text-center text-sm text-secondary-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link
                                to="/login"
                                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Inicia sesión
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Nota adicional */}
                <p className="mt-4 text-center text-xs text-secondary-500">
                    Al registrarte, aceptas nuestros términos, condiciones y política de privacidad
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
