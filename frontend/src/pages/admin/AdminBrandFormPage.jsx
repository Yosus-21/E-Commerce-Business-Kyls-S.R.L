import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { Card, Button, Input, LoadingOverlay } from '../../components/common';
import * as brandService from '../../services/brandService';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const brandSchema = yup.object().shape({
    name: yup
        .string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    description: yup
        .string()
        .max(500, 'La descripción no puede exceder 500 caracteres'),
});

/**
 * AdminBrandFormPage Component
 * Formulario para crear/editar marcas
 */
const AdminBrandFormPage = () => {
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
        resolver: yupResolver(brandSchema),
    });

    // Cargar marca (si es edición)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                // Si es edición, cargar marca
                if (isEditMode) {
                    const response = await brandService.getBrand(id);
                    const brand = response.data;

                    if (!brand) {
                        toast.error('Marca no encontrada', {
                            position: 'bottom-right',
                        });
                        navigate('/admin/brands');
                        return;
                    }

                    // Rellenar formulario
                    setValue('name', brand.name);
                    setValue('description', brand.description || '');

                    // Guardar imagen existente
                    if (brand.image) {
                        setExistingImage(brand.image);
                    }
                }
            } catch (error) {
                console.error('Error al cargar marca:', error);
                toast.error('Error al cargar datos de la marca', {
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

            // Validar imagen requerida en modo crear
            if (!isEditMode && !selectedFile) {
                toast.error('La imagen/logo es requerida', {
                    position: 'bottom-right',
                });
                setLoading(false);
                return;
            }

            // Crear FormData
            const formData = new FormData();

            // Agregar campos de texto
            formData.append('name', data.name);
            if (data.description) {
                formData.append('description', data.description);
            }

            // Agregar imagen (si hay nueva)
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            // Llamar al servicio
            if (isEditMode) {
                await brandService.updateBrand(id, formData);
                toast.success('Marca actualizada exitosamente', {
                    position: 'bottom-right',
                });
            } else {
                await brandService.createBrand(formData);
                toast.success('Marca creada exitosamente', {
                    position: 'bottom-right',
                });
            }

            // Redirigir a lista
            navigate('/admin/brands');
        } catch (error) {
            console.error('Error al guardar marca:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al guardar marca';
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
                    onClick={() => navigate('/admin/brands')}
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </Button>

                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        {isEditMode ? 'Editar Marca' : 'Nueva Marca'}
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        {isEditMode
                            ? 'Actualiza la información de la marca'
                            : 'Completa los datos de la nueva marca'}
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
                                label="Nombre de la Marca"
                                {...register('name')}
                                error={errors.name?.message}
                                placeholder="Ej: Apple, Samsung, Nike"
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
                                    placeholder="Breve descripción de la marca..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Imagen/Logo */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Logo de la Marca
                        </h3>

                        {isEditMode && existingImage && !previewImage && (
                            <div className="mb-4 p-4 bg-info-50 border border-info-200 rounded-lg">
                                <p className="text-sm text-info-800 mb-2">
                                    ℹ️ <strong>Logo actual:</strong>
                                </p>
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${existingImage}`}
                                    alt="Logo actual"
                                    className="w-32 h-32 object-contain rounded-lg border border-secondary-200 bg-white p-2"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Subir Logo {!isEditMode && <span className="text-danger-600">*</span>}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-1 text-sm text-secondary-500">
                                Formatos permitidos: JPG, PNG, WebP
                                {!isEditMode && <span className="text-danger-600"> (Requerido)</span>}
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
                                    className="w-40 h-40 object-contain rounded-lg border-2 border-primary-300 bg-white p-2"
                                />
                            </div>
                        )}

                        {!previewImage && !existingImage && (
                            <div className="mt-4 p-6 border-2 border-dashed border-secondary-300 rounded-lg text-center">
                                <FaImage className="mx-auto text-4xl text-secondary-400 mb-2" />
                                <p className="text-sm text-secondary-600">
                                    No hay logo seleccionado
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/brands')}
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
                            {isEditMode ? 'Actualizar Marca' : 'Crear Marca'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminBrandFormPage;
