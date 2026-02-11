import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShoppingCart, CreditCard, TrendingUp, UserPlus, Eye, ShoppingBag } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const UserAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // Calculate start date based on range
            const endDate = new Date();
            const startDate = new Date();
            if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
            if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
            if (dateRange === '90d') startDate.setDate(endDate.getDate() - 90);

            const res = await axios.get(`/api/analytics/dashboard?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setData(res.data.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!data) return <div className="p-8 text-center">No data available</div>;

    // Calculate Conversion Rates
    const viewToCartRate = data.funnel.view_item > 0 ? ((data.funnel.add_to_cart / data.funnel.view_item) * 100).toFixed(1) : 0;
    const cartToCheckoutRate = data.funnel.add_to_cart > 0 ? ((data.funnel.begin_checkout / data.funnel.add_to_cart) * 100).toFixed(1) : 0;
    const checkoutToPurchaseRate = data.funnel.begin_checkout > 0 ? ((data.funnel.purchase / data.funnel.begin_checkout) * 100).toFixed(1) : 0;
    const overallConversionRate = data.uniqueVisitors > 0 ? ((data.funnel.purchase / data.uniqueVisitors) * 100).toFixed(1) : 0;

    // Chart Data: Daily Activity
    const activityChartData = {
        labels: data.dailyActivity.map(d => d.date),
        datasets: [
            {
                label: 'Page Views',
                data: data.dailyActivity.map(d => d.views),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Unique Users',
                data: data.dailyActivity.map(d => d.uniqueUsers),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y1',
            },
        ],
    };

    // Chart Data: Funnel
    const funnelChartData = {
        labels: ['View Product', 'Add to Cart', 'Begin Checkout', 'Purchase'],
        datasets: [
            {
                label: 'Users',
                data: [
                    data.funnel.view_item,
                    data.funnel.add_to_cart,
                    data.funnel.begin_checkout,
                    data.funnel.purchase
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="text-blue-600" /> User Analytics
                </h2>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-white border text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Eye size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Unique Visitors</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{data.uniqueVisitors}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        Total Views: {data.totalPageViews}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Add to Cart Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{viewToCartRate}%</p>
                    <p className="text-xs text-gray-400 mt-1">View to Cart</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                            <CreditCard size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Checkout Dropout</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{100 - checkoutToPurchaseRate}%</p>
                    <p className="text-xs text-gray-400 mt-1">Abandonment Rate</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{overallConversionRate}%</p>
                    <p className="text-xs text-gray-400 mt-1">Visitor to Purchase</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Funnel Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6">Conversion Funnel</h3>
                    <div className="h-64">
                        <Bar
                            data={funnelChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }}
                        />
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-6">User Activity (Daily)</h3>
                    <div className="h-64">
                        <Line
                            data={activityChartData}
                            options={{
                                maintainAspectRatio: false,
                                interaction: { mode: 'index', intersect: false },
                                scales: {
                                    y: { type: 'linear', display: true, position: 'left' },
                                    y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } },
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Events Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Recent Live Events</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-500 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 font-medium">Time</th>
                                <th className="px-6 py-3 font-medium">Event</th>
                                <th className="px-6 py-3 font-medium">User/Guest</th>
                                <th className="px-6 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.recentEvents.map((event, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">{new Date(event.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${event.eventType === 'purchase' ? 'bg-green-100 text-green-700' :
                                                event.eventType === 'add_to_cart' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {event.eventType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">{event.userId ? 'User: ' + event.userId : 'Guest: ' + event.guestId?.substr(0, 8)}...</td>
                                    <td className="px-6 py-4 text-gray-600">{event.url} {event.metadata?.productName ? `(${event.metadata.productName})` : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
