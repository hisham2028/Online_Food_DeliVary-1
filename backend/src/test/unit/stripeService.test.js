/**
 * StripeService unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the stripe package - must use a regular function so `new Stripe()` works
const mockSessionCreate = vi.fn();

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(function () {
    this.checkout = {
      sessions: {
        create: mockSessionCreate,
      },
    };
  }),
}));

const { default: StripeService } = await import('../../services/StripeService.js');

describe('StripeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal lazy-loaded stripe instance so it re-constructs for each test
    StripeService._stripe = null;
  });

  describe('stripe getter', () => {
    it('lazily initialises the Stripe client', () => {
      const s1 = StripeService.stripe;
      const s2 = StripeService.stripe;
      expect(s1).toBe(s2); // same cached instance
      expect(typeof s1.checkout.sessions.create).toBe('function');
    });
  });

  describe('formatLineItems', () => {
    it('converts items to Stripe line-item objects', () => {
      const items = [
        { name: 'Pizza', price: 12.99, quantity: 2 },
        { name: 'Burger', price: 8.5, quantity: 1 },
      ];

      const lineItems = StripeService.formatLineItems(items);

      expect(lineItems).toHaveLength(2);
      expect(lineItems[0]).toEqual({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Pizza' },
          unit_amount: 1299,
        },
        quantity: 2,
      });
      expect(lineItems[1]).toEqual({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Burger' },
          unit_amount: 850,
        },
        quantity: 1,
      });
    });

    it('defaults quantity to 1 when not provided', () => {
      const items = [{ name: 'Salad', price: 5.0 }];
      const lineItems = StripeService.formatLineItems(items);
      expect(lineItems[0].quantity).toBe(1);
    });

    it('rounds fractional cents correctly', () => {
      const items = [{ name: 'Item', price: 10.999 }];
      const lineItems = StripeService.formatLineItems(items);
      expect(lineItems[0].price_data.unit_amount).toBe(1100);
    });

    it('returns empty array for empty input', () => {
      expect(StripeService.formatLineItems([])).toEqual([]);
    });
  });

  describe('createCheckoutSession', () => {
    it('creates a checkout session with correct parameters', async () => {
      const session = { id: 'sess_123', url: 'https://checkout.stripe.com/sess_123' };
      mockSessionCreate.mockResolvedValue(session);

      const lineItems = [{ price_data: {}, quantity: 1 }];
      const orderId = 'order_abc';

      const result = await StripeService.createCheckoutSession(lineItems, orderId);

      expect(mockSessionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: expect.stringContaining(`orderId=${orderId}`),
          cancel_url: expect.stringContaining(`orderId=${orderId}`),
        })
      );
      expect(result).toBe(session);
    });

    it('propagates errors from Stripe', async () => {
      mockSessionCreate.mockRejectedValue(new Error('Stripe error'));

      await expect(
        StripeService.createCheckoutSession([], 'o1')
      ).rejects.toThrow('Stripe error');
    });
  });
});
