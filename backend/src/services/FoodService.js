/**
 * Food Service - Business Logic Layer
 */

import FoodModel from '../models/FoodModel.js';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

class FoodService {
  constructor(foodModel = null) {
    this.foodModel = foodModel || FoodModel;
  }

  async addFood(foodData, imageFile) {
    if (!foodData.name || !foodData.price || !imageFile) {
      throw new Error('Name, price, and image are required');
    }

    const newFood = await this.foodModel.create({
      name: foodData.name,
      description: foodData.description || '',
      price: Number(foodData.price),
      category: foodData.category || 'other',
      image: imageFile.filename,
      isAvailable: foodData.isAvailable !== undefined ? foodData.isAvailable : true
    });

    return newFood;
  }

  async getAllFoods(filters = {}) {
    const query = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.isAvailable !== undefined) {
      query.isAvailable = filters.isAvailable;
    }

    const options = {
      sort: filters.sort || { createdAt: -1 },
      limit: filters.limit,
      skip: filters.skip
    };

    return await this.foodModel.findAll(query, options);
  }

  async getFoodById(foodId) {
    const food = await this.foodModel.findById(foodId);
    if (!food) {
      throw new Error('Food item not found');
    }
    return food;
  }

  async searchFoods(searchTerm) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    return await this.foodModel.search(searchTerm);
  }

  async updateFood(foodId, updateData, imageFile) {
    const food = await this.foodModel.findById(foodId);
    if (!food) {
      throw new Error('Food item not found');
    }

    const updates = { ...updateData };

    if (imageFile) {
      await this._deleteImage(food.image);
      updates.image = imageFile.filename;
    }

    if (updates.price) {
      updates.price = Number(updates.price);
    }

    return await this.foodModel.updateById(foodId, updates);
  }

  async deleteFood(foodId) {
    const food = await this.foodModel.findById(foodId);
    if (!food) {
      throw new Error('Food item not found');
    }

    await this._deleteImage(food.image);
    await this.foodModel.deleteById(foodId);

    return { message: 'Food item deleted successfully' };
  }

  async _deleteImage(filename) {
    if (!filename) return;

    const imagePath = join(process.cwd(), 'uploads', filename);
    if (existsSync(imagePath)) {
      try {
        await unlink(imagePath);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  }
}

export default FoodService;
