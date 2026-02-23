import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import { Card, Button, LoadingSpinner } from '../../components/common';
import * as brandService from '../../services/brandService';
import { toast } from 'react-toastify';

/**
 * AdminBrandsPage Component
 * Gestión de marcas para administradores
 */
const AdminBrandsPage = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar marcas al montar
    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await brandService.getAllBrands();
            setBrands(response.data || []);
        } catch (error) {
            toast.error('Error al cargar marcas', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar la marca "${name}"?`)) {
            return;
        }

        try {
            await brandService.deleteBrand(id);
            toast.success('Marca eliminada exitosamente', {
                position: 'bottom-right',
            });
            fetchBrands();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar marca', {
                position: 'bottom-right',
            });
        }
    };

    // Estado vacío
    if (!loading && brands.length === 0) {
        return (
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">Marcas</h1>
                        <p className="text-secondary-600 mt-1">Gestiona las marcas de productos</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/brands/new')}
                    >
                        <FaPlus className="mr-2" />
                        Nueva Marca
                    </Button>
                </div>

                <Card>
                    <div className="text-center py-12">
                        <FaStar className="mx-auto text-6xl text-secondary-300 mb-4" />
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            No hay marcas registradas
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Comienza creando tu primera marca de productos
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/brands/new')}
                        >
                            <FaPlus className="mr-2" />
                            Crear Primera Marca
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Marcas</h1>
                    <p className="text-secondary-600 mt-1">Gestiona las marcas de productos</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/brands/new')}
                >
                    <FaPlus className="mr-2" />
                    Nueva Marca
                </Button>
            </div>

            {/* Loading */}
            {loading ? (
                <Card>
                    <div className="py-12">
                        <LoadingSpinner />
                    </div>
                </Card>
            ) : (
                <Card>
                    {/* Stats */}
                    <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-600">Total de Marcas</p>
                                <p className="text-2xl font-bold text-secondary-900">{brands.length}</p>
                            </div>
                            <FaStar className="text-4xl text-primary-600" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Logo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {brands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-secondary-50">
                                        {/* Logo */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {brand.image ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${brand.image}`}
                                                    alt={brand.name}
                                                    className="h-12 w-12 rounded object-contain bg-white border border-secondary-200"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded bg-secondary-100 flex items-center justify-center">
                                                    <FaStar className="text-secondary-400" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Nombre */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-secondary-900">
                                                {brand.name}
                                            </div>
                                        </td>

                                        {/* Slug */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-secondary-600">
                                                {brand.slug}
                                            </div>
                                        </td>

                                        {/* Descripción */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-secondary-600 max-w-xs truncate">
                                                {brand.description || '-'}
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/brands/edit/${brand._id}`)}
                                                    className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded transition-colors"
                                                    title="Editar marca"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(brand._id, brand.name)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar marca"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AdminBrandsPage;
