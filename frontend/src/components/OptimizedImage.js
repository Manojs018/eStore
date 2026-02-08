import React, { useState } from 'react';

const OptimizedImage = ({ src, alt, className, width, height, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Helper to generate Unsplash URLs
    const getUnsplashUrl = (url, width, format = 'webp') => {
        if (!url || !url.includes('images.unsplash.com')) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}w=${width}&q=80&fm=${format}&fit=crop`;
    };

    // Determine if it's an Unsplash image for optimization
    const isUnsplash = src && src.includes('images.unsplash.com');

    // Generate srcset for responsive images if it's Unsplash
    const srcSet = isUnsplash
        ? `${getUnsplashUrl(src, 400)} 400w,
           ${getUnsplashUrl(src, 800)} 800w,
           ${getUnsplashUrl(src, 1200)} 1200w`
        : undefined;

    const sizes = isUnsplash
        ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        : undefined;

    // Fallback for non-Unsplash images or error
    const finalSrc = error
        ? 'https://via.placeholder.com/400x300?text=No+Image'
        : (isUnsplash ? getUnsplashUrl(src, 800) : src);

    return (
        <div className={`relative overflow-hidden bg-gray-100 ${className}`} style={{ width, height }}>
            {/* Blur placeholder or skeleton could go here */}
            <img
                src={finalSrc}
                alt={alt}
                srcSet={srcSet}
                sizes={sizes}
                loading="lazy"
                decoding="async"
                width={width}
                height={height}
                className={`transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className} w-full h-full object-cover`}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError(true)}
                {...props}
            />
            {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                    <span className="sr-only">Loading image...</span>
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
