import { FaWhatsapp } from 'react-icons/fa';

/**
 * WhatsAppButton Component
 * Botón flotante de WhatsApp que aparece en todas las páginas
 */
const WhatsAppButton = () => {
    const whatsappNumber = '59179669569'; // Número de WhatsApp
    const message = '¡Hola! Me gustaría más información sobre sus productos y servicios.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-110 group"
            aria-label="Contactar por WhatsApp"
        >
            <FaWhatsapp className="text-3xl" />

            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                ¿Necesitas ayuda? ¡Escríbenos!
            </span>

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></span>
        </a>
    );
};

export default WhatsAppButton;
