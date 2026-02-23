import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoice, FaDownload, FaWhatsapp, FaBoxOpen, FaCalendar, FaDollarSign } from 'react-icons/fa';
import { Card, Button } from '../../components/common';
import { getUserQuotes, downloadQuotePDF } from '../../services/quoteService';
import { toast } from 'react-toastify';

// WhatsApp Business Number - Configure in env or here
const BUSINESS_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '59178787878';

/**
 * MyQuotesPage Component
 * User's quote history with PDF download and WhatsApp consultation
 */
const MyQuotesPage = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await getUserQuotes();
            setQuotes(response.data || []);
        } catch (error) {
            console.error('Error al obtener cotizaciones:', error);
            toast.error('Error al cargar tus cotizaciones', {
                position: 'bottom-right',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (quote) => {
        try {
            setDownloadingId(quote._id);

            // Download PDF from backend
            const response = await downloadQuotePDF(quote._id);

            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Cotizacion-${quote.quoteNumber || quote._id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF descargado exitosamente', {
                position: 'bottom-right',
            });
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            toast.error('Error al descargar el PDF', {
                position: 'bottom-right',
            });
        } finally {
            setDownloadingId(null);
        }
    };

    const handleWhatsAppConsult = (quote) => {
        const date = new Date(quote.createdAt).toLocaleDateString('es-BO');
        const message = encodeURIComponent(
            `Hola, quisiera retomar la cotización #${quote.quoteNumber || quote._id} generada el ${date}. ` +
            `Total estimado: Bs ${quote.totalAmount.toFixed(2)}`
        );
        window.open(`https://wa.me/${BUSINESS_WHATSAPP}?text=${message}`, '_blank');
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Generada': 'bg-blue-100 text-blue-800 border-blue-200',
            'Contactado': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Cerrada': 'bg-green-100 text-green-800 border-green-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-secondary-600">Cargando cotizaciones...</p>
                </div>
            </div>
        );
    }

    // Empty state
    if (quotes.length === 0) {
        return (
            <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
                <Card className="max-w-md w-full">
                    <div className="p-8 text-center">
                        <div className="mb-6">
                            <FaFileInvoice className="mx-auto text-6xl text-secondary-300" />
                        </div>
                        <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-3">
                            Aún no has generado cotizaciones
                        </h2>
                        <p className="text-secondary-600 mb-6">
                            Explora nuestro catálogo de productos y servicios para crear tu primera cotización
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/products')}
                        >
                            <FaBoxOpen className="mr-2" />
                            Ir al Catálogo
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Main content with quotes
    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <FaFileInvoice className="text-4xl" />
                        <div>
                            <h1 className="text-3xl font-heading font-bold">
                                Mis Cotizaciones
                            </h1>
                            <p className="text-purple-100 mt-1">
                                Historial completo de tus cotizaciones generadas
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-secondary-600 mb-1">Total Cotizaciones</p>
                                    <p className="text-3xl font-bold text-purple-600">{quotes.length}</p>
                                </div>
                                <FaFileInvoice className="text-4xl text-purple-200" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-secondary-600 mb-1">Activas</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {quotes.filter(q => q.status === 'Generada').length}
                                    </p>
                                </div>
                                <FaBoxOpen className="text-4xl text-blue-200" />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-secondary-600 mb-1">Valor Total</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        Bs {quotes.reduce((sum, q) => sum + q.totalAmount, 0).toFixed(0)}
                                    </p>
                                </div>
                                <FaDollarSign className="text-4xl text-green-200" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Desktop Table */}
                <Card className="hidden md:block overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary-200">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        # Cotización
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {quotes.map((quote) => (
                                    <tr key={quote._id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaFileInvoice className="text-purple-600 mr-2" />
                                                <span className="text-sm font-medium text-secondary-900">
                                                    {quote.quoteNumber || `#${quote._id.slice(-8)}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-secondary-600">
                                                <FaCalendar className="mr-2 text-secondary-400" />
                                                {formatDate(quote.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-secondary-900">
                                                {quote.items?.length || 0} productos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-secondary-900">
                                                Bs {quote.totalAmount.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(quote.status)}`}>
                                                {quote.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleDownloadPDF(quote)}
                                                    disabled={downloadingId === quote._id}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    {downloadingId === quote._id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : (
                                                        <FaDownload />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleWhatsAppConsult(quote)}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
                                                    title="Consultar por WhatsApp"
                                                >
                                                    <FaWhatsapp />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {quotes.map((quote) => (
                        <Card key={quote._id}>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center mb-1">
                                            <FaFileInvoice className="text-purple-600 mr-2" />
                                            <span className="font-semibold text-secondary-900">
                                                {quote.quoteNumber || `#${quote._id.slice(-8)}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-secondary-600">
                                            <FaCalendar className="mr-1 text-secondary-400" />
                                            {formatDate(quote.createdAt)}
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(quote.status)}`}>
                                        {quote.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-t border-b border-secondary-200">
                                    <div>
                                        <p className="text-xs text-secondary-500">Items</p>
                                        <p className="text-sm font-medium text-secondary-900">
                                            {quote.items?.length || 0} productos
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-secondary-500">Total</p>
                                        <p className="text-sm font-semibold text-secondary-900">
                                            Bs {quote.totalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleDownloadPDF(quote)}
                                        disabled={downloadingId === quote._id}
                                    >
                                        {downloadingId === quote._id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <FaDownload className="mr-1" />
                                                PDF
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        onClick={() => handleWhatsAppConsult(quote)}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <FaWhatsapp className="mr-1" />
                                        Consultar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyQuotesPage;
