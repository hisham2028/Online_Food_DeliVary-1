import express from 'express';
import FoodController from '../controllers/FoodController.js';
import FileUploadMiddleware from '../middleware/FileUploadMiddleware.js';

class FoodRoute {
  constructor() {
    this.router = express.Router();
    this.controller = FoodController;
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post("/add", FileUploadMiddleware.upload("image"), this.controller.addFood);
    this.router.get("/list", this.controller.listFood);
    this.router.post("/remove", this.controller.removeFood);
    this.router.put("/update/:id", FileUploadMiddleware.upload("image"), this.controller.updateFood);
    this.router.get("/search", this.controller.searchFood);
  }

  getRouter() {
    return this.router;
  }
}

export default new FoodRoute().getRouter();
