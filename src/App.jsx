import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { CartProvider } from './context/CartContext';
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
import './App.css';

function CustomerLayout({ children }) {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <CartProvider>
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
      </CartProvider>
    </AdminProvider>
  );
}

export default App;
