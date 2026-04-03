import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

// Mock firebase config
vi.mock('../firebase/config', () => ({
  auth: {},
  googleProvider: {},
  facebookProvider: {}
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import authService from './authService';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('signInWithGoogle', () => {
    it('successfully signs in with Google and stores token', async () => {
      const mockUser = {
        displayName: 'Test User',
        email: 'test@example.com',
        uid: 'firebase-uid-123',
        photoURL: 'https://example.com/photo.jpg'
      };

      signInWithPopup.mockResolvedValue({ user: mockUser });
      axios.post.mockResolvedValue({
        data: {
          success: true,
          token: 'test-token-123',
          user: { name: 'Test User', email: 'test@example.com' }
        }
      });

      const result = await authService.signInWithGoogle();

      expect(result.success).toBe(true);
      expect(result.token).toBe('test-token-123');
      expect(localStorage.getItem('token')).toBe('test-token-123');
    });

    it('throws error when backend returns failure', async () => {
      const mockUser = {
        displayName: 'Test User',
        email: 'test@example.com',
        uid: 'firebase-uid-123',
        photoURL: null
      };

      signInWithPopup.mockResolvedValue({ user: mockUser });
      axios.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Authentication failed'
        }
      });

      await expect(authService.signInWithGoogle()).rejects.toThrow('Authentication failed');
    });

    it('throws error when signInWithPopup fails', async () => {
      signInWithPopup.mockRejectedValue(new Error('Popup closed'));

      await expect(authService.signInWithGoogle()).rejects.toThrow('Popup closed');
    });
  });

  describe('signInWithFacebook', () => {
    it('successfully signs in with Facebook and stores token', async () => {
      const mockUser = {
        displayName: 'Facebook User',
        email: 'fb@example.com',
        uid: 'firebase-uid-456',
        photoURL: 'https://example.com/fb-photo.jpg'
      };

      signInWithPopup.mockResolvedValue({ user: mockUser });
      axios.post.mockResolvedValue({
        data: {
          success: true,
          token: 'fb-token-456',
          user: { name: 'Facebook User', email: 'fb@example.com' }
        }
      });

      const result = await authService.signInWithFacebook();

      expect(result.success).toBe(true);
      expect(result.token).toBe('fb-token-456');
      expect(localStorage.getItem('token')).toBe('fb-token-456');
    });

    it('throws error when backend returns failure', async () => {
      const mockUser = {
        displayName: 'Facebook User',
        email: 'fb@example.com',
        uid: 'firebase-uid-456',
        photoURL: null
      };

      signInWithPopup.mockResolvedValue({ user: mockUser });
      axios.post.mockResolvedValue({
        data: {
          success: false,
          message: 'Facebook auth failed'
        }
      });

      await expect(authService.signInWithFacebook()).rejects.toThrow('Facebook auth failed');
    });

    it('throws error when signInWithPopup fails', async () => {
      signInWithPopup.mockRejectedValue(new Error('Facebook popup error'));

      await expect(authService.signInWithFacebook()).rejects.toThrow('Facebook popup error');
    });
  });

  describe('signOut', () => {
    it('successfully signs out and removes token', async () => {
      localStorage.setItem('token', 'existing-token');
      firebaseSignOut.mockResolvedValue();

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('throws error when signOut fails', async () => {
      firebaseSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('onAuthStateChange', () => {
    it('registers auth state change listener', () => {
      const callback = vi.fn();
      authService.onAuthStateChange(callback);

      expect(onAuthStateChanged).toHaveBeenCalledWith({}, callback);
    });
  });

  describe('getCurrentToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem('token', 'stored-token');

      const token = authService.getCurrentToken();

      expect(token).toBe('stored-token');
    });

    it('returns null when no token exists', () => {
      const token = authService.getCurrentToken();

      expect(token).toBeNull();
    });
  });
});
