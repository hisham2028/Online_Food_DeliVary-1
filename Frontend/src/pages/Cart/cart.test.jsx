import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Cart from './cart';
import { StoreContext } from '../../context/StoreContext';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Cart Page', () => {
  const foodList = [
    { _id: '1', name: 'Pizza', price: 10, image: 'pizza.jpg' },
    { _id: '2', name: 'Burger', price: 8, image: 'burger.jpg' },
  ];

  const defaultContext = {
    cartItems: {},
    food_list: foodList,
    removeFromCart: vi.fn(),
    getTotalCartAmount: () => 0,
    url: 'http://localhost:4000',
  };

  const renderWithContext = (ctx = {}) => {
    const value = { ...defaultContext, ...ctx };
    return render(
      <StoreContext.Provider value={value}>
        <Cart />
      </StoreContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders cart header columns', () => {
    renderWithContext();
    const headerRow = screen.getAllByText('Total');
    expect(headerRow.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Items')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  test('shows no items when cart is empty', () => {
    const { container } = renderWithContext();
    const cartItemRows = container.querySelectorAll('.cart-items-item');
    expect(cartItemRows.length).toBe(0);
  });

  test('renders cart items correctly', () => {
    renderWithContext({
      cartItems: { '1': 2 },
      getTotalCartAmount: () => 20,
    });
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    const twentyDollars = screen.getAllByText('$20');
    expect(twentyDollars.length).toBeGreaterThanOrEqual(1);
  });

  test('renders multiple cart items', () => {
    renderWithContext({
      cartItems: { '1': 1, '2': 3 },
      getTotalCartAmount: () => 34,
    });
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
  });

  test('calls removeFromCart when remove button clicked', () => {
    const mockRemove = vi.fn();
    renderWithContext({
      cartItems: { '1': 2 },
      getTotalCartAmount: () => 20,
      removeFromCart: mockRemove,
    });
    const removeBtn = screen.getByText('×');
    fireEvent.click(removeBtn);
    expect(mockRemove).toHaveBeenCalledWith('1', true);
  });

  test('displays correct subtotal, delivery fee, and total', () => {
    renderWithContext({
      cartItems: { '1': 2 },
      getTotalCartAmount: () => 20,
    });
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Delivery Fee')).toBeInTheDocument();
    // Subtotal $20, delivery $2, total $22
    expect(screen.getByText('$22')).toBeInTheDocument();
  });

  test('shows $0 delivery fee when cart is empty', () => {
    renderWithContext();
    const deliveryFees = screen.getAllByText('$0');
    expect(deliveryFees.length).toBeGreaterThanOrEqual(1);
  });

  test('navigates to /order when checkout button clicked', () => {
    renderWithContext({
      cartItems: { '1': 1 },
      getTotalCartAmount: () => 10,
    });
    fireEvent.click(screen.getByText('PROCEED TO CHECKOUT'));
    expect(mockNavigate).toHaveBeenCalledWith('/order');
  });

  test('renders promo code input', () => {
    renderWithContext();
    expect(screen.getByPlaceholderText('promo code')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});
