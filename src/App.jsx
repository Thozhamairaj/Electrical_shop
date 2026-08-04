import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductPage from './pages/ProductPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import UserSync from './components/UserSync';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReviews from './pages/admin/AdminReviews';
import Chatbot from './components/Chatbot';
import CheckoutLink from './pages/CheckoutLink';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import './App.css';

function CustomerLayout({ children }) {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <WishlistProvider>
          <UserSync />
          <Router>
            <Routes>
            {/* ── Admin routes (no customer header/footer) ─────────── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedAdminRoute>
                  <AdminProducts />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedAdminRoute>
                  <AdminOrders />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedAdminRoute>
                  <AdminReviews />
                </ProtectedAdminRoute>
              }
            />
            {/* Redirect bare /admin to dashboard */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ── Customer routes (with Header & Footer) ───────────── */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <Home />
                </CustomerLayout>
              }
            />
            <Route
              path="/products"
              element={
                <CustomerLayout>
                  <Products />
                </CustomerLayout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <CustomerLayout>
                  <ProductPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/about"
              element={
                <CustomerLayout>
                  <About />
                </CustomerLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <CustomerLayout>
                  <Contact />
                </CustomerLayout>
              }
            />

            {/* Protected customer routes */}
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <SignedIn>
                    <Cart />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/auth" replace />
                  </SignedOut>
                </CustomerLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <CustomerLayout>
                  <SignedIn>
                    <Profile />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/auth" replace />
                  </SignedOut>
                </CustomerLayout>
              }
            />
            <Route
              path="/wishlist"
              element={
                <CustomerLayout>
                  <Wishlist />
                </CustomerLayout>
              }
            />
            <Route
              path="/orders"
              element={
                <CustomerLayout>
                  <SignedIn>
                    <Orders />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/auth" replace />
                  </SignedOut>
                </CustomerLayout>
              }
            />

            {/* Public Payment Link */}
            <Route path="/payment-link/:orderId" element={<CheckoutLink />} />

            {/* Auth page */}
            <Route
              path="/auth"
              element={
                <CustomerLayout>
                  <SignedOut>
                    <Auth />
                  </SignedOut>
                  <SignedIn>
                    <Navigate to="/" replace />
                  </SignedIn>
                </CustomerLayout>
              }
            />
          </Routes>
        </Router>
      </WishlistProvider>
    </CartProvider>
  </AdminProvider>
  );
}

export default App;
