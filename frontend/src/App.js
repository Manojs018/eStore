import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import PerformanceDashboard from './components/PerformanceDashboard';
import './App.css';

import { initGA, logPageView } from './utils/analytics';

const PageTracker = () => {
  const location = useLocation();

  React.useEffect(() => {
    initGA();
    logPageView();
  }, [location]);

  return null;
};

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Products = React.lazy(() => import('./pages/Products'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Admin = React.lazy(() => import('./pages/Admin'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen bg-background">
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        theme: {
                          primary: '#4aed88',
                          secondary: 'black',
                        },
                      },
                    }}
                  />
                  <PageTracker />
                  <OfflineBanner />
                  {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
                  <Header />
                  <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-8">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
