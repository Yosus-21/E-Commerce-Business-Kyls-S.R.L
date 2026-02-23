import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';
import { Button } from '../../components/common';

/**
 * NotFoundPage Component
 * Página de error 404 personalizada
 */
const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center">

                {/* Número 404 estilizado */}
                <div className="relative inline-block mb-8">
                    <h1 className="text-[200px] sm:text-[250px] font-bold leading-none">
                        <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                            404
                        </span>
                    </h1>

                    {/* Icono decorativo */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <FaSearch className="text-6xl text-primary-200 opacity-30" />
                    </div>
                </div>

                {/* Mensaje de error */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-3xl sm:text-4xl font-heading font-bold text-secondary-900">
                        ¡Ups! Página no encontrada
                    </h2>
                    <p className="text-lg text-secondary-600 max-w-lg mx-auto">
                        Parece que esta página no existe o ha sido movida.
                        No te preocupes, te ayudaremos a encontrar lo que buscas.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => navigate('/')}
                    >
                        <FaHome className="mr-2" />
                        Volver al Inicio
                    </Button>

                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => navigate('/products')}
                    >
                        Ver Productos
                    </Button>
                </div>

                {/* Enlaces rápidos */}
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Enlaces Útiles
                    </h3>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/products')}
                            className="p-4 rounded-lg hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-3xl mb-2">🛍️</div>
                            <p className="font-medium text-secondary-900 group-hover:text-primary-700">
                                Catálogo
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/about')}
                            className="p-4 rounded-lg hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-3xl mb-2">ℹ️</div>
                            <p className="font-medium text-secondary-900 group-hover:text-primary-700">
                                Sobre Nosotros
                            </p>
                        </button>

                        <button
                            onClick={() => navigate('/contact')}
                            className="p-4 rounded-lg hover:bg-primary-50 transition-colors group"
                        >
                            <div className="text-3xl mb-2">📞</div>
                            <p className="font-medium text-secondary-900 group-hover:text-primary-700">
                                Contacto
                            </p>
                        </button>
                    </div>
                </div>

                {/* Mensaje adicional */}
                <p className="text-sm text-secondary-500 mt-8">
                    Si crees que esto es un error, por favor{' '}
                    <button
                        onClick={() => navigate('/contact')}
                        className="text-primary-700 hover:text-primary-800 underline font-medium"
                    >
                        contáctanos
                    </button>
                </p>
            </div>
        </div>
    );
};

export default NotFoundPage;
