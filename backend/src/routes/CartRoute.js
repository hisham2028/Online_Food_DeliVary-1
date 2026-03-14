import express from "express";
import CartController from "../controllers/CartController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

class CartRoute {
  constructor() {
    this.router = express.Router();
    this.controller = CartController;
    this.authMiddleware = AuthMiddleware;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/add", this.authMiddleware.authenticate, this.controller.addToCart);
    this.router.post("/remove", this.authMiddleware.authenticate, this.controller.removeFromCart);
    this.router.post("/get", this.authMiddleware.authenticate, this.controller.getCart);
    this.router.post("/clear", this.authMiddleware.authenticate, this.controller.clearCart);
  }

  getRouter() {
    return this.router;
  }
}

export default new CartRoute().getRouter();
