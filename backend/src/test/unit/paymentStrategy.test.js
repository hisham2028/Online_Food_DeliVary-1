/**
 * PaymentStrategy unit tests
 *
 * StripeService is mocked so no real HTTP calls are made.
 */

const mockFormatLineItems        = jest.fn();
const mockCreateCheckoutSession  = jest.fn();

jest.mock('../services/StripeService.js', () => ({
  formatLineItems:       mockFormatLineItems,
  createCheckoutSession: mockCreateCheckoutSession,
}));

import {
  BasePaymentStrategy,
  CardPaymentStrategy,
  CodPaymentStrategy,
  PaymentProcessor,
} from '../strategies/PaymentStrategy.js';

describe('PaymentStrategy', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── BasePaymentStrategy ────────────────────────────────────────────────────

  describe('BasePaymentStrategy', () => {
    it('throws when processPayment() is called directly', async () => {
      const base = new BasePaymentStrategy();
      await expect(base.processPayment({})).rejects.toThrow(
        'processPayment() must be implemented by a concrete strategy'
      );
    });
  });

  // ── CardPaymentStrategy ────────────────────────────────────────────────────

  describe('CardPaymentStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new CardPaymentStrategy();
    });

    it('returns type "card" and session_url on success', async () => {
      mockFormatLineItems.mockReturnValue([{ price_data: {} }]);
      mockCreateCheckoutSession.mockResolvedValue({ url: 'https://stripe.com/pay/session123' });

      const result = await strategy.processPayment({
        items: [{ name: 'Pizza', price: 10 }],
        orderId: 'o1',
        amount: 10,
      });

      expect(mockFormatLineItems).toHaveBeenCalledWith([{ name: 'Pizza', price: 10 }]);
      expect(mockCreateCheckoutSession).toHaveBeenCalled();
      expect(result).toEqual({
        type: 'card',
        session_url: 'https://stripe.com/pay/session123',
      });
    });

    it('propagates Stripe errors', async () => {
      mockFormatLineItems.mockReturnValue([]);
      mockCreateCheckoutSession.mockRejectedValue(new Error('Stripe error'));

      await expect(
        strategy.processPayment({ items: [], orderId: 'o1', amount: 0 })
      ).rejects.toThrow('Stripe error');
    });
  });

  // ── CodPaymentStrategy ─────────────────────────────────────────────────────

  describe('CodPaymentStrategy', () => {
    let strategy;

    beforeEach(() => {
      strategy = new CodPaymentStrategy();
    });

    it('returns type "cod" with orderId and message', async () => {
      const result = await strategy.processPayment({ orderId: 'o2' });

      expect(result).toEqual({
        type: 'cod',
        message: 'Order Placed',
        orderId: 'o2',
      });
    });
  });

  // ── PaymentProcessor ───────────────────────────────────────────────────────

  describe('PaymentProcessor', () => {
    let processor;

    beforeEach(() => {
      processor = new PaymentProcessor();
    });

    it('throws when processPayment() is called before setStrategy()', async () => {
      await expect(processor.processPayment({})).rejects.toThrow(
        'No payment strategy selected. Call setStrategy() first.'
      );
    });

    it('throws on unknown payment method', () => {
      expect(() => processor.setStrategy('bitcoin')).toThrow(
        'Unknown payment method: bitcoin'
      );
    });

    it('supports method chaining on setStrategy()', () => {
      const returned = processor.setStrategy('cod');
      expect(returned).toBe(processor);
    });

    it('delegates to CodPaymentStrategy', async () => {
      const result = await processor.setStrategy('cod').processPayment({ orderId: 'o3' });

      expect(result.type).toBe('cod');
      expect(result.orderId).toBe('o3');
    });

    it('delegates to CardPaymentStrategy', async () => {
      mockFormatLineItems.mockReturnValue([]);
      mockCreateCheckoutSession.mockResolvedValue({ url: 'https://stripe.com/s' });

      const result = await processor.setStrategy('card').processPayment({
        items: [],
        orderId: 'o4',
        amount: 0,
      });

      expect(result.type).toBe('card');
      expect(result.session_url).toBe('https://stripe.com/s');
    });

    it('can switch strategy between calls', async () => {
      const cod = await processor.setStrategy('cod').processPayment({ orderId: 'o5' });
      expect(cod.type).toBe('cod');

      mockFormatLineItems.mockReturnValue([]);
      mockCreateCheckoutSession.mockResolvedValue({ url: 'https://stripe.com/x' });

      const card = await processor.setStrategy('card').processPayment({
        items: [],
        orderId: 'o6',
        amount: 0,
      });
      expect(card.type).toBe('card');
    });
  });
});
