import { useState, useEffect } from 'react';
import { FaFilePdf, FaDownload, FaBoxOpen, FaConciergeBell, FaLayerGroup } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Button, LoadingSpinner, Card } from '../../components/common';
import reportService from '../../services/reportService';
import * as brandService from '../../services/brandService';

const CatalogPage = () => {
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(true);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const response = await brandService.getAllBrands();
            if (response.success) {
                setBrands(response.data);
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoadingBrands(false);
        }
    };

    const handleDownload = async (type, brandId = null, title = 'Catálogo') => {
        try {
            setLoading(true);
            toast.info(`Generando ${title}, por favor espere...`, { autoClose: 2000 });

            await reportService.downloadCatalog(type, brandId);

            toast.success('¡Descarga iniciada exitosamente!');
        } catch (error) {
            console.error('Error downloading catalog:', error);
            toast.error('Error al descargar el catálogo. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
                        Catálogo Digital
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Descarga nuestros catálogos actualizados en formato PDF para consultarlos sin conexión.
                    </p>
                </div>

                {/* Main Catalogs */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <FaFilePdf className="mr-3 text-red-600" />
                        Catálogos Generales
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Catálogo Completo */}
                        <Card className="p-8 text-center hover:shadow-xl transition-shadow border-t-4 border-primary-600">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaLayerGroup className="text-3xl text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Catálogo Completo</h3>
                            <p className="text-gray-500 mb-6">Todos nuestros productos y servicios en un solo documento.</p>
                            <Button
                                onClick={() => handleDownload('all', null, 'Catálogo Completo')}
                                isLoading={loading}
                                fullWidth
                                className="flex items-center justify-center gap-2"
                            >
                                <FaDownload /> Descargar PDF
                            </Button>
                        </Card>

                        {/* Solo Productos */}
                        <Card className="p-8 text-center hover:shadow-xl transition-shadow border-t-4 border-secondary-600">
                            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaBoxOpen className="text-3xl text-secondary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Solo Productos</h3>
                            <p className="text-gray-500 mb-6">Lista detallada de equipos, accesorios y hardware disponible.</p>
                            <Button
                                variant="secondary"
                                onClick={() => handleDownload('products', null, 'Catálogo de Productos')}
                                isLoading={loading}
                                fullWidth
                                className="flex items-center justify-center gap-2"
                            >
                                <FaDownload /> Descargar PDF
                            </Button>
                        </Card>

                        {/* Solo Servicios */}
                        <Card className="p-8 text-center hover:shadow-xl transition-shadow border-t-4 border-accent-600">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaConciergeBell className="text-3xl text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Solo Servicios</h3>
                            <p className="text-gray-500 mb-6">Nuestras soluciones tecnológicas y servicios empresariales.</p>
                            <Button
                                variant="outline"
                                onClick={() => handleDownload('services', null, 'Catálogo de Servicios')}
                                isLoading={loading}
                                fullWidth
                                className="flex items-center justify-center gap-2"
                            >
                                <FaDownload /> Descargar PDF
                            </Button>
                        </Card>
                    </div>
                </section>

                {/* Brand Catalogs */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <FaLayerGroup className="mr-3 text-secondary-600" />
                        Descargar por Marca
                    </h2>

                    {loadingBrands ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {brands.map((brand) => (
                                <div key={brand._id} className="bg-white rounded-lg shadow-sm hover:shadow-md p-4 transition-all flex flex-col items-center text-center border border-gray-100">
                                    <div className="h-16 w-full flex items-center justify-center mb-4">
                                        {brand.image ? (
                                            <img
                                                src={`${(import.meta.env.VITE_API_URL).replace('/api', '')}${brand.image}`}
                                                alt={brand.name}
                                                className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className={`${brand.image ? 'hidden' : 'flex'} w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 items-center justify-center`}>
                                            <span className="text-xl font-bold text-purple-600">
                                                {brand.name[0]}
                                            </span>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-3">{brand.name}</h4>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDownload('products', brand._id, `Catálogo ${brand.name}`)}
                                        isLoading={loading}
                                        className="w-full text-xs"
                                    >
                                        <FaDownload className="mr-1" /> Descargar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CatalogPage;
