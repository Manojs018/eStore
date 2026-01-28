import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const CheckoutFormContent = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    // Basic validation
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode || !shippingInfo.country) {
      setError('Please fill in all shipping fields');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent on backend
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: Math.round(getCartTotal() * 100), // Convert to cents
          items: cart,
          shippingInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      const { clientSecret, mock } = await response.json();

      let paymentResult;

      if (mock) {
        // Simulation for development without Stripe keys
        console.warn('Using MOCK payment flow');
        await new Promise(r => setTimeout(r, 1500)); // Simulate processing
        paymentResult = { paymentIntent: { status: 'succeeded' } };
      } else {
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: user.name,
              email: user.email,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                postal_code: shippingInfo.zipCode,
                country: shippingInfo.country,
              }
            }
          }
        });
        paymentResult = result;
      }

      const { paymentIntent, error: stripeError } = paymentResult;

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        clearCart();
        navigate('/orders');
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    }

    setLoading(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#9e2146'
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={shippingInfo.address}
              onChange={handleShippingChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={shippingInfo.zipCode}
              onChange={handleShippingChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={shippingInfo.country}
              onChange={handleShippingChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-indigo"
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          {cart.map(item => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-4">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary-indigo text-white py-3 px-4 rounded-md hover:bg-electric-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
      >
        {loading ? 'Processing...' : `Pay $${getCartTotal().toFixed(2)}`}
      </button>
    </form>
  );
};

const CheckoutForm = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent />
    </Elements>
  );
};

export default CheckoutForm;