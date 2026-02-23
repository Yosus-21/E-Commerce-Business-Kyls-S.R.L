import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaConciergeBell, FaWhatsapp, FaCheckCircle } from 'react-icons/fa';
import { Card, LoadingSpinner, SearchBar } from '../../components/common';
import * as serviceService from '../../services/serviceService';
import serviciosVideo from '../../assets/videos/video-serivicios.mp4';

/**
 * ServicesPage Component
 * Página pública de servicios con integración WhatsApp
 */
const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Número de WhatsApp (configurar según negocio)
    const WHATSAPP_NUMBER = '59177123456'; // Reemplazar con número real

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await serviceService.getAllServices();
            setServices(response.data || []);
        } catch (error) {
            console.error('Error al cargar servicios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppClick = (serviceName) => {
        const message = `Hola, me interesa el servicio: ${serviceName}`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Filtrado de servicios en tiempo real
    const filteredServices = useMemo(() => {
        if (!searchQuery.trim()) {
            return services;
        }

        const query = searchQuery.toLowerCase();
        return services.filter((service) =>
            service.title.toLowerCase().includes(query) ||
            (service.description && service.description.toLowerCase().includes(query))
        );
    }, [services, searchQuery]);

    return (
        <div className="min-h-screen bg-secondary-50">

            {/* Header con Video de Fondo */}
            <div className="relative py-24 overflow-hidden">
                {/* Video de Fondo */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src={serviciosVideo} type="video/mp4" />
                </video>

                {/* Overlay Oscuro */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/85 via-blue-900/75 to-indigo-900/85 z-10"></div>

                {/* Decoración adicional */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl z-10"></div>

                {/* Contenido */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
                    <span className="text-purple-300 font-semibold tracking-wider uppercase text-sm mb-2 block">
                        Soluciones Profesionales
                    </span>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-4 text-white">
                        Nuestros Servicios
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Potencia tu negocio con nuestra consultoría experta y tecnología de vanguardia.
                    </p>
                    <div className="h-1 w-20 bg-gradient-to-r from-purple-300 to-indigo-300 mx-auto rounded-full mt-6"></div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Buscador */}
                {!loading && services.length > 0 && (
                    <div className="mb-8">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Buscar servicios por nombre o descripción..."
                            className="max-w-2xl mx-auto"
                        />

                        {/* Contador de resultados */}
                        {searchQuery && (
                            <p className="text-center mt-4 text-slate-600">
                                {filteredServices.length === 0 ? (
                                    <span className="text-amber-600 font-medium">No se encontraron servicios</span>
                                ) : (
                                    <>
                                        Mostrando <span className="font-semibold text-purple-600">{filteredServices.length}</span>
                                        {' '}de {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="py-20">
                        <LoadingSpinner />
                    </div>
                ) : services.length === 0 ? (
                    <Card className="text-center py-12">
                        <FaConciergeBell className="text-6xl text-secondary-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            No hay servicios disponibles
                        </h3>
                        <p className="text-secondary-600">
                            Pronto agregaremos nuevos servicios
                        </p>
                    </Card>
                ) : filteredServices.length === 0 ? (
                    <Card className="text-center py-12">
                        <FaConciergeBell className="text-6xl text-amber-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                            No se encontraron resultados para "{searchQuery}"
                        </h3>
                        <p className="text-secondary-600 mb-4">
                            Intenta con otros términos de búsqueda
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Limpiar búsqueda
                        </button>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredServices.map((service) => (
                                <Card key={service._id} hoverable className="flex flex-col overflow-hidden group">

                                    {/* Link wrapper para toda la card excepto botones */}
                                    <div className="relative">

                                        {/* Imagen */}
                                        {service.image ? (
                                            <Link to={`/services/${service._id}`} className="block overflow-hidden cursor-pointer">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${service.image}`}
                                                    alt={service.title}
                                                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </Link>
                                        ) : (
                                            <Link to={`/services/${service._id}`} className="block w-full h-56 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center cursor-pointer">
                                                <FaConciergeBell className="text-6xl text-primary-600" />
                                            </Link>
                                        )}

                                        {/* Contenido */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <Link to={`/services/${service._id}`} className="hover:text-primary-600 transition-colors">
                                                <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                                                    {service.title}
                                                </h3>
                                            </Link>

                                            <p className="text-secondary-600 mb-4 flex-1 line-clamp-3">
                                                {service.description}
                                            </p>

                                            {/* Características */}
                                            {service.features && service.features.length > 0 && (
                                                <div className="mb-4">
                                                    <ul className="space-y-2">
                                                        {service.features.slice(0, 3).map((feature, index) => (
                                                            <li key={index} className="flex items-start text-sm text-secondary-700">
                                                                <FaCheckCircle className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                                <span className="truncate">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Precio */}
                                            {service.price && (
                                                <div className="mb-4">
                                                    <p className="text-2xl font-bold text-primary-600">
                                                        {service.price}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <Link
                                                    to={`/services/${service._id}`}
                                                    className="col-span-1 border border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors text-center text-sm flex items-center justify-center"
                                                >
                                                    Ver Detalles
                                                </Link>
                                                <button
                                                    onClick={() => handleWhatsAppClick(service.title)}
                                                    className="col-span-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center text-sm gap-1"
                                                >
                                                    <FaWhatsapp className="text-lg" />
                                                    Cotizar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* CTA Section */}
                        <div className="mt-16 bg-primary-600 rounded-2xl p-8 sm:p-12 text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">
                                ¿No encuentras lo que buscas?
                            </h2>
                            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
                                Contáctanos directamente y te ayudaremos a encontrar la solución perfecta para tu negocio
                            </p>
                            <button
                                onClick={() => handleWhatsAppClick('Consulta personalizada')}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
                            >
                                <FaWhatsapp className="text-xl" />
                                Contactar por WhatsApp
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
