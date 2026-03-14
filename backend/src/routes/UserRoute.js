import express from "express";
import rateLimit from "express-rate-limit";
import UserController from "../controllers/UserController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

class UserRoute {
  constructor() {
    this.router = express.Router();
    this.controller = UserController;
    this.authMiddleware = AuthMiddleware;

    // Stricter rate limit for login/register to prevent brute force
    this.authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // only 10 attempts per window
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many attempts. Please try again in 15 minutes." }
    });

    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/register", this.authLimiter, this.controller.register);
    this.router.post("/login", this.authLimiter, this.controller.login);
    this.router.get("/profile", this.authMiddleware.authenticate, this.controller.getUserProfile);
    this.router.put("/profile", this.authMiddleware.authenticate, this.controller.updateProfile);
  }

  getRouter() {
    return this.router;
  }
}

export default new UserRoute().getRouter();
