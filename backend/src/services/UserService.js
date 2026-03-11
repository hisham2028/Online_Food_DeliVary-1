/**
 * User Service - Business Logic Layer
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import UserModel from '../models/UserModel.js';

class UserService {
  constructor(userModel = null) {
    this.userModel = userModel || UserModel;
    this.jwtExpiry = process.env.JWT_EXPIRY || '7d';
  }

  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: this.jwtExpiry
    });
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async register(userData) {
    const { name, email, password } = userData;

    // Validate
    if (!name || !email || !password) {
      throw new Error('Please provide name, email and password');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Enter a valid email');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check existing user
    const existingUser = await this.userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const newUser = await this.userModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Generate token
    const token = this.generateToken(newUser._id);

    return {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      },
      token
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id);

    // Update last login
    await this.userModel.updateById(user._id, { lastLogin: new Date() });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}

export default UserService;
