import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { Card, Button, LoadingSpinner } from '../../components/common';
import { useCart } from '../../context/CartContext';
import { getProductImage } from '../../utils/imageHelper';
import { toast } from 'react-toastify';

/**
 * CartPage Component
 * Página completa del carrito de compras
 */
const CartPage = () => {
    const navigate = useNavigate();
    const { cart, loading, error, updateQuantity, removeItem } = useCart();

    // ✅ DEBUG LOG - Para identificar problemas


    // ==============================================
    // MANEJO DE CANTIDAD
    // ==============================================
    const handleUpdateQuantity = async (itemId, currentQuantity, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await updateQuantity(itemId, newQuantity);
            toast.success('Cantidad actualizada', {
                position: 'bottom-right',
                autoClose: 1500,
            });
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error(error.message || 'Error al actualizar cantidad', {
                position: 'bottom-right',
            });
        }
    };

    // ==============================================
    // MANEJO DE ELIMINACIÓN
    // ==============================================
    const handleRemove = async (itemId, productName) => {
        const confirmed = window.confirm(`¿Eliminar "${productName}" del carrito?`);
        if (!confirmed) return;

        try {
            await removeItem(itemId);
            toast.success(`${productName} eliminado del carrito`, {
                position: 'bottom-right',
            });
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error(error.message || 'Error al eliminar producto', {
                position: 'bottom-right',
            });
        }
    };

    // ==============================================
    // ESTADO 1: CARGANDO
    // ==============================================
    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <LoadingSpinner message="Cargando carrito..." />
            </div>
        );
    }

    // ==============================================
    // ESTADO 2: ERROR
    // ==============================================
    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-8">
                    Cotización de Productos
                </h1>

                <Card>
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <div className="mx-auto text-6xl text-danger-500">⚠️</div>
                        </div>
                        <h2 className="text-2xl font-semibold text-secondary-900 mb-3">
                            Error al cargar el carrito
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            {error}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                            >
                                Reintentar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/products')}
                            >
                                Volver a la Tienda
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // ==============================================
    // ESTADO 3: CARRITO NULL O SIN ITEMS
    // ==============================================
    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-8">
                    Cotización de Productos
                </h1>

                <Card>
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <FaShoppingCart className="mx-auto text-8xl text-secondary-300" />
                        </div>
                        <h2 className="text-2xl font-semibold text-secondary-900 mb-3">
                            Tu cotización está vacía
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Parece que aún no has agregado productos a tu cotización.
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/products')}
                        >
                            Explorar Productos
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ==============================================
    // CÁLCULOS
    // ==============================================
    const totalItems = cart.itemCount || cart.items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.totalAmount || cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Calcular envío (ejemplo: 30 Bs o gratis si gasta más de 500)
    const shippingCost = totalPrice >= 500 ? 0 : 30;
    const finalTotal = totalPrice + shippingCost;

    // ==============================================
    // ESTADO 4: CARRITO CON PRODUCTOS
    // ==============================================
    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-secondary-900">
                        Cotización de Productos
                    </h1>
                    <p className="text-secondary-600 mt-2">
                        {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu cotizaci\u00f3n
                    </p>
                </div>

                {/* Layout de 2 columnas */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda - Lista de Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map((item) => {
                            // Obtener ID del item (puede ser _id o id)
                            const itemId = item._id || item.id;
                            const product = item.product;
                            const productId = product._id || product.id;

                            return (
                                <Card key={itemId} hoverable>
                                    <div className="flex flex-col sm:flex-row gap-4">

                                        {/* Imagen del Producto */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={getProductImage(product.images?.[0])}
                                                alt={product.name}
                                                className="w-full sm:w-32 h-32 object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Información del Producto */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-secondary-900 mb-1 truncate">
                                                {product.name}
                                            </h3>
                                            {product.brand && (
                                                <p className="text-sm text-secondary-500 mb-2">
                                                    Marca: {product.brand}
                                                </p>
                                            )}
                                            <p className="text-lg font-bold text-primary-700">
                                                Bs. {item.price?.toFixed(2)}
                                            </p>
                                            <p className="text-sm text-secondary-600 mt-1">
                                                Subtotal: Bs. {(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Controles */}
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">

                                            {/* Control de Cantidad */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className={`
                                                        w-8 h-8 rounded-lg flex items-center justify-center
                                                        border transition-colors
                                                        ${item.quantity <= 1
                                                            ? 'border-secondary-200 text-secondary-400 cursor-not-allowed'
                                                            : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                                                        }
                                                    `}
                                                    aria-label="Disminuir cantidad"
                                                >
                                                    <FaMinus size={12} />
                                                </button>

                                                <span className="text-lg font-semibold text-secondary-900 min-w-[2rem] text-center">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => handleUpdateQuantity(itemId, item.quantity, item.quantity + 1)}
                                                    disabled={item.quantity >= (product.stock || 99)}
                                                    className={`
                                                        w-8 h-8 rounded-lg flex items-center justify-center
                                                        border transition-colors
                                                        ${item.quantity >= (product.stock || 99)
                                                            ? 'border-secondary-200 text-secondary-400 cursor-not-allowed'
                                                            : 'border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-500'
                                                        }
                                                    `}
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <FaPlus size={12} />
                                                </button>
                                            </div>

                                            {/* Botón Eliminar */}
                                            <button
                                                onClick={() => handleRemove(itemId, product.name)}
                                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-danger-700 hover:text-danger-900 hover:bg-danger-50 rounded-lg transition-colors"
                                                aria-label="Eliminar producto"
                                            >
                                                <FaTrash className="mr-2" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Columna Derecha - Resumen */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-4">
                            <Card>
                                <h2 className="text-xl font-semibold text-secondary-900 mb-6">
                                    Resumen del Pedido
                                </h2>

                                {/* Desglose */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary-700">
                                            Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                                        </span>
                                        <span className="font-semibold text-secondary-900">
                                            Bs. {totalPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-secondary-700">Costo de Envío</span>
                                        <span className="font-semibold text-secondary-900">
                                            {shippingCost === 0 ? (
                                                <span className="text-success-600">¡Gratis!</span>
                                            ) : (
                                                `Bs. ${shippingCost.toFixed(2)}`
                                            )}
                                        </span>
                                    </div>

                                    {totalPrice < 500 && totalPrice > 0 && (
                                        <div className="text-xs text-secondary-600 bg-primary-50 border border-primary-200 rounded-lg p-3">
                                            💡 <strong>¡Envío gratis</strong> en compras mayores a Bs. 500
                                        </div>
                                    )}

                                    <div className="border-t border-secondary-200 pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-secondary-900">
                                                Total
                                            </span>
                                            <span className="text-2xl font-bold text-primary-700">
                                                Bs. {finalTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Generar Cotización */}
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={() => navigate('/quotation')}
                                >
                                    Generar Cotización
                                </Button>

                                {/* Botón Continuar Explorando */}
                                <Button
                                    variant="outline"
                                    size="md"
                                    fullWidth
                                    onClick={() => navigate('/products')}
                                    className="mt-3"
                                >
                                    Continuar Explorando
                                </Button>

                                {/* Información Adicional */}
                                <div className="mt-6 pt-6 border-t border-secondary-200">
                                    <h3 className="text-sm font-semibold text-secondary-900 mb-3">
                                        ¿Necesitas ayuda?
                                    </h3>
                                    <ul className="text-xs text-secondary-600 space-y-2">
                                        <li>✅ Cotización sin compromiso</li>
                                        <li>✅ Descarga inmediata en PDF</li>
                                        <li>✅ Válida por 30 días</li>
                                        <li>✅ Sin necesidad de pago</li>
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
