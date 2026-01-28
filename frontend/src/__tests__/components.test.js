import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

// Mock dependencies
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));



// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
  AuthContext: {},
  useAuth: () => ({ user: null, logout: jest.fn() }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Update Mock for ProductCard usage
jest.mock('../contexts/CartContext', () => ({
  CartContext: {},
  useCart: () => ({
    getCartItemsCount: () => 0,
    addToCart: jest.fn() // ProductCard needs this
  }),
  CartProvider: ({ children }) => <div>{children}</div>
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 29.99,
    imageUrl: 'https://via.placeholder.com/300',
    category: 'Electronics',
    description: 'Test Description',
    inStock: true
  };

  it('should render product card with correct information', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/29.99/)).toBeInTheDocument();
  });

  it('should display product image with lazy loading', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', mockProduct.imageUrl);
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('should have add to cart button', () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    const button = screen.getByText(/Add to Cart/i);
    expect(button).toBeInTheDocument();
  });
});



describe('Header Component', () => {
  it('should display eStore logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('eStore')).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    // Cart icon is SVG, but we can check for link presence
  });
});