import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, XCircle, AlertTriangle, Activity, Database, Server, Clock } from 'lucide-react';
import axios from 'axios';

const StatusPage = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStatus = async () => {
        try {
            const response = await axios.get('/health');
            setStatus(response.data);
        } catch (error) {
            setStatus({ status: 'error', message: 'System unreachable' });
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        if (typeof status === 'string' && status === 'ok') return 'text-green-500';
        if (status?.status === 'ok') return 'text-green-500';
        return 'text-red-500';
    };

    const getStatusIcon = (status) => {
        if (typeof status === 'string' && status === 'ok') return <CheckCircle className="w-6 h-6 text-green-500" />;
        if (status?.status === 'ok') return <CheckCircle className="w-6 h-6 text-green-500" />;
        return <XCircle className="w-6 h-6 text-red-500" />;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Helmet>
                <title>System Status | eStore</title>
                <meta name="description" content="Current system status and uptime monitoring for eStore services." />
            </Helmet>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Activity className="w-8 h-8 text-blue-500" />
                            System Status
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Real-time monitoring of our services
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${status?.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {status?.status === 'ok' ? 'All Systems Operational' : 'System Issues Detected'}
                    </div>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* API Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">API Service</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Core application backend</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${getStatusColor(status?.checks?.api)}`}>
                                    {status?.checks?.api === 'ok' ? 'Operational' : 'Down'}
                                </span>
                                {getStatusIcon(status?.checks?.api)}
                            </div>
                        </div>

                        {/* Database Status */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Database</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Primary data storage</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${getStatusColor(status?.checks?.database)}`}>
                                    {status?.checks?.database === 'ok' ? 'Operational' : 'Disconnected'}
                                </span>
                                {getStatusIcon(status?.checks?.database)}
                            </div>
                        </div>

                        {/* Uptime Info */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>System Uptime: {status?.checks?.uptime ? `${Math.floor(status.checks.uptime / 60)} minutes` : 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <span>Last Updated: {lastUpdated?.toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Status updates are automatically refreshed every 30 seconds.</p>
            </div>
        </div>
    );
};

export default StatusPage;
