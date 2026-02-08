import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/SkeletonLoader';
import { SAMPLE_PRODUCTS, CATEGORIES } from '../utils/constants';
import SEO from '../components/SEO';

const Landing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    // Simulate API fetch delay
    setLoading(true);
    const timer = setTimeout(() => {
      setProducts(SAMPLE_PRODUCTS);
      setFilteredProducts(SAMPLE_PRODUCTS);
      setLoading(false);
    }, 1500); // Simulate 1.5 second loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return; // Do not filter if still loading

    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, loading]); // Added loading to dependency array

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Home"
        description="Welcome to eStore - Discover amazing products at unbeatable prices."
        url="https://estore.example.com/"
      />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-primary to-electric-blue text-white py-12 md:py-20 lg:py-24"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
            Welcome to eStore
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, reliable delivery.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent text-white px-8 py-3 md:py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg min-h-[44px]"
          >
            Shop Now
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                    ? 'bg-primary-indigo text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8 md:mb-12"
          >
            Featured Products
          </motion.h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-primary-indigo rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50. Delivered within 2-3 business days.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All products come with a 30-day return policy and quality assurance.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our customer support team is available around the clock to help you.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;