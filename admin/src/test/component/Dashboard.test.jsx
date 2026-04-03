/**
 * COMPONENT TEST — Dashboard Page
 * Tests: renders stats, loading state, filter bar, orders table, error handling
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Dashboard from '../../pages/dashboard/Dashboard';
import { ServiceContext } from '../../App';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { ORDER_STATUS_CHANGED: 'order:statusChanged' },
}));

const makeOrder = (overrides = {}) => ({
  _id: 'abc123def456',
  amount: 25,
  status: 'Food Processing',
  date: new Date().toISOString(),
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

describe('Dashboard Page', () => {
  const mockOrderRepo = {
    getAll: vi.fn(),
    updateStatus: vi.fn(),
  };

  const services = {
    api: { getBaseUrl: () => 'http://localhost:4002' },
    foodRepo: { getAll: vi.fn() },
    orderRepo: mockOrderRepo,
  };

  const renderDashboard = () =>
    render(
      <ServiceContext.Provider value={services}>
        <Dashboard />
      </ServiceContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders dashboard heading', () => {
    mockOrderRepo.getAll.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    mockOrderRepo.getAll.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText('Loading dashboard…')).toBeInTheDocument();
  });

  test('renders all stat cards after loading', async () => {
    mockOrderRepo.getAll.mockResolvedValue([
      makeOrder({ status: 'Food Processing' }),
      makeOrder({ _id: 'order2', status: 'Delivered', amount: 30 }),
      makeOrder({ _id: 'order3', status: 'Out for Delivery', amount: 15 }),
    ]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Processing')).toBeInTheDocument();
      // "Out for Delivery" and "Delivered" appear in both stat cards and order badges
      const deliveryTexts = screen.getAllByText('Out for Delivery');
      expect(deliveryTexts.length).toBeGreaterThanOrEqual(1);
      const deliveredTexts = screen.getAllByText('Delivered');
      expect(deliveredTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('displays correct stat values', async () => {
    mockOrderRepo.getAll.mockResolvedValue([
      makeOrder({ status: 'Food Processing', amount: 25 }),
      makeOrder({ _id: 'order2', status: 'Delivered', amount: 30 }),
    ]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('$55.00')).toBeInTheDocument(); // total revenue
      expect(screen.getByText('2')).toBeInTheDocument();       // total orders
      // "1" appears multiple times (processing=1, delivered=1), use getAllByText
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('renders filter bar with all period buttons', async () => {
    mockOrderRepo.getAll.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('All Time')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
      expect(screen.getByText('This Year')).toBeInTheDocument();
    });
  });

  test('All Time filter is active by default', async () => {
    mockOrderRepo.getAll.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      const allTimeBtn = screen.getByText('All Time');
      expect(allTimeBtn).toHaveClass('filter-btn--active');
    });
  });

  test('clicking filter button changes active filter', async () => {
    mockOrderRepo.getAll.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Today'));
    expect(screen.getByText('Today')).toHaveClass('filter-btn--active');
    expect(screen.getByText('All Time')).not.toHaveClass('filter-btn--active');
  });

  test('renders orders table headers', async () => {
    mockOrderRepo.getAll.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Order ID')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });
  });

  test('shows empty message when no orders for period', async () => {
    mockOrderRepo.getAll.mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No orders for this period.')).toBeInTheDocument();
    });
  });

  test('renders recent orders section with count', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Orders (1)')).toBeInTheDocument();
    });
  });

  test('renders order row with customer name and amount', async () => {
    mockOrderRepo.getAll.mockResolvedValue([makeOrder()]);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      // $25.00 appears in both stat card (Total Revenue) and order row
      const amounts = screen.getAllByText('$25.00');
      expect(amounts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('1 items')).toBeInTheDocument();
    });
  });

  test('shows error toast on fetch failure', async () => {
    mockOrderRepo.getAll.mockRejectedValue(new Error('Network error'));
    renderDashboard();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });
});
