import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import ReviewList from '../components/ReviewList';
import api from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import { logAddToCart, logEvent } from '../utils/analytics';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
          logEvent('Product', 'View Item', res.data.data.name);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      logAddToCart({ ...product, quantity });
      logEvent('Product', 'Add to Cart', product.name);
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          Back to Home
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <SEO
        title={product.name}
        description={product.description}
        image={product.imageUrl || product.image}
        url={`https://estore.example.com/product/${product._id}`}
        type="product"
      />
      <button
        onClick={() => navigate('/')}
        className="text-primary hover:text-primary-dark mb-4 font-medium"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

        {/* Product Image */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <OptimizedImage
            src={product.imageUrl || product.image}
            alt={product.name}
            className="w-full h-auto aspect-square"
            width={600}
            height={600}
          />
        </motion.div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          <div className="flex items-center space-x-4">
            <span className="text-2xl md:text-3xl font-bold text-primary">${product.price}</span>
            <span className="text-sm text-gray-500">SKU: {product._id}</span>
          </div>

          <p className="text-gray-600 text-lg leading-relaxed">
            {product.description}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h3 className="font-bold text-gray-900">Product Details</h3>
            <p className="text-gray-600">Category: {product.category}</p>
            <p className="text-gray-600">Stock: {product.stock} available</p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-4">
              <label className="font-bold text-gray-700">Quantity:</label>
              <div className="flex items-center space-x-2 border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 touch-manipulation"
                >
                  −
                </button>
                <span className="px-4 py-2 font-bold min-w-[3ch] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 min-h-[44px] text-gray-600 hover:bg-gray-100 touch-manipulation"
                >
                  +
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="w-full bg-primary text-white font-bold py-3 md:py-4 rounded-lg hover:opacity-90 transition-opacity min-h-[48px] shadow-md"
            >
              Add to Cart
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full border-2 border-primary text-primary font-bold py-3 md:py-4 rounded-lg hover:bg-blue-50 transition-colors min-h-[48px]"
            >
              Buy Now
            </motion.button>
          </div>
        </div>
      </div >

      {/* Review Section */}
      < ReviewList productId={id} />
    </motion.div >
  );
};

export default ProductDetail;