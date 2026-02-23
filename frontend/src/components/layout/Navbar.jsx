import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Button, Badge } from '../common';
import logo from '../../assets/images/logo.png';

/**
 * Navbar Component
 * Navegación principal responsive con autenticación y carrito
 */
const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Nosotros', path: '/about' },
        { name: 'Productos', path: '/products' },
        { name: 'Servicios', path: '/services' },
        { name: 'Experiencia', path: '/experience' },
        { name: 'Catálogo', path: '/catalog' },
        { name: 'Contacto', path: '/contact' },
    ];

    return (
        <nav className="bg-white border-b border-secondary-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">

                    {/* Logo - Izquierda */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img
                            src={logo}
                            alt="Business Kyla SRL"
                            className="h-24 w-auto object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                            }}
                        />
                        <h1
                            className="text-2xl font-heading font-bold text-primary-700 hover:text-primary-800 transition-colors"
                            style={{ display: 'none' }}
                        >
                            Business Kyla SRL
                        </h1>
                    </Link>

                    {/* Enlaces de navegación - Centro (Desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="text-secondary-700 font-medium transition-all duration-200 hover:text-primary-700 hover:scale-105 border-b-2 border-transparent hover:border-primary-500 pb-1"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Acciones - Derecha */}
                    <div className="flex items-center space-x-4">

                        {/* Carrito */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-secondary-700 hover:text-primary-600 transition-colors"
                            aria-label="Carrito de compras"
                        >
                            <FaShoppingCart size={24} />

                            {/* Badge de contador */}
                            {cartCount > 0 && (
                                <Badge
                                    variant="danger"
                                    size="sm"
                                    rounded
                                    className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5"
                                >
                                    {cartCount > 99 ? '99+' : cartCount}
                                </Badge>
                            )}
                        </Link>

                        {/* Autenticación */}
                        {!isAuthenticated ? (
                            <div className="hidden md:block">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate('/login')}
                                >
                                    Iniciar Sesión
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                {/* User dropdown menu */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-secondary-700 hover:text-primary-600 transition-colors py-2">
                                        <FaUser className="text-primary-600" />
                                        <span className="font-medium">Hola, {user?.name?.split(' ')[0]}</span>
                                    </button>

                                    {/* Dropdown */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                        >
                                            Mi Perfil
                                        </Link>
                                        <Link
                                            to="/profile/quotes"
                                            className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                        >
                                            Mis Cotizaciones
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 transition-colors border-t border-secondary-200"
                                            >
                                                Panel Admin
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-danger-700 hover:bg-danger-50 transition-colors border-t border-secondary-200"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botón de menú móvil */}
                        <button
                            className="md:hidden p-2 text-secondary-700 hover:text-primary-600 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Menú"
                        >
                            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Menú móvil */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-secondary-200 bg-white">
                    <div className="px-4 py-3 space-y-3">

                        {/* Enlaces de navegación */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="block py-2 text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="pt-3 border-t border-secondary-200">
                            {!isAuthenticated ? (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    onClick={() => {
                                        navigate('/login');
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    Iniciar Sesión
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 text-secondary-700 py-2">
                                        <FaUser className="text-primary-600" />
                                        <span className="font-medium">Hola, {user?.name}</span>
                                    </div>

                                    <Link
                                        to="/profile"
                                        className="block py-2 text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Mi Perfil
                                    </Link>

                                    <Link
                                        to="/profile/quotes"
                                        className="block py-2 text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Mis Cotizaciones
                                    </Link>

                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="block py-2 text-primary-700 hover:text-primary-800 font-medium transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Panel Admin
                                        </Link>
                                    )}

                                    <Button
                                        variant="outline"
                                        fullWidth
                                        onClick={handleLogout}
                                    >
                                        Cerrar Sesión
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
