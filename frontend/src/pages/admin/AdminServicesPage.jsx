import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaConciergeBell } from 'react-icons/fa';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import * as serviceService from '../../services/serviceService';
import { toast } from 'react-toastify';

/**
 * AdminServicesPage Component
 * Gestión de servicios para administradores
 */
const AdminServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar servicios al montar
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getAllServices();
            setServices(response.data || []);
        } catch (error) {
            toast.error('Error al cargar servicios', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`¿Estás seguro de eliminar el servicio "${title}"?`)) {
            return;
        }

        try {
            await serviceService.deleteService(id);
            toast.success('Servicio eliminado exitosamente', {
                position: 'bottom-right',
            });
            fetchServices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar servicio', {
                position: 'bottom-right',
            });
        }
    };

    // Estado vacío
    if (!loading && services.length === 0) {
        return (
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">Servicios</h1>
                        <p className="text-secondary-600 mt-1">Gestiona los servicios ofrecidos</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/admin/services/new')}
                    >
                        <FaPlus className="mr-2" />
                        Nuevo Servicio
                    </Button>
                </div>

                <Card>
                    <div className="text-center py-12">
                        <FaConciergeBell className="mx-auto text-6xl text-secondary-300 mb-4" />
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            No hay servicios registrados
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Comienza creando tu primer servicio
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/services/new')}
                        >
                            <FaPlus className="mr-2" />
                            Crear Primer Servicio
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
                    <h1 className="text-2xl font-bold text-secondary-900">Servicios</h1>
                    <p className="text-secondary-600 mt-1">Gestiona los servicios ofrecidos</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/services/new')}
                >
                    <FaPlus className="mr-2" />
                    Nuevo Servicio
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
                                <p className="text-sm text-secondary-600">Total de Servicios</p>
                                <p className="text-2xl font-bold text-secondary-900">{services.length}</p>
                            </div>
                            <FaConciergeBell className="text-4xl text-primary-600" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Imagen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Título
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Vistas
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {services.map((service) => (
                                    <tr key={service.id} className="hover:bg-secondary-50">
                                        {/* Imagen */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {service.image ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${service.image}`}
                                                    alt={service.title}
                                                    className="h-16 w-24 rounded object-cover border border-secondary-200"
                                                />
                                            ) : (
                                                <div className="h-16 w-24 rounded bg-secondary-100 flex items-center justify-center">
                                                    <FaConciergeBell className="text-secondary-400" />
                                                </div>
                                            )}
                                        </td>

                                        {/* Título */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-secondary-900">
                                                {service.title}
                                            </div>
                                            <div className="text-sm text-secondary-600 max-w-xs truncate">
                                                {service.description}
                                            </div>
                                        </td>

                                        {/* Precio */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-secondary-900">
                                                {service.price || '-'}
                                            </div>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={service.isActive ? 'success' : 'secondary'}>
                                                {service.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </td>

                                        {/* Vistas */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-secondary-600">
                                                {service.views || 0}
                                            </div>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/services/edit/${service.id}`)}
                                                    className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded transition-colors"
                                                    title="Editar servicio"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service.id, service.title)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                                                    title="Eliminar servicio"
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

export default AdminServicesPage;
