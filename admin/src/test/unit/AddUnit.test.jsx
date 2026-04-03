/**
 * AddUnit.test.jsx - Comprehensive tests for Add page component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Add from '../../pages/add/Add';
import { ServiceContext } from '../../App';
import EventBus, { EVENTS } from '../../events/EventBus';

// Mock dependencies
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../../assets/assets', () => ({ assets: { upload_area: 'upload.png' } }));
vi.mock('../../events/EventBus', () => ({
  default: { emit: vi.fn(), on: vi.fn(() => vi.fn()) },
  EVENTS: { FOOD_ADDED: 'food:added' }
}));

import { toast } from 'react-toastify';

const makeFoodRepo = (overrides = {}) => ({
  add: vi.fn().mockResolvedValue({ message: 'Food item added!' }),
  ...overrides
});

const renderAdd = (foodRepo = makeFoodRepo()) =>
  render(
    <ServiceContext.Provider value={{ foodRepo }}>
      <Add />
    </ServiceContext.Provider>
  );

describe('Add Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:preview-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('Initial Render', () => {
    it('renders the upload area', () => {
      renderAdd();
      expect(screen.getByAltText('Upload preview')).toBeInTheDocument();
    });

    it('renders product name input', () => {
      renderAdd();
      expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
    });

    it('renders description textarea', () => {
      renderAdd();
      expect(screen.getByPlaceholderText('Write content here')).toBeInTheDocument();
    });

    it('renders category select with all options', () => {
      renderAdd();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders price input', () => {
      renderAdd();
      expect(screen.getByPlaceholderText('$20')).toBeInTheDocument();
    });

    it('renders ADD button', () => {
      renderAdd();
      expect(screen.getByRole('button', { name: 'ADD' })).toBeInTheDocument();
    });
  });

  describe('Image Upload', () => {
    it('shows preview when file is selected', async () => {
      renderAdd();
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = document.getElementById('image');
      
      await userEvent.upload(input, file);
      
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('revokes object URL on unmount', async () => {
      const { unmount } = renderAdd();
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = document.getElementById('image');
      
      await userEvent.upload(input, file);
      unmount();
      
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting without image', async () => {
      renderAdd();
      fireEvent.submit(screen.getByRole('button', { name: 'ADD' }).closest('form'));
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please upload an image.');
      });
    });

    it('does not call foodRepo.add without image', async () => {
      const foodRepo = makeFoodRepo();
      renderAdd(foodRepo);
      fireEvent.submit(screen.getByRole('button', { name: 'ADD' }).closest('form'));
      
      await waitFor(() => {
        expect(foodRepo.add).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    const uploadAndSubmit = async (foodRepo) => {
      renderAdd(foodRepo);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      await userEvent.upload(document.getElementById('image'), file);
      await act(async () => {
        fireEvent.submit(screen.getByRole('button', { name: 'ADD' }).closest('form'));
      });
    };

    it('calls foodRepo.add on valid submission', async () => {
      const foodRepo = makeFoodRepo();
      await uploadAndSubmit(foodRepo);
      
      await waitFor(() => {
        expect(foodRepo.add).toHaveBeenCalled();
      });
    });

    it('shows success toast on successful submission', async () => {
      await uploadAndSubmit(makeFoodRepo());
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Food item added!');
      });
    });

    it('emits FOOD_ADDED event on success', async () => {
      await uploadAndSubmit(makeFoodRepo());
      
      await waitFor(() => {
        expect(EventBus.emit).toHaveBeenCalledWith(EVENTS.FOOD_ADDED, expect.any(Object));
      });
    });

    it('shows error toast on failure', async () => {
      const foodRepo = makeFoodRepo({
        add: vi.fn().mockRejectedValue(new Error('Server error'))
      });
      await uploadAndSubmit(foodRepo);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    });
  });

  describe('Loading State', () => {
    it('disables button while loading', async () => {
      let resolveAdd;
      const foodRepo = makeFoodRepo({
        add: vi.fn(() => new Promise(r => { resolveAdd = r; }))
      });
      renderAdd(foodRepo);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      await userEvent.upload(document.getElementById('image'), file);
      
      act(() => {
        fireEvent.submit(screen.getByRole('button').closest('form'));
      });
      
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveTextContent('Adding…');
      
      act(() => resolveAdd({ message: 'Done' }));
    });
  });
});
