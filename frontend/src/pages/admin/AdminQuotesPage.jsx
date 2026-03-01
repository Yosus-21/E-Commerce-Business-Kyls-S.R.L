import { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaFileDownload, FaSpinner } from 'react-icons/fa';
import { Card } from '../../components/common';
import { getAllQuotes, updateQuoteStatus, downloadQuotePDF } from '../../services/quoteService';
import { toast } from 'react-toastify';

/**
 * AdminQuotesPage
 * ✅ Migrado a MySQL: usa quote.id (entero) en lugar de quote._id
 * ✅ Paginación usa campos del backend: totalPages, currentPage, totalQuotes
 * ✅ Botón de descarga PDF usa quote.id y dispara blob download
 */
const AdminQuotesPage = () => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null); // ID de la cotización descargando
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({});
    const [selectedQuote, setSelectedQuote] = useState(null);

    useEffect(() => {
        fetchQuotes();
    }, [filters]);

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const response = await getAllQuotes(filters);
            setQuotes(response.data || []);
            // Backend retorna: { currentPage, totalPages, totalQuotes, limit }
            setPagination(response.pagination || {});
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Error al cargar cotizaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (quoteId, newStatus) => {
        try {
            // ✅ quoteId es el id numérico de MySQL
            await updateQuoteStatus(quoteId, newStatus);
            toast.success('Estado actualizado exitosamente');
            fetchQuotes();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar estado');
        }
    };

    const handleDownloadPDF = async (quote) => {
        try {
            // ✅ Usa quote.id (MySQL integer), NO quote._id
            setDownloadingId(quote.id);
            await downloadQuotePDF(quote.id, quote.quoteNumber);
            toast.success(`PDF de ${quote.quoteNumber} descargado`);
        } catch (error) {
            console.error('Error descargando PDF:', error);
            toast.error('Error al descargar el PDF');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-BO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'Generada': 'bg-blue-100 text-blue-800',
            'Contactado': 'bg-yellow-100 text-yellow-800',
            'Cerrada': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Campos de paginación que devuelve el backend Sequelize:
    // { currentPage, totalPages, totalQuotes, limit }
    const totalPages = pagination.totalPages || 1;
    const currentPage = pagination.currentPage || filters.page;
    const totalQuotes = pagination.totalQuotes || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-secondary-900">
                    Gestión de Cotizaciones
                </h1>
                <p className="text-secondary-600 mt-2">
                    Administra y da seguimiento a todas las cotizaciones generadas
                </p>
            </div>

            {/* Filtros */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Buscar por número de cotización..."
                            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        />
                    </div>

                    {/* Filtro por estado */}
                    <select
                        className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="">Todos los estados</option>
                        <option value="Generada">Generada</option>
                        <option value="Contactado">Contactado</option>
                        <option value="Cerrada">Cerrada</option>
                    </select>

                    {/* Botón refrescar */}
                    <button
                        onClick={fetchQuotes}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                    >
                        Actualizar
                    </button>
                </div>
            </Card>

            {/* Tabla de Cotizaciones */}
            <Card>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-secondary-600 mt-4">Cargando cotizaciones...</p>
                    </div>
                ) : quotes.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFileDownload className="mx-auto text-6xl text-secondary-300 mb-4" />
                        <p className="text-secondary-600">No se encontraron cotizaciones</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-secondary-200">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Número</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-secondary-200">
                                    {quotes.map((quote) => {
                                        // ✅ quote.id es el ID numérico de MySQL
                                        const quoteId = quote.id;
                                        return (
                                            <tr key={quoteId} className="hover:bg-secondary-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                                    {quote.quoteNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-secondary-900">{quote.customerData?.name}</div>
                                                    <div className="text-xs text-secondary-500">{quote.customerData?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                    {formatDate(quote.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                                    {quote.items?.length || 0} productos
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                                    Bs. {Number(quote.totalAmount || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* ✅ usa quoteId (MySQL integer) */}
                                                    <select
                                                        value={quote.status}
                                                        onChange={(e) => handleStatusChange(quoteId, e.target.value)}
                                                        className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${getStatusColor(quote.status)}`}
                                                    >
                                                        <option value="Generada">Generada</option>
                                                        <option value="Contactado">Contactado</option>
                                                        <option value="Cerrada">Cerrada</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-3">
                                                        {/* Ver detalles */}
                                                        <button
                                                            onClick={() => setSelectedQuote(quote)}
                                                            className="text-primary-600 hover:text-primary-900"
                                                            title="Ver detalles"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                        {/* ✅ Descargar PDF — usa quote.id numérico */}
                                                        <button
                                                            onClick={() => handleDownloadPDF(quote)}
                                                            disabled={downloadingId === quoteId}
                                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                                            title="Descargar PDF"
                                                        >
                                                            {downloadingId === quoteId
                                                                ? <FaSpinner className="animate-spin" />
                                                                : <FaFileDownload />
                                                            }
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación — usa campos correctos del backend Sequelize */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-secondary-200">
                                <p className="text-sm text-secondary-700">
                                    Página {currentPage} de {totalPages} ({totalQuotes} cotizaciones)
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        disabled={filters.page >= totalPages}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Modal de Detalles */}
            {selectedQuote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-secondary-900">
                                Cotización {selectedQuote.quoteNumber}
                            </h3>
                            <div className="flex gap-3 items-center">
                                {/* Descargar PDF desde el modal */}
                                <button
                                    onClick={() => handleDownloadPDF(selectedQuote)}
                                    disabled={downloadingId === selectedQuote.id}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                                    title="Descargar PDF"
                                >
                                    {downloadingId === selectedQuote.id
                                        ? <FaSpinner className="animate-spin" />
                                        : <FaFileDownload />
                                    }
                                    PDF
                                </button>
                                <button
                                    onClick={() => setSelectedQuote(null)}
                                    className="text-secondary-400 hover:text-secondary-600 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Cliente */}
                            <div>
                                <h4 className="font-semibold text-secondary-700 mb-2">Cliente</h4>
                                <p className="text-secondary-900">{selectedQuote.customerData?.name}</p>
                                <p className="text-sm text-secondary-600">{selectedQuote.customerData?.email}</p>
                                <p className="text-sm text-secondary-600">{selectedQuote.customerData?.phone}</p>
                                {selectedQuote.customerData?.company && (
                                    <p className="text-sm text-secondary-600">{selectedQuote.customerData.company}</p>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold text-secondary-700 mb-2">Productos Cotizados</h4>
                                <div className="space-y-2">
                                    {(selectedQuote.items || []).map((item, index) => (
                                        <div key={item.id || index} className="flex justify-between p-2 bg-secondary-50 rounded">
                                            <span className="text-secondary-900">{item.name}</span>
                                            <span className="text-secondary-600">
                                                {item.quantity} x Bs. {Number(item.price || 0).toFixed(2)} = Bs. {Number(item.subtotal || 0).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notas */}
                            {selectedQuote.notes && (
                                <div>
                                    <h4 className="font-semibold text-secondary-700 mb-1">Notas</h4>
                                    <p className="text-sm text-secondary-600">{selectedQuote.notes}</p>
                                </div>
                            )}

                            {/* Total */}
                            <div className="pt-4 border-t border-secondary-200">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-primary-600">
                                        Bs. {Number(selectedQuote.totalAmount || 0).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminQuotesPage;
