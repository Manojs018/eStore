import React, { useState } from 'react';
import { Shield, Lock, Smartphone, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const AdminSecurity = () => {
    const { user, login } = useAuth(); // We might need to refresh user profile
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('initial'); // initial, qr, verify, success
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [code, setCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);

    // Check if 2FA is already enabled based on user profile
    // Note: user object in context might not have this field if it wasn't populated on login/profile fetch.
    // We should ideally fetch fresh profile or assume user object has it if we updated User model and selected it.
    // By default 'twoFactorEnabled' is in user model, so it should be in 'user' context if we fetch profile.
    const [isEnabled, setIsEnabled] = useState(user?.twoFactorEnabled || false);

    React.useEffect(() => {
        // Fetch latest profile to get accurate 2FA status
        api.get('/auth/profile').then(res => {
            if (res.data.success) {
                setIsEnabled(res.data.data.twoFactorEnabled);
            }
        }).catch(err => console.error(err));
    }, []);

    const startSetup = async () => {
        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/setup');
            if (res.data.success) {
                setQrCode(res.data.qrCode);
                setSecret(res.data.secret);
                setStep('qr');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start 2FA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifySetup = async () => {
        if (!code) return;
        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/verify', { token: code });
            if (res.data.success) {
                setIsEnabled(true);
                setBackupCodes(res.data.recoveryCodes);
                setStep('success');
                toast.success('2FA Enabled Successfully');
                // Ideally update global user context here
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This makes your account less secure.')) return;

        // We might need a code to disable it securely, but for now simple disable endpoint
        // Actually our endpoint is defined to take a token validation for disable too?
        // Let's check backend implementation.. 
        // Yes: router.post('/2fa/disable' ... const verified = speakeasy.totp.verify...)
        // So we need to ask for a code to disable it.

        const token = prompt('Please enter your 2FA code to authenticate this action:');
        if (!token) return;

        setLoading(true);
        try {
            const res = await api.post('/auth/2fa/disable', { token });
            if (res.data.success) {
                setIsEnabled(false);
                setStep('initial');
                toast.success('2FA Disabled');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Shield size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication (2FA)</h2>
                        <p className="text-gray-500 text-sm">
                            Status: <span className={`font-medium ${isEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                {isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </p>
                    </div>
                </div>
                <div>
                    {isEnabled ? (
                        <button
                            onClick={disable2FA}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition"
                            disabled={loading}
                        >
                            Disable 2FA
                        </button>
                    ) : (
                        step === 'initial' && (
                            <button
                                onClick={startSetup}
                                className="px-4 py-2 bg-primary-indigo text-white rounded-lg hover:bg-opacity-90 font-medium transition shadow-md"
                                disabled={loading}
                            >
                                Enable 2FA
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Setup Flow */}
            {!isEnabled && step === 'qr' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Smartphone size={20} /> Setup Authenticator App
                    </h3>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {qrCode && <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mb-4 mix-blend-multiply" />}
                            <p className="text-xs text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded">Secret: {secret}</p>
                        </div>

                        <div className="space-y-4">
                            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                                <li>Install Google Authenticator or Authy on your phone.</li>
                                <li>Scan the QR code shown on the left.</li>
                                <li>Enter the 6-digit code generated by the app below.</li>
                            </ol>

                            <div className="mt-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Enter Verification Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-indigo outline-none text-lg tracking-widest text-center"
                                        placeholder="000000"
                                    />
                                    <button
                                        onClick={verifySetup}
                                        disabled={loading || code.length < 6}
                                        className="px-6 py-2 bg-primary-indigo text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {loading ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success / Recovery Codes */}
            {step === 'success' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-center gap-3 mb-6 text-green-700">
                        <CheckCircle size={28} />
                        <h3 className="text-xl font-bold">2FA is now enabled!</h3>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                            <div>
                                <h4 className="text-sm font-bold text-yellow-800">Save your backup codes</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    If you lose access to your authenticator app, you can use these codes to log in.
                                    Each code can only be used once. <strong>Save them in a secure place.</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-sm bg-gray-50 p-6 rounded-lg border border-gray-200">
                        {backupCodes.map((code, index) => (
                            <div key={index} className="bg-white p-2 text-center rounded border border-gray-300">
                                {code}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 text-right">
                        <button
                            onClick={() => { setStep('initial'); setBackupCodes([]); }}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                        >
                            I have saved these codes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSecurity;
