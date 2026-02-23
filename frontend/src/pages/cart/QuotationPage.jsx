import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaFileInvoice, FaUser, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import { Card, Input, Button } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import * as quoteService from '../../services/quoteService';
import { toast } from 'react-toastify';

/**
 * Schema de validación con Yup
 */
const quotationSchema = yup.object({
    name: yup
        .string()
        .required('El nombre completo es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: yup
        .string()
        .required('El email es requerido')
        .email('Ingresa un email válido'),
    phone: yup
        .string()
        .required('El teléfono es requerido')
        .matches(/^[0-9]{8,}$/, 'Ingresa un número válido (mínimo 8 dígitos)'),
    company: yup
        .string()
        .optional()
}).required();

/**
 * QuotationPage Component
 * Página para generar cotización desde el carrito
 */
const QuotationPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const { cart, clear: clearCart } = useCart();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(quotationSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            company: '',
        },
    });

    // Redirigir si no está autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            toast.warning('Debes iniciar sesión para continuar', {
                position: 'bottom-right',
            });
            navigate('/login', { state: { from: { pathname: '/quotation' } } });
        }
    }, [isAuthenticated, navigate]);

    // Redirigir si el carrito está vacío
    useEffect(() => {
        if (cart.items.length === 0) {
            toast.info('Tu carrito está vacío', {
                position: 'bottom-right',
            });
            navigate('/products');
        }
    }, [cart.items.length, navigate]);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);

            // Preparar datos del cliente
            const customerData = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company || undefined
            };

            // Generar cotización
            const response = await quoteService.generateQuote(customerData);

            // Crear blob del PDF y abrirlo en nueva pestaña
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Abrir PDF en nueva pestaña
            window.open(url, '_blank');

            // Limpiar carrito
            await clearCart();

            toast.success('✅ Cotización generada exitosamente', {
                position: 'bottom-right',
            });

            // Redirigir al inicio
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (error) {
            console.error('Error al generar cotización:', error);
            toast.error(error.response?.data?.message || 'Error al generar cotización', {
                position: 'bottom-right',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Calculaciones del carrito
    const subtotal = cart.totalAmount || 0;
    const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <FaFileInvoice className="text-4xl" />
                        <div>
                            <h1 className="text-3xl font-heading font-bold">
                                Generar Cotización
                            </h1>
                            <p className="text-purple-100 mt-1">
                                Completa tus datos para recibir tu cotización en PDF
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Formulario de datos */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="p-6">
                                <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-6">
                                    Tus Datos
                                </h2>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                    {/* Nombre completo */}
                                    <div>
                                        <Input
                                            label="Nombre Completo"
                                            icon={FaUser}
                                            placeholder="Ej: Juan Pérez"
                                            {...register('name')}
                                            error={errors.name?.message}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <Input
                                            label="Correo Electrónico"
                                            type="email"
                                            icon={FaEnvelope}
                                            placeholder="ejemplo@email.com"
                                            {...register('email')}
                                            error={errors.email?.message}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <Input
                                            label="Teléfono"
                                            icon={FaPhone}
                                            placeholder="75123456"
                                            {...register('phone')}
                                            error={errors.phone?.message}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Empresa (Opcional) */}
                                    <div>
                                        <Input
                                            label="Empresa (Opcional)"
                                            icon={FaBuilding}
                                            placeholder="Nombre de tu empresa"
                                            {...register('company')}
                                            error={errors.company?.message}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Botones */}
                                    <div className="flex gap-4 pt-4">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="flex-1"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    <FaFileInvoice className="mr-2" />
                                                    Generar Cotización en PDF
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => navigate('/cart')}
                                            disabled={isLoading}
                                        >
                                            Volver al Carrito
                                        </Button>
                                    </div>

                                </form>
                            </div>
                        </Card>
                    </div>

                    {/* Resumen del  carrito */}
                    <div className="lg:col-span-1">
                        <Card>
                            <div className="p-6">
                                <h3 className="text-xl font-heading font-bold text-secondary-900 mb-4">
                                    Resumen
                                </h3>

                                <div className="space-y-3 border-b border-secondary-200 pb-4 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-secondary-600">Productos</span>
                                        <span className="font-semibold text-secondary-900">{itemCount}</span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-4">
                                    {cart.items.map((item) => (
                                        <div key={item._id} className="flex justify-between text-sm">
                                            <div className="flex-1">
                                                <span className="text-secondary-700">
                                                    {item.product?.name || 'Producto'}
                                                </span>
                                                <span className="text-secondary-500 ml-2">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                            <span className="font-medium text-secondary-900">
                                                Bs {(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-secondary-200 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-heading font-bold text-secondary-900">
                                            Total
                                        </span>
                                        <span className="text-2xl font-heading font-bold text-purple-600">
                                            Bs {subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Nota informativa */}
                                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <p className="text-xs text-purple-800">
                                        <strong>Nota:</strong> Al generar la cotización se descargará un archivo PDF con el detalle de los productos. Esta cotización no implica una compra ni un compromiso de pago.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuotationPage;
