import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaArrowLeft, FaImage } from 'react-icons/fa';
import { Card, Button, Input, LoadingOverlay } from '../../components/common';
import * as productService from '../../services/productService';
import * as brandService from '../../services/brandService';
import { toast } from 'react-toastify';
import { getProductImage } from '../../utils/imageHelper';

/**
 * Schema de validación con Yup
 */
const productSchema = yup.object().shape({
    name: yup
        .string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),
    description: yup
        .string()
        .required('La descripción es obligatoria')
        .min(10, 'La descripción debe tener al menos 10 caracteres'),
    brandId: yup
        .string(),                          // Opcional (Sin marca)
    price: yup
        .number()
        .typeError('El precio debe ser un número')
        .required('El precio es obligatorio')
        .positive('El precio debe ser mayor a 0'),
    stock: yup
        .number()
        .typeError('El stock debe ser un número')
        .required('El stock es obligatorio')
        .integer('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo'),
    categoryId: yup
        .string()
        .required('La categoría es obligatoria'),
});

/**
 * AdminProductFormPage Component
 * Formulario para crear/editar productos
 */
const AdminProductFormPage = () => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: {
            isFeatured: false,
            discountPercentage: 0,
        },
    });

    const price = watch('price');
    const discountPercentage = watch('discountPercentage');
    const isFeatured = watch('isFeatured');

    // Calcular precio con descuento
    const discountedPrice = price && discountPercentage > 0
        ? (price * (1 - discountPercentage / 100)).toFixed(2)
        : price;

    // Cargar categorías, marcas y producto (si es edición)
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                // Cargar categorías
                const categoriesResponse = await productService.getCategories();
                setCategories(categoriesResponse.data || []);

                // Cargar marcas
                const brandsResponse = await brandService.getAllBrands();
                setBrands(brandsResponse.data || []);

                // Si es edición, cargar producto
                if (isEditMode) {
                    // Obtener producto (necesitamos crear una función getProduct en productService)
                    const productsResponse = await productService.getProducts();
                    const product = (productsResponse.data?.products || productsResponse.data || [])
                        .find(p => p.id == id || p._id === id);

                    if (!product) {
                        toast.error('Producto no encontrado', {
                            position: 'bottom-right',
                        });
                        navigate('/admin/products');
                        return;
                    }

                    // Rellenar formulario con IDs numéricos de MySQL
                    setValue('name', product.name);
                    setValue('description', product.description);
                    setValue('longDescription', product.longDescription || '');
                    setValue('brandId', product.brandId || product.brand?.id || '');
                    setValue('price', product.price);
                    setValue('stock', product.stock);
                    setValue('categoryId', product.categoryId || product.category?.id || '');
                    setValue('isFeatured', product.isFeatured || false);
                    setValue('discountPercentage', product.discountPercentage || 0);

                    // Guardar imágenes existentes
                    setExistingImages(product.images || []);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar datos del formulario', {
                    position: 'bottom-right',
                });
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, [id, isEditMode, navigate, setValue]);

    // Manejar selección de archivos
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Crear previews
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    // Enviar formulario
    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // Crear FormData
            const formData = new FormData();

            // Agregar campos de texto
            formData.append('name', data.name);
            formData.append('description', data.description);
            if (data.longDescription) {
                formData.append('longDescription', data.longDescription);
            }
            // ✅ Enviar categoryId y brandId (nombres que espera el backend Sequelize)
            formData.append('categoryId', data.categoryId);
            if (data.brandId) {
                formData.append('brandId', data.brandId);
            }
            formData.append('price', data.price);
            formData.append('stock', data.stock);
            formData.append('isFeatured', data.isFeatured || false);
            formData.append('discountPercentage', data.discountPercentage || 0);

            // Agregar imágenes (si hay nuevas)
            if (selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            // Llamar al servicio
            if (isEditMode) {
                await productService.updateProduct(id, formData);
                toast.success('Producto actualizado exitosamente', {
                    position: 'bottom-right',
                });
            } else {
                await productService.createProduct(formData);
                toast.success('Producto creado exitosamente', {
                    position: 'bottom-right',
                });
            }

            // Redirigir a lista
            navigate('/admin/products');
        } catch (error) {
            console.error('Error al guardar producto:', error);
            toast.error(error.message || 'Error al guardar producto', {
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
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/products')}
                >
                    <FaArrowLeft className="mr-2" />
                    Volver
                </Button>

                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                    </h1>
                    <p className="text-secondary-600 mt-1">
                        {isEditMode
                            ? 'Actualiza la información del producto'
                            : 'Completa los datos del nuevo producto'}
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
                                label="Nombre del Producto"
                                {...register('name')}
                                error={errors.name?.message}
                                placeholder="Ej: Laptop Dell Inspiron 15"
                            />

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${errors.description
                                            ? 'border-danger-500 focus:ring-danger-500'
                                            : 'border-secondary-300'
                                        }
                  `}
                                    placeholder="Describe las características principales del producto..."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Sobre el Producto (Descripción detallada)
                                </label>
                                <textarea
                                    {...register('longDescription')}
                                    rows={10}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Escribe aquí todos los detalles, historia o especificaciones detalladas..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Marca (Opcional)
                                </label>
                                <select
                                    {...register('brandId')}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Sin marca</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id || brand._id} value={brand.id || brand._id}>
                                            {brand.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.brandId && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.brandId.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Precio e Inventario */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Precio e Inventario
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Precio (Bs.)"
                                type="number"
                                step="0.01"
                                {...register('price')}
                                error={errors.price?.message}
                                placeholder="0.00"
                            />

                            <Input
                                label="Stock (Unidades)"
                                type="number"
                                {...register('stock')}
                                error={errors.stock?.message}
                                placeholder="0"
                            />
                        </div>
                    </Card>

                    {/* Marketing y Promociones */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Marketing y Promociones
                        </h3>

                        <div className="space-y-4">
                            {/* Checkbox Destacado */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    {...register('isFeatured')}
                                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                                />
                                <label
                                    htmlFor="isFeatured"
                                    className="ml-2 block text-sm text-secondary-700"
                                >
                                    ⭐ Destacar en página de inicio
                                </label>
                            </div>

                            {/* Descuento */}
                            <div>
                                <Input
                                    label="Descuento (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    {...register('discountPercentage')}
                                    placeholder="0"
                                />
                                <p className="mt-1 text-sm text-secondary-500">
                                    Ingresa el porcentaje de descuento (0-100)
                                </p>
                            </div>

                            {/* Preview de Precio con Descuento */}
                            {discountPercentage > 0 && price > 0 && (
                                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                    <p className="text-sm font-medium text-primary-900 mb-2">
                                        💰 Vista Previa de Precio
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-secondary-600 line-through">
                                                Precio original: Bs {Number(price).toFixed(2)}
                                            </p>
                                            <p className="text-lg font-bold text-primary-600">
                                                Precio final: Bs {discountedPrice}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-sm font-semibold">
                                                -{discountPercentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Organización */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Categorización
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Categoría
                                </label>
                                <select
                                    {...register('categoryId')}
                                    className={`
                    w-full px-4 py-2 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${errors.categoryId
                                            ? 'border-danger-500 focus:ring-danger-500'
                                            : 'border-secondary-300'
                                        }
                  `}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categories.map((category) => (
                                        <option key={category.id || category._id} value={category.id || category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoryId && (
                                    <p className="mt-1 text-sm text-danger-600">
                                        {errors.categoryId.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Imágenes */}
                    <Card>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                            Imágenes del Producto
                        </h3>

                        {isEditMode && existingImages.length > 0 && (
                            <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                                <p className="text-sm text-warning-800 mb-2">
                                    ℹ️ <strong>Nota:</strong> Al subir nuevas imágenes, se reemplazarán las imágenes actuales del producto.
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {existingImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={getProductImage(img)}
                                            alt={`Producto imagen ${index + 1}`}
                                            className="w-20 h-20 object-cover rounded-lg border border-secondary-200"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80x80/e2e8f0/64748b?text=Sin+Imagen';
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                                Subir Imágenes {!isEditMode && <span className="text-danger-600">*</span>}
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="mt-1 text-sm text-secondary-500">
                                Puedes seleccionar múltiples imágenes (JPG, PNG, WebP)
                            </p>
                        </div>

                        {/* Preview de nuevas imágenes */}
                        {previewImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-secondary-700 mb-2">
                                    Vista previa:
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {previewImages.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg border-2 border-primary-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isEditMode && selectedFiles.length === 0 && (
                            <div className="mt-4 p-6 border-2 border-dashed border-secondary-300 rounded-lg text-center">
                                <FaImage className="mx-auto text-4xl text-secondary-400 mb-2" />
                                <p className="text-sm text-secondary-600">
                                    No has seleccionado imágenes aún
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/admin/products')}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={loading}
                            disabled={loading || (!isEditMode && selectedFiles.length === 0)}
                        >
                            {isEditMode ? 'Actualizar Producto' : 'Crear Producto'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminProductFormPage;
