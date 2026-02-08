import React from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/LoginForm';

import SEO from '../components/SEO';

const Login = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen"
    >
      <SEO
        title="Login"
        description="Login to your eStore account based on your preferences."
        url="https://estore.example.com/login"
      />
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Login</h1>
        <LoginForm />
      </div>
    </motion.div>
  );
};

export default Login;