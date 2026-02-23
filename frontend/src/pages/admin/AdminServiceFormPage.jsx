import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { Card, Button, Input, LoadingOverlay } from '../../components/common';
import * as serviceService from '../../services/serviceService';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const serviceSchema = yup.object().shape({
    title: yup
        .string()
        .required('El título es obligatorio')
        .max(200, 'El título no puede exceder 200 caracteres'),
    description: yup
        .string()
        .max(3000, 'La descripción no puede exceder 3000 caracteres'),
    price: yup
        .string()
        .max(50, 'El precio no puede exceder 50 caracteres'),
    features: yup
        .string(),
});

/**
 * AdminServiceFormPage Component
 * Formulario para crear/editar servicios
 */
const AdminServiceFormPage = () => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        resolver: yupResolver(serviceSchema),
    });

    // Cargar servicio (si es edición)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                // Si es edición, cargar servicio
                if (isEditMode) {
                    const response = await serviceService.getService(id);
                    const service = response.data;

                    if (!service) {
                        toast.error('Servicio no encontrado', {
                            position: 'bottom-right',
                        });
                        navigate('/admin/services');
                        return;
                    }

                    // Rellenar formulario
                    setValue('title', service.title);
                    setValue('description', service.description || '');
                    setValue('longDescription', service.longDescription || '');
                    setValue('price', service.price || '');

                    // Convertir features array a string separado por comas
                    if (service.features && Array.isArray(service.features)) {
                        setValue('features', service.features.join(', '));
                    }

                    // Guardar imagen existente
                    if (service.image) {
                        setExistingImage(service.image);
                    }
                }
            } catch (error) {
                console.error('Error al cargar servicio:', error);
                toast.error('Error al cargar datos del servicio', {
                    position: 'bottom-right',
                });
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [id, isEditMode, navigate, setValue]);

    // Manejar selección de archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Crear preview
            const preview = URL.createObjectURL(file);
            setPreviewImage(preview);
        }
    };

    // Enviar formulario
    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // Crear FormData
            const formData = new FormData();

            // Agregar campos de texto
            formData.append('title', data.title);
            if (data.description) {
                formData.append('description', data.description);
            }
            if (data.longDescription) {
                formData.append('longDescription', data.longDescription);
            }
            if (data.price) {
                formData.append('price', data.price);
            }

            // Procesar features: convertir string separado por comas a array
            if (data.features) {
                const featuresArray = data.features
                    .split(',')
                    .map(f => f.trim())
                    .filter(f => f.length > 0);

                // Enviar como JSON string
                formData.append('features', JSON.stringify(featuresArray));
            }

            // Agregar imagen (si hay nueva)
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            // Llamar al servicio
            if (isEditMode) {
                await serviceService.updateService(id, formData);
                toast.success('Servicio actualizado exitosamente', {
                    position: 'bottom-right',
                });
            } else {
                await serviceService.createService(formData);
                toast.success('Servicio creado exitosamente', {
                    position: 'bottom-right',
                });
            }

            // Redirigir a lista
            navigate('/admin/services');
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al guardar servicio';
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
                    onClick={() => navigate('/admin/services')}
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </Button>

                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        {isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        {isEditMode
                            ? 'Actualiza la información del servicio'
                            : 'Completa los datos del nuevo servicio'}
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
                                label="Título del Servicio"
                                {...register('title')}
                                error={errors.title?.message}
                                placeholder="Ej: Desarrollo Web, Consultoría IT"
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={5}
                                    className={`
                                        w-full px-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-primary-500
                                        ${errors.description
                                            ? 'border-danger-500 focus:ring-danger-500'
                                            : 'border-secondary-300'
                                        }
                                    `}
                                    placeholder="Descripción detallada del servicio..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Sobre el Servicio (Descripción detallada)
                                </label>
                                <textarea
                                    {...register('longDescription')}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Escribe aquí todos los detalles del servicio..."
                                />
                            </div>

                            <Input
                                label="Precio (Opcional)"
                                {...register('price')}
                                error={errors.price?.message}
                                placeholder="Ej: Desde 500 Bs, Consultar"
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Características (separadas por comas)
                                </label>
                                <textarea
                                    {...register('features')}
                                    rows={3}
                                    className={`
                                        w-full px-4 py-2 border rounded-lg
                                        focus:outline-none focus:ring-2 focus:ring-primary-500
                                        ${errors.features
                                            ? 'border-danger-500 focus:ring-danger-500'
                                            : 'border-secondary-300'
                                        }
                                    `}
                                    placeholder="Ej: Responsive, SEO Optimizado, Soporte 24/7"
                                />
                                <p className="mt-1 text-sm text-secondary-500">
                                    Separa cada característica con una coma (,)
                                </p>
                                {errors.features && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.features.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Imagen */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Imagen del Servicio
                        </h3>

                        {isEditMode && existingImage && !previewImage && (
                            <div className="mb-4 p-4 bg-info-50 border border-info-200 rounded-lg">
                                <p className="text-sm text-info-800 mb-2">
                                    ℹ️ <strong>Imagen actual:</strong>
                                </p>
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${existingImage}`}
                                    alt="Imagen actual"
                                    className="w-48 h-32 object-cover rounded-lg border border-secondary-200"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Subir Imagen <span className="text-secondary-500">(Opcional)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-1 text-sm text-secondary-500">
                                Formatos permitidos: JPG, PNG, WebP
                            </p>
                        </div>

                        {/* Preview de nueva imagen */}
                        {previewImage && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-secondary-700 mb-2">
                                    Vista previa:
                                </p>
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-64 h-40 object-cover rounded-lg border-2 border-primary-300"
                                />
                            </div>
                        )}

                        {!previewImage && !existingImage && (
                            <div className="mt-4 p-6 border-2 border-dashed border-secondary-300 rounded-lg text-center">
                                <FaImage className="mx-auto text-4xl text-secondary-400 mb-2" />
                                <p className="text-sm text-secondary-600">
                                    No hay imagen seleccionada
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/services')}
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
                            {isEditMode ? 'Actualizar Servicio' : 'Crear Servicio'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminServiceFormPage;
