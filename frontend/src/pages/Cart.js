import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/CartItem';
import { CartItemSkeleton } from '../components/SkeletonLoader';
import SEO from '../components/SEO';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cart, getCartTotal } = useCart();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay for better UX demo
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <SEO
          title="Cart"
          description="View your shopping cart."
          url="https://estore.example.com/cart"
        />
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600 mb-8">You need to login to view your cart</p>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90">
          Go to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 container mx-auto px-4 py-8"
    >
      <SEO
        title="Shopping Cart"
        description="View your shopping cart."
        url="https://estore.example.com/cart"
      />
      <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <Link to="/" className="text-primary hover:text-primary-dark font-semibold text-lg">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-4 md:p-6">
            <div className="space-y-4">
              {cart.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 border-b pb-4">Order Summary</h2>
              <div className="flex justify-between mb-2 text-gray-600">
                <span>Subtotal</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-bold text-gray-900 border-t pt-4">
                <span>Total</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="bg-primary text-white w-full py-4 rounded-lg hover:opacity-90 transition-opacity block text-center font-bold text-lg shadow-md">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;