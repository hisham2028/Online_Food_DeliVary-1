/**
 * Order Service - Uses Strategy Pattern for payments
 */

import OrderModel from '../models/OrderModel.js';
import UserModel from '../models/UserModel.js';
import FoodModel from '../models/FoodModel.js';
import { PaymentProcessor } from '../strategies/PaymentStrategy.js';

class OrderService {
  constructor(orderModel = null, userModel = null, foodModel = null) {
    this.orderModel = orderModel || OrderModel;
    this.userModel = userModel || UserModel;
    this.foodModel = foodModel || FoodModel;
    this.paymentProcessor = new PaymentProcessor();
  }

  async createOrder(orderData) {
    const { userId, items, amount, address, paymentMethod = 'card' } = orderData;

    // Validate items
    await this._validateOrderItems(items);

    // Create order
    const order = await this.orderModel.create({
      userId,
      items,
      amount,
      address,
      paymentMethod
    });

    // Process payment using Strategy Pattern
    const paymentResult = await this.paymentProcessor
      .setStrategy(paymentMethod)
      .processPayment({
        items,
        orderId: order._id,
        amount
      });

    // Clear cart
    await this.userModel.clearCart(userId);

    return {
      order,
      payment: paymentResult
    };
  }

  async verifyPayment(orderId, success) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (success === 'true' || success === true) {
      await this.orderModel.updatePaymentStatus(orderId, true);
      return {
        success: true,
        message: 'Payment verified'
      };
    } else {
      await this.orderModel.deleteById(orderId);
      return {
        success: false,
        message: 'Payment failed'
      };
    }
  }

  async getUserOrders(userId, options = {}) {
    return await this.orderModel.findByUserId(userId, {
      sort: { createdAt: -1 },
      ...options
    });
  }

  async getOrderById(orderId) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async getAllOrders(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    const options = {
      sort: { createdAt: -1 },
      limit: filters.limit,
      skip: filters.skip
    };

    return await this.orderModel.findAll(query, options);
  }

  async updateOrderStatus(orderId, status) {
    const validStatuses = ['Food Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.orderModel.updateStatus(orderId, status);
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId, userId = null) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (userId && order.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized');
    }

    if (order.status === 'Delivered') {
      throw new Error('Cannot cancel delivered order');
    }

    return await this.orderModel.updateStatus(orderId, 'Cancelled');
  }

  async _validateOrderItems(items) {
    for (const item of items) {
      const food = await this.foodModel.findById(item._id || item.foodId);
      if (!food) {
        throw new Error(`Food item not found: ${item.name}`);
      }
      if (!food.isAvailable) {
        throw new Error(`Food item not available: ${food.name}`);
      }
    }
    return true;
  }
}

export default OrderService;
