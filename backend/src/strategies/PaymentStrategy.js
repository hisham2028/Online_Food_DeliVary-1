/**
 * PaymentStrategy — Strategy Pattern
 *
 * Each payment method is an independent, interchangeable strategy.
 * Adding a new payment method = one new class, zero changes elsewhere.
 * Follows the Open/Closed Principle.
 */

import StripeService from '../services/StripeService.js';

// ─── Base Strategy (Abstract Interface) ───────────────────────────────────────
class BasePaymentStrategy {
  /**
   * Process a payment.
   * @param {{ items: Array, orderId: string, amount: number }} paymentData
   * @returns {Promise<{ type: string, [key: string]: any }>}
   */
  async processPayment(_paymentData) {
    throw new Error('processPayment() must be implemented by a concrete strategy');
  }
}

// ─── Card Payment (Stripe Checkout) ───────────────────────────────────────────
class CardPaymentStrategy extends BasePaymentStrategy {
  constructor() {
    super();
    this.stripeService = StripeService;
  }

  async processPayment({ items, orderId, amount }) {
    const lineItems = this.stripeService.formatLineItems(items);
    const session = await this.stripeService.createCheckoutSession(lineItems, orderId);

    return {
      type: 'card',
      session_url: session.url,
    };
  }
}

// ─── Cash on Delivery ─────────────────────────────────────────────────────────
class CodPaymentStrategy extends BasePaymentStrategy {
  async processPayment({ orderId }) {
    return {
      type: 'cod',
      message: 'Order Placed',
      orderId,
    };
  }
}

// ─── Payment Processor (Context) ──────────────────────────────────────────────
/**
 * Holds the current strategy and delegates processPayment() to it.
 * Usage:
 *   const processor = new PaymentProcessor();
 *   const result = await processor.setStrategy('card').processPayment(data);
 */
class PaymentProcessor {
  constructor() {
    this.strategies = {
      card: new CardPaymentStrategy(),
      cod: new CodPaymentStrategy(),
    };
    this.currentStrategy = null;
  }

  /**
   * Select a payment strategy by key.
   * @param {string} method - 'card' or 'cod'
   * @returns {PaymentProcessor} this (for chaining)
   */
  setStrategy(method) {
    const strategy = this.strategies[method];
    if (!strategy) {
      throw new Error(`Unknown payment method: ${method}. Supported: ${Object.keys(this.strategies).join(', ')}`);
    }
    this.currentStrategy = strategy;
    return this;
  }

  /**
   * Process payment using the selected strategy.
   * @param {{ items: Array, orderId: string, amount: number }} paymentData
   */
  async processPayment(paymentData) {
    if (!this.currentStrategy) {
      throw new Error('No payment strategy selected. Call setStrategy() first.');
    }
    return await this.currentStrategy.processPayment(paymentData);
  }
}

export {
  BasePaymentStrategy,
  CardPaymentStrategy,
  CodPaymentStrategy,
  PaymentProcessor,
};
