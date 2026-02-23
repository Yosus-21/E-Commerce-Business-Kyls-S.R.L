import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MainLayout } from './components/layout';
import AdminLayout from './components/layout/AdminLayout';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { ProductsPage } from './pages';
import HomePage from './pages/public/HomePage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ServiceDetailsPage from './pages/public/ServiceDetailsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import CatalogPage from './pages/public/CatalogPage';
import ServicesPage from './pages/public/ServicesPage';
import ExperiencePage from './pages/public/ExperiencePage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
// import CheckoutPage from './pages/cart/CheckoutPage'; // Página no existe
import QuotationPage from './pages/cart/QuotationPage';
// import OrderSuccessPage from './pages/cart/OrderSuccessPage'; // Página no existe
import CartPage from './pages/cart/CartPage';
// import OrdersPage from './pages/user/OrdersPage'; // Página no existe
// import OrderDetailPage from './pages/user/OrderDetailPage'; // Página no existe
import ProfilePage from './pages/user/ProfilePage';
import MyQuotesPage from './pages/user/MyQuotesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminOrdersPage from './pages/admin/AdminOrdersPage'; // Página no existe
// import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'; // Página no existe
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminCategoryFormPage from './pages/admin/AdminCategoryFormPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminBrandFormPage from './pages/admin/AdminBrandFormPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminServiceFormPage from './pages/admin/AdminServiceFormPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminHeroImagesPage from './pages/admin/AdminHeroImagesPage';
import AdminPartnersPage from './pages/admin/AdminPartnersPage';
import AdminQuotesPage from './pages/admin/AdminQuotesPage';
import './index.css';

/**
 * Placeholder Pages
 */

// Página de Carrito (Placeholder temporal)


/**
 * App Component
 * Configuración de rutas y providers
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>

            {/* Rutas Públicas - MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="cart" element={<CartPage />} />

              {/* Rutas protegidas de usuario */}
              <Route
                path="profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />

              <Route
                path="profile/quotes"
                element={
                  <PrivateRoute>
                    <MyQuotesPage />
                  </PrivateRoute>
                }
              />

              {/* Ruta protegida de cotización */}
              <Route
                path="quotation"
                element={
                  <PrivateRoute>
                    <QuotationPage />
                  </PrivateRoute>
                }
              />

              {/* Rutas de órdenes comentadas temporalmente
              <Route path="orders">
                <Route
                  index
                  element={
                    <PrivateRoute>
                      <OrdersPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="success"
                  element={
                    <PrivateRoute>
                      <OrderSuccessPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path=":id"
                  element={
                    <PrivateRoute>
                      <OrderDetailPage />
                    </PrivateRoute>
                  }
                />
              </Route>
              */}

              {/* Ruta 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Rutas de Administración */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />

              {/* Productos */}
              <Route path="products">
                <Route index element={<AdminProductsPage />} />
                <Route path="new" element={<AdminProductFormPage />} />
                <Route path="edit/:id" element={<AdminProductFormPage />} />
              </Route>

              {/* Categorías */}
              <Route path="categories">
                <Route index element={<AdminCategoriesPage />} />
                <Route path="new" element={<AdminCategoryFormPage />} />
                <Route path="edit/:id" element={<AdminCategoryFormPage />} />
              </Route>

              {/* Marcas */}
              <Route path="brands">
                <Route index element={<AdminBrandsPage />} />
                <Route path="new" element={<AdminBrandFormPage />} />
                <Route path="edit/:id" element={<AdminBrandFormPage />} />
              </Route>

              {/* Servicios */}
              <Route path="services">
                <Route index element={<AdminServicesPage />} />
                <Route path="new" element={<AdminServiceFormPage />} />
                <Route path="edit/:id" element={<AdminServiceFormPage />} />
              </Route>

              {/* Órdenes */}
              {/* Órdenes (Comentado temporalmente)
              <Route path="orders">
                <Route index element={<AdminOrdersPage />} />
                <Route path=":id" element={<AdminOrderDetailPage />} />
              </Route>
              */}

              {/* Cotizaciones */}
              <Route path="quotes" element={<AdminQuotesPage />} />

              {/* Usuarios */}
              <Route path="users">
                <Route index element={<AdminUsersPage />} />
              </Route>

              {/* Imágenes del Hero */}
              <Route path="hero-images" element={<AdminHeroImagesPage />} />

              {/* Partners/Aliados - Experiencia */}
              <Route path="partners" element={<AdminPartnersPage />} />
            </Route>
          </Routes>

          {/* Toast Container Global */}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
