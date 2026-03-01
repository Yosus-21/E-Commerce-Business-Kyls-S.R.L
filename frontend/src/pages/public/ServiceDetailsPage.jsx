import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    FaHome,
    FaChevronRight,
    FaArrowLeft,
    FaWhatsapp,
    FaCheckCircle,
    FaConciergeBell,
    FaArrowRight
} from 'react-icons/fa';
import { Card, Button, LoadingSpinner } from '../../components/common';
import * as serviceService from '../../services/serviceService';

const ServiceDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imgError, setImgError] = useState(false);
    const [relatedServices, setRelatedServices] = useState([]);

    // Número de WhatsApp
    const WHATSAPP_NUMBER = '59170000000'; // Ajustar según config

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll al top al cambiar de servicio
        fetchServiceDetails();
        fetchRelatedServices();
    }, [id]);

    const fetchRelatedServices = async () => {
        try {
            const response = await serviceService.getAllServices();
            if (response.success && Array.isArray(response.data)) {
                // Filtrar el servicio actual y tomar máx 3
                const others = response.data.filter(s => s.id.toString() !== id).slice(0, 3);
                setRelatedServices(others);
            }
        } catch (error) {
            console.error('Error fetching related services:', error);
        }
    };

    const fetchServiceDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await serviceService.getService(id);
            if (response.success && response.data) {
                setService(response.data);
            } else {
                setError('No se pudo encontrar el servicio');
            }
        } catch (err) {
            console.error('Error al cargar servicio:', err);
            setError('Error al cargar la información del servicio');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppClick = () => {
        if (!service) return;
        const message = `Hola, estoy interesado en el servicio: ${service.title}`;
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Servicio no encontrado</h2>
                    <p className="text-secondary-600 mb-6">{error || 'El servicio no existe o fue eliminado'}</p>
                    <Button onClick={() => navigate('/services')}>Volver a Servicios</Button>
                </Card>
            </div>
        );
    }

    const serviceImage = (service.image && !imgError)
        ? `${import.meta.env.VITE_API_URL}${service.image}`
        : null;

    return (
        <div className="bg-secondary-50 min-h-screen py-8">
            <div className="container mx-auto px-4">

                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-secondary-600 mb-8">
                    <Link to="/" className="hover:text-primary-600 transition-colors flex items-center">
                        <FaHome className="mr-1" /> Inicio
                    </Link>
                    <FaChevronRight className="mx-2 text-secondary-400" size={12} />
                    <Link to="/services" className="hover:text-primary-600 transition-colors">
                        Servicios
                    </Link>
                    <FaChevronRight className="mx-2 text-secondary-400" size={12} />
                    <span className="text-secondary-900 font-medium truncate max-w-xs">{service.title}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-12">
                    <div className="grid md:grid-cols-2 gap-0">

                        {/* COLUMNA IZQUIERDA: IMAGEN */}
                        <div className="bg-secondary-100 relative min-h-[400px] md:min-h-full flex items-center justify-center">
                            {serviceImage ? (
                                <img
                                    src={serviceImage}
                                    alt={service.title}
                                    className="w-full h-full object-cover absolute inset-0"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <FaConciergeBell className="text-8xl text-secondary-300" />
                            )}
                        </div>

                        {/* COLUMNA DERECHA: INFO */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
                                {service.title}
                            </h1>

                            {service.price && (
                                <div className="mb-6">
                                    <span className="inline-block bg-primary-100 text-primary-700 font-bold px-4 py-2 rounded-lg text-xl">
                                        {service.price}
                                    </span>
                                </div>
                            )}

                            <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                                {service.description}
                            </p>

                            {/* Características */}
                            {service.features && service.features.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-secondary-900 uppercase tracking-wider mb-4">
                                        Características Principales
                                    </h3>
                                    <ul className="space-y-3">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <FaCheckCircle className="text-success-500 mt-1 mr-3 flex-shrink-0" />
                                                <span className="text-secondary-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* CTA */}
                            <div className="mt-auto pt-6">
                                <Button
                                    fullWidth
                                    size="lg"
                                    onClick={handleWhatsAppClick}
                                    className="bg-green-600 hover:bg-green-700 border-none shadow-lg hover:shadow-green-500/30 py-4 text-lg"
                                >
                                    <FaWhatsapp className="mr-2 text-2xl" />
                                    Cotizar este Servicio
                                </Button>
                                <p className="text-center text-xs text-secondary-400 mt-3">
                                    Te contactaremos vía WhatsApp para brindarte más información
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECCIÓN SOBRE EL SERVICIO (Long Description) */}
                {service.longDescription && (
                    <section className="mb-16">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-heading font-bold text-secondary-900 mb-8 text-center">
                                Sobre el Servicio
                            </h2>
                            <Card className="p-8 md:p-12 bg-white">
                                <div className="prose prose-lg max-w-none text-secondary-700 whitespace-pre-wrap">
                                    {service.longDescription}
                                </div>
                            </Card>
                        </div>
                    </section>
                )}

                {/* OTROS SERVICIOS DISPONIBLES */}
                {relatedServices.length > 0 && (
                    <section className="mt-16 pb-12 border-t border-secondary-200 pt-16">
                        <h2 className="text-2xl font-bold text-secondary-900 mb-8">
                            Otros servicios disponibles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedServices.map((related) => (
                                <Link key={related.id} to={`/services/${related.id}`} className="block group h-full">
                                    <Card hoverable className="h-full overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
                                        {related.image && (
                                            <div className="h-48 overflow-hidden bg-secondary-100">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${related.image}`}
                                                    alt={related.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        {!related.image && (
                                            <div className="h-48 bg-secondary-100 flex items-center justify-center">
                                                <FaConciergeBell className="text-5xl text-secondary-300" />
                                            </div>
                                        )}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                {related.title}
                                            </h3>
                                            <p className="text-secondary-600 text-sm mb-4 line-clamp-3 flex-1">
                                                {related.description}
                                            </p>
                                            <span className="text-primary-600 font-semibold text-sm flex items-center mt-auto">
                                                Ver Detalles <FaArrowRight className="ml-2 text-xs" />
                                            </span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default ServiceDetailsPage;
