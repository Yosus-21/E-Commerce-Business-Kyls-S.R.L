import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaStar, FaTimes, FaTh } from 'react-icons/fa';
import { ProductCard } from '../../components/products';
import { LoadingOverlay, Card } from '../../components/common';
import * as productService from '../../services/productService';
import * as brandService from '../../services/brandService';
import * as categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

/**
 * ProductsPage Component
 * Catálogo de productos con filtros de búsqueda y marcas
 */
const ProductsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Cargar marcas y categorías
    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, []);

    // Leer filtros desde URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const brandParam = params.get('brand');
        const categoryParam = params.get('category');
        if (brandParam) {
            setSelectedBrand(brandParam);
        }
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [location.search]);

    // Cargar productos cuando cambian los filtros
    useEffect(() => {
        fetchProducts();
    }, [selectedBrand, selectedCategory, searchTerm]);

    const fetchBrands = async () => {
        try {
            const response = await brandService.getAllBrands();
            setBrands(response.data || []);
        } catch (error) {
            console.error('Error al cargar marcas:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories();
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = {
                limit: 50,
            };

            if (searchTerm) params.search = searchTerm;
            if (selectedBrand) params.brand = selectedBrand;
            if (selectedCategory) params.category = selectedCategory;

            const response = await productService.getProducts(params);
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

    // Manejar cambio en búsqueda con delay
    useEffect(() => {
        const timer = setTimeout(() => {
            // La búsqueda se actualiza automáticamente por el useEffect de fetchProducts
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleBrandFilter = (brandId) => {
        setSelectedBrand(brandId);
        updateURL({ brand: brandId, category: selectedCategory });
    };

    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        updateURL({ brand: selectedBrand, category: categoryId });
    };

    const updateURL = ({ brand, category }) => {
        const params = new URLSearchParams();
        if (brand) params.set('brand', brand);
        if (category) params.set('category', category);
        const queryString = params.toString();
        navigate(queryString ? `/products?${queryString}` : '/products');
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedBrand('');
        setSelectedCategory('');
        navigate('/products');
    };

    const selectedBrandInfo = brands.find(b => b._id === selectedBrand);
    const selectedCategoryInfo = categories.find(c => c._id === selectedCategory);

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-heading font-bold text-secondary-900 mb-2">
                        Catálogo de Productos
                    </h1>
                    <p className="text-secondary-600">
                        Encuentra los mejores productos al mejor precio
                    </p>
                </div>

                {/* Layout con Sidebar y Contenido */}
                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Sidebar - Filtros */}
                    <aside className="lg:col-span-1">
                        <Card>
                            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                                Filtros
                            </h3>

                            {/* Búsqueda */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-secondary-700 mb-2">
                                    Buscar
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-secondary-400 text-sm" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 text-sm border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            {/* Filtro por Marca */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-secondary-800 mb-3 flex items-center gap-2">
                                    <FaStar className="text-primary-600" />
                                    Marcas
                                </h4>

                                {loadingBrands ? (
                                    <p className="text-sm text-secondary-500">Cargando marcas...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Todas las marcas */}
                                        <label className="flex items-center cursor-pointer hover:bg-secondary-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="brand"
                                                checked={!selectedBrand}
                                                onChange={() => handleBrandFilter('')}
                                                className="mr-2 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-secondary-700">
                                                Todas las marcas
                                            </span>
                                        </label>

                                        {/* Lista de marcas */}
                                        {brands.map((brand) => (
                                            <label
                                                key={brand._id}
                                                className="flex items-center cursor-pointer hover:bg-secondary-50 p-2 rounded-lg transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="brand"
                                                    checked={selectedBrand === brand._id}
                                                    onChange={() => handleBrandFilter(brand._id)}
                                                    className="mr-2 text-primary-600 focus:ring-primary-500"
                                                />
                                                {brand.image && (
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}${brand.image}`}
                                                        alt={brand.name}
                                                        className="w-6 h-6 object-contain mr-2"
                                                    />
                                                )}
                                                <span className="text-sm text-secondary-700">
                                                    {brand.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Filtro por Categorías */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-secondary-800 mb-3 flex items-center gap-2">
                                    <FaTh className="text-primary-600" />
                                    Categorías
                                </h4>

                                {loadingCategories ? (
                                    <p className="text-sm text-secondary-500">Cargando categorías...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Todas las categorías */}
                                        <label className="flex items-center cursor-pointer hover:bg-secondary-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={!selectedCategory}
                                                onChange={() => handleCategoryFilter('')}
                                                className="mr-2 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm text-secondary-700">
                                                Todas las categorías
                                            </span>
                                        </label>

                                        {/* Lista de categorías */}
                                        {categories.map((category) => (
                                            <label
                                                key={category._id}
                                                className="flex items-center cursor-pointer hover:bg-secondary-50 p-2 rounded-lg transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    checked={selectedCategory === category._id}
                                                    onChange={() => handleCategoryFilter(category._id)}
                                                    className="mr-2 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-sm text-secondary-700">
                                                    {category.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Botón limpiar filtros */}
                            {(searchTerm || selectedBrand || selectedCategory) && (
                                <button
                                    onClick={handleClearFilters}
                                    className="w-full py-2 px-4 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <FaTimes />
                                    Limpiar Filtros
                                </button>
                            )}
                        </Card>
                    </aside>

                    {/* Contenido Principal */}
                    <div className="lg:col-span-3">

                        {/* Filtros activos */}
                        {(searchTerm || selectedBrand || selectedCategory) && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {searchTerm && (
                                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        <span>Búsqueda: "{searchTerm}"</span>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="hover:text-primary-900"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                                {selectedBrand && selectedBrandInfo && (
                                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        <span>Marca: {selectedBrandInfo.name}</span>
                                        <button
                                            onClick={() => handleBrandFilter('')}
                                            className="hover:text-primary-900"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                                {selectedCategory && selectedCategoryInfo && (
                                    <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                        <span>Categoría: {selectedCategoryInfo.name}</span>
                                        <button
                                            onClick={() => handleCategoryFilter('')}
                                            className="hover:text-primary-900"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Estado de carga */}
                        {loading && (
                            <LoadingOverlay message="Cargando productos..." />
                        )}

                        {/* Grid de productos */}
                        {!loading && products.length > 0 && (
                            <div>
                                <div className="mb-4 text-secondary-600">
                                    {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sin resultados */}
                        {!loading && products.length === 0 && (
                            <div className="text-center py-12">
                                <Card className="p-12 max-w-md mx-auto">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-2xl font-semibold text-secondary-900 mb-2">
                                        No se encontraron productos
                                    </h3>
                                    <p className="text-secondary-600 mb-6">
                                        {searchTerm || selectedBrand
                                            ? 'Intenta ajustar los filtros'
                                            : 'No hay productos disponibles en este momento'
                                        }
                                    </p>
                                    {(searchTerm || selectedBrand) && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Limpiar todos los filtros
                                        </button>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
