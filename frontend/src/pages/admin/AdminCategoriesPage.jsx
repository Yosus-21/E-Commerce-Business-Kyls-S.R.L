import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import * as categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

/**
 * AdminCategoriesPage Component
 * Gestión de categorías para administradores
 */
const AdminCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar categorías al montar
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getCategories();
            setCategories(response.data || []);
        } catch (error) {
            toast.error('Error al cargar categorías', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
            return;
        }

        try {
            await categoryService.deleteCategory(id);
            toast.success('Categoría eliminada exitosamente', {
                position: 'bottom-right',
            });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar categoría', {
                position: 'bottom-right',
            });
        }
    };

    // Estado vacío
    if (!loading && categories.length === 0) {
        return (
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">Categorías</h1>
                        <p className="text-secondary-600 mt-1">Gestiona las categorías de productos</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/categories/new')}
                    >
                        <FaPlus className="mr-2" />
                        Nueva Categoría
                    </Button>
                </div>

                <Card>
                    <div className="text-center py-12">
                        <FaTags className="mx-auto text-6xl text-secondary-300 mb-4" />
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            No hay categorías registradas
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Comienza creando tu primera categoría de productos
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/categories/new')}
                        >
                            <FaPlus className="mr-2" />
                            Crear Primera Categoría
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
                    <h1 className="text-2xl font-bold text-secondary-900">Categorías</h1>
                    <p className="text-secondary-600 mt-1">Gestiona las categorías de productos</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/categories/new')}
                >
                    <FaPlus className="mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Total Categorías</p>
                            <p className="text-2xl font-bold text-secondary-900">{categories.length}</p>
                        </div>
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <FaTags className="text-2xl text-primary-700" />
                        </div>
                    </div>
                </Card>

                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Activas</p>
                            <p className="text-2xl font-bold text-success-700">
                                {categories.filter(c => c.isActive !== false).length}
                            </p>
                        </div>
                        <div className="p-3 bg-success-100 rounded-lg">
                            <FaTags className="text-2xl text-success-700" />
                        </div>
                    </div>
                </Card>

                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Inactivas</p>
                            <p className="text-2xl font-bold text-secondary-500">
                                {categories.filter(c => c.isActive === false).length}
                            </p>
                        </div>
                        <div className="p-3 bg-secondary-100 rounded-lg">
                            <FaTags className="text-2xl text-secondary-500" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabla de Categorías */}
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Productos
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-200">
                                {categories.map((category) => (
                                    <tr key={category._id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-secondary-900">{category.name}</div>
                                                {category.description && (
                                                    <div className="text-sm text-secondary-500 truncate max-w-xs">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-sm text-secondary-600 bg-secondary-100 px-2 py-1 rounded">
                                                {category.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={category.isActive !== false ? 'success' : 'secondary'}>
                                                {category.isActive !== false ? 'Activa' : 'Inactiva'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                                            {category.productCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/categories/edit/${category._id}`)}
                                                    className="p-2 text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id, category.name)}
                                                    className="p-2 text-danger-700 hover:bg-danger-50 rounded-lg transition-colors"
                                                    title="Eliminar"
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
                )}
            </Card>
        </div>
    );
};

export default AdminCategoriesPage;
