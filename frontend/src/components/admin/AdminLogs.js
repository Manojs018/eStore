import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        level: '',
        search: '',
    });
    const [stats, setStats] = useState({
        total: 0,
        info: 0,
        warn: 0,
        error: 0
    });

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            if (filter.level) queryParams.append('level', filter.level);
            if (filter.search) queryParams.append('search', filter.search);

            const res = await axios.get(`/api/admin/logs?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setLogs(res.data.data);
                // Calculate stats on the fly from the current page/batch or ask BE for it.
                // For now, simpler to trust the list or BE. 
                // We'll roughly count from the fetched batch for immediate feedback.
                const counts = res.data.data.reduce((acc, log) => {
                    acc.total++;
                    if (log.level === 'info') acc.info++;
                    else if (log.level === 'warn') acc.warn++;
                    else if (log.level === 'error') acc.error++;
                    return acc;
                }, { total: 0, info: 0, warn: 0, error: 0 });
                setStats(counts);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000); // Auto refresh every 10s
        return () => clearInterval(interval);
    }, [filter]);

    const getLevelColor = (level) => {
        switch (level) {
            case 'error': return 'text-red-600 bg-red-100';
            case 'warn': return 'text-yellow-600 bg-yellow-100';
            case 'info': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'error': return <AlertTriangle size={16} />;
            case 'warn': return <AlertTriangle size={16} />; // Same icon for warn but different color
            case 'info': return <Info size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters and Stats */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={filter.level}
                        onChange={(e) => setFilter({ ...filter, level: e.target.value })}
                    >
                        <option value="">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warn">Warn</option>
                        <option value="error">Error</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={fetchLogs}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Log List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading logs...</td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No logs found</td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getLevelColor(log.level)}`}>
                                                {getLevelIcon(log.level)}
                                                {log.level.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.service || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-mono max-w-xs truncate" title={JSON.stringify(log.message || log)}>
                                            {typeof log.message === 'string' ? log.message : JSON.stringify(log.message)}
                                            {log.url && <span className="text-gray-400 ml-2">({log.method} {log.url})</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {log.requestId || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;
