import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, Plus, Trash2, Globe, AlertTriangle, QrCode, Lock, Unlock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSecurity = ({ user }) => {
    // --- IP Whitelist State ---
    const [allowedIps, setAllowedIps] = useState([]);
    const [newIp, setNewIp] = useState('');
    const [label, setLabel] = useState('');
    const [ipLoading, setIpLoading] = useState(false);

    // --- 2FA State ---
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        fetchAllowedIps();
        if (user) {
            setCurrentUser(user);
        }
    }, [user]);

    // --- IP Management Functions ---
    const fetchAllowedIps = async () => {
        try {
            const response = await api.get('/admin/allowed-ips');
            if (response.data.success) {
                setAllowedIps(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch IPs', error);
        }
    };

    const handleAddIp = async (e) => {
        e.preventDefault();
        setIpLoading(true);
        try {
            const response = await api.post('/admin/allowed-ips', { ip: newIp, label });
            if (response.data.success) {
                toast.success('IP Added to Whitelist');
                setAllowedIps([response.data.data, ...allowedIps]);
                setNewIp('');
                setLabel('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add IP');
        } finally {
            setIpLoading(false);
        }
    };

    const handleDeleteIp = async (id) => {
        if (!window.confirm('Are you sure you want to remove this IP?')) return;
        try {
            const response = await api.delete(`/admin/allowed-ips/${id}`);
            if (response.data.success) {
                toast.success('IP Removed');
                setAllowedIps(allowedIps.filter(ip => ip._id !== id));
            }
        } catch (error) {
            toast.error('Failed to remove IP');
        }
    };

    // --- 2FA Functions ---
    const setupTwoFactor = async () => {
        setTwoFaLoading(true);
        try {
            const response = await api.post('/auth/2fa/setup');
            if (response.data.success) {
                setQrCode(response.data.qrCode);
                setSecret(response.data.secret);
            }
        } catch (error) {
            toast.error('Failed to setup 2FA');
        } finally {
            setTwoFaLoading(false);
        }
    };

    const verifyTwoFactor = async () => {
        setTwoFaLoading(true);
        try {
            const response = await api.post('/auth/2fa/verify', { token });
            if (response.data.success) {
                toast.success('2FA Enabled Successfully');
                setRecoveryCodes(response.data.recoveryCodes);
                setShowBackupCodes(true);
                setQrCode('');
                setToken('');
                setCurrentUser({ ...currentUser, twoFactorEnabled: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid Code');
        } finally {
            setTwoFaLoading(false);
        }
    };

    const disableTwoFactor = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) return;

        // Creating a custom prompt to get the token for disabling
        const code = window.prompt("Enter your 2FA code to confirm disabling:");
        if (!code) return;

        setTwoFaLoading(true);
        try {
            const response = await api.post('/auth/2fa/disable', { token: code });
            if (response.data.success) {
                toast.success('2FA Disabled');
                setCurrentUser({ ...currentUser, twoFactorEnabled: false });
                setRecoveryCodes([]);
                setShowBackupCodes(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setTwoFaLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-primary-indigo" />
                Security Settings
            </h2>

            {/* --- IP Whitelist Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Globe className="text-blue-500" size={20} />
                        IP Whitelist
                    </h3>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Restrict Admin Access
                    </span>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Only IPs listed here can access the Admin Panel.
                    <span className="bg-gray-100 px-1 rounded ml-1">127.0.0.1</span> (Localhost) is always allowed.
                </p>

                <form onSubmit={handleAddIp} className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                        <input
                            type="text"
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            placeholder="e.g. 192.168.1.1"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-indigo outline-none"
                            required
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g. Office VPN"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-indigo outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={ipLoading}
                        className="px-6 py-2 bg-primary-indigo text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add IP
                    </button>
                </form>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allowedIps.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No IPs whitelisted.
                                    </td>
                                </tr>
                            ) : (
                                allowedIps.map((ip) => (
                                    <tr key={ip._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                                            {ip.ip}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ip.label || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ip.addedBy?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ip.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteIp(ip._id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 2FA Section --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <QrCode className="text-purple-500" size={20} />
                        Two-Factor Authentication
                    </h3>
                    {currentUser?.twoFactorEnabled ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            <Check size={12} /> Enabled
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                            <Lock size={12} /> Disabled
                        </span>
                    )}
                </div>

                {!currentUser?.twoFactorEnabled ? (
                    <div>
                        {!qrCode ? (
                            <div className="text-center py-6">
                                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                                    Protect your account with an extra layer of security. once enabled, you will be required to enter a code from your authenticator app when you login.
                                </p>
                                <button
                                    onClick={setupTwoFactor}
                                    disabled={twoFaLoading}
                                    className="px-6 py-2 bg-primary-indigo text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    Enable 2FA
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                                    <div className="bg-white p-4 rounded shadow-sm">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h4 className="font-semibold text-lg">Scan this QR Code</h4>
                                        <p className="text-sm text-gray-500">
                                            Use an authenticator app like Google Authenticator or Authy to scan the QR code.
                                        </p>
                                        <div>
                                            <p className="text-xs text-gray-400 mb-1">Manual Entry Code</p>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-gray-800 tracking-wider">
                                                    {secret}
                                                </code>
                                                <button onClick={() => copyToClipboard(secret)} className="text-gray-400 hover:text-primary-indigo">
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-xs mx-auto">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Authentication Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={token}
                                            onChange={(e) => setToken(e.target.value)}
                                            placeholder="000 000"
                                            className="block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-indigo text-center tracking-widest text-lg"
                                        />
                                        <button
                                            onClick={verifyTwoFactor}
                                            disabled={twoFaLoading || token.length < 6}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="p-6 bg-green-50 rounded-lg border border-green-100 mb-6 text-center">
                            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-green-900 mb-2">Two-Factor Authentication is Active</h4>
                            <p className="text-sm text-green-700 mb-6">
                                Your account is secure. You will be asked for a code when you login.
                            </p>

                            <button
                                onClick={disableTwoFactor}
                                className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                            >
                                Disable 2FA
                            </button>
                        </div>

                        {showBackupCodes && (
                            <div className="mb-6">
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Lock size={16} className="text-gray-500" />
                                    Backup Recovery Codes
                                </h4>
                                <div className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-sm grid grid-cols-2 gap-2">
                                    {recoveryCodes.map((code, index) => (
                                        <div key={index} className="bg-gray-700 px-2 py-1 rounded text-center">
                                            {code}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-red-500 mt-2">
                                    * Save these codes in a safe place. They will not be shown again.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSecurity;
