import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <span className="text-9xl font-extrabold text-gray-200 block select-none">
                    404
                </span>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    Oops! Page not found
                </h1>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                    <Home size={20} />
                    <span className="font-semibold">Go Home</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-16 border-t border-gray-100 pt-8 w-full max-w-2xl"
            >
                <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-6">
                    Suggestions for you
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        to="/products"
                        className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <div className="bg-blue-50 text-blue-500 p-3 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-primary">Shop Products</span>
                    </Link>

                    <Link
                        to="/cart"
                        className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <div className="bg-green-50 text-green-500 p-3 rounded-full mb-3 group-hover:bg-green-100 transition-colors">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-primary">View Cart</span>
                    </Link>

                    <Link
                        to="/contact" // Assuming contact route or just a placeholder if not existing, but used in footer so logical here
                        className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all group"
                    >
                        <div className="bg-purple-50 text-purple-500 p-3 rounded-full mb-3 group-hover:bg-purple-100 transition-colors">
                            <HelpCircle size={24} />
                        </div>
                        <span className="text-gray-700 font-medium group-hover:text-primary">Help Center</span>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
