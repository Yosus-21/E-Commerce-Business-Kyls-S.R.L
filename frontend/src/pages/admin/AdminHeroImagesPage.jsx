import { useState, useEffect } from 'react';
import { FaImage, FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Card, Button, LoadingSpinner } from '../../components/common';
import * as featuredImageService from '../../services/featuredImageService';
import { getImageUrl } from '../../utils/imageHelper';
import { toast } from 'react-toastify';

/**
 * AdminHeroImagesPage Component
 * Página de administración para gestionar imágenes del hero carousel
 */
const AdminHeroImagesPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await featuredImageService.getAll();
            setImages(response.data || []);
        } catch (error) {
            console.error('Error cargando imágenes:', error);
            toast.error('Error al cargar imágenes');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('La imagen no debe superar 2MB');
            return;
        }

        // Validar tipo
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Solo se permiten imágenes JPG, PNG o WEBP');
            return;
        }

        try {
            setUploading(true);
            await featuredImageService.uploadImage(file);
            toast.success('✅ Imagen subida exitosamente');
            fetchImages(); // Recargar lista
            e.target.value = ''; // Limpiar input
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            toast.error(error.response?.data?.message || 'Error al subir imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await featuredImageService.updateImage(id, { isActive: !currentStatus });
            toast.success(currentStatus ? 'Imagen ocultada' : 'Imagen activada');
            fetchImages();
        } catch (error) {
            console.error('Error actualizando imagen:', error);
            toast.error('Error al actualizar imagen');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) {
            return;
        }

        try {
            await featuredImageService.deleteImage(id);
            toast.success('🗑️ Imagen eliminada');
            fetchImages();
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            toast.error('Error al eliminar imagen');
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <div className="bg-white border-b border-secondary-200 py-6 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FaImage className="text-2xl text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-heading font-bold text-secondary-900">
                                    Imágenes del Hero
                                </h1>
                                <p className="text-secondary-600 text-sm">
                                    Gestiona las imágenes del carrusel de la página de inicio
                                </p>
                            </div>
                        </div>

                        {/* Botón de subir */}
                        <div>
                            <input
                                type="file"
                                ref={(input) => (window.heroImageInput = input)}
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={uploading}
                            />
                            <Button
                                variant="primary"
                                disabled={uploading}
                                onClick={() => window.heroImageInput?.click()}
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus className="mr-2" />
                                        Subir Nueva Imagen
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

                {/* Info */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>💡 Recomendaciones:</strong> Usa imágenes de alta calidad (máx. 2MB),
                        resolución recomendada 800x600px o superior, formato JPG/PNG/WEBP.
                        Las imágenes se mostrarán en el carrusel de la página principal.
                    </p>
                </div>

                {/* Lista de imágenes */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : images.length === 0 ? (
                    <Card>
                        <div className="text-center py-16">
                            <FaImage className="mx-auto text-6xl text-secondary-300 mb-4" />
                            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                                No hay imágenes
                            </h3>
                            <p className="text-secondary-600 mb-6">
                                Comienza subiendo tu primera imagen para el hero carousel
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((image) => (
                            <Card key={image.id} hoverable>
                                <div className="relative group">
                                    {/* Imagen */}
                                    <div className="aspect-video bg-secondary-100 rounded-lg overflow-hidden mb-3">
                                        <img
                                            src={getImageUrl(image.imageUrl)}
                                            alt="Hero"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Badge de estado */}
                                    <div className="absolute top-2 left-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${image.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {image.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2">
                                        <p className="text-xs text-secondary-500">
                                            Orden: {image.order} |
                                            Creada: {new Date(image.createdAt).toLocaleDateString('es-BO')}
                                        </p>

                                        {/* Botones */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant={image.isActive ? 'outline' : 'primary'}
                                                size="sm"
                                                onClick={() => handleToggleActive(image.id, image.isActive)}
                                                className="flex-1"
                                            >
                                                {image.isActive ? (
                                                    <>
                                                        <FaEyeSlash className="mr-1" />
                                                        Ocultar
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaEye className="mr-1" />
                                                        Mostrar
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(image.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHeroImagesPage;
