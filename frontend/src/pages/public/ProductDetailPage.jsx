import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaMinus, FaPlus, FaArrowLeft, FaHome, FaChevronRight, FaCheck } from 'react-icons/fa';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import ProductCard from '../../components/products/ProductCard';
import { useCart } from '../../context/CartContext';
import * as productService from '../../services/productService';
import { getProductImage } from '../../utils/imageHelper';
import { toast } from 'react-toastify';

/**
 * ProductDetailPage Component
 * Página de detalle de producto con diseño profesional e-commerce
 * Includes: Breadcrumbs, Product Info, Features, Related Products
 */
const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Cargar producto
    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);


            const response = await productService.getProduct(id);



            // ✅ Backend retorna { success: true, data: { product: {...}, relatedProducts: [...] } }
            const productData = response.data?.product;
            const relatedData = response.data?.relatedProducts || [];



            if (!productData) {
                throw new Error('Producto no encontrado en la respuesta del servidor');
            }

            setProduct(productData);
            setRelatedProducts(relatedData);
        } catch (err) {
            console.error('❌ Error al cargar producto:', err);
            console.error('❌ Error response:', err.response?.data);
            setError(err.message || 'No se pudo cargar el producto');

            // Si es 404, redirigir después de mostrar el error
            if (err.message?.includes('404') || err.message?.includes('no encontrado')) {
                setTimeout(() => navigate('/products'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Incrementar cantidad
    const incrementQuantity = () => {
        if (product && quantity < product.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    // Decrementar cantidad
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Agregar al carrito
    const handleAddToCart = async () => {
        try {
            setAddingToCart(true);
            await addItem(product.id, quantity);
            toast.success(`${quantity} ${quantity === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`, {
                position: 'bottom-right',
                autoClose: 2000,
            });
            setQuantity(1); // Reset cantidad
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
            setAddingToCart(false);
        }
    };

    // Parsear descripción para features (detectar listas)
    const parseFeatures = (description) => {
        if (!description) return null;

        // Detectar si tiene formato de lista (- o *)
        const lines = description.split('\n').filter(line => line.trim());
        const hasListFormat = lines.some(line => line.trim().startsWith('-') || line.trim().startsWith('*'));

        if (hasListFormat) {
            // Renderizar como lista con checks
            return (
                <ul className="space-y-3">
                    {lines.map((line, index) => {
                        const text = line.replace(/^[-*]\s*/, '').trim();
                        if (!text) return null;

                        return (
                            <li key={index} className="flex items-start">
                                <FaCheck className="text-primary-600 mt-1 mr-3 flex-shrink-0" size={16} />
                                <span className="text-secondary-700 leading-relaxed">{text}</span>
                            </li>
                        );
                    })}
                </ul>
            );
        } else {
            // Renderizar como párrafos
            return (
                <div className="space-y-4">
                    {lines.map((line, index) => (
                        <p key={index} className="text-secondary-700 leading-relaxed">
                            {line}
                        </p>
                    ))}
                </div>
            );
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                        Producto no encontrado
                    </h2>
                    <p className="text-secondary-600 mb-6">
                        {error || 'El producto que buscas no existe o fue eliminado'}
                    </p>
                    <Button onClick={() => navigate('/products')}>
                        Volver al Catálogo
                    </Button>
                </Card>
            </div>
        );
    }

    // Imagen del producto
    const productImage = imgError
        ? 'https://via.placeholder.com/600x600/e2e8f0/64748b?text=Sin+Imagen'
        : getProductImage(product.images?.[0]);

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-6">

                {/* ========================================
                    BREADCRUMBS
                ======================================== */}
                <nav className="flex items-center text-sm text-secondary-600 mb-6">
                    <Link to="/" className="hover:text-primary-600 transition-colors flex items-center">
                        <FaHome className="mr-1" />
                        Inicio
                    </Link>
                    <FaChevronRight className="mx-2 text-secondary-400" size={12} />
                    <Link to="/products" className="hover:text-primary-600 transition-colors">
                        Productos
                    </Link>
                    <FaChevronRight className="mx-2 text-secondary-400" size={12} />
                    <span className="text-secondary-900 font-medium truncate max-w-xs">
                        {product.name}
                    </span>
                </nav>

                {/* ========================================
                    SECCIÓN PRINCIPAL: IMAGEN + INFO + COMPRA
                ======================================== */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">

                    {/* COLUMNA IZQUIERDA: Galería de Imágenes */}
                    <div className="space-y-4">
                        <Card padding={false} className="overflow-hidden bg-secondary-50">
                            <div className="relative">
                                <img
                                    src={productImage}
                                    alt={product.name}
                                    className="w-full h-auto object-contain max-h-[600px] p-8"
                                    onError={() => setImgError(true)}
                                />
                            </div>
                        </Card>

                        {/* Miniaturas de imágenes adicionales */}
                        {product.images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-secondary-50 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-500 transition-all cursor-pointer"
                                    >
                                        <img
                                            src={getProductImage(img)}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Información y Compra */}
                    <div className="space-y-6">

                        {/* Categoría Badge */}
                        <div>
                            <Badge variant="primary" size="lg">
                                {product.category?.name || 'Sin Categoría'}
                            </Badge>
                        </div>

                        {/* Título y Marca */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-3 leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-lg text-secondary-600">
                                Marca: <span className="font-semibold text-secondary-800">{product.brand?.name || (typeof product.brand === 'string' ? product.brand : 'Sin Marca')}</span>
                            </p>
                        </div>

                        {/* Precio - Principal CTA Visual */}
                        <div className="py-6 border-y-2 border-primary-100 bg-primary-50 -mx-6 px-6">
                            <div className="flex items-baseline space-x-2">
                                <span className="text-5xl lg:text-6xl font-bold text-primary-700">
                                    Bs. {product.price?.toFixed(2) || '0.00'}
                                </span>
                            </div>
                        </div>

                        {/* Stock Badge */}
                        <div>
                            {product.stock > 0 ? (
                                <div className="flex items-center space-x-3">
                                    <Badge variant="success" size="lg">
                                        ✓ En Stock
                                    </Badge>
                                    <span className="text-secondary-600 font-medium">
                                        {product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'}
                                    </span>
                                </div>
                            ) : (
                                <Badge variant="danger" size="lg">
                                    ✕ Agotado
                                </Badge>
                            )}
                        </div>

                        {/* Descripción breve (primeras 2 líneas) */}
                        {product.description && (
                            <div className="bg-secondary-50 p-5 rounded-lg">
                                <p className="text-secondary-700 leading-relaxed line-clamp-3">
                                    {product.description.split('\n')[0]}
                                </p>
                            </div>
                        )}

                        {/* Selector de Cantidad */}
                        {product.stock > 0 && (
                            <div className="bg-white border-2 border-secondary-200 rounded-lg p-5">
                                <label className="block text-sm font-semibold text-secondary-900 mb-3 uppercase tracking-wide">
                                    Cantidad
                                </label>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={decrementQuantity}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 rounded-lg border-2 border-secondary-300 flex items-center justify-center hover:bg-secondary-100 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaMinus className="text-secondary-700" />
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            if (value >= 1 && value <= product.stock) {
                                                setQuantity(value);
                                            }
                                        }}
                                        className="w-24 h-12 text-center border-2 border-secondary-300 rounded-lg font-bold text-xl text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all"
                                    />

                                    <button
                                        onClick={incrementQuantity}
                                        disabled={quantity >= product.stock}
                                        className="w-12 h-12 rounded-lg border-2 border-secondary-300 flex items-center justify-center hover:bg-secondary-100 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FaPlus className="text-secondary-700" />
                                    </button>
                                </div>
                                {quantity === product.stock && product.stock < 10 && (
                                    <p className="text-sm text-warning-600 mt-3 font-medium">
                                        ⚠️ Has alcanzado el stock máximo disponible
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Botón Principal: Agregar al Carrito - DESTACADO */}
                        <div className="pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || addingToCart}
                                isLoading={addingToCart}
                                className="text-xl py-5 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                            >
                                <FaShoppingCart className="mr-3" size={24} />
                                {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                            </Button>
                        </div>

                        {/* Garantías y Beneficios */}
                        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center text-secondary-700">
                                    <FaCheck className="text-success-600 mr-3" />
                                    <span className="font-medium">Envío a todo el país</span>
                                </div>
                                <div className="flex items-center text-secondary-700">
                                    <FaCheck className="text-success-600 mr-3" />
                                    <span className="font-medium">Garantía del vendedor</span>
                                </div>
                                <div className="flex items-center text-secondary-700">
                                    <FaCheck className="text-success-600 mr-3" />
                                    <span className="font-medium">Devoluciones aceptadas</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* ========================================
                    ESPECIFICACIONES Y CARACTERÍSTICAS
                ======================================== */}
                {/* ========================================
                    SOBRE EL PRODUCTO
                ======================================== */}
                {(product.longDescription || product.description) && (
                    <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12 md:py-16">
                        <div className="container mx-auto max-w-5xl">
                            <h2 className="text-3xl font-heading font-bold text-secondary-900 mb-8 text-left">
                                Sobre el producto
                            </h2>
                            <Card className="bg-white">
                                <div className="prose prose-lg max-w-none text-secondary-700 whitespace-pre-wrap">
                                    {product.longDescription || parseFeatures(product.description)}
                                </div>
                            </Card>
                        </div>
                    </section>
                )}

                {/* ========================================
                    PRODUCTOS RELACIONADOS
                ======================================== */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-heading font-bold text-secondary-900">
                                También te podría interesar
                            </h2>
                            <Link
                                to="/products"
                                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center transition-colors"
                            >
                                Ver todos
                                <FaChevronRight className="ml-2" size={14} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard
                                    key={relatedProduct.id || relatedProduct._id}
                                    product={relatedProduct}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Botón volver (al final, menos intrusivo) */}
                <div className="flex justify-center mt-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-secondary-600 hover:text-primary-600 font-medium transition-colors px-6 py-3 border border-secondary-300 rounded-lg hover:border-primary-500"
                    >
                        <FaArrowLeft className="mr-2" />
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
