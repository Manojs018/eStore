import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { Plus, Minus, Trash2 } from 'lucide-react';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [inputValue, setInputValue] = React.useState(item.quantity);

  // Sync internal state if props change (e.g. from restore or external update)
  React.useEffect(() => {
    setInputValue(item.quantity);
  }, [item.quantity]);

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    // Assuming max stock is available on item object, defaulting to 99 if not
    const maxStock = item.stock || 99;
    if (item.quantity < maxStock) {
      updateQuantity(item._id, item.quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const newVal = parseInt(e.target.value);
    setInputValue(e.target.value); // Allow typing empty during edit

    if (!isNaN(newVal) && newVal >= 1) {
      const maxStock = item.stock || 99;
      updateQuantity(item._id, Math.min(newVal, maxStock));
    }
  };

  const handleBlur = () => {
    // specific check on blur: usually revert to 1 if empty or invalid
    if (!inputValue || parseInt(inputValue) < 1) {
      setInputValue(1);
      updateQuantity(item._id, 1);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col sm:flex-row items-center bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100 gap-4 mb-4"
    >
      {/* Product Image & Name */}
      <div className="flex items-center gap-4 w-full sm:w-2/5">
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={item.imageUrl || item.image || 'https://via.placeholder.com/150'}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-center w-full sm:w-1/5">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="p-2 text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min="1"
            max={item.stock}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="w-12 text-center text-sm font-medium border-x border-gray-300 py-2 focus:outline-none"
          />
          <button
            onClick={handleIncrement}
            disabled={item.quantity >= (item.stock || 99)}
            className="p-2 text-gray-600 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Price */}
      <div className="w-full sm:w-1/5 text-center sm:text-right">
        <span className="font-bold text-gray-900 text-lg">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
        <div className="text-xs text-gray-500">
          ${item.price} each
        </div>
      </div>

      {/* Remove Button */}
      <div className="w-full sm:w-auto text-center sm:text-right">
        <button
          onClick={() => removeFromCart(item._id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;