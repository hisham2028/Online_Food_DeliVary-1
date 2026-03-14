import OrderModel from "../models/OrderModel.js";
import UserModel from "../models/UserModel.js";
import StripeService from "../services/StripeService.js";

class OrderController {
  constructor() {
    this.orderModel = OrderModel;
    this.userModel = UserModel;
    this.stripeService = StripeService;
  }

  placeOrder = async (req, res) => {
    try {
      const newOrder = await this.orderModel.create({
        userId: req.body.userId,
        items: req.body.items,
        amount: req.body.amount,
        address: req.body.address
      });

      await this.userModel.updateById(req.body.userId, { cartData: {} });

      if (req.body.paymentMethod === "cod") {
        return res.json({ success: true, message: "Order Placed" });
      }

      const lineItems = this.stripeService.formatLineItems(req.body.items);
      const session = await this.stripeService.createCheckoutSession(lineItems, newOrder._id);

      res.json({ success: true, session_url: session.url });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error placing order" });
    }
  }

  verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
      if (success === "true") {
        await this.orderModel.updatePaymentStatus(orderId, true);
        res.json({ success: true, message: "Paid" });
      } else {
        await this.orderModel.deleteById(orderId);
        res.json({ success: false, message: "Not Paid" });
      }
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error verifying order" });
    }
  }

  getUserOrders = async (req, res) => {
    try {
      const orders = await this.orderModel.findByUserId(req.body.userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error fetching user orders" });
    }
  }

  listOrders = async (req, res) => {
    try {
      const orders = await this.orderModel.findAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error collecting orders" });
    }
  }

  updateStatus = async (req, res) => {
    try {
      const { orderId, status } = req.body;
      await this.orderModel.updateStatus(orderId, status);
      res.json({ success: true, message: "Status Updated" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error updating status" });
    }
  }

  getOrderById = async (req, res) => {
    try {
      const order = await this.orderModel.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
      res.json({ success: true, data: order });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error fetching order" });
    }
  }

  cancelOrder = async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await this.orderModel.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (order.status !== "Food Processing") {
        return res.json({ success: false, message: "Cannot cancel order in current status" });
      }

      await this.orderModel.updateStatus(orderId, "Cancelled");
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error cancelling order" });
    }
  }
}

export default new OrderController();
