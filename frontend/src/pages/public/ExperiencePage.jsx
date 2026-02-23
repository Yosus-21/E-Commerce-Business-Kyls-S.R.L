import { useState, useEffect } from 'react';
import { FaHandshake, FaBuilding } from 'react-icons/fa';
import * as partnerService from '../../services/partnerService';
import { LoadingSpinner } from '../../components/common';
import { getProductImage } from '../../utils/imageHelper';
import experienceVideo from '../../assets/videos/experience-bg.mp4';

/**
 * ExperiencePage Component
 * Muestra los logos de clientes/aliados que confían en Business Kyla SRL
 */
const ExperiencePage = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                setLoading(true);
                const response = await partnerService.getAllActive();
                setPartners(response.data);
            } catch (error) {
                console.error('Error al cargar aliados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    if (loading) {
        return <LoadingSpinner text="Cargando experiencia..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Hero Section with Video Background */}
            <section className="relative py-32 overflow-hidden text-white">
                {/* Video de Fondo */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src={experienceVideo} type="video/mp4" />
                </video>

                {/* Overlay Oscuro */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/70 to-purple-800/80 z-10"></div>

                {/* Contenido */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 shadow-2xl">
                        <FaHandshake className="text-4xl" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
                        Nuestra Experiencia
                    </h1>
                    <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto drop-shadow-lg">
                        Más de <span className="font-bold text-white">{partners.length} empresas</span> confían en Business Kyla SRL para sus soluciones tecnológicas
                    </p>
                </div>
            </section>

            {/* Partners Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Descripción */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                        <FaBuilding />
                        Empresas que confían en nosotros
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Nuestros Clientes y Aliados
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Orgullosos de trabajar con empresas líderes en diferentes sectores,
                        entregando soluciones tecnológicas de excelencia
                    </p>
                </div>

                {/* Grid de Logos */}
                {partners.length === 0 ? (
                    <div className="text-center py-20">
                        <FaBuilding className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">
                            Próximamente agregaremos nuestros aliados estratégicos
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {partners.map((partner) => (
                            <div
                                key={partner._id}
                                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-500 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                                title={partner.name}
                            >
                                <img
                                    src={getProductImage(partner.logo)}
                                    alt={partner.name}
                                    className="max-w-full max-h-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA Section */}
                <div className="mt-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        ¿Quieres ser parte de nuestra red?
                    </h3>
                    <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
                        Únete a las empresas que han confiado en nosotros para impulsar su transformación digital
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-white text-purple-700 font-bold px-8 py-4 rounded-full hover:bg-purple-50 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Contáctanos
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ExperiencePage;
