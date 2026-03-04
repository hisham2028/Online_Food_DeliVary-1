import express from "express";
import cors from "cors";
import 'dotenv/config'; 
import dns from 'node:dns';
import Database from "./config/Database.js";
import FoodRoute from "./routes/FoodRoute.js";
import UserRoute from "./routes/UserRoute.js";
import CartRoute from "./routes/CartRoute.js"; 
import OrderRoute from "./routes/OrderRoute.js";

dns.setServers(['8.8.8.8', '1.1.1.1']); 

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.database = Database;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeStaticFiles();
    this.initializeTestRoute();
  }

  initializeMiddleware() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  initializeRoutes() {
    this.app.use("/api/food", FoodRoute);
    this.app.use("/api/user", UserRoute);
    this.app.use("/api/cart", CartRoute);
    this.app.use("/api/order", OrderRoute);
  }

  initializeStaticFiles() {
    this.app.use("/images", express.static('uploads'));
  }

  initializeTestRoute() {
    this.app.get("/", (req, res) => {
      res.send("API Working Successfully");
    });
  }

  async start() {
    try {
      await this.database.connect();
      
      this.app.listen(this.port, () => {
        console.log(`Server Started on http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  getApp() {
    return this.app;
  }
}

const server = new Server();
server.start();

export default server;
