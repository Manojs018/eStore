import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CartItemSkeleton } from '../components/SkeletonLoader';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated) {
      // Simulate API fetch
      const timer = setTimeout(() => {
        // Mock data fetch
        setLoading(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
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
      <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
      {loading ? (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <CartItemSkeleton key={i} />
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-6">Your cart is empty</p>
          <Link to="/" className="text-primary hover:text-primary-dark font-semibold text-lg">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-2">
                <span className="font-medium text-lg">{item.name}</span>
                <span className="font-bold text-primary text-xl">${item.price}</span>
              </div>
            ))}
          </div>
          <Link to="/checkout" className="mt-8 bg-primary text-white w-full py-4 rounded-lg hover:opacity-90 transition-opacity block text-center font-bold text-lg min-h-[48px] shadow-md">
            Proceed to Checkout
          </Link>
        </div>
      )}
    </motion.div>
  );
};


export default Cart;