import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  CreditCard,
  Twitter as XIcon // Using standard icon mapping
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      // In a real app, this would make an API call
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* 1. Company Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white tracking-tight">eStore</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Your premium destination for high-quality products. We believe in quality,
              transparency, and exceptional customer service.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors aria-label=Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors aria-label=Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors aria-label=Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-primary transition-colors aria-label=YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* 2. Shop Categories */}
          <div>
            <h4 className="text-white font-semibold mb-6">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products?category=electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="hover:text-primary transition-colors">Clothing</Link></li>
              <li><Link to="/products?category=home" className="hover:text-primary transition-colors">Home & Living</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* 3. Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/tracking" className="hover:text-primary transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Stay Connected</h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-primary transition-colors text-white"
                  required
                />
                <Mail className="absolute left-3 top-2.5 text-gray-500" size={18} />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {isSubscribed ? 'Thanks for subscribing!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section: Legal & Payment */}
        <div className="border-t border-gray-800 pt-8 mt-8 md:flex md:justify-between md:items-center">

          {/* Copyright & Legal */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} eStore. All rights reserved.
            </p>
            <div className="flex justify-center md:justify-start space-x-4 mt-2 text-xs text-gray-500">
              <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-300">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-gray-300">Cookie Policy</Link>
            </div>
          </div>

          {/* Payment Icons */}
          <div className="flex justify-center space-x-3 text-gray-500">
            <CreditCard size={24} />
            <span className="text-sm font-semibold tracking-widest border border-gray-600 rounded px-1">VISA</span>
            <span className="text-sm font-semibold tracking-widest border border-gray-600 rounded px-1">MC</span>
            <span className="text-sm font-semibold tracking-widest border border-gray-600 rounded px-1">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;