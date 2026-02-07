import React from 'react';

const PageLoader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading...</p>
            </div>
        </div>
    );
};

export default PageLoader;
