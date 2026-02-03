import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Check, AlertCircle } from 'lucide-react';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import { toast } from 'react-hot-toast';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation Logic
  const validate = (data) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (data.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordErrors = [];
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else {
      if (data.password.length < 8) passwordErrors.push('min 8 chars');
      if (!/[A-Z]/.test(data.password)) passwordErrors.push('uppercase');
      if (!/[a-z]/.test(data.password)) passwordErrors.push('lowercase');
      if (!/[0-9]/.test(data.password)) passwordErrors.push('number');
      if (!/[@$!%*?&]/.test(data.password)) passwordErrors.push('special char');
      if (data.password.toLowerCase() === 'password123') passwordErrors.push('common password rejected');

      if (passwordErrors.length > 0) {
        newErrors.password = 'Does not meet strength requirements';
      }
    }

    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  useEffect(() => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setIsValid(Object.keys(validationErrors).length === 0 &&
      Object.values(formData).every(val => val !== ''));
  }, [formData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        toast.success('Registration successful! Please login.');
        navigate('/');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200";
    if (touched[fieldName]) {
      if (errors[fieldName]) {
        return `${baseClass} border-red-500 bg-red-50 focus:ring-red-200`;
      }
      return `${baseClass} border-green-500 bg-green-50 focus:ring-green-200`;
    }
    return `${baseClass} border-gray-300 focus:ring-primary-indigo`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName('name')}
              placeholder="John Doe"
            />
            {touched.name && !errors.name && (
              <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
            )}
            {touched.name && errors.name && (
              <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
            )}
          </div>
          {touched.name && errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName('email')}
              placeholder="john@example.com"
            />
            {touched.email && !errors.email && (
              <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
            )}
            {touched.email && errors.email && (
              <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
            )}
          </div>
          {touched.email && errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName('password')}
              placeholder="••••••••"
            />
          </div>
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getFieldClassName('confirmPassword')}
              placeholder="••••••••"
            />
            {touched.confirmPassword && !errors.confirmPassword && (
              <Check className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
            )}
            {touched.confirmPassword && errors.confirmPassword && (
              <AlertCircle className="absolute right-3 top-2.5 h-5 w-5 text-red-500" />
            )}
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full bg-primary-indigo text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : 'Register'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-indigo font-medium hover:text-electric-blue transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterForm;