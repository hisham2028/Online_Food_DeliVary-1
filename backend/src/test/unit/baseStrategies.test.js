/**
 * Top-level validation strategy tests:
 *   BaseValidationStrategy, ImageValidationStrategy (strategies/)
 *   and fileUploaded/AvatarValidationStrategy (which re-exports PaymentStrategy)
 */
import { describe, it, expect, vi } from 'vitest';

// ─── strategies/BaseValidationStrategy ───────────────────────────────────────
import BaseValidationStrategy from '../../strategies/BaseValidationStrategy.js';

describe('strategies/BaseValidationStrategy', () => {
  it('can be subclassed', () => {
    class Concrete extends BaseValidationStrategy {
      validate() { return 'ok'; }
    }
    expect(new Concrete().validate()).toBe('ok');
  });

  it('throws when validate() is not overridden', () => {
    const base = new BaseValidationStrategy();
    expect(() => base.validate()).toThrow('validate(file) must be implemented');
  });
});

// ─── strategies/ImageValidationStrategy ──────────────────────────────────────
import ImageValidationStrategy from '../../strategies/ImageValidationStrategy.js';

describe('strategies/ImageValidationStrategy', () => {
  it('accepts JPEG files', () => {
    const strategy = new ImageValidationStrategy();
    expect(() => strategy.validate({ mimetype: 'image/jpeg' })).not.toThrow();
  });

  it('accepts PNG files', () => {
    const strategy = new ImageValidationStrategy();
    expect(() => strategy.validate({ mimetype: 'image/png' })).not.toThrow();
  });

  it('accepts WebP files', () => {
    const strategy = new ImageValidationStrategy();
    expect(() => strategy.validate({ mimetype: 'image/webp' })).not.toThrow();
  });

  it('rejects PDF files', () => {
    const strategy = new ImageValidationStrategy();
    expect(() => strategy.validate({ mimetype: 'application/pdf' })).toThrow(
      'Invalid file type. Only JPEG, PNG and WebP allowed'
    );
  });

  it('accepts a custom list of allowed types', () => {
    const strategy = new ImageValidationStrategy({ allowedTypes: ['image/gif'] });
    expect(() => strategy.validate({ mimetype: 'image/gif' })).not.toThrow();
    expect(() => strategy.validate({ mimetype: 'image/jpeg' })).toThrow();
  });
});

// ─── fileUploaded/AvatarValidationStrategy (actually PaymentStrategy code) ────
vi.mock('../../services/StripeService.js', () => ({
  default: {
    formatLineItems: vi.fn().mockReturnValue([]),
    createCheckoutSession: vi.fn().mockResolvedValue({ url: 'https://stripe.com/pay' }),
  },
}));

const {
  BasePaymentStrategy,
  CardPaymentStrategy,
  CodPaymentStrategy,
  PaymentProcessor,
} = await import('../../strategies/fileUploaded/AvatarValidationStrategy.js');

const StripeService = (await import('../../services/StripeService.js')).default;

describe('fileUploaded/AvatarValidationStrategy (PaymentStrategy)', () => {
  describe('BasePaymentStrategy', () => {
    it('throws when processPayment() is not overridden', async () => {
      const base = new BasePaymentStrategy();
      await expect(base.processPayment({})).rejects.toThrow('processPayment() must be implemented');
    });
  });

  describe('CodPaymentStrategy', () => {
    it('returns cod type with orderId', async () => {
      const strategy = new CodPaymentStrategy();
      const result = await strategy.processPayment({ orderId: 'o1' });
      expect(result).toEqual({ type: 'cod', message: 'Order Placed', orderId: 'o1' });
    });
  });

  describe('CardPaymentStrategy', () => {
    it('calls StripeService and returns session_url', async () => {
      const strategy = new CardPaymentStrategy();
      const result = await strategy.processPayment({
        items: [{ name: 'Pizza', price: 10, quantity: 1 }],
        orderId: 'o1',
        amount: 10,
      });
      expect(StripeService.formatLineItems).toHaveBeenCalled();
      expect(StripeService.createCheckoutSession).toHaveBeenCalled();
      expect(result).toEqual({ type: 'card', session_url: 'https://stripe.com/pay' });
    });
  });

  describe('PaymentProcessor', () => {
    it('processes COD payment via setStrategy chain', async () => {
      const processor = new PaymentProcessor();
      const result = await processor.setStrategy('cod').processPayment({ orderId: 'o2' });
      expect(result.type).toBe('cod');
    });

    it('processes card payment', async () => {
      const processor = new PaymentProcessor();
      const result = await processor.setStrategy('card').processPayment({
        items: [],
        orderId: 'o3',
        amount: 0,
      });
      expect(result.type).toBe('card');
    });

    it('throws for an unknown payment method', () => {
      const processor = new PaymentProcessor();
      expect(() => processor.setStrategy('crypto')).toThrow('Unknown payment method: crypto');
    });

    it('throws when processPayment() is called before setStrategy()', async () => {
      const processor = new PaymentProcessor();
      await expect(processor.processPayment({})).rejects.toThrow(
        'No payment strategy selected'
      );
    });
  });
});
