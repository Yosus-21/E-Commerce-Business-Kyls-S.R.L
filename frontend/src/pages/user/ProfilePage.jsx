import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaUser, FaLock, FaSave } from 'react-icons/fa';
import { Card, Input, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Schemas de validación
 */
const profileSchema = yup.object().shape({
    name: yup
        .string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),
    phone: yup
        .string()
        .matches(/^\d{8}$/, 'Formato: 8 dígitos')
        .nullable(),
});

const passwordSchema = yup.object().shape({
    currentPassword: yup
        .string()
        .required('La contraseña actual es obligatoria'),
    newPassword: yup
        .string()
        .required('La nueva contraseña es obligatoria')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: yup
        .string()
        .required('Debes confirmar la nueva contraseña')
        .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden'),
});

/**
 * ProfilePage Component
 * Página de perfil del usuario con datos personales y cambio de contraseña
 */
const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    // Formulario de datos personales
    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: errorsProfile },
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
        },
    });

    // Formulario de cambio de contraseña
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: errorsPassword },
        reset: resetPassword,
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    // Actualizar datos personales
    const onSubmitProfile = async (data) => {
        try {
            setLoadingProfile(true);

            // TODO: Implementar userService.updateProfile(data)
            // Por ahora simulamos la actualización
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Actualizar contexto (si hay función)
            if (updateUser) {
                updateUser({ ...user, ...data });
            }

            toast.success('Perfil actualizado exitosamente', {
                position: 'bottom-right',
            });
        } catch (error) {
            toast.error(error.message || 'Error al actualizar perfil', {
                position: 'bottom-right',
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    // Cambiar contraseña
    const onSubmitPassword = async (data) => {
        try {
            setLoadingPassword(true);

            // TODO: Implementar authService.updatePassword(data)
            // Por ahora simulamos la actualización
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Contraseña actualizada exitosamente', {
                position: 'bottom-right',
            });

            resetPassword();
        } catch (error) {
            toast.error(error.message || 'Error al cambiar contraseña', {
                position: 'bottom-right',
            });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        Mi Perfil
                    </h1>
                    <p className="text-secondary-600 mt-2">
                        Gestiona tu información personal y seguridad
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-secondary-200">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'personal'
                                    ? 'border-primary-600 text-primary-700'
                                    : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
                                }
              `}
                        >
                            <FaUser className="inline mr-2" />
                            Datos Personales
                        </button>

                        <button
                            onClick={() => setActiveTab('security')}
                            className={`
                pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'security'
                                    ? 'border-primary-600 text-primary-700'
                                    : 'border-transparent text-secondary-600 hover:text-secondary-900 hover:border-secondary-300'
                                }
              `}
                        >
                            <FaLock className="inline mr-2" />
                            Seguridad
                        </button>
                    </div>
                </div>

                {/* Tab: Datos Personales */}
                {activeTab === 'personal' && (
                    <Card>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                            Información Personal
                        </h2>

                        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Nombre Completo"
                                        {...registerProfile('name')}
                                        error={errorsProfile.name?.message}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>

                                <div>
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="bg-secondary-100"
                                    />
                                    <p className="text-xs text-secondary-500 mt-1">
                                        El email no puede ser modificado
                                    </p>
                                </div>

                                <div>
                                    <Input
                                        label="Teléfono"
                                        {...registerProfile('phone')}
                                        error={errorsProfile.phone?.message}
                                        placeholder="12345678"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={loadingProfile}
                                    disabled={loadingProfile}
                                >
                                    <FaSave className="mr-2" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Tab: Seguridad */}
                {activeTab === 'security' && (
                    <Card>
                        <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                            Cambiar Contraseña
                        </h2>

                        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">

                            <Input
                                label="Contraseña Actual"
                                type="password"
                                {...registerPassword('currentPassword')}
                                error={errorsPassword.currentPassword?.message}
                                placeholder="Tu contraseña actual"
                            />

                            <div className="grid sm:grid-cols-2 gap-6">
                                <Input
                                    label="Nueva Contraseña"
                                    type="password"
                                    {...registerPassword('newPassword')}
                                    error={errorsPassword.newPassword?.message}
                                    placeholder="Mínimo 6 caracteres"
                                />

                                <Input
                                    label="Confirmar Nueva Contraseña"
                                    type="password"
                                    {...registerPassword('confirmPassword')}
                                    error={errorsPassword.confirmPassword?.message}
                                    placeholder="Repite la nueva contraseña"
                                />
                            </div>

                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                                <p className="text-sm text-primary-900">
                                    <strong>Recomendaciones:</strong>
                                </p>
                                <ul className="text-sm text-primary-800 mt-2 space-y-1 list-disc list-inside">
                                    <li>Usa al menos 6 caracteres</li>
                                    <li>Combina letras, números y símbolos</li>
                                    <li>No uses información personal obvia</li>
                                </ul>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={loadingPassword}
                                    disabled={loadingPassword}
                                >
                                    <FaLock className="mr-2" />
                                    Cambiar Contraseña
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
