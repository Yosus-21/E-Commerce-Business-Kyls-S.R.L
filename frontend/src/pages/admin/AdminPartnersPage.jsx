import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import * as partnerService from '../../services/partnerService';
import { LoadingSpinner } from '../../components/common';
import { getProductImage } from '../../utils/imageHelper';

/**
 * AdminPartn

ersPage Component
 * Gestión de logos de aliados/clientes
 */
const AdminPartnersPage = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        logo: null
    });

    // Fetch partners
    const fetchPartners = async () => {
        try {
            setLoading(true);
            const response = await partnerService.getAll();
            setPartners(response.data);
        } catch (error) {
            console.error('Error al cargar aliados:', error);
            toast.error('Error al cargar la lista de aliados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    // Handle upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('El archivo es muy grande. Máximo 2MB');
                return;
            }

            // Validar tipo
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error('Solo se permiten imágenes JPG, PNG o WEBP');
                return;
            }

            setFormData({ ...formData, logo: file });
        }
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('El nombre del aliado es obligatorio');
            return;
        }

        if (!formData.logo) {
            toast.error('Por favor selecciona un logo');
            return;
        }

        try {
            setUploading(true);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('logo', formData.logo);

            await partnerService.uploadPartner(data);

            toast.success('Aliado agregado exitosamente');
            setFormData({ name: '', logo: null });
            document.getElementById('logoInput').value = '';
            fetchPartners();
        } catch (error) {
            console.error('Error al subir aliado:', error);
            toast.error(error.response?.data?.message || 'Error al subir el aliado');
        } finally {
            setUploading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Eliminar a ${name}?`)) return;

        try {
            await partnerService.deletePartner(id);
            toast.success('Aliado eliminado exitosamente');
            fetchPartners();
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast.error('Error al eliminar el aliado');
        }
    };

    if (loading) {
        return <LoadingSpinner text="Cargando aliados..." />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gestión de Experiencia
                </h1>
                <p className="text-gray-600">
                    Administra los logos de empresas y clientes que confían en Business Kyla SRL
                </p>
            </div>

            {/* Formulario de Upload */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FaPlus className="mr-2 text-purple-600" />
                    Agregar Nuevo Aliado
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ej: Banco FIE S.A."
                            />
                        </div>

                        {/* Logo */}
                        <div>
                            <label htmlFor="logoInput" className="block text-sm font-medium text-gray-700 mb-2">
                                Logo (JPG, PNG, WEBP - Máx 2MB) *
                            </label>
                            <input
                                type="file"
                                id="logoInput"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    {formData.logo && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FaImage className="text-gray-400" />
                            <span className="text-sm text-gray-600">{formData.logo.name}</span>
                        </div>
                    )}

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <FaPlus />
                                Agregar Aliado
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Lista de Partners */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Aliados Actuales ({partners.length})
                </h2>

                {partners.length === 0 ? (
                    <div className="text-center py-12">
                        <FaImage className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500">No hay aliados registrados aún</p>
                        <p className="text-sm text-gray-400 mt-2">Sube el primer logo usando el formulario de arriba</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {partners.map((partner) => (
                            <div
                                key={partner.id}
                                className="relative group bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-500 hover:shadow-lg transition-all duration-300"
                            >
                                {/* Logo */}
                                <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                                    <img
                                        src={getProductImage(partner.logo)}
                                        alt={partner.name}
                                        className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                    />
                                </div>

                                {/* Info */}
                                <div className="p-3 bg-gray-50">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={partner.name}>
                                        {partner.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {partner.isActive ? '✓ Activo' : '○ Inactivo'}
                                    </p>
                                </div>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => handleDelete(partner.id, partner.name)}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    title="Eliminar"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPartnersPage;
