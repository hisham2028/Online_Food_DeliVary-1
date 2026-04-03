/**
 * ListUnit.test.jsx - Comprehensive tests for List page component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import List from '../../pages/list/List';
import { ServiceContext } from '../../App';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock dependencies
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { FOOD_ADDED: 'food:added', FOOD_REMOVED: 'food:removed' }
}));

import { toast } from 'react-toastify';

const mockFoodItems = [
  { _id: '1', name: 'Pizza', category: 'Fast Food', price: 12.99, image: 'pizza.png' },
  { _id: '2', name: 'Burger', category: 'Fast Food', price: 8.99, image: 'burger.png' }
];

const makeFoodRepo = (overrides = {}) => ({
  getAll: vi.fn().mockResolvedValue(mockFoodItems),
  remove: vi.fn().mockResolvedValue({ message: 'Item removed.' }),
  ...overrides
});

const makeApi = () => ({
  getBaseUrl: () => 'http://localhost:4002'
});

const renderList = (foodRepo = makeFoodRepo(), api = makeApi()) =>
  render(
    <ServiceContext.Provider value={{ foodRepo, api }}>
      <List />
    </ServiceContext.Provider>
  );

describe('List Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders page title', async () => {
      renderList();
      expect(screen.getByText('All Food Items')).toBeInTheDocument();
    });

    it('renders table headers', () => {
      renderList();
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Price')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      renderList();
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('fetches food items on mount', async () => {
      const foodRepo = makeFoodRepo();
      renderList(foodRepo);
      
      await waitFor(() => {
        expect(foodRepo.getAll).toHaveBeenCalled();
      });
    });

    it('displays food items after loading', async () => {
      renderList();
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        expect(screen.getByText('Burger')).toBeInTheDocument();
      });
    });

    it('shows empty state when no items', async () => {
      const foodRepo = makeFoodRepo({ getAll: vi.fn().mockResolvedValue([]) });
      renderList(foodRepo);
      
      await waitFor(() => {
        expect(screen.getByText(/No food items yet/)).toBeInTheDocument();
      });
    });

    it('shows error toast on fetch failure', async () => {
      const foodRepo = makeFoodRepo({
        getAll: vi.fn().mockRejectedValue(new Error('Network error'))
      });
      renderList(foodRepo);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Remove Item', () => {
    it('calls foodRepo.remove when remove button clicked', async () => {
      const foodRepo = makeFoodRepo();
      renderList(foodRepo);
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(foodRepo.remove).toHaveBeenCalledWith('1');
      });
    });

    it('shows success toast on successful removal', async () => {
      renderList();
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Item removed.');
      });
    });

    it('removes item from list optimistically', async () => {
      renderList();
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
      });
    });

    it('emits FOOD_REMOVED event', async () => {
      renderList();
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.FOOD_REMOVED, { foodId: '1' });
      });
    });

    it('shows error toast on removal failure', async () => {
      const foodRepo = makeFoodRepo({
        remove: vi.fn().mockRejectedValue(new Error('Delete failed'))
      });
      renderList(foodRepo);
      
      await waitFor(() => {
        expect(screen.getByText('Pizza')).toBeInTheDocument();
      });
      
      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Delete failed');
      });
    });
  });

  describe('EventBus Subscription', () => {
    it('subscribes to FOOD_ADDED event', () => {
      renderList();
      expect(EventBus.on).toHaveBeenCalledWith(EVENTS.FOOD_ADDED, expect.any(Function));
    });

    it('unsubscribes on unmount', () => {
      const unsubscribe = vi.fn();
      EventBus.on.mockReturnValue(unsubscribe);
      
      const { unmount } = renderList();
      unmount();
      
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
