import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { Card, Button, Input, LoadingOverlay } from '../../components/common';
import * as categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const categorySchema = yup.object().shape({
    name: yup
        .string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres'),
    description: yup
        .string()
        .max(200, 'La descripción no puede exceder 200 caracteres'),
});

/**
 * AdminCategoryFormPage Component
 * Formulario para crear/editar categorías
 */
const AdminCategoryFormPage = () => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: yupResolver(categorySchema),
    });

    // Cargar categoría (si es edición)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                // Si es edición, cargar categoría
                if (isEditMode) {
                    const response = await categoryService.getCategory(id);


                    const category = response.data;

                    if (!category) {
                        toast.error('Categoría no encontrada', {
                            position: 'bottom-right',
                        });
                        navigate('/admin/categories');
                        return;
                    }

                    // Rellenar formulario
                    setValue('name', category.name);
                    setValue('description', category.description || '');
                }
            } catch (error) {
                console.error('Error al cargar categoría:', error);
                toast.error('Error al cargar datos de la categoría', {
                    position: 'bottom-right',
                });
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [id, isEditMode, navigate, setValue]);

    // Enviar formulario
    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // Llamar al servicio con datos planos (no FormData)
            if (isEditMode) {
                await categoryService.updateCategory(id, data);
                toast.success('Categoría actualizada exitosamente', {
                    position: 'bottom-right',
                });
            } else {
                await categoryService.createCategory(data);
                toast.success('Categoría creada exitosamente', {
                    position: 'bottom-right',
                });
            }

            // Redirigir a lista
            navigate('/admin/categories');
        } catch (error) {
            console.error('Error al guardar categoría:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al guardar categoría';
            toast.error(errorMessage, {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    // Estado de carga inicial
    if (loadingData) {
        return <LoadingOverlay message="Cargando formulario..." />;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/categories')}
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </Button>

                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        {isEditMode
                            ? 'Actualiza la información de la categoría'
                            : 'Completa los datos de la nueva categoría'}
                    </p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-6">

                    {/* Información Básica */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Información Básica
                        </h3>

                        <div className="space-y-4">
                            <Input
                                label="Nombre de la Categoría"
                                {...register('name')}
                                error={errors.name?.message}
                                placeholder="Ej: Electrónicos, Ropa, Hogar"
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    className={`
                                        w-full px-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-primary-500
                                        ${errors.description
                                            ? 'border-danger-500 focus:ring-danger-500'
                                            : 'border-secondary-300'
                                        }
                                    `}
                                    placeholder="Breve descripción de la categoría..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/categories')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={loading}
                            disabled={loading}
                        >
                            {isEditMode ? 'Actualizar Categoría' : 'Crear Categoría'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminCategoryFormPage;
