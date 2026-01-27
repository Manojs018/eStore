import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export const ProductCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48">
                <Skeleton height="100%" />
            </div>
            <div className="p-4">
                <div className="mb-2">
                    <Skeleton height={24} width="80%" />
                </div>
                <div className="mb-3">
                    <Skeleton count={3} />
                </div>
                <div className="flex items-center justify-between mb-3">
                    <Skeleton width={80} height={28} />
                    <Skeleton width={60} />
                </div>
                <Skeleton height={40} className="w-full" borderRadius={6} />
            </div>
        </div>
    );
};

export const ProductDetailSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="rounded-lg overflow-hidden h-[400px]">
                <Skeleton height="100%" />
            </div>
            <div className="space-y-6">
                <Skeleton height={48} width="90%" />
                <div className="flex items-center space-x-4">
                    <Skeleton width={100} height={36} />
                    <Skeleton width={80} />
                </div>
                <Skeleton count={4} />
                <div className="rounded-lg p-4 space-y-2">
                    <Skeleton height={24} width="40%" />
                    <Skeleton width="60%" />
                    <Skeleton width="50%" />
                </div>
                <div className="space-y-4 pt-4">
                    <Skeleton height={48} width="100%" borderRadius={8} />
                    <Skeleton height={48} width="100%" borderRadius={8} />
                </div>
            </div>
        </div>
    );
};

export const CartItemSkeleton = () => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 gap-2">
            <Skeleton width={200} height={24} />
            <Skeleton width={80} height={28} />
        </div>
    );
};

export const TableRowSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <Skeleton width="30%" height={24} className="mb-2" />
            <Skeleton width="20%" />
        </div>
    );
};
