import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { CartContext } from './contexts/CartContext';
import { WishlistContext } from './contexts/WishlistContext';

// Default mock values
const mockAuth = {
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    loading: false,
};

const mockCart = {
    cart: [],
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    getCartTotal: jest.fn().mockReturnValue(0),
    getCartItemsCount: jest.fn().mockReturnValue(0),
};

const mockWishlist = {
    wishlist: [],
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
    isInWishlist: jest.fn().mockReturnValue(false),
};

const AllTheProviders = ({ children, authProps, cartProps, wishlistProps }) => {
    return (
        <BrowserRouter>
            <AuthContext.Provider value={{ ...mockAuth, ...authProps }}>
                <WishlistContext.Provider value={{ ...mockWishlist, ...wishlistProps }}>
                    <CartContext.Provider value={{ ...mockCart, ...cartProps }}>
                        {children}
                    </CartContext.Provider>
                </WishlistContext.Provider>
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

const customRender = (ui, options = {}) => {
    const { authProps, cartProps, wishlistProps, ...renderOptions } = options;

    return render(ui, {
        wrapper: (props) => (
            <AllTheProviders
                {...props}
                authProps={authProps}
                cartProps={cartProps}
                wishlistProps={wishlistProps}
            />
        ),
        ...renderOptions,
    });
};

// Start export
export * from '@testing-library/react';
export { customRender as render };
