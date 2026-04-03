/**
 * COMPONENT TEST — List Page
 * Tests: renders food list, loading state, empty state, remove item
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import List from '../../pages/list/List';
import { ServiceContext } from '../../App';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { FOOD_ADDED: 'food:added', FOOD_REMOVED: 'food:removed' },
}));

describe('List Page', () => {
  const mockFoodRepo = {
    getAll: vi.fn(),
    remove: vi.fn(),
  };

  const services = {
    api: { getBaseUrl: () => 'http://localhost:4002' },
    foodRepo: mockFoodRepo,
    orderRepo: { getAll: vi.fn() },
  };

  const renderList = () =>
    render(
      <ServiceContext.Provider value={services}>
        <List />
      </ServiceContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders page title', async () => {
    mockFoodRepo.getAll.mockResolvedValue([]);
    renderList();
    expect(screen.getByText('All Food Items')).toBeInTheDocument();
  });

  test('renders table headers', async () => {
    mockFoodRepo.getAll.mockResolvedValue([]);
    renderList();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    mockFoodRepo.getAll.mockImplementation(() => new Promise(() => {}));
    renderList();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows empty state when no items', async () => {
    mockFoodRepo.getAll.mockResolvedValue([]);
    renderList();
    await waitFor(() => {
      expect(screen.getByText(/No food items yet/)).toBeInTheDocument();
    });
  });

  test('renders food items after loading', async () => {
    mockFoodRepo.getAll.mockResolvedValue([
      { _id: '1', name: 'Pizza', category: 'Pasta', price: 15, image: 'pizza.png' },
      { _id: '2', name: 'Salad Bowl', category: 'Salad', price: 10, image: 'salad.png' },
    ]);
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
      expect(screen.getByText('Salad Bowl')).toBeInTheDocument();
      expect(screen.getByText('$15.00')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });
  });

  test('renders food item images with correct src', async () => {
    mockFoodRepo.getAll.mockResolvedValue([
      { _id: '1', name: 'Pizza', category: 'Pasta', price: 15, image: 'pizza.png' },
    ]);
    renderList();

    await waitFor(() => {
      const img = screen.getByAltText('Pizza');
      expect(img).toHaveAttribute('src', 'http://localhost:4002/images/pizza.png');
    });
  });

  test('removes item when remove button clicked', async () => {
    mockFoodRepo.getAll.mockResolvedValue([
      { _id: '1', name: 'Pizza', category: 'Pasta', price: 15, image: 'pizza.png' },
    ]);
    mockFoodRepo.remove.mockResolvedValue({ message: 'Item removed.' });
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    const removeBtn = screen.getByLabelText('Remove Pizza');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(mockFoodRepo.remove).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('Item removed.');
      expect(screen.queryByText('Pizza')).not.toBeInTheDocument();
    });
  });

  test('shows error toast on remove failure', async () => {
    mockFoodRepo.getAll.mockResolvedValue([
      { _id: '1', name: 'Pizza', category: 'Pasta', price: 15, image: 'pizza.png' },
    ]);
    mockFoodRepo.remove.mockRejectedValue(new Error('Remove failed'));
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Remove Pizza'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Remove failed');
    });
  });

  test('shows error toast on fetch failure', async () => {
    mockFoodRepo.getAll.mockRejectedValue(new Error('Network error'));
    renderList();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });
});
