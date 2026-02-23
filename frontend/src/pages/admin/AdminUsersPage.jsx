import { useState, useEffect } from 'react';
import { FaUsers, FaUserShield, FaTrash, FaCalendar } from 'react-icons/fa';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import * as userService from '../../services/userService';
import { toast } from 'react-toastify';

/**
 * AdminUsersPage Component
 * Gestión de usuarios para administradores
 */
const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        users: 0,
    });

    // Cargar usuarios al montar
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            const usersData = response.data || [];
            setUsers(usersData);

            // Calcular estadísticas
            setStats({
                total: usersData.length,
                admins: usersData.filter(u => u.role === 'admin').length,
                users: usersData.filter(u => u.role === 'user').length,
            });
        } catch (error) {
            toast.error('Error al cargar usuarios', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (userId, currentRole, userName) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promover a Administrador' : 'cambiar a Usuario';

        if (!window.confirm(`¿Estás seguro de ${action} a "${userName}"?`)) {
            return;
        }

        try {
            await userService.updateUserRole(userId, newRole);
            toast.success(`Usuario ${action === 'promover a Administrador' ? 'promovido' : 'actualizado'} exitosamente`, {
                position: 'bottom-right',
            });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cambiar rol', {
                position: 'bottom-right',
            });
        }
    };

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            await userService.deleteUser(userId);
            toast.success('Usuario eliminado exitosamente', {
                position: 'bottom-right',
            });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al eliminar usuario', {
                position: 'bottom-right',
            });
        }
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-secondary-900">Usuarios</h1>
                <p className="text-secondary-600 mt-1">Gestiona los usuarios del sistema</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Total Usuarios</p>
                            <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <FaUsers className="text-2xl text-primary-700" />
                        </div>
                    </div>
                </Card>

                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Administradores</p>
                            <p className="text-2xl font-bold text-primary-700">{stats.admins}</p>
                        </div>
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <FaUserShield className="text-2xl text-primary-700" />
                        </div>
                    </div>
                </Card>

                <Card padding="sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-secondary-600">Usuarios Regulares</p>
                            <p className="text-2xl font-bold text-secondary-700">{stats.users}</p>
                        </div>
                        <div className="p-3 bg-secondary-100 rounded-lg">
                            <FaUsers className="text-2xl text-secondary-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabla de Usuarios */}
            <Card>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                        <FaUsers className="mx-auto text-6xl text-secondary-300 mb-4" />
                        <h2 className="text-xl font-semibold text-secondary-900 mb-2">
                            No hay usuarios registrados
                        </h2>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Rol
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Fecha Registro
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-200">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="font-medium text-secondary-900">{user.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-secondary-700">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-secondary-600">{user.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
                                                {user.role === 'admin' ? (
                                                    <>
                                                        <FaUserShield className="inline mr-1" />
                                                        Admin
                                                    </>
                                                ) : (
                                                    'Usuario'
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-secondary-600">
                                                <FaCalendar className="mr-2 text-secondary-400" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant={user.role === 'admin' ? 'outline' : 'primary'}
                                                    size="sm"
                                                    onClick={() => handleChangeRole(user._id, user.role, user.name)}
                                                >
                                                    {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(user._id, user.name)}
                                                    className="p-2 text-danger-700 hover:bg-danger-50 rounded-lg transition-colors"
                                                    title="Eliminar usuario"
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

export default AdminUsersPage;
