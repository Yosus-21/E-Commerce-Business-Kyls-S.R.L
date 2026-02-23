import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaStar, FaTags, FaConciergeBell, FaArrowRight, FaRocket, FaLightbulb } from 'react-icons/fa';
import { Hero, Features } from '../../components/home';
import { LoadingSpinner, Card } from '../../components/common';
import ProductCard from '../../components/products/ProductCard';
import * as productService from '../../services/productService';
import * as brandService from '../../services/brandService';
import * as serviceService from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';
import { getProductImage } from '../../utils/imageHelper';

/**
 * HomePage Component
 * Página principal renovada con diseño Premium
 */
const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Estados para las secciones
    const [brands, setBrands] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [discountedProducts, setDiscountedProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState({
        brands: true,
        featured: true,
        offers: true,
        services: true,
    });

    // Cargar datos al montar
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        // Marcas
        try {
            const brandsData = await brandService.getAllBrands();
            setBrands(brandsData.data || []);
        } catch (error) {
            console.error('Error loading brands:', error);
        } finally {
            setLoading(prev => ({ ...prev, brands: false }));
        }

        // Productos destacados
        try {
            const featuredData = await productService.getProducts({ isFeatured: true, limit: 8 });
            setFeaturedProducts(featuredData.data?.products || featuredData.data || []);
        } catch (error) {
            console.error('Error loading featured products:', error);
        } finally {
            setLoading(prev => ({ ...prev, featured: false }));
        }

        // Productos con descuento
        try {
            const allProductsData = await productService.getProducts({ limit: 20 });
            const allProducts = allProductsData.data?.products || allProductsData.data || [];
            const withDiscounts = allProducts.filter(p => p.discountPercentage > 0);
            setDiscountedProducts(withDiscounts.slice(0, 8));
        } catch (error) {
            console.error('Error loading discounted products:', error);
        } finally {
            setLoading(prev => ({ ...prev, offers: false }));
        }

        // Servicios
        try {
            const servicesData = await serviceService.getAllServices({ limit: 3 });
            setServices(servicesData.data || []);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(prev => ({ ...prev, services: false }));
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <Hero />

            {/* Features (Beneficios) */}
            <Features />

            {/* Nuestras Marcas */}
            <section className="py-16 bg-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-heading font-bold mb-3 flex items-center justify-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                Nuestras Marcas
                            </span>
                        </h2>
                        <div className="h-1 w-16 bg-purple-200 mx-auto rounded-full"></div>
                    </div>

                    {loading.brands ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                            {brands.map((brand) => (
                                <Link
                                    key={brand._id}
                                    to={`/products?brand=${brand._id}`}
                                    className="flex justify-center p-4 hover:scale-110 transition-transform cursor-pointer"
                                >
                                    {brand.image ? (
                                        <img
                                            src={getProductImage(brand.image)}
                                            alt={brand.name}
                                            className="h-12 w-auto object-contain"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-gray-400">{brand.name}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Productos Destacados */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                    Productos Destacados
                                </span>
                            </h2>
                            <p className="text-slate-600">Lo mejor de nuestra tecnología para ti</p>
                        </div>
                        <Link to="/products" className="hidden sm:flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors">
                            Ver todo <FaArrowRight className="ml-2" />
                        </Link>
                    </div>

                    {loading.featured ? (
                        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Ofertas Especiales */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-3">
                            Ofertas Limitadas
                        </span>
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                Descuentos Especiales
                            </span>
                        </h2>
                    </div>
                    {loading.offers ? (
                        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {discountedProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Servicios Corporativos */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-heading font-bold mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                                Servicios Corporativos
                            </span>
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Soluciones profesionales para tu empresa</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {loading.services ? (
                            <div className="col-span-3 flex justify-center"><LoadingSpinner /></div>
                        ) : services.map(service => (
                            <div key={service._id} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-purple-500/10 transition-all duration-300 border border-slate-100 group">
                                <div className="mb-4 h-40 overflow-hidden rounded-xl bg-slate-100 relative">
                                    {service.image ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${service.image}`}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            <FaConciergeBell size={40} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">{service.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-3">{service.description}</p>
                                <Link to={`/services/${service._id}`} className="text-purple-600 font-medium hover:text-purple-700 text-sm inline-flex items-center">
                                    Mas información <FaArrowRight className="ml-2 text-xs" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
