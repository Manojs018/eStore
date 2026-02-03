import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (pass) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const strength = getStrength(password);

    const getLabel = () => {
        if (strength === 0) return 'None';
        if (strength < 3) return 'Weak';
        if (strength < 5) return 'Medium';
        return 'Strong';
    };

    const getColor = () => {
        if (strength === 0) return 'bg-gray-200';
        if (strength < 3) return 'bg-red-500';
        if (strength < 5) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Uppercase', met: /[A-Z]/.test(password) },
        { label: 'Lowercase', met: /[a-z]/.test(password) },
        { label: 'Number', met: /[0-9]/.test(password) },
        { label: 'Special char (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
    ];

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Strength</span>
                <span className="font-medium">{getLabel()}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-500">
                        {req.met ? (
                            <Check className="w-3 h-3 text-green-500 mr-1.5" />
                        ) : (
                            <X className="w-3 h-3 text-gray-300 mr-1.5" />
                        )}
                        <span className={req.met ? 'text-gray-700' : ''}>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
