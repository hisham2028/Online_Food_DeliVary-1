import mongoose from "mongoose";

class OrderModel {
  constructor() {
    this.schema = new mongoose.Schema({
      userId: {
        type: String,
        required: true
      },
      items: {
        type: Array,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      address: {
        type: Object,
        required: true
      },
      status: {
        type: String,
        default: "Food Processing"
      },
      date: {
        type: Date,
        default: Date.now
      },
      payment: {
        type: Boolean,
        default: false
      }
    });

    this.model = mongoose.models.orders || mongoose.model("orders", this.schema);
  }

  async create(orderData) {
    const order = new this.model(orderData);
    return await order.save();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findByUserId(userId) {
    return await this.model.find({ userId });
  }

  async findAll() {
    return await this.model.find({});
  }

  async updateById(id, updateData) {
    return await this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async updateStatus(orderId, status) {
    return await this.updateById(orderId, { status });
  }

  async updatePaymentStatus(orderId, paymentStatus) {
    return await this.updateById(orderId, { payment: paymentStatus });
  }

  getModel() {
    return this.model;
  }
}

export default new OrderModel();
