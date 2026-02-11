import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Heart } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { logAddToCart } from '../utils/analytics';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logAddToCart(product); // Add logging
    addToCart(product);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  const isLiked = isInWishlist(product._id);

  return (
    <motion.div
    // ...
    >
      <Link to={`/product/${product._id}`}>
        <div className="relative overflow-hidden bg-gray-100">
          <OptimizedImage
            src={product.imageUrl || product.image}
            alt={product.name}
            className="w-full h-48 transition-transform duration-300 hover:scale-105"
            width={400}
            height={300}
          />
          {!product.inStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm z-10">
              Out of Stock
            </div>
          )}

          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all z-20"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={20}
              className={`transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {product.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl md:text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="text-sm text-gray-600">
                {product.averageRating || product.rating || 0} ({product.numOfReviews || product.reviews || 0})
              </span>
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors min-h-[44px] ${product.inStock
            ? 'bg-primary text-white hover:bg-opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;