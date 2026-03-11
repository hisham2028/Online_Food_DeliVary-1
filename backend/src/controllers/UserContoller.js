import UserService from "../services/UserService.js";

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login({ email, password });
      res.json({ success: true, token: result.token });
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      res.json({ success: false, message: error.message || "Server Error" });
    }
  }

  register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.userService.register({ name, email, password });
      res.json({ success: true, token: result.token });
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      res.json({ success: false, message: error.message || "Server Error" });
    }
  }

  getUserProfile = async (req, res) => {
    try {
      const profile = await this.userService.getProfile(req.body.userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
      res.json({ success: false, message: error.message || "Server Error" });
    }
  }
}

export default new UserController();
