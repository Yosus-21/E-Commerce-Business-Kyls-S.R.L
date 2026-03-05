import { FaShippingFast, FaShieldAlt, FaHeadset, FaQrcode } from 'react-icons/fa';

/**
 * Lista de características/beneficios
 */
const features = [
    {
        icon: FaShippingFast,
        title: 'Envío Seguro',
        description: 'Entregamos tus productos de forma rápida y segura en todo Bolivia',
        color: 'primary',
    },
    {
        icon: FaShieldAlt,
        title: 'Garantía Real',
        description: 'Todos nuestros productos cuentan con garantía oficial del fabricante',
        color: 'success',
    },
    {
        icon: FaHeadset,
        title: 'Soporte Técnico',
        description: 'Equipo técnico disponible para ayudarte con cualquier consulta',
        color: 'secondary',
    },
    {
        icon: FaQrcode,
        title: 'Pago con QR',
        description: 'Acepta todos los métodos de pago incluyendo QR boliviano',
        color: 'primary',
    },
];

/**
 * Features Component
 * Sección de características/beneficios del negocio
 */
const Features = () => {
    return (
        <section className="py-8 sm:py-24 bg-secondary-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900 mb-4">
                        ¿Por qué elegir Business Kyla SRL?
                    </h2>
                    <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                        Nos comprometemos a ofrecerte la mejor experiencia de compra con beneficios únicos
                    </p>
                </div>

                {/* Grid de características */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                {/* Ícono */}
                                <div className={`
                  inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5
                  bg-${feature.color}-100 text-${feature.color}-700
                  group-hover:scale-110 transition-transform duration-300
                `}>
                                    <Icon size={28} />
                                </div>

                                {/* Título */}
                                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                                    {feature.title}
                                </h3>

                                {/* Descripción */}
                                <p className="text-secondary-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Stats adicionales */}
                <div className="mt-16 pt-12 border-t border-secondary-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="text-4xl font-bold text-primary-700 mb-2">24/7</p>
                            <p className="text-secondary-600">Atención al Cliente</p>
                        </div>
                        <div>
                            <p className="text-4xl font-bold text-primary-700 mb-2">100%</p>
                            <p className="text-secondary-600">Productos Originales</p>
                        </div>
                        <div>
                            <div className="flex justify-center mb-2">
                                <FaShippingFast className="text-4xl text-primary-700" />
                            </div>
                            <p className="text-secondary-600">Entregas Personalizadas</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
