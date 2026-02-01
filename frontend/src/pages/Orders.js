import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { TableRowSkeleton } from '../components/SkeletonLoader';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (isAuthenticated) {
      const fetchOrders = async () => {
        try {
          const response = await axios.get('/api/orders');
          if (response.data.success) {
            setOrders(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
          // Optional: toast error
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <h1 className="text-3xl font-bold mb-4">Please Login</h1>
        <p className="text-gray-600">You need to login to view your orders</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize
                    ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                    {order.orderStatus}
                  </span>
                  <p className="font-bold text-lg mt-1">${order.totalAmount?.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-600 text-sm">
                      <span>{item.product ? item.product.name : item.name} (x{item.quantity})</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tracking Information */}
              {
                order.trackingInfo && order.trackingInfo.trackingNumber && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2 text-blue-600">Tracking Information</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                      <p><span className="font-semibold">Carrier:</span> {order.trackingInfo.carrier || 'N/A'}</p>
                      <p><span className="font-semibold">Tracking #:</span> {order.trackingInfo.trackingNumber}</p>
                      {order.trackingInfo.trackingUrl && (
                        <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Track Shipment
                        </a>
                      )}
                    </div>
                  </div>
                )
              }

              {/* Status History */}
              {
                order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2 text-purple-600">Order History</h4>
                    <div className="space-y-3">
                      {order.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 capitalize">{history.status}</p>
                            <p className="text-xs text-gray-500">{new Date(history.date).toLocaleString()}</p>
                            {history.comment && <p className="text-xs text-gray-600 mt-0.5">{history.comment}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Orders;