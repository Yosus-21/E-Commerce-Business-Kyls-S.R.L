import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFileInvoice,
    FaMoneyBillWave,
    FaBoxOpen,
    FaUserTie,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card } from '../../components/common';
import { getDashboardStats } from '../../services/quoteService';
import { toast } from 'react-toastify';

// Colores para gráficos
const COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#ea580c', '#ca8a04'];

/**
 * AdminDashboard Component
 * Dashboard BI enfocado en cotizaciones y análisis de datos
 */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Fetch dashboard stats
    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error('Error al cargar estadísticas del dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Calcular tasa de conversión
    const getConversionRate = () => {
        if (!stats?.monthly) return '0%';
        const total = stats.monthly.totalQuotes;
        const closed = stats.monthly.closedQuotes;
        if (total === 0) return '0%';
        return ((closed / total) * 100).toFixed(1) + '%';
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-secondary-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-secondary-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // KPI Cards Data
    const kpiCards = [
        {
            title: 'Cotizaciones del Mes',
            value: stats?.monthly?.totalQuotes || 0,
            icon: FaFileInvoice,
            color: 'primary',
            bgColor: 'bg-primary-100',
            textColor: 'text-primary-700',
            subtitle: `${stats?.monthly?.generatedQuotes || 0} generadas`,
        },
        {
            title: 'Oportunidad de Venta',
            value: `Bs. ${(stats?.monthly?.totalValue || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`,
            icon: FaMoneyBillWave,
            color: 'success',
            bgColor: 'bg-success-100',
            textColor: 'text-success-700',
            subtitle: 'Valor total cotizado',
        },
        {
            title: 'Productos Únicos',
            value: stats?.uniqueProducts || 0,
            icon: FaBoxOpen,
            color: 'purple',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-700',
            subtitle: 'Productos cotizados',
        },
        {
            title: 'Tasa de Conversión',
            value: getConversionRate(),
            icon: FaUserTie,
            color: 'warning',
            bgColor: 'bg-warning-100',
            textColor: 'text-warning-700',
            subtitle: `${stats?.monthly?.closedQuotes || 0} cerradas`,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        Dashboard de Cotizaciones
                    </h1>
                    <p className="text-secondary-600 mt-2">
                        Análisis de datos y métricas de negocio
                    </p>
                </div>
                <button
                    onClick={fetchDashboardStats}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    Actualizar Datos
                </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiCards.map((stat, index) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                {/* Contenido */}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-secondary-600 mb-2">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-secondary-900 mb-3">
                                        {stat.value}
                                    </p>
                                    <p className="text-xs text-secondary-500">
                                        {stat.subtitle}
                                    </p>
                                </div>

                                {/* Ícono */}
                                <div className={`
                                    ${stat.bgColor} ${stat.textColor}
                                    w-14 h-14 rounded-xl flex items-center justify-center
                                `}>
                                    <Icon size={28} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Top 5 Productos Más Cotizados */}
                <Card>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Top 5 Productos Más Cotizados
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats?.topProducts || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalQuantity" fill="#7c3aed" name="Cantidad Cotizada" />
                        </BarChart>
                    </ResponsiveContainer>
                    {(!stats?.topProducts || stats.topProducts.length === 0) && (
                        <div className="text-center py-8 text-secondary-500">
                            No hay datos de productos cotizados
                        </div>
                    )}
                </Card>

                {/* Distribución por Categorías */}
                <Card>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Distribución por Categorías
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.categoryDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {(stats?.categoryDistribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {(!stats?.categoryDistribution || stats.categoryDistribution.length === 0) && (
                        <div className="text-center py-8 text-secondary-500">
                            No hay datos de categorías
                        </div>
                    )}
                </Card>
            </div>

            {/* Tendencia de Cotizaciones (últimos 30 días) */}
            <Card>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Tendencia de Cotizaciones (Últimos 30 Días)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats?.quoteTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="_id"
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#7c3aed"
                            strokeWidth={2}
                            name="Cotizaciones"
                        />
                    </LineChart>
                </ResponsiveContainer>
                {(!stats?.quoteTrend || stats.quoteTrend.length === 0) && (
                    <div className="text-center py-8 text-secondary-500">
                        No hay datos de tendencias
                    </div>
                )}
            </Card>

            {/* Top Clientes y Acciones Rápidas */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Top Clientes (Hot Leads) */}
                <Card>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center">
                        <span className="mr-2">🔥</span>
                        Top Clientes Interesados
                    </h3>
                    <div className="space-y-3">
                        {stats?.topClients && stats.topClients.length > 0 ? (
                            stats.topClients.map((client, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-secondary-900">
                                            {client.name}
                                        </p>
                                        <p className="text-xs text-secondary-600">
                                            {client.email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary-600">
                                            {client.quoteCount}
                                        </p>
                                        <p className="text-xs text-secondary-500">
                                            cotizaciones
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-secondary-500">
                                No hay datos de clientes
                            </div>
                        )}
                    </div>
                </Card>

                {/* Acciones Rápidas */}
                <Card>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Acciones Rápidas
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/quotes')}
                            className="w-full flex items-center px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group cursor-pointer"
                        >
                            <FaFileInvoice className="text-primary-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                            <div className="text-left flex-1">
                                <p className="text-sm font-medium text-secondary-900">
                                    Ver Cotizaciones
                                </p>
                                <p className="text-xs text-secondary-600">
                                    Gestiona todas las cotizaciones
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/products/new')}
                            className="w-full flex items-center px-4 py-3 bg-success-50 hover:bg-success-100 rounded-lg transition-colors group cursor-pointer"
                        >
                            <FaBoxOpen className="text-success-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                            <div className="text-left flex-1">
                                <p className="text-sm font-medium text-secondary-900">
                                    Agregar Producto
                                </p>
                                <p className="text-xs text-secondary-600">
                                    Añadir nuevo producto al catálogo
                                </p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full flex items-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group cursor-pointer"
                        >
                            <FaUserTie className="text-purple-600 mr-3 group-hover:scale-110 transition-transform" size={20} />
                            <div className="text-left flex-1">
                                <p className="text-sm font-medium text-secondary-900">
                                    Ver Clientes
                                </p>
                                <p className="text-xs text-secondary-600">
                                    Administrar base de clientes
                                </p>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>

            {/* Estado de Cotizaciones */}
            <Card className="bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white text-2xl">📊</span>
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                            Resumen del Mes
                        </h3>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                                <p className="text-xs text-secondary-600">Generadas</p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {stats?.monthly?.generatedQuotes || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-secondary-600">Contactadas</p>
                                <p className="text-2xl font-bold text-warning-600">
                                    {stats?.monthly?.contactedQuotes || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-secondary-600">Cerradas</p>
                                <p className="text-2xl font-bold text-success-600">
                                    {stats?.monthly?.closedQuotes || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
