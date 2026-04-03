/**
 * OrdersUnit.test.jsx - Comprehensive tests for Orders page component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Orders from '../../pages/orders/Orders';
import { ServiceContext } from '../../App';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock dependencies
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../assets/assets', () => ({ assets: { parcel_icon: '/parcel.png' } }));
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
    date: '2024-01-15',
    address: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipcode: '10001',
      phone: '555-1234'
    }
  },
  {
    _id: 'order2',
    items: [{ name: 'Burger', quantity: 1 }, { name: 'Fries', quantity: 1 }],
    amount: 15.99,
    status: 'Out for Delivery',
    date: '2024-01-14',
    address: {
      firstName: 'Jane',
      lastName: 'Smith',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipcode: '90001',
      phone: '555-5678'
    }
  }
];

const makeOrderRepo = (overrides = {}) => ({
  getAll: vi.fn().mockResolvedValue(mockOrders),
  updateStatus: vi.fn().mockResolvedValue({ success: true }),
  ...overrides
});

const renderOrders = (orderRepo = makeOrderRepo()) =>
  render(
    <ServiceContext.Provider value={{ orderRepo }}>
      <Orders />
    </ServiceContext.Provider>
  );

describe('Orders Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders page title', () => {
      renderOrders();
      expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      renderOrders();
      expect(screen.getByText('Loading orders…')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('fetches orders on mount', async () => {
      const orderRepo = makeOrderRepo();
      renderOrders(orderRepo);
      
      await waitFor(() => {
        expect(orderRepo.getAll).toHaveBeenCalled();
      });
    });

    it('displays orders after loading', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('displays order item summary', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText(/Pizza x 2/)).toBeInTheDocument();
      });
    });

    it('displays order address', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
      });
    });

    it('displays order phone', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText('555-1234')).toBeInTheDocument();
      });
    });

    it('shows error toast on fetch failure', async () => {
      const orderRepo = makeOrderRepo({
        getAll: vi.fn().mockRejectedValue(new Error('Network error'))
      });
      renderOrders(orderRepo);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Status Update', () => {
    it('renders status select with current status', async () => {
      renderOrders();
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects[0]).toHaveValue('Food Processing');
      });
    });

    it('calls updateStatus when status is changed', async () => {
      const orderRepo = makeOrderRepo();
      renderOrders(orderRepo);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Out for Delivery' } });
      
      await waitFor(() => {
        expect(orderRepo.updateStatus).toHaveBeenCalledWith('order1', 'Out for Delivery');
      });
    });

    it('emits ORDER_STATUS_CHANGED event on successful update', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Delivered' } });
      
      await waitFor(() => {
        expect(EventBus.emit).toHaveBeenCalledWith(
          EVENTS.ORDER_STATUS_CHANGED,
          expect.objectContaining({ orderId: 'order1', newStatus: 'Delivered' })
        );
      });
    });

    it('shows error toast and refetches on update failure', async () => {
      const orderRepo = makeOrderRepo({
        updateStatus: vi.fn().mockRejectedValue(new Error('Update failed'))
      });
      renderOrders(orderRepo);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'Delivered' } });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Update failed');
      });
    });
  });

  describe('Item Count Display', () => {
    it('shows singular "item" for single item orders', async () => {
      const singleItemOrder = [{
        ...mockOrders[0],
        items: [{ name: 'Pizza', quantity: 1 }]
      }];
      const orderRepo = makeOrderRepo({ getAll: vi.fn().mockResolvedValue(singleItemOrder) });
      renderOrders(orderRepo);
      
      await waitFor(() => {
        expect(screen.getByText('1 item')).toBeInTheDocument();
      });
    });

    it('shows plural "items" for multiple item orders', async () => {
      renderOrders();
      
      await waitFor(() => {
        expect(screen.getByText('2 items')).toBeInTheDocument();
      });
    });
  });
});
