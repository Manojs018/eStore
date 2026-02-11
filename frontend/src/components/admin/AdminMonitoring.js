import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, Server, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminMonitoring = () => {
    const [stats, setStats] = useState(null);
    const [slowQueries, setSlowQueries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/monitoring/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Failed to fetch stats';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlowQueries = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/admin/monitoring/slow-queries', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.data.success) {
                setSlowQueries(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch slow queries', err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchSlowQueries();
    }, []);

    if (loading && !stats) return <div className="p-8 text-center">Loading Monitoring Data...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Server size={24} /> System Health
                </h2>
                <button
                    onClick={() => { fetchStats(); fetchSlowQueries(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Server size={24} />
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${parseFloat(stats?.system?.memory?.percent) > 80 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {stats?.system?.memory?.percent} Used
                        </span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Memory Usage</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.system?.memory?.used} / {stats?.system?.memory?.total}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Database size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Database Storage</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.database?.storageSize}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats?.database?.objects} Objects</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <Clock size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">System Uptime</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{(stats?.system?.uptime / 3600).toFixed(1)} Hours</p>
                    <p className="text-xs text-green-600 mt-1">Target: 99.9% SLA</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                            <AlertTriangle size={24} />
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{stats?.connections?.active} Active</span>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">DB Connections</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.connections?.current}</p>
                </div>
            </div>

            {/* Detailed Stats & Slow Queries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Slow Queries ({slowQueries.length})</h3>
                    </div>
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-500 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Collection</th>
                                    <th className="px-6 py-3 font-medium">Operation</th>
                                    <th className="px-6 py-3 font-medium">Duration</th>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {slowQueries.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No slow queries detected</td>
                                    </tr>
                                ) : (
                                    slowQueries.map((q, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{q.collectionName}</td>
                                            <td className="px-6 py-4">{q.operation}</td>
                                            <td className="px-6 py-4 text-red-600 font-bold">{q.duration}ms</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(q.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">Database Details</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Database Name</span>
                            <span className="font-medium">{stats?.database?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Collections</span>
                            <span className="font-medium">{stats?.database?.collections}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Data Size</span>
                            <span className="font-medium">{stats?.database?.dataSize}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Index Size</span>
                            <span className="font-medium">{stats?.database?.indexSize}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Avg Object Size</span>
                            <span className="font-medium">{Math.round(stats?.database?.avgObjSize)} bytes</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMonitoring;
