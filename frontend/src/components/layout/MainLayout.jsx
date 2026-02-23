import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../common/WhatsAppButton';

/**
 * MainLayout Component
 * Layout principal que envuelve todas las páginas
 * Incluye Navbar, contenido (Outlet), Footer y botón flotante de WhatsApp
 */
const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-secondary-50">
            {/* Navbar sticky en la parte superior */}
            <Navbar />

            {/* Contenido principal - flex-grow para empujar el footer abajo */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer siempre en la parte inferior */}
            <Footer />

            {/* Botón flotante de WhatsApp */}
            <WhatsAppButton />
        </div>
    );
};

export default MainLayout;
