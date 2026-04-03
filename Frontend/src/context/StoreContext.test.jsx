import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import StoreContextProvider, { useStore } from './StoreContext';

vi.mock('axios');

// Helper component to consume and expose context values
const TestConsumer = ({ onContext }) => {
  const ctx = useStore();
  onContext(ctx);
  return (
    <div>
      <span data-testid="token">{ctx.token}</span>
      <span data-testid="food-count">{ctx.food_list.length}</span>
      <span data-testid="cart-total">{ctx.getTotalCartAmount()}</span>
      <span data-testid="cart-items-count">{ctx.getTotalCartItems()}</span>
      <button data-testid="add" onClick={() => ctx.addToCart('1')}>Add</button>
      <button data-testid="remove" onClick={() => ctx.removeFromCart('1')}>Remove</button>
      <button data-testid="remove-all" onClick={() => ctx.removeFromCart('1', true)}>RemoveAll</button>
      <button data-testid="set-token" onClick={() => ctx.setToken('new-token')}>SetToken</button>
    </div>
  );
};

describe('StoreContext', () => {
  let latestCtx;
  const captureCtx = (ctx) => { latestCtx = ctx; };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    latestCtx = null;

    // Default: empty food list, no cart
    axios.get.mockResolvedValue({ data: { data: [] } });
    axios.post.mockResolvedValue({ data: { cartData: {} } });
  });

  const renderProvider = () =>
    render(
      <StoreContextProvider>
        <TestConsumer onContext={captureCtx} />
      </StoreContextProvider>
    );

  // ─── Initial state ────────────────────────────────────────
  test('provides default context values', async () => {
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('');
      expect(screen.getByTestId('food-count').textContent).toBe('0');
      expect(screen.getByTestId('cart-total').textContent).toBe('0');
      expect(screen.getByTestId('cart-items-count').textContent).toBe('0');
    });
  });

  test('fetches food list on mount', async () => {
    axios.get.mockResolvedValue({
      data: { data: [{ _id: '1', name: 'Pizza', price: 10 }] },
    });

    renderProvider();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/food/list'));
      expect(screen.getByTestId('food-count').textContent).toBe('1');
    });
  });

  // ─── Token restoration from localStorage ──────────────────
  test('restores token from localStorage and loads cart', async () => {
    localStorage.setItem('token', 'saved-token');
    axios.get.mockResolvedValue({ data: { data: [] } });
    axios.post.mockResolvedValue({ data: { cartData: { '1': 2 } } });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('saved-token');
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/cart/get'),
      {},
      expect.objectContaining({ headers: { token: 'saved-token' } })
    );
  });

  // ─── addToCart ─────────────────────────────────────────────
  test('addToCart increments item count', async () => {
    renderProvider();
    await waitFor(() => expect(latestCtx).toBeTruthy());

    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('1');
    });
  });

  test('addToCart calls API when token is set', async () => {
    localStorage.setItem('token', 'my-token');
    axios.get.mockResolvedValue({ data: { data: [] } });
    axios.post.mockResolvedValue({ data: { cartData: {} } });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('my-token');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/cart/add'),
        { itemId: '1' },
        expect.objectContaining({ headers: { token: 'my-token' } })
      );
    });
  });

  // ─── removeFromCart ────────────────────────────────────────
  test('removeFromCart decrements item count', async () => {
    renderProvider();
    await waitFor(() => expect(latestCtx).toBeTruthy());

    // Add 2 items then remove 1
    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });
    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('2');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('remove'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('1');
    });
  });

  test('removeFromCart with completely=true removes item entirely', async () => {
    renderProvider();
    await waitFor(() => expect(latestCtx).toBeTruthy());

    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('2');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('remove-all'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('0');
    });
  });

  // ─── getTotalCartAmount ────────────────────────────────────
  test('getTotalCartAmount computes total from food_list and cartItems', async () => {
    axios.get.mockResolvedValue({
      data: { data: [{ _id: '1', name: 'Pizza', price: 10 }] },
    });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('food-count').textContent).toBe('1');
    });

    // Add item to cart
    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-total').textContent).toBe('10');
    });

    // Add again — should be 20
    await act(async () => {
      await userEvent.click(screen.getByTestId('add'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-total').textContent).toBe('20');
    });
  });

  // ─── Error handling ────────────────────────────────────────
  test('handles food list fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Network error'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('food-count').textContent).toBe('0');
    });

    consoleSpy.mockRestore();
  });

  test('handles cart load error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('token', 'my-token');
    axios.get.mockResolvedValue({ data: { data: [] } });
    axios.post.mockRejectedValue(new Error('Cart error'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count').textContent).toBe('0');
    });

    consoleSpy.mockRestore();
  });

  // ─── setToken ──────────────────────────────────────────────
  test('setToken updates token value', async () => {
    renderProvider();
    await waitFor(() => expect(latestCtx).toBeTruthy());

    await act(async () => {
      await userEvent.click(screen.getByTestId('set-token'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('token').textContent).toBe('new-token');
    });
  });

  // ─── url ───────────────────────────────────────────────────
  test('provides url from context', async () => {
    renderProvider();
    await waitFor(() => {
      expect(latestCtx.url).toBeDefined();
      expect(typeof latestCtx.url).toBe('string');
    });
  });
});
