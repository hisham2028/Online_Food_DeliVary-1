/**
 * PaymentStrategy unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/StripeService.js', () => ({
  default: {
    formatLineItems: vi.fn().mockReturnValue([{ price_data: {}, quantity: 1 }]),
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://stripe.com/checkout' })
  }
}));

import {
  BasePaymentStrategy,
  CardPaymentStrategy,
  CodPaymentStrategy,
  PaymentProcessor
} from '../../strategies/PaymentStrategy.js';

describe('PaymentStrategy', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('BasePaymentStrategy', () => {
    it('throws error when processPayment is called directly', async () => {
      const base = new BasePaymentStrategy();
      await expect(base.processPayment({})).rejects.toThrow('processPayment() must be implemented');
    });
  });

  describe('CardPaymentStrategy', () => {
    it('returns session_url for card payments', async () => {
      const strategy = new CardPaymentStrategy();
      const result = await strategy.processPayment({
        items: [{ name: 'Pizza', price: 10, quantity: 1 }],
        orderId: 'order123',
        amount: 10
      });

      expect(result.type).toBe('card');
      expect(result.session_url).toBe('https://stripe.com/checkout');
    });
  });

  describe('CodPaymentStrategy', () => {
    it('returns COD confirmation', async () => {
      const strategy = new CodPaymentStrategy();
      const result = await strategy.processPayment({
        orderId: 'order123'
      });

      expect(result.type).toBe('cod');
      expect(result.message).toBe('Order Placed');
      expect(result.orderId).toBe('order123');
    });
  });

  describe('PaymentProcessor', () => {
    it('sets card strategy correctly', () => {
      const processor = new PaymentProcessor();
      const result = processor.setStrategy('card');
      expect(result).toBe(processor); // Returns this for chaining
    });

    it('sets cod strategy correctly', () => {
      const processor = new PaymentProcessor();
      const result = processor.setStrategy('cod');
      expect(result).toBe(processor);
    });

    it('throws error for unknown payment method', () => {
      const processor = new PaymentProcessor();
      expect(() => processor.setStrategy('bitcoin')).toThrow('Unknown payment method');
    });

    it('throws error when processing without setting strategy', async () => {
      const processor = new PaymentProcessor();
      await expect(processor.processPayment({})).rejects.toThrow('No payment strategy selected');
    });

    it('processes card payment through strategy', async () => {
      const processor = new PaymentProcessor();
      const result = await processor.setStrategy('card').processPayment({
        items: [{ name: 'Burger', price: 8, quantity: 2 }],
        orderId: 'order456',
        amount: 16
      });

      expect(result.type).toBe('card');
    });

    it('processes COD payment through strategy', async () => {
      const processor = new PaymentProcessor();
      const result = await processor.setStrategy('cod').processPayment({
        orderId: 'order789'
      });

      expect(result.type).toBe('cod');
      expect(result.message).toBe('Order Placed');
    });
  });
});
