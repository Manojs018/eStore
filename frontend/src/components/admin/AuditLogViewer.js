import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        search: ''
    });

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...filters
            };
            // Remove empty filters
            Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

            const response = await api.get('/audit-logs', { params });
            if (response.data.success) {
                setLogs(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(pagination.page);
    }, [pagination.page]); // Only re-fetch when page changes. Filters trigger manual fetch or effect?

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination({ ...pagination, page: 1 });
        fetchLogs(1);
    };

    const handleReset = () => {
        setFilters({ action: '', resource: '', search: '' });
        setPagination({ ...pagination, page: 1 });
        // fetchLogs(1) - Need to wait for state update or pass empty filters directly
        // Better to just call fetchLogs(1) with empty filters object locally constructed, but relying on state in next render is safer if useEffect depends on filters.
        // But here useEffect only depends on page. So let's manually call.

        // Actually, let's just trigger a reload
        setTimeout(() => fetchLogs(1), 0);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="text-primary-indigo" />
                    Audit Trail
                </h2>

                <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search details..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-indigo outline-none"
                        />
                    </div>

                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-indigo outline-none"
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="UPDATE_STATUS">Status Update</option>
                        <option value="UPDATE_ROLE">Role Change</option>
                    </select>

                    <select
                        name="resource"
                        value={filters.resource}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-indigo outline-none"
                    >
                        <option value="">All Resources</option>
                        <option value="User">User</option>
                        <option value="Product">Product</option>
                        <option value="Order">Order</option>
                    </select>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-primary-indigo text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        Apply
                    </button>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        Reset
                    </button>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Action</th>
                            <th className="px-6 py-3">Resource</th>
                            <th className="px-6 py-3">Details</th>
                            <th className="px-6 py-3">IP Address</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <RefreshCw className="animate-spin h-6 w-6 mx-auto mb-2" />
                                    Loading logs...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No audit logs found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{log.user?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{log.user?.email || 'Deleted User'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                                                log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                        log.action === 'LOGIN' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                                        {log.resource} <span className="text-gray-400">#{log.resourceId?.slice(-6)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                                        {log.ip}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1 || loading}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.pages || loading}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogViewer;
