import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PlaceOrder from './placeorder';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

vi.mock('axios');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('PlaceOrder Page', () => {
  const foodList = [
    { _id: '1', name: 'Pizza', price: 10, image: 'pizza.jpg' },
    { _id: '2', name: 'Burger', price: 8, image: 'burger.jpg' },
  ];

  const defaultContext = {
    getTotalCartAmount: () => 20,
    token: 'test-token',
    food_list: foodList,
    cartItems: { '1': 2 },
    url: 'http://localhost:4000',
  };

  const renderWithContext = (ctx = {}) => {
    const value = { ...defaultContext, ...ctx };
    return render(
      <StoreContext.Provider value={value}>
        <PlaceOrder />
      </StoreContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Redirect when cart is empty ──────────────────────────
  test('redirects to /cart when cart total is 0', () => {
    renderWithContext({ getTotalCartAmount: () => 0 });
    expect(mockNavigate).toHaveBeenCalledWith('/cart');
  });

  // ─── Delivery Information form fields ─────────────────────
  test('renders all delivery information fields', () => {
    renderWithContext();
    expect(screen.getByText('Delivery Information')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Street')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('State')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Zip Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
  });

  // ─── Cart totals display ──────────────────────────────────
  test('displays correct subtotal, delivery fee, and total', () => {
    renderWithContext();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Delivery Fee')).toBeInTheDocument();
    // Subtotal $20, delivery $2, total $22
    expect(screen.getByText('$22')).toBeInTheDocument();
  });

  // ─── Payment method selection ─────────────────────────────
  test('shows COD selected by default', () => {
    renderWithContext();
    expect(screen.getByText('Cash on Delivery')).toBeInTheDocument();
    expect(screen.getByText('Stripe (Credit Card)')).toBeInTheDocument();
    // Default is COD so button says PROCEED TO CHECKOUT
    expect(screen.getByText(/PROCEED TO CHECKOUT/)).toBeInTheDocument();
  });

  test('switches to stripe payment method', () => {
    renderWithContext();
    fireEvent.click(screen.getByText('Stripe (Credit Card)'));
    expect(screen.getByText(/PROCEED TO PAYMENT/)).toBeInTheDocument();
  });

  test('switches back to COD after selecting stripe', () => {
    renderWithContext();
    fireEvent.click(screen.getByText('Stripe (Credit Card)'));
    expect(screen.getByText(/PROCEED TO PAYMENT/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cash on Delivery'));
    expect(screen.getByText(/PROCEED TO CHECKOUT/)).toBeInTheDocument();
  });

  // ─── Form field updates ───────────────────────────────────
  test('updates input values on change', () => {
    renderWithContext();
    const firstNameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(firstNameInput, { target: { value: 'John', name: 'firstName' } });
    expect(firstNameInput.value).toBe('John');

    const phoneInput = screen.getByPlaceholderText('Phone');
    fireEvent.change(phoneInput, { target: { value: '1234567890', name: 'phone' } });
    expect(phoneInput.value).toBe('1234567890');
  });

  // ─── COD order placement ──────────────────────────────────
  test('places COD order and navigates to myorders', async () => {
    axios.post.mockResolvedValue({
      data: { success: true, message: 'Order placed' },
    });

    renderWithContext();

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Street'), { target: { value: '123 Main St', name: 'street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'NYC', name: 'city' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'NY', name: 'state' } });
    fireEvent.change(screen.getByPlaceholderText('Zip Code'), { target: { value: '10001', name: 'zipcode' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US', name: 'country' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890', name: 'phone' } });

    fireEvent.click(screen.getByText(/PROCEED TO CHECKOUT/));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/order/place',
        expect.objectContaining({
          paymentMethod: 'cod',
          amount: 22,
        }),
        expect.objectContaining({ headers: { token: 'test-token' } })
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/myorders');
    });
  });

  // ─── Stripe order placement ───────────────────────────────
  test('places stripe order and redirects to session URL', async () => {
    const replaceOriginal = window.location.replace;
    delete window.location;
    window.location = { replace: vi.fn() };

    axios.post.mockResolvedValue({
      data: { success: true, session_url: 'https://checkout.stripe.com/session' },
    });

    renderWithContext();

    // Select stripe
    fireEvent.click(screen.getByText('Stripe (Credit Card)'));

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Street'), { target: { value: '123 Main St', name: 'street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'NYC', name: 'city' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'NY', name: 'state' } });
    fireEvent.change(screen.getByPlaceholderText('Zip Code'), { target: { value: '10001', name: 'zipcode' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US', name: 'country' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890', name: 'phone' } });

    fireEvent.click(screen.getByText(/PROCEED TO PAYMENT/));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/order/place',
        expect.objectContaining({ paymentMethod: 'stripe' }),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledWith('https://checkout.stripe.com/session');
    });

    // Restore
    window.location.replace = replaceOriginal;
  });

  // ─── Error handling ───────────────────────────────────────
  test('shows alert on failed order', async () => {
    axios.post.mockResolvedValue({
      data: { success: false, message: 'Out of stock' },
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Street'), { target: { value: '123 Main St', name: 'street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'NYC', name: 'city' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'NY', name: 'state' } });
    fireEvent.change(screen.getByPlaceholderText('Zip Code'), { target: { value: '10001', name: 'zipcode' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US', name: 'country' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890', name: 'phone' } });

    fireEvent.click(screen.getByText(/PROCEED TO CHECKOUT/));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error: Out of stock');
    });

    alertSpy.mockRestore();
  });

  test('shows alert on network error', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('Street'), { target: { value: '123 Main St', name: 'street' } });
    fireEvent.change(screen.getByPlaceholderText('City'), { target: { value: 'NYC', name: 'city' } });
    fireEvent.change(screen.getByPlaceholderText('State'), { target: { value: 'NY', name: 'state' } });
    fireEvent.change(screen.getByPlaceholderText('Zip Code'), { target: { value: '10001', name: 'zipcode' } });
    fireEvent.change(screen.getByPlaceholderText('Country'), { target: { value: 'US', name: 'country' } });
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '1234567890', name: 'phone' } });

    fireEvent.click(screen.getByText(/PROCEED TO CHECKOUT/));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Something went wrong.');
    });

    alertSpy.mockRestore();
  });
});
