import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Card, Button, Badge, LoadingOverlay } from '../../components/common';
import * as productService from '../../services/productService';
import { toast } from 'react-toastify';
import { getProductImage } from '../../utils/imageHelper';

/**
 * AdminProductsPage Component
 * Página de gestión de inventario de productos para administradores
 */
const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Cargar productos
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productService.getProducts();
            setProducts(response.data?.products || response.data || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            toast.error('Error al cargar productos', {
                position: 'bottom-right',
            });
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar producto
    const handleDelete = async (id, name) => {
        const confirmed = window.confirm(
            `¿Estás seguro de que deseas eliminar "${name}"?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmed) return;

        try {
            await productService.deleteProduct(id);

            toast.success('Producto eliminado exitosamente', {
                position: 'bottom-right',
            });

            // Actualizar lista
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            toast.error(error.message || 'Error al eliminar producto', {
                position: 'bottom-right',
            });
        }
    };

    // Obtener variante de badge según stock
    const getStockBadge = (stock) => {
        if (stock === 0) {
            return { variant: 'danger', label: 'Agotado' };
        } else if (stock < 5) {
            return { variant: 'warning', label: `Bajo: ${stock}` };
        } else {
            return { variant: 'success', label: `Stock: ${stock}` };
        }
    };

    // Estado de carga
    if (loading) {
        return <LoadingOverlay message="Cargando inventario..." />;
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        Inventario
                    </h1>
                    <p className="text-secondary-600 mt-2">
                        Gestiona el catálogo de productos de tu tienda
                    </p>
                </div>

                <Button
                    variant="primary"
                    onClick={() => navigate('/admin/products/new')}
                >
                    <FaPlus className="mr-2" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <p className="text-sm text-secondary-600 mb-1">Total Productos</p>
                    <p className="text-2xl font-bold text-secondary-900">{products.length}</p>
                </Card>
                <Card>
                    <p className="text-sm text-secondary-600 mb-1">Stock Bajo</p>
                    <p className="text-2xl font-bold text-warning-600">
                        {products.filter(p => p.stock > 0 && p.stock < 5).length}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-secondary-600 mb-1">Agotados</p>
                    <p className="text-2xl font-bold text-danger-600">
                        {products.filter(p => p.stock === 0).length}
                    </p>
                </Card>
            </div>

            {/* Tabla de Productos */}
            <Card padding={false}>
                {products.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-secondary-600 mb-4">
                            No hay productos en el inventario
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/admin/products/new')}
                        >
                            Crear Primer Producto
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50 border-b border-secondary-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {products.map((product) => {
                                    const stockBadge = getStockBadge(product.stock);

                                    return (
                                        <tr key={product.id} className="hover:bg-secondary-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={getProductImage(product.images?.[0])}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-secondary-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-secondary-500">
                                                            {product.brand?.name || 'Sin Marca'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm text-secondary-900">
                                                    {product.category?.name || 'Sin categoría'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-semibold text-secondary-900">
                                                    Bs. {product.price?.toFixed(2)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={stockBadge.variant}>
                                                    {stockBadge.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                                                    >
                                                        <FaEdit className="mr-1" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-danger-700 hover:text-danger-900 hover:bg-danger-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash className="mr-1" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminProductsPage;
