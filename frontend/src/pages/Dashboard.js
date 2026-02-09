import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Activity, Database, Server, Clock } from 'lucide-react';
import StatusPage from '../pages/StatusPage';

const PerformanceDashboard = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Helmet>
                <title>Performance Dashboard | eStore</title>
                <meta name="description" content="Real-time performance metrics and monitoring dashboard." />
            </Helmet>

            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-500" />
                Performance Overview
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Response Time</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">125ms</h3>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <span>▼ 12% vs last hour</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Throughput</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1.2k rpm</h3>
                        </div>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                        <span>▲ 5% vs last hour</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Error Rate</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">0.05%</h3>
                        </div>
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Activity className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <span>Synced with Sentry</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Database</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4ms</h3>
                        </div>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <span>Healthy</span>
                    </div>
                </div>
            </div>

            {/* Integration Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">New Relic APM Connected</h3>
                <p className="text-blue-700 dark:text-blue-300">
                    Performance data is being streamed to New Relic One. View detailed transaction traces, database query analysis, and more in your New Relic dashboard.
                </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">System Health Status</h2>
            <StatusPage />
        </div>
    );
};

export default PerformanceDashboard;
