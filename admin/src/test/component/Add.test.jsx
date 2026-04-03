/**
 * COMPONENT TEST — Add Page
 * Tests: renders form fields, submits food item, handles errors
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Add from '../../pages/add/Add';
import { ServiceContext } from '../../App';
import { toast } from 'react-toastify';

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../assets/assets', () => ({
  assets: { upload_area: 'upload_area.png' },
}));

vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { FOOD_ADDED: 'food:added' },
}));

describe('Add Page', () => {
  const mockFoodRepo = {
    add: vi.fn(),
  };

  const services = {
    api: { getBaseUrl: () => 'http://localhost:4002' },
    foodRepo: mockFoodRepo,
    orderRepo: { getAll: vi.fn() },
  };

  const renderAdd = () =>
    render(
      <ServiceContext.Provider value={services}>
        <Add />
      </ServiceContext.Provider>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL / revokeObjectURL for image preview
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  test('renders form with all fields', () => {
    renderAdd();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('Product Name')).toBeInTheDocument();
    expect(screen.getByText('Product Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Product Price')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ADD' })).toBeInTheDocument();
  });

  test('renders name input with placeholder', () => {
    renderAdd();
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });

  test('renders description textarea', () => {
    renderAdd();
    expect(screen.getByPlaceholderText('Write content here')).toBeInTheDocument();
  });

  test('renders price input', () => {
    renderAdd();
    expect(screen.getByPlaceholderText('$20')).toBeInTheDocument();
  });

  test('renders category select with options', () => {
    renderAdd();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('Salad'); // default category
  });

  test('updates name field on input', () => {
    renderAdd();
    const nameInput = screen.getByPlaceholderText('Type here');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'New Pizza' } });
    expect(nameInput.value).toBe('New Pizza');
  });

  test('updates description on input', () => {
    renderAdd();
    const textarea = screen.getByPlaceholderText('Write content here');
    fireEvent.change(textarea, { target: { name: 'description', value: 'Delicious pizza' } });
    expect(textarea.value).toBe('Delicious pizza');
  });

  test('shows error toast when submitting without image', async () => {
    renderAdd();
    fireEvent.change(screen.getByPlaceholderText('Type here'), {
      target: { name: 'name', value: 'Pizza' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write content here'), {
      target: { name: 'description', value: 'Tasty' },
    });
    fireEvent.change(screen.getByPlaceholderText('$20'), {
      target: { name: 'price', value: '15' },
    });
    fireEvent.submit(screen.getByPlaceholderText('Type here').closest('form'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please upload an image.');
    });
    expect(mockFoodRepo.add).not.toHaveBeenCalled();
  });

  test('submits form successfully with image', async () => {
    mockFoodRepo.add.mockResolvedValue({ message: 'Food item added!' });
    renderAdd();

    // Fill in all fields
    fireEvent.change(screen.getByPlaceholderText('Type here'), {
      target: { name: 'name', value: 'Pizza' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write content here'), {
      target: { name: 'description', value: 'Tasty pizza' },
    });
    fireEvent.change(screen.getByPlaceholderText('$20'), {
      target: { name: 'price', value: '15' },
    });

    // Simulate image upload
    const file = new File(['img'], 'pizza.png', { type: 'image/png' });
    const fileInput = document.getElementById('image');
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.submit(screen.getByPlaceholderText('Type here').closest('form'));

    await waitFor(() => {
      expect(mockFoodRepo.add).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Food item added!');
    });
  });

  test('shows error toast on add failure', async () => {
    mockFoodRepo.add.mockRejectedValue(new Error('Server error'));
    renderAdd();

    fireEvent.change(screen.getByPlaceholderText('Type here'), {
      target: { name: 'name', value: 'Pizza' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write content here'), {
      target: { name: 'description', value: 'Tasty' },
    });
    fireEvent.change(screen.getByPlaceholderText('$20'), {
      target: { name: 'price', value: '15' },
    });

    const file = new File(['img'], 'pizza.png', { type: 'image/png' });
    fireEvent.change(document.getElementById('image'), { target: { files: [file] } });

    fireEvent.submit(screen.getByPlaceholderText('Type here').closest('form'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });

  test('disables submit button while loading', async () => {
    let resolveAdd;
    mockFoodRepo.add.mockImplementation(() => new Promise((r) => { resolveAdd = r; }));
    renderAdd();

    const file = new File(['img'], 'pizza.png', { type: 'image/png' });
    fireEvent.change(document.getElementById('image'), { target: { files: [file] } });
    fireEvent.change(screen.getByPlaceholderText('Type here'), {
      target: { name: 'name', value: 'Pizza' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write content here'), {
      target: { name: 'description', value: 'Tasty' },
    });
    fireEvent.change(screen.getByPlaceholderText('$20'), {
      target: { name: 'price', value: '15' },
    });

    fireEvent.submit(screen.getByPlaceholderText('Type here').closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
    });

    resolveAdd({ message: 'Done' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ADD' })).not.toBeDisabled();
    });
  });
});
