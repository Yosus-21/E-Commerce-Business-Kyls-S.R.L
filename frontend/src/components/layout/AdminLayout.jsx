import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    FaChartLine,
    FaBox,
    FaClipboardList,
    FaTags,
    FaStar,
    FaConciergeBell,
    FaUsers,
    FaImage,
    FaExternalLinkAlt,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaFileInvoice
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * Navegación del Sidebar
 */
const navItems = [
    {
        path: '/admin',
        label: 'Dashboard',
        icon: FaChartLine,
        exact: true,
    },
    {
        path: '/admin/products',
        label: 'Productos',
        icon: FaBox,
    },
    {
        path: '/admin/categories',
        label: 'Categorías',
        icon: FaTags,
    },
    {
        path: '/admin/brands',
        label: 'Marcas',
        icon: FaStar,
    },
    {
        path: '/admin/services',
        label: 'Servicios',
        icon: FaConciergeBell,
    },
    {
        path: '/admin/quotes',
        label: 'Cotizaciones',
        icon: FaFileInvoice,
    },
    {
        path: '/admin/users',
        label: 'Usuarios',
        icon: FaUsers,
    },
    {
        path: '/admin/hero-images',
        label: 'Imágenes Inicio',
        icon: FaImage,
    },
    {
        path: '/admin/partners',
        label: 'Experiencia',
        icon: FaStar,
    },
];

/**
 * AdminLayout Component
 * Layout del panel de administración con sidebar
 */
const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Sesión cerrada exitosamente', {
                position: 'bottom-right',
            });
            navigate('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión', {
                position: 'bottom-right',
            });
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">

            {/* Sidebar Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-secondary-900 text-white">
                <div className="flex flex-col flex-1 min-h-0">

                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 bg-secondary-800 border-b border-secondary-700">
                        <h1 className="text-2xl font-heading font-bold text-primary-400">
                            Kyla Admin
                        </h1>
                    </div>

                    {/* Navegación */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-primary-600 text-white'
                                            : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className="mr-3" size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            );
                        })}

                        {/* Ir a Tienda */}
                        <button
                            onClick={() => navigate('/')}
                            className="w-full flex items-center px-4 py-3 rounded-lg text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
                        >
                            <FaExternalLinkAlt className="mr-3" size={20} />
                            <span className="font-medium">Ir a Tienda</span>
                        </button>
                    </nav>

                    {/* Usuario y Logout */}
                    <div className="p-4 border-t border-secondary-700">
                        <div className="flex items-center mb-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center mr-3">
                                <span className="text-lg font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-secondary-400">Administrador</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 rounded-lg text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
                        >
                            <FaSignOutAlt className="mr-3" size={20} />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Sidebar Mobile (Overlay) */}
            {sidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>

                    {/* Sidebar */}
                    <aside className="fixed inset-y-0 left-0 w-64 bg-secondary-900 text-white z-50 lg:hidden transform transition-transform">
                        <div className="flex flex-col h-full">

                            {/* Header con botón cerrar */}
                            <div className="flex items-center justify-between h-16 px-6 bg-secondary-800 border-b border-secondary-700">
                                <h1 className="text-2xl font-heading font-bold text-primary-400">
                                    Kyla Admin
                                </h1>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="text-secondary-400 hover:text-white"
                                >
                                    <FaTimes size={24} />
                                </button>
                            </div>

                            {/* Navegación */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.exact}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) => `
                        flex items-center px-4 py-3 rounded-lg transition-colors
                        ${isActive
                                                    ? 'bg-primary-600 text-white'
                                                    : 'text-secondary-300 hover:bg-secondary-800 hover:text-white'
                                                }
                      `}
                                        >
                                            <Icon className="mr-3" size={20} />
                                            <span className="font-medium">{item.label}</span>
                                        </NavLink>
                                    );
                                })}

                                <button
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        navigate('/');
                                    }}
                                    className="w-full flex items-center px-4 py-3 rounded-lg text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
                                >
                                    <FaExternalLinkAlt className="mr-3" size={20} />
                                    <span className="font-medium">Ir a Tienda</span>
                                </button>
                            </nav>

                            {/* Usuario y Logout */}
                            <div className="p-4 border-t border-secondary-700">
                                <div className="flex items-center mb-3 px-2">
                                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center mr-3">
                                        <span className="text-lg font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user?.name}</p>
                                        <p className="text-xs text-secondary-400">Administrador</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-3 rounded-lg text-secondary-300 hover:bg-secondary-800 hover:text-white transition-colors"
                                >
                                    <FaSignOutAlt className="mr-3" size={20} />
                                    <span className="font-medium">Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </>
            )}

            {/* Área de Contenido */}
            <div className="lg:pl-64">

                {/* Header Superior */}
                <header className="sticky top-0 z-30 bg-white border-b border-secondary-200 shadow-sm">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

                        {/* Botón menú móvil */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-secondary-600 hover:text-secondary-900"
                        >
                            <FaBars size={24} />
                        </button>

                        {/* Título o Breadcrumb */}
                        <div className="flex-1 lg:ml-0 ml-4">
                            <h2 className="text-xl font-semibold text-secondary-900">
                                Panel de Administración
                            </h2>
                        </div>

                        {/* Info del admin (desktop) */}
                        <div className="hidden sm:flex items-center">
                            <span className="text-sm text-secondary-600 mr-2">
                                Hola, <span className="font-medium text-secondary-900">{user?.name}</span>
                            </span>
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Contenido Principal */}
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
