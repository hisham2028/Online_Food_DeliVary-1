import mongoose from "mongoose";

class UserModel {
  constructor() {
    this.schema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      cartData: { type: Object, default: {} },
      resetPasswordToken: { type: String },
      resetPasswordExpire: { type: Date }
    }, { 
      minimize: false, 
      timestamps: true
    });

    this.model = mongoose.models.user || mongoose.model("user", this.schema);
  }

  async create(userData) {
    const user = new this.model(userData);
    return await user.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async updateById(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async updateCart(userId, cartData) {
    return await this.model.findByIdAndUpdate(userId, { cartData }, { new: true });
  }

  async clearCart(userId) {
    return await this.model.findByIdAndUpdate(userId, { cartData: {} }, { new: true });
  }

  getModel() {
    return this.model;
  }
}

export default new UserModel();
