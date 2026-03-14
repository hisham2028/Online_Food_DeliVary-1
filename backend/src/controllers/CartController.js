import UserModel from "../models/UserModel.js";

class CartController {
  constructor() {
    this.userModel = UserModel;
  }

  addToCart = async (req, res) => {
    try {
      const userData = await this.userModel.findById(req.body.userId);
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
      const cartData = userData.cartData;

      if (!cartData[req.body.itemId]) {
        cartData[req.body.itemId] = 1;
      } else {
        cartData[req.body.itemId] += 1;
      }

      await this.userModel.updateById(req.body.userId, { cartData });
      res.json({ success: true, message: "Added To Cart" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error adding to cart" });
    }
  }

  removeFromCart = async (req, res) => {
    try {
      const userData = await this.userModel.findById(req.body.userId);
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
      const cartData = userData.cartData;

      if (cartData[req.body.itemId] > 0) {
        cartData[req.body.itemId] -= 1;
      }

      await this.userModel.updateById(req.body.userId, { cartData });
      res.json({ success: true, message: "Removed From Cart" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error removing from cart" });
    }
  }

  getCart = async (req, res) => {
    try {
      const userData = await this.userModel.findById(req.body.userId);
      if (!userData) {
        return res.json({ success: false, message: "User not found" });
      }
      const cartData = userData.cartData;
      res.json({ success: true, cartData });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error fetching cart" });
    }
  }

  clearCart = async (req, res) => {
    try {
      await this.userModel.updateById(req.body.userId, { cartData: {} });
      res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error clearing cart" });
    }
  }
}

export default new CartController();
