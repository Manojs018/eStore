import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

export const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Fetch wishlist from API
            // Simulated fetch
            const saved = localStorage.getItem(`wishlist_${user._id}`);
            if (saved) {
                setWishlist(JSON.parse(saved));
            } else {
                setWishlist([]); // Start fresh or fetch from real API
            }
        } else {
            setWishlist([]);
        }
    }, [user]);

    const addToWishlist = (product) => {
        if (!user) {
            toast.error('Please login to use wishlist');
            return;
        }

        // Optimistic update
        const exists = wishlist.some(item => item._id === product._id);
        let newWishlist;

        if (exists) {
            newWishlist = wishlist.filter(item => item._id !== product._id);
            toast.success('Removed from wishlist');
        } else {
            newWishlist = [...wishlist, product];
            toast.success('Added to wishlist');
        }

        setWishlist(newWishlist);
        localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(newWishlist));

        // Real API call would go here:
        // fetch(`/api/wishlist/${product._id}`, { method: 'PUT', ... })
    };

    const removeFromWishlist = (productId) => {
        const newWishlist = wishlist.filter(item => item._id !== productId);
        setWishlist(newWishlist);
        if (user) {
            localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(newWishlist));
        }
        toast.success('Removed from wishlist');
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
