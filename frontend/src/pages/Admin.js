import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, FileText, Activity, TrendingUp, Shield } from 'lucide-react';
import AdminStats from '../components/admin/AdminStats';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminLogs from '../components/admin/AdminLogs';
import AdminMonitoring from '../components/admin/AdminMonitoring';
import UserAnalytics from '../components/admin/UserAnalytics';
import AdminSecurity from '../components/admin/AdminSecurity';

const Admin = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminStats />
            {/* Dashboard can also show recent orders summary */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
              <AdminOrders />
            </div>
          </motion.div>
        );
      case 'products':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminProducts />
          </motion.div>
        );
      case 'orders':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminOrders />
          </motion.div>
        );
      case 'users':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminUsers />
          </motion.div>
        );
      case 'logs':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminLogs />
          </motion.div>
        );
      case 'monitoring':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminMonitoring />
          </motion.div>
        );
      case 'analytics':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <UserAnalytics />
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AdminSecurity />
          </motion.div>
        );
      default:
        return <AdminStats />;
    }
  };

  const SidebarItem = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      data-testid={`nav-${id}`}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === id
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 -my-8 -mx-4">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r min-h-screen p-6 hidden md:block">
        <div className="flex items-center space-x-2 mb-10 text-primary">
          <LayoutDashboard size={28} />
          <span className="text-xl font-bold">Admin Panel</span>
        </div>

        <nav className="space-y-2">
          <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="products" label="Products" icon={Package} />
          <SidebarItem id="orders" label="Orders" icon={ShoppingCart} />
          <SidebarItem id="users" label="Users" icon={Users} />
          <SidebarItem id="logs" label="System Logs" icon={FileText} />
          <SidebarItem id="monitoring" label="Monitoring" icon={Activity} />
          <SidebarItem id="analytics" label="Analytics" icon={TrendingUp} />
          <SidebarItem id="security" label="Security" icon={Shield} />
        </nav>

        <div className="mt-auto pt-10">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden bg-white p-4 shadow-sm flex overflow-x-auto space-x-4">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-gray-600'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('products')} className={`p-2 rounded ${activeTab === 'products' ? 'bg-primary text-white' : 'text-gray-600'}`}>Products</button>
        <button onClick={() => setActiveTab('orders')} className={`p-2 rounded ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-600'}`}>Orders</button>
        <button onClick={() => setActiveTab('users')} className={`p-2 rounded ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-600'}`}>Users</button>
        <button onClick={() => setActiveTab('logs')} className={`p-2 rounded ${activeTab === 'logs' ? 'bg-primary text-white' : 'text-gray-600'}`}>Logs</button>
        <button onClick={() => setActiveTab('monitoring')} className={`p-2 rounded ${activeTab === 'monitoring' ? 'bg-primary text-white' : 'text-gray-600'}`}>Monitor</button>
        <button onClick={() => setActiveTab('analytics')} className={`p-2 rounded ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-gray-600'}`}>Analytics</button>
        <button onClick={() => setActiveTab('security')} className={`p-2 rounded ${activeTab === 'security' ? 'bg-primary text-white' : 'text-gray-600'}`}>Security</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
            <p className="text-gray-500 text-sm">Overview of your store's {activeTab}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@estore.com'}</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;