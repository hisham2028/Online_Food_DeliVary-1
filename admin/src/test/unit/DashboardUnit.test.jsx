/**
 * DashboardUnit.test.jsx - Comprehensive tests for Dashboard page component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../../pages/dashboard/Dashboard';
import { ServiceContext } from '../../App';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock dependencies
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { ORDER_STATUS_CHANGED: 'order:statusChanged' }
}));

import { toast } from 'react-toastify';

const mockOrders = [
  {
    _id: 'order1',
    items: [{ name: 'Pizza', quantity: 2 }],
    amount: 25.99,
    status: 'Food Processing',
    date: new Date().toISOString(),
    address: { firstName: 'John', lastName: 'Doe', street: '123 Main St', city: 'NYC', state: 'NY', country: 'USA', zipcode: '10001' }
  },
  {
    _id: 'order2',
    items: [{ name: 'Burger', quantity: 1 }],
    amount: 15.99,
    status: 'Out for Delivery',
    date: new Date().toISOString(),
    address: { firstName: 'Jane', lastName: 'Smith', street: '456 Oak Ave', city: 'LA', state: 'CA', country: 'USA', zipcode: '90001' }
  },
  {
    _id: 'order3',
    items: [{ name: 'Salad', quantity: 1 }],
    amount: 10.99,
    status: 'Delivered',
    date: new Date().toISOString(),
    address: { firstName: 'Bob', lastName: 'Wilson', street: '789 Elm St', city: 'Chicago', state: 'IL', country: 'USA', zipcode: '60601' }
  }
];

const makeOrderRepo = (overrides = {}) => ({
  getAll: vi.fn().mockResolvedValue(mockOrders),
  ...overrides
});

const renderDashboard = (orderRepo = makeOrderRepo()) =>
  render(
    <ServiceContext.Provider value={{ orderRepo }}>
      <Dashboard />
    </ServiceContext.Provider>
  );

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders dashboard heading', () => {
      renderDashboard();
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      renderDashboard();
      expect(screen.getByText('Loading dashboard…')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('fetches orders on mount', async () => {
      const orderRepo = makeOrderRepo();
      renderDashboard(orderRepo);
      
      await waitFor(() => {
        expect(orderRepo.getAll).toHaveBeenCalled();
      });
    });

    it('shows error toast on fetch failure', async () => {
      const orderRepo = makeOrderRepo({
        getAll: vi.fn().mockRejectedValue(new Error('Network error'))
      });
      renderDashboard(orderRepo);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Stats Cards', () => {
    it('renders all stat cards after loading', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        expect(screen.getByText('Processing')).toBeInTheDocument();
        expect(screen.getAllByText('Out for Delivery').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
      });
    });

    it('displays correct total orders count', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('displays correct status counts', async () => {
      renderDashboard();
      
      await waitFor(() => {
        // 1 Food Processing, 1 Out for Delivery, 1 Delivered
        const ones = screen.getAllByText('1');
        expect(ones.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Filter Bar', () => {
    it('renders all filter buttons', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('All Time')).toBeInTheDocument();
        expect(screen.getByText('Today')).toBeInTheDocument();
        expect(screen.getByText('This Week')).toBeInTheDocument();
        expect(screen.getByText('This Month')).toBeInTheDocument();
        expect(screen.getByText('This Year')).toBeInTheDocument();
      });
    });

    it('All Time filter is active by default', async () => {
      renderDashboard();
      
      await waitFor(() => {
        const allTimeBtn = screen.getByText('All Time');
        expect(allTimeBtn).toHaveClass('filter-btn--active');
      });
    });

    it('clicking filter button changes active filter', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('All Time')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Today'));
      
      expect(screen.getByText('Today')).toHaveClass('filter-btn--active');
    });
  });

  describe('Orders Table', () => {
    it('renders orders table headers', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Order ID')).toBeInTheDocument();
        expect(screen.getByText('Customer')).toBeInTheDocument();
        expect(screen.getByText('Items')).toBeInTheDocument();
        expect(screen.getByText('Amount')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
      });
    });

    it('renders recent orders section with count', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/Recent Orders/)).toBeInTheDocument();
      });
    });

    it('renders order rows with customer names', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('shows empty message when no orders for period', async () => {
      const orderRepo = makeOrderRepo({ getAll: vi.fn().mockResolvedValue([]) });
      renderDashboard(orderRepo);
      
      await waitFor(() => {
        expect(screen.getByText('No orders for this period.')).toBeInTheDocument();
      });
    });
  });

  describe('EventBus Subscription', () => {
    it('subscribes to ORDER_STATUS_CHANGED event', () => {
      renderDashboard();
      expect(EventBus.on).toHaveBeenCalledWith(EVENTS.ORDER_STATUS_CHANGED, expect.any(Function));
    });

    it('unsubscribes on unmount', () => {
      const unsubscribe = vi.fn();
      EventBus.on.mockReturnValue(unsubscribe);
      
      const { unmount } = renderDashboard();
      unmount();
      
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
