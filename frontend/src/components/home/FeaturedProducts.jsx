import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { ProductCard } from '../products';
import { Button, LoadingSpinner } from '../common';
import * as productService from '../../services/productService';

/**
 * FeaturedProducts Component
 * Muestra productos destacados en la página de inicio
 */
const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                setLoading(true);

                // Obtener los primeros 4 productos
                const response = await productService.getProducts({
                    limit: 4,
                    page: 1,
                });

                setProducts(response.data?.products || response.data || []);
            } catch (error) {
                console.error('Error al cargar productos destacados:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <section className="py-16 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900 mb-2">
                            Productos Destacados
                        </h2>
                        <p className="text-lg text-secondary-600">
                            Los productos más populares de nuestra tienda
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => navigate('/products')}
                        className="mt-4 sm:mt-0"
                    >
                        Ver Todos
                        <FaArrowRight className="ml-2" />
                    </Button>
                </div>

                {/* Estado de carga */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {/* Grid de productos */}
                {!loading && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id || product._id} product={product} />
                        ))}
                    </div>
                )}

                {/* Sin productos */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-secondary-600 mb-4">
                            No hay productos destacados en este momento
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/products')}
                        >
                            Ver Catálogo Completo
                        </Button>
                    </div>
                )}

                {/* Skeletons mientras carga (alternativa más elegante) */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                            >
                                <div className="h-64 bg-secondary-200"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-secondary-200 rounded mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedProducts;
