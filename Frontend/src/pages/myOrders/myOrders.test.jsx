import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MyOrders from './myOrders';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

vi.mock('axios');

describe('MyOrders Page', () => {
  const defaultContext = {
    url: 'http://localhost:4000',
    token: 'test-token',
  };

  const renderWithContext = (ctx = {}) => {
    return render(
      <StoreContext.Provider value={{ ...defaultContext, ...ctx }}>
        <MyOrders />
      </StoreContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders My Orders heading', () => {
    axios.post.mockResolvedValue({ data: { data: [] } });
    renderWithContext();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
  });

  test('shows no orders message when empty', async () => {
    axios.post.mockResolvedValue({ data: { data: [] } });
    renderWithContext();
    await waitFor(() => {
      expect(screen.getByText('No orders found.')).toBeInTheDocument();
    });
  });

  test('fetches and displays orders', async () => {
    const orders = [
      {
        items: [{ name: 'Pizza', quantity: 2 }],
        amount: 24,
        status: 'Delivered',
      },
    ];
    axios.post.mockResolvedValue({ data: { data: orders } });
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText(/Pizza x 2/)).toBeInTheDocument();
      expect(screen.getByText('$24.00')).toBeInTheDocument();
      expect(screen.getByText('Items: 1')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  test('calls API with correct token', async () => {
    axios.post.mockResolvedValue({ data: { data: [] } });
    renderWithContext();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/order/userorders',
        {},
        { headers: { token: 'test-token' } }
      );
    });
  });

  test('does not fetch orders when no token', () => {
    axios.post.mockResolvedValue({ data: { data: [] } });
    renderWithContext({ token: '' });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('shows error message on fetch failure', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Failed to load orders. Please try again.')).toBeInTheDocument();
    });
  });

  test('track order button re-fetches orders', async () => {
    const orders = [
      { items: [{ name: 'Burger', quantity: 1 }], amount: 12, status: 'Processing' },
    ];
    axios.post.mockResolvedValue({ data: { data: orders } });
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Track Order')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Track Order'));

    await waitFor(() => {
      // Called twice: once on mount, once on track click
      expect(axios.post).toHaveBeenCalledTimes(2);
    });
  });

  test('renders multiple orders with correct item formatting', async () => {
    const orders = [
      {
        items: [
          { name: 'Pizza', quantity: 2 },
          { name: 'Coke', quantity: 1 },
        ],
        amount: 30,
        status: 'Out for Delivery',
      },
    ];
    axios.post.mockResolvedValue({ data: { data: orders } });
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText(/Pizza x 2, Coke x 1/)).toBeInTheDocument();
      expect(screen.getByText('Items: 2')).toBeInTheDocument();
    });
  });
});
