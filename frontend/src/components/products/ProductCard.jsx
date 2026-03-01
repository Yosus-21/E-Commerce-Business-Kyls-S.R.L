import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../common';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { getProductImage } from '../../utils/imageHelper';

/**
 * ProductCard Component
 * Tarjeta de producto con diseño Premium, hover effects y badges
 */
const ProductCard = ({ product }) => {
    const [loading, setLoading] = useState(false);
    const [imgError, setImgError] = useState(false);
    const { addItem } = useCart();

    // Imagen del producto o placeholder
    const productImage = imgError
        ? 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=Sin+Imagen'
        : getProductImage(product.images?.[0]);

    // Formatear precio
    const formattedPrice = typeof product.price === 'number'
        ? product.price.toFixed(2)
        : '0.00';

    // Manejar agregar al carrito
    const handleAddToCart = async () => {
        try {
            setLoading(true);
            await addItem(product.id, 1);
            toast.success(`${product.name} agregado al carrito`, {
                position: 'bottom-right',
                autoClose: 2000,
            });
        } catch (error) {
            if (error.message?.includes('iniciar sesión')) {
                toast.error('Debes iniciar sesión para agregar productos', {
                    position: 'bottom-right',
                });
            } else if (error.message?.toLowerCase().includes('stock')) {
                toast.warning('Stock insuficiente', {
                    position: 'bottom-right',
                });
            } else {
                toast.error('Error al agregar al carrito', {
                    position: 'bottom-right',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            className="flex flex-col h-full group hover:-translate-y-1 transition-all duration-300 border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/20 rounded-2xl overflow-hidden bg-white"
            noPadding
        >
            {/* Imagen Product */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 group">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />

                </Link>

                {/* Badge de categoría */}
                {product.category?.name && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="primary" rounded className="shadow-sm backdrop-blur-md bg-white/90 text-purple-700">
                            {product.category.name}
                        </Badge>
                    </div>
                )}

                {/* Badge de DESCUENTO */}
                {product.discountPercentage > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="danger" size="md" className="bg-red-600 text-white font-bold shadow-md">
                            -{product.discountPercentage}%
                        </Badge>
                    </div>
                )}

                {/* Badge de stock bajo */}
                {product.stock > 0 && product.stock < 5 && !product.discountPercentage && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="warning" size="sm" className="shadow-sm">
                            ¡Pocas unidades!
                        </Badge>
                    </div>
                )}

                {/* Badge de agotado */}
                {product.stock === 0 && (
                    <div className="absolute bottom-3 right-3">
                        <Badge variant="danger" size="sm" className="shadow-md">
                            Agotado
                        </Badge>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Nombre del producto */}
                <Link to={`/product/${product.id}`}>
                    <h3
                        className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2 min-h-[3.5rem] hover:text-purple-600 transition-colors cursor-pointer"
                        title={product.name}
                    >
                        {product.name}
                    </h3>
                </Link>

                {/* Descripción (truncada) */}
                {product.description && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2 flex-grow">
                        {product.description}
                    </p>
                )}

                {/* Precio con descuento */}
                <div className="mt-auto pt-2">
                    {product.discountPercentage > 0 ? (
                        <div className="flex flex-col gap-1 mb-4">
                            <span className="text-sm text-slate-400 line-through">
                                Bs. {formattedPrice}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-slate-900">
                                    Bs. {product.discountedPrice?.toFixed(2) || ((product.price * (1 - product.discountPercentage / 100)).toFixed(2))}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-slate-900">
                                Bs. {formattedPrice}
                            </span>
                        </div>
                    )}

                    {/* Botón agregar al carrito */}
                    <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        isLoading={loading}
                        disabled={loading || product.stock === 0}
                        onClick={handleAddToCart}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none shadow-md hover:shadow-lg transition-all"
                    >
                        {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default ProductCard;
