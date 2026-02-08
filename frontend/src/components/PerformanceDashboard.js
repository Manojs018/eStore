import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import { Activity, Zap, Clock, MousePointer, Layout } from 'lucide-react';

const MetricCard = ({ title, value, status, icon: Icon, description }) => {
    const getStatusColor = (val, thresholds) => {
        if (val <= thresholds[0]) return 'text-green-500 bg-green-50 border-green-100';
        if (val <= thresholds[1]) return 'text-yellow-500 bg-yellow-50 border-yellow-100';
        return 'text-red-500 bg-red-50 border-red-100';
    };

    // Thresholds based on Google's Core Web Vitals
    let thresholds = [0, 0];
    let displayValue = value;
    let unit = 'ms';

    switch (title) {
        case 'LCP': // Largest Contentful Paint
            thresholds = [2500, 4000];
            break;
        case 'INP': // Interaction to Next Paint
            thresholds = [200, 500];
            break;
        case 'CLS': // Cumulative Layout Shift
            thresholds = [0.1, 0.25];
            unit = '';
            displayValue = typeof value === 'number' ? value.toFixed(3) : value;
            break;
        case 'FCP': // First Contentful Paint
            thresholds = [1800, 3000];
            break;
        case 'TTFB': // Time to First Byte
            thresholds = [800, 1800];
            break;
        default:
            thresholds = [0, 0];
    }

    const colorClass = getStatusColor(value, thresholds);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${colorClass} transition-shadow hover:shadow-md cursor-help group relative`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <Icon size={18} />
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-white/50">{value === 0 ? 'Waiting...' : `${displayValue}${unit}`}</span>
            </div>
            <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-current transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((value / (thresholds[1] * 1.5 || 1)) * 100, 100)}%` }}
                />
            </div>

            {/* Tooltip */}
            <div className="absolute top-full left-0 w-full mt-2 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                {description}
                <div className="mt-1 opacity-70">
                    Good: {'<'} {thresholds[0]}{unit} • Poor: {'>'} {thresholds[1]}{unit}
                </div>
            </div>
        </motion.div>
    );
};

const PerformanceDashboard = () => {
    const [metrics, setMetrics] = useState({
        LCP: 0,
        INP: 0,
        CLS: 0,
        FCP: 0,
        TTFB: 0
    });

    useEffect(() => {
        // Collect real-time metrics for this session
        onLCP((m) => setMetrics(prev => ({ ...prev, LCP: m.value })));
        onINP((m) => setMetrics(prev => ({ ...prev, INP: m.value })));
        onCLS((m) => setMetrics(prev => ({ ...prev, CLS: m.value })));
        onFCP((m) => setMetrics(prev => ({ ...prev, FCP: m.value })));
        onTTFB((m) => setMetrics(prev => ({ ...prev, TTFB: m.value })));
    }, []);

    // Only show in development or for admin users (simulated logic here)
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 z-50">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 w-80 max-h-[80vh] overflow-y-auto">
                <h3 className="text-gray-800 font-bold mb-4 flex items-center">
                    <Activity className="mr-2 text-primary" size={20} />
                    Performance Vitals
                </h3>

                <div className="space-y-3">
                    <MetricCard
                        title="LCP"
                        value={metrics.LCP}
                        icon={Zap}
                        description="Largest Contentful Paint: Measures loading performance. How long it takes for the main content to load."
                    />
                    <MetricCard
                        title="INP"
                        value={metrics.INP}
                        icon={MousePointer}
                        description="Interaction to Next Paint: Measures responsiveness. How fast the page responds to user inputs."
                    />
                    <MetricCard
                        title="CLS"
                        value={metrics.CLS}
                        icon={Layout}
                        description="Cumulative Layout Shift: Measures visual stability. How much content shifts unexpectedly."
                    />
                    <MetricCard
                        title="FCP"
                        value={metrics.FCP}
                        icon={Clock}
                        description="First Contentful Paint: Time until the first text or image is painted."
                    />
                    <MetricCard
                        title="TTFB"
                        value={metrics.TTFB}
                        icon={Activity}
                        description="Time to First Byte: Responsiveness of the web server."
                    />
                </div>
                <div className="mt-4 text-[10px] text-gray-400 text-center border-t pt-2">
                    Live Session Metrics (Dev Mode Only)
                </div>
            </div>
        </div>
    );
};

export default PerformanceDashboard;
