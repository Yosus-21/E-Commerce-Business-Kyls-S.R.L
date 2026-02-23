import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaTwitter } from 'react-icons/fa';
import logo from '../../assets/images/logo-oficial.png';

/**
 * Footer Component
 * Pie de página corporativo "Massive" con estilo Premium
 */
const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-slate-900 text-slate-300 pt-16 pb-8 overflow-hidden font-inter">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Columna 1: Brand & About */}
                    <div className="space-y-6">
                        <Link to="/" className="block w-48 transition-opacity hover:opacity-90">
                            <img
                                src={logo}
                                alt="Business Kyla SRL"
                                className="h-14 w-auto object-contain brightness-0 invert"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Impulsamos la transformación digital de tu empresa con soluciones tecnológicas de vanguardia. Consultoría, Hardware y Soporte Corporativo en un solo lugar.
                        </p>
                        <div className="flex space-x-4">
                            <SocialIcon href="https://facebook.com" icon={FaFacebook} label="Facebook" />
                            <SocialIcon href="https://instagram.com" icon={FaInstagram} label="Instagram" />
                            <SocialIcon href="https://linkedin.com" icon={FaLinkedin} label="LinkedIn" />
                            <SocialIcon href="https://wa.me/59179669569" icon={FaWhatsapp} label="WhatsApp" />
                        </div>
                    </div>

                    {/* Columna 2: Enlaces Rápidos */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Navegación</h4>
                        <ul className="space-y-3">
                            <FooterLink to="/" label="Inicio" />
                            <FooterLink to="/products" label="Catálogo de Productos" />
                            <FooterLink to="/services" label="Servicios Empresariales" />
                            <FooterLink to="/catalog" label="Descargar PDF" />
                            <FooterLink to="/contact" label="Contacto" />
                        </ul>
                    </div>

                    {/* Columna 3: Ubicaciones */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Nuestras Ubicaciones</h4>
                        <ul className="space-y-4 text-sm">
                            {/* Ubicación 1 */}
                            <li>
                                <a
                                    href="https://maps.app.goo.gl/v8bTZ92xTqWkDWkg8"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start group cursor-pointer"
                                >
                                    <FaMapMarkerAlt className="text-purple-500 group-hover:text-purple-400 mt-1 mr-3 flex-shrink-0 transition-colors" size={18} />
                                    <div>
                                        <span className="text-white font-medium group-hover:text-purple-400 transition-colors">Oficina Norte</span>
                                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                            Manzana 40, Torre 2 – Piso 10<br />
                                            Av. San Martín, Santa Cruz de la Sierra
                                        </p>
                                    </div>
                                </a>
                            </li>

                            {/* Ubicación 2 */}
                            <li>
                                <a
                                    href="https://www.google.com/maps/place/17%C2%B048'57.1%22S+63%C2%B010'35.0%22W/@-17.8158646,-63.1789551,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-17.8158646!4d-63.1763802?hl=es&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start group cursor-pointer"
                                >
                                    <FaMapMarkerAlt className="text-purple-500 group-hover:text-purple-400 mt-1 mr-3 flex-shrink-0 transition-colors" size={18} />
                                    <div>
                                        <span className="text-white font-medium group-hover:text-purple-400 transition-colors">Oficina zona Sur</span>
                                        <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                                            Radial 13 calle 5 # 3295<br />
                                            Entre 3 y 4 anillo, Santa Cruz de la Sierra
                                        </p>
                                    </div>
                                </a>
                            </li>

                            {/* Teléfono */}
                            <li className="flex items-center pt-2">
                                <FaPhone className="text-purple-500 mr-3 flex-shrink-0" size={18} />
                                <a href="tel:+59179669569" className="hover:text-purple-400 transition-colors">
                                    +591 796 69569
                                </a>
                            </li>

                            {/* Email */}
                            <li className="flex items-center">
                                <FaEnvelope className="text-purple-500 mr-3 flex-shrink-0" size={18} />
                                <a href="mailto:belen.torrico@kyla.com.bo" className="hover:text-purple-400 transition-colors">
                                    belen.torrico@kyla.com.bo
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 4: Newsletter (Visual) */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 tracking-wide">Mantente Informado</h4>
                        <p className="text-slate-400 text-sm mb-4">
                            Suscríbete para recibir las últimas novedades en tecnología y ofertas exclusivas.
                        </p>
                        <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                            />
                            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-900/40 text-sm">
                                Suscribirse
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {currentYear} Business Kyla SRL. Todos los derechos reservados.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-purple-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="hover:text-purple-400 transition-colors">Términos</Link>
                        <Link to="/sitemap" className="hover:text-purple-400 transition-colors">Mapa del Sitio</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Subcomponente para enlaces
const FooterLink = ({ to, label }) => (
    <li>
        <Link to={to} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
            {label}
        </Link>
    </li>
);

// Subcomponente para iconos sociales
const SocialIcon = ({ href, icon: Icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-white hover:bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 bg-slate-800"
        aria-label={label}
    >
        <Icon size={18} />
    </a>
);

export default Footer;
