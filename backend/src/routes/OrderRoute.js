import express from "express";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import OrderController from "../controllers/OrderController.js";

class OrderRoute {
  constructor() {
    this.router = express.Router();
    this.controller = OrderController;
    this.authMiddleware = AuthMiddleware;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/place", this.authMiddleware.authenticate, this.controller.placeOrder);
    this.router.post("/verify", this.controller.verifyOrder);
    this.router.post("/userorders", this.authMiddleware.authenticate, this.controller.getUserOrders);
    this.router.get("/list", this.controller.listOrders);
    this.router.post("/status", this.controller.updateStatus);
    this.router.get("/:id", this.controller.getOrderById);
    this.router.post("/cancel", this.authMiddleware.authenticate, this.controller.cancelOrder);
  }

  getRouter() {
    return this.router;
  }
}

export default new OrderRoute().getRouter();
