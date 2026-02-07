import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Package,
  Heart
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would filter products or go to search page
      // For now, we'll navigate to products with a search param (implementation detail)
      // or simply focus the products page's search if available.
      // Let's assume navigating to /products?search=... is the goal
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 font-sans border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">

          {/* 1. Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary text-white p-2 rounded-lg group-hover:bg-primary-dark transition-colors">
              <ShoppingBag size={24} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-gray-800 tracking-tight">
              eStore
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path
                  ? 'text-primary'
                  : 'text-gray-600'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Admin Link (Conditional) */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 text-sm font-medium px-3 py-1 rounded-full ${location.pathname.startsWith('/admin')
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-purple-600 hover:bg-purple-50'
                  }`}
              >
                <LayoutDashboard size={16} />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* 3. Search Bar (Desktop) */}
          <div className="hidden lg:block w-72">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
              <Search className="absolute left-3.5 top-2.5 text-gray-400" size={18} />
            </form>
          </div>

          {/* 4. Actions (Cart, User, Mobile Toggle) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Wishlist Icon */}
            <Link to="/wishlist" aria-label="Wishlist" className="relative p-2 text-gray-600 hover:text-primary transition-colors hover:bg-gray-50 rounded-full">
              <Heart size={24} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {/* Cart Icon */}
            <Link to="/cart" aria-label="Shopping Cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors hover:bg-gray-50 rounded-full">
              <ShoppingBag size={24} />
              {getCartItemsCount() > 0 && (
                <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User Menu"
                  aria-expanded={isUserMenuOpen}
                  className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full border border-gray-200 hover:border-primary/50 transition-all ml-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} className="mr-3 text-gray-400" />
                          Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package size={16} className="mr-3 text-gray-400" />
                          My Orders
                        </Link>
                        {/* Wishlist could go here */}
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary font-medium text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white hover:bg-primary-dark font-medium text-sm px-5 py-2.5 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg ml-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-4 py-3 rounded-lg text-sm font-medium ${location.pathname === link.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {!user && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="text-center py-2.5 text-gray-700 bg-gray-50 rounded-lg font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-center py-2.5 text-white bg-primary rounded-lg font-medium text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;