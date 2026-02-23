import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaWhatsapp, FaClock, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * ContactPage Component
 * Página de contacto con formulario y sucursales
 */
const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar campos requeridos
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Por favor, completa todos los campos requeridos');
            return;
        }

        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL;

            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(data.message || '¡Mensaje enviado exitosamente! Te contactaremos pronto.', {
                    position: 'bottom-right'
                });
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                toast.error(data.message || 'Error al enviar el mensaje. Intenta nuevamente.');
            }
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            toast.error('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

            {/* Sección Contáctanos - Formulario */}
            <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Contáctanos
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto mb-6"></div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            ¿Tienes alguna pregunta? Envíanos un mensaje y te responderemos lo antes posible.
                        </p>
                    </div>

                    {/* Grid: Formulario + Info rápida */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Formulario de Contacto */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Nombre */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre completo *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="Tu nombre"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                placeholder="tu@email.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <div className="mb-6">
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono (opcional)
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            placeholder="+591 000 00000"
                                        />
                                    </div>

                                    {/* Mensaje */}
                                    <div className="mb-6">
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                            Mensaje *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                            placeholder="¿En qué podemos ayudarte?"
                                        ></textarea>
                                    </div>

                                    {/* Botón Enviar */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane className="mr-2" />
                                                Enviar Mensaje
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Información de Contacto Rápida */}
                        <div className="space-y-4">
                            {/* Email */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-3">
                                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                        <FaEnvelope className="text-purple-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email</p>
                                        <a href="mailto:belen.torrico@kyla.com.bo" className="text-gray-800 font-medium hover:text-purple-600 transition-colors text-sm">
                                            belen.torrico@kyla.com.bo
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                                        <FaWhatsapp className="text-green-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">WhatsApp</p>
                                        <a href="https://wa.me/59179669569" target="_blank" rel="noopener noreferrer" className="text-gray-800 font-medium hover:text-green-600 transition-colors text-sm">
                                            +591 796 69569
                                        </a>
                                    </div>
                                </div>
                                <a
                                    href="https://wa.me/59179669569?text=Hola,%20necesito%20información"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg transition-colors mt-4"
                                >
                                    Chatear ahora
                                </a>
                            </div>

                            {/* Teléfono */}
                            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <FaPhone className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Teléfono</p>
                                        <a href="tel:+59179669569" className="text-gray-800 font-medium hover:text-blue-600 transition-colors text-sm">
                                            +591 796 69569
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección Sucursales */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Sucursales */}
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Nuestras <span className="text-purple-600">Sucursales</span>
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 mx-auto mb-6"></div>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Visítanos en cualquiera de nuestras ubicaciones. Estamos aquí para ayudarte.
                        </p>
                    </div>

                    {/* Grid de Oficinas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Oficina Norte */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                            {/* Mapa Google Maps Embebido */}
                            <div className="w-full h-64 relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.567!2d-63.176!3d-17.8158!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDQ4JzU3LjEiUyA2M8KwMTAnMzUuMCJX!5e0!3m2!1ses!2sbo!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Mapa Oficina Norte"
                                ></iframe>
                            </div>

                            {/* Información */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-2 h-8 bg-purple-600 mr-3 rounded-full"></span>
                                    OFICINA SANTA CRUZ - NORTE
                                </h3>

                                {/* Dirección */}
                                <div className="flex items-start mb-4 group">
                                    <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                                        <FaMapMarkerAlt className="text-purple-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Dirección</p>
                                        <p className="text-gray-800 font-medium">
                                            Manzana 40, Torre 2 – Piso 10<br />
                                            Av. San Martín, Santa Cruz de la Sierra
                                        </p>
                                    </div>
                                </div>

                                {/* Teléfono */}
                                <div className="flex items-start mb-4 group">
                                    <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                                        <FaPhone className="text-green-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Teléfono de contacto</p>
                                        <a href="tel:+59179669569" className="text-gray-800 font-medium hover:text-purple-600 transition-colors">
                                            +591 796 69569
                                        </a>
                                    </div>
                                </div>

                                {/* Horarios */}
                                <div className="flex items-start mb-6 group">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                                        <FaClock className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Horario de atención</p>
                                        <p className="text-gray-800 font-medium">
                                            Lunes a Viernes: 08:00 a 12:00 y 14:00 a 18:00<br />
                                            Sábado: 08:30 a 12:30
                                        </p>
                                    </div>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="https://maps.app.goo.gl/v8bTZ92xTqWkDWkg8"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <FaMapMarkerAlt className="mr-2" />
                                        Ver en Google Maps
                                    </a>
                                    <a
                                        href="https://wa.me/59179669569?text=Hola,%20necesito%20información%20sobre%20la%20Oficina%20Norte"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <FaWhatsapp className="mr-2" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Oficina zona Sur */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                            {/* Mapa Google Maps Embebido */}
                            <div className="w-full h-64 relative">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3799.567!2d-63.1763802!3d-17.8158646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTfCsDQ4JzU3LjEiUyA2M8KwMTAnMzUuMCJX!5e0!3m2!1ses!2sbo!4v1234567890"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Mapa Oficina zona Sur"
                                ></iframe>
                            </div>

                            {/* Información */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                    <span className="w-2 h-8 bg-purple-600 mr-3 rounded-full"></span>
                                    OFICINA SANTA CRUZ - SUR
                                </h3>

                                {/* Dirección */}
                                <div className="flex items-start mb-4 group">
                                    <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                                        <FaMapMarkerAlt className="text-purple-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Dirección</p>
                                        <p className="text-gray-800 font-medium">
                                            Radial 13 calle 5 # 3295<br />
                                            Entre 3 y 4 anillo, Santa Cruz de la Sierra
                                        </p>
                                    </div>
                                </div>

                                {/* Teléfono */}
                                <div className="flex items-start mb-4 group">
                                    <div className="bg-green-100 p-3 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                                        <FaPhone className="text-green-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Teléfono de contacto</p>
                                        <a href="tel:+59179669569" className="text-gray-800 font-medium hover:text-purple-600 transition-colors">
                                            +591 796 69569
                                        </a>
                                    </div>
                                </div>

                                {/* Horarios */}
                                <div className="flex items-start mb-6 group">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                                        <FaClock className="text-blue-600 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium mb-1">Horario de atención</p>
                                        <p className="text-gray-800 font-medium">
                                            Lunes a Viernes: 08:00 a 12:00 y 14:00 a 18:00<br />
                                            Sábado: 08:30 a 12:30
                                        </p>
                                    </div>
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a
                                        href="https://www.google.com/maps/place/17%C2%B048'57.1%22S+63%C2%B010'35.0%22W/@-17.8158646,-63.1789551,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-17.8158646!4d-63.1763802?hl=es&entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <FaMapMarkerAlt className="mr-2" />
                                        Ver en Google Maps
                                    </a>
                                    <a
                                        href="https://wa.me/59179669569?text=Hola,%20necesito%20información%20sobre%20la%20Oficina%20zona%20Sur"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
                                    >
                                        <FaWhatsapp className="mr-2" />
                                        WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
