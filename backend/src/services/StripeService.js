/**
 * Stripe Service - Payment Processing
 */
import Stripe from 'stripe';

class StripeService {
  constructor() {
    this._stripe = null;
  }

  get stripe() {
    if (!this._stripe) {
      this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    }
    return this._stripe;
  }

  formatLineItems(items) {
    return items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));
  }

  async createCheckoutSession(lineItems, orderId) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/verify?success=true&orderId=${orderId}`,
      cancel_url: `${process.env.FRONTEND_URL}/verify?success=false&orderId=${orderId}`,
    });
  }
}

export default new StripeService();
