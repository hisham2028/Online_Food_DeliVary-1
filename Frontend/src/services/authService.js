// src/services/authService.js
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase/config';
import axios from 'axios';

class AuthService {
  constructor() {
    this.url = "http://localhost:4002";
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Prepare user data for backend
      const userData = {
        name: user.displayName,
        email: user.email,
        firebaseUid: user.uid,
        provider: 'google',
        photoURL: user.photoURL
      };

      // Send to backend for registration/login
      const response = await axios.post(`${this.url}/api/user/social-login`, userData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        return {
          success: true,
          token: response.data.token,
          user: response.data.user
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      throw error;
    }
  }

  // Facebook Sign In
  async signInWithFacebook() {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Prepare user data for backend
      const userData = {
        name: user.displayName,
        email: user.email,
        firebaseUid: user.uid,
        provider: 'facebook',
        photoURL: user.photoURL
      };

      // Send to backend for registration/login
      const response = await axios.post(`${this.url}/api/user/social-login`, userData);

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        return {
          success: true,
          token: response.data.token,
          user: response.data.user
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Facebook Sign In Error:", error);
      throw error;
    }
  }

  // Sign Out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem("token");
      return { success: true };
    } catch (error) {
      console.error("Sign Out Error:", error);
      throw error;
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user token
  getCurrentToken() {
    return localStorage.getItem("token");
  }
}

export const authService = new AuthService();
export default authService;
