/**
 * COMPONENT TEST — Orders Page
 * Tests: renders orders, loading state, status update, error handling
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Orders from '../../pages/orders/Orders';
import { ServiceContext } from '../../App';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../assets/assets', () => ({
  assets: { parcel_icon: 'parcel.png' },
}));

vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { ORDER_STATUS_CHANGED: 'order:statusChanged' },
}));

const makeOrder = (overrides = {}) => ({
  _id: 'abc123def456',
  amount: 25,
  status: 'Food Processing',
  date: '2026-03-10T12:00:00Z',
  items: [{ name: 'Pizza', quantity: 2 }],
  address: {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'US',
    zipcode: '10001',
    phone: '555-1234',
  },
  ...overrides,
});

describe('Orders Page', () => {
  const mockOrderRepo = {
    getAll: vi.fn(),
    updateStatus: vi.fn(),
  };

  const services = {
    api: { getBaseUrl: () => 'http://localhost:4002' },
    foodRepo: { getAll: vi.fn() },
    orderRepo: mockOrderRepo,
  };

  const renderOrders = () =>
    render(
      <ServiceContext.Provider value={services}>
        <Orders />
      </ServiceContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title', () => {
    mockOrderRepo.getAll.mockImplementation(() => new Promise(() => {}));
    renderOrders();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    mockOrderRepo.getAll.mockImplementation(() => new Promise(() => {}));
    renderOrders();
    expect(screen.getByText('Loading orders…')).toBeInTheDocument();
  });

  test('renders orders after loading', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderOrders();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Pizza x 2/)).toBeInTheDocument();
      expect(screen.getByText('555-1234')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });
  });

  test('renders order address', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderOrders();

    await waitFor(() => {
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      expect(screen.getByText(/New York/)).toBeInTheDocument();
    });
  });

  test('renders item count', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderOrders();

    await waitFor(() => {
      expect(screen.getByText('1 item')).toBeInTheDocument();
    });
  });

  test('renders plural item count for multiple items', async () => {
    mockOrderRepo.getAll.mockResolvedValue([
      makeOrder({ items: [{ name: 'Pizza', quantity: 2 }, { name: 'Coke', quantity: 1 }] }),
    ]);
    renderOrders();

    await waitFor(() => {
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  test('renders status select with current status', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderOrders();

    await waitFor(() => {
      const select = screen.getByLabelText('Update order status');
      expect(select.value).toBe('Food Processing');
    });
  });

  test('updates order status on select change', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    mockOrderRepo.updateStatus.mockResolvedValue({ success: true });
    renderOrders();

    await waitFor(() => {
      expect(screen.getByLabelText('Update order status')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Update order status'), {
      target: { value: 'Delivered' },
    });

    await waitFor(() => {
      expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith('abc123def456', 'Delivered');
    });
  });

  test('shows error toast on fetch failure', async () => {
    mockOrderRepo.getAll.mockRejectedValue(new Error('Failed to fetch orders'));
    renderOrders();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch orders');
    });
  });

  test('shows error toast and re-fetches on status update failure', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    mockOrderRepo.updateStatus.mockRejectedValue(new Error('Update failed'));
    renderOrders();

    await waitFor(() => {
      expect(screen.getByLabelText('Update order status')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Update order status'), {
      target: { value: 'Delivered' },
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed');
      // Re-fetches on failure (rollback)
      expect(mockOrderRepo.getAll).toHaveBeenCalledTimes(2);
    });
  });

  test('renders multiple orders', async () => {
    mockOrderRepo.getAll.mockResolvedValue([
      makeOrder({ _id: 'order1', address: { firstName: 'John', lastName: 'Doe' } }),
      makeOrder({ _id: 'order2', address: { firstName: 'Jane', lastName: 'Smith' } }),
    ]);
    renderOrders();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});
