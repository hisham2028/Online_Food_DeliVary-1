/**
 * Cart Service - Business Logic Layer
 */

import UserModel from '../models/UserModel.js';
import FoodModel from '../models/FoodModel.js';

class CartService {
  constructor(userModel = null, foodModel = null) {
    this.userModel = userModel || UserModel;
    this.foodModel = foodModel || FoodModel;
  }

  async addToCart(userId, itemId) {
    // Verify food exists and available
    const food = await this.foodModel.findById(itemId);
    if (!food) {
      throw new Error('Food item not found');
    }
    if (!food.isAvailable) {
      throw new Error('Food item not available');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cartData = { ...user.cartData };

    if (!cartData[itemId]) {
      cartData[itemId] = 1;
    } else {
      cartData[itemId] += 1;
    }

    await this.userModel.updateCart(userId, cartData);

    return { message: 'Added to cart', cartData };
  }

  async removeFromCart(userId, itemId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const cartData = { ...user.cartData };

    if (!cartData[itemId] || cartData[itemId] <= 0) {
      throw new Error('Item not in cart');
    }

    cartData[itemId] -= 1;

    if (cartData[itemId] === 0) {
      delete cartData[itemId];
    }

    await this.userModel.updateCart(userId, cartData);

    return { message: 'Removed from cart', cartData };
  }

  async getCart(userId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return { cartData: user.cartData || {} };
  }

  async clearCart(userId) {
    await this.userModel.clearCart(userId);
    return { message: 'Cart cleared', cartData: {} };
  }
}

export default CartService;
