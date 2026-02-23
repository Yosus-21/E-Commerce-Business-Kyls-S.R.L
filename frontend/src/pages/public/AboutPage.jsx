import { FaRocket, FaLightbulb, FaHandshake, FaShieldAlt, FaUsers, FaChartLine, FaWhatsapp } from 'react-icons/fa';
import { Button } from '../../components/common';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../../assets/videos/hero-video.mp4';

/**
 * AboutPage - "Sobre Nosotros"
 * Diseño Premium: Dark Mode elegante con acentos morados/indigo.
 */
const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* 1. Hero Section - Impacto Visual con Video de Fondo */}
            <section className="relative py-32 overflow-hidden text-center">
                {/* Video de Fondo */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src={heroVideo} type="video/mp4" />
                </video>

                {/* Overlay Oscuro */}
                <div className="absolute inset-0 bg-black/70 z-10"></div>

                <div className="relative z-20 max-w-5xl mx-auto px-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-300 text-sm font-semibold tracking-wider uppercase mb-6 shadow-xl">
                        Nuestra Identidad
                    </span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                        Impulsando el <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 animate-gradient-x">
                            Futuro Digital
                        </span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                        En Business Kyla SRL, no solo vendemos tecnología; diseñamos ecosistemas digitales que transforman empresas. Somos tu aliado estratégico en la era de la automatización.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button variant="primary" size="lg" onClick={() => navigate('/contact')}>
                            Contáctanos
                        </Button>
                        <button
                            className="px-6 py-3 text-base font-semibold rounded-lg border-2 border-white/60 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-purple-700 hover:border-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            onClick={() => navigate('/services')}
                        >
                            Nuestros Servicios
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Misión y Visión - "Lucete" Style */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Card Misión */}
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-white border border-slate-100 rounded-2xl p-10 shadow-2xl hover:shadow-purple-500/10 transition-shadow">
                                <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
                                    <FaRocket size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">Nuestra Misión</h2>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    Brindar soluciones tecnológicas integrales que impulsen la automatización y eficiencia de nuestros clientes. A través de consultoría experta y hardware de vanguardia, garantizamos innovación y satisfacción en cada proyecto a nivel nacional.
                                </p>
                            </div>
                        </div>

                        {/* Card Visión */}
                        <div className="relative group perspective-1000 mt-8 md:mt-24">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-slate-900 text-white border border-slate-800 rounded-2xl p-10 shadow-2xl hover:shadow-indigo-500/20 transition-shadow">
                                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-indigo-400">
                                    <FaLightbulb size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Nuestra Visión</h2>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    Ser la empresa líder indiscutible en automatización corporativa en Bolivia. Aspiramos a ser el estándar de excelencia en tecnología para banca, educación y gobierno, reconocidos por nuestra fiabilidad e innovación constante.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. Nuestros Valores Core */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-purple-600 font-semibold uppercase tracking-wider text-sm">ADN Corporativo</span>
                        <h2 className="text-4xl font-bold text-slate-900 mt-2">Nuestros Valores</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard
                            icon={FaShieldAlt}
                            title="Integridad"
                            desc="Transparencia y honestidad en cada trato comercial. Tu confianza es nuestro activo más valioso."
                        />
                        <ValueCard
                            icon={FaHandshake}
                            title="Compromiso"
                            desc="Nos ponemos la camiseta de tu empresa. Tu éxito es el nuestro."
                        />
                        <ValueCard
                            icon={FaUsers}
                            title="Colaboración"
                            desc="Trabajamos codo a codo contigo para entender y resolver tus verdaderos desafíos."
                        />
                        <ValueCard
                            icon={FaChartLine}
                            title="Excelencia"
                            desc="No nos conformamos con lo estándar. Buscamos siempre superar las expectativas."
                        />
                    </div>
                </div>
            </section>

            {/* 4. CTA Final */}
            <section className="py-20 bg-white text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">¿Listo para transformar tu empresa?</h2>
                    <p className="text-slate-600 text-lg mb-8">
                        Agenda una reunión con nuestros consultores expertos y descubre cómo podemos potenciar tu negocio hoy mismo.
                    </p>
                    <Button
                        onClick={() => window.open('https://wa.me/59179669569?text=Hola,%20quisiera%20agendar%20una%20reunión%20para%20transformar%20mi%20empresa', '_blank')}
                        className="bg-green-600 text-white hover:bg-green-700 hover:scale-105 border-0 text-lg px-8 py-3 font-bold shadow-xl shadow-green-200 flex items-center justify-center gap-2 mx-auto"
                    >
                        <FaWhatsapp className="text-2xl" />
                        Háblenos Ahora
                    </Button>
                </div>
            </section>

        </div>
    );
};

// Componente helper para tarjetas de valores
const ValueCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
);

export default AboutPage;
