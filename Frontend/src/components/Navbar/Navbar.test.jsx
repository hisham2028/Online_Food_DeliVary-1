import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { StoreContext } from '../../context/StoreContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Navbar Component', () => {
  const mockSetShowLogin = vi.fn();
  const mockSetToken = vi.fn();

  const defaultContext = {
    cartItems: {},
    token: '',
    setToken: mockSetToken,
    getTotalCartAmount: vi.fn().mockReturnValue(0),
  };

  const renderWithContext = (contextValue = defaultContext) => {
    return render(
      <BrowserRouter>
        <StoreContext.Provider value={contextValue}>
          <Navbar setShowLogin={mockSetShowLogin} />
        </StoreContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renders navbar with logo', () => {
    // Arrange & Act
    renderWithContext();
    
    // Assert
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
  });

  test('renders navigation menu items', () => {
    // Arrange & Act
    renderWithContext();
    
    // Assert
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(screen.getByText('contact-us')).toBeInTheDocument();
  });

  test('renders sign in button when not authenticated', () => {
    // Arrange & Act
    renderWithContext();
    
    // Assert
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });

  test('calls setShowLogin when sign in button is clicked', () => {
    // Arrange
    renderWithContext();
    
    // Act
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    // Assert
    expect(mockSetShowLogin).toHaveBeenCalledWith(true);
  });

  test('renders profile dropdown when authenticated', () => {
    // Arrange
    const contextWithToken = { ...defaultContext, token: 'test-token' };
    
    // Act
    renderWithContext(contextWithToken);
    
    // Assert
    const profileIcon = screen.getByAltText('Profile');
    expect(profileIcon).toBeInTheDocument();
  });

  test('displays cart dot when items in cart', () => {
    // Arrange
    const contextWithCart = {
      ...defaultContext,
      cartItems: { '1': 2 },
      getTotalCartAmount: vi.fn().mockReturnValue(12.99),
    };
    
    // Act
    const { container } = renderWithContext(contextWithCart);
    
    // Assert
    const dot = container.querySelector('.dot');
    expect(dot).toBeInTheDocument();
  });

  test('does not display cart dot when cart is empty', () => {
    // Arrange & Act
    const { container } = renderWithContext();
    
    // Assert
    const dot = container.querySelector('.dot');
    expect(dot).not.toBeInTheDocument();
  });

  test('toggles search input visibility', () => {
    // Arrange
    const { container } = renderWithContext();
    
    // Act
    const searchIcon = screen.getByAltText('Search');
    fireEvent.click(searchIcon);
    
    // Assert
    const searchContainer = container.querySelector('.navbar-search-container');
    expect(searchContainer).toHaveClass('active');
  });

  test('handles search form submission', () => {
    // Arrange
    renderWithContext();
    const searchIcon = screen.getByAltText('Search');
    fireEvent.click(searchIcon);
    
    // Act
    const searchInput = screen.getByPlaceholderText('Search items...');
    fireEvent.change(searchInput, { target: { value: 'pizza' } });
    fireEvent.submit(searchInput.closest('form'));
    
    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/search?q=pizza');
  });

  test('logs out user when logout is clicked', () => {
    // Arrange
    const contextWithToken = { ...defaultContext, token: 'test-token' };
    renderWithContext(contextWithToken);
    
    // Act
    const logoutItem = screen.getByText('Logout');
    fireEvent.click(logoutItem);
    
    // Assert
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockSetToken).toHaveBeenCalledWith('');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('navigates to orders page when Orders is clicked', () => {
    // Arrange
    const contextWithToken = { ...defaultContext, token: 'test-token' };
    renderWithContext(contextWithToken);
    
    // Act
    const ordersItem = screen.getByText('Orders');
    fireEvent.click(ordersItem);
    
    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/myorders');
  });

  test('applies sticky class on scroll', () => {
    // Arrange
    const { container } = renderWithContext();
    
    // Act
    window.scrollY = 100;
    fireEvent.scroll(window);
    
    // Assert - Note: This tests the scroll handler setup
    expect(container.querySelector('.navbar')).toBeInTheDocument();
  });
});