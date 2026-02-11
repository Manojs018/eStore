import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Check, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const { login, verifyTwoFactor } = useAuth();
  const navigate = useNavigate();

  // Validation Logic
  const validate = (data) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!data.password) {
      newErrors.password = 'Password is required';
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

    // 2FA Flow
    if (showTwoFactor) {
      if (!twoFactorCode || twoFactorCode.length < 6) {
        toast.error('Please enter a valid 6-digit code');
        return;
      }
      setLoading(true);
      try {
        const result = await verifyTwoFactor(tempToken, twoFactorCode);
        if (result.success) {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        if (result.twoFactorRequired) {
          setTempToken(result.tempToken);
          setShowTwoFactor(true);
          toast('Please enter your 2FA code', { icon: '🔐' });
        } else {
          toast.success('Successfully logged in!');
          navigate('/');
        }
      } else {
        toast.error(result.error || 'Login failed. Please check your credentials.');
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
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {showTwoFactor ? 'Two-Factor Authentication' : 'Welcome Back'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {showTwoFactor ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="text-center mb-4">
              <Shield className="mx-auto h-12 w-12 text-primary-indigo mb-2" />
              <p className="text-gray-600 text-sm">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <div>
              <label htmlFor="code" className="block text-gray-700 text-sm font-bold mb-2">
                Authentication Code
              </label>
              <input
                type="text"
                id="code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo text-center text-2xl tracking-widest"
                placeholder="000000"
                autoFocus
              />
            </div>
          </motion.div>
        ) : (
          <>
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
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={(!isValid && !showTwoFactor) || loading}
          className="w-full bg-primary-indigo text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-6"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {showTwoFactor ? 'Verifying...' : 'Logging In...'}
            </span>
          ) : (showTwoFactor ? 'Verify Code' : 'Login')}
        </button>
      </form>

      {!showTwoFactor && (
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-indigo font-medium hover:text-electric-blue transition-colors">
              Register here
            </Link>
          </p>
        </div>
      )}

      {showTwoFactor && (
        <div className="text-center mt-6">
          <button onClick={() => setShowTwoFactor(false)} className="text-gray-500 text-sm hover:underline">
            Back to Login
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default LoginForm;