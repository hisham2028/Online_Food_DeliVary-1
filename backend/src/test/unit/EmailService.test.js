/**
 * EmailService unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn()
  }
}));

import EmailService from '../../services/EmailService.js';

describe('EmailService', () => {
  let mockTransporter;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTransporter = {
      sendMail: vi.fn()
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg123' });

      const result = await EmailService.sendEmail(
        'test@example.com',
        'Test Subject',
        'Test body text',
        '<p>Test body HTML</p>'
      );

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body text',
        html: '<p>Test body HTML</p>'
      }));
      expect(result.messageId).toBe('msg123');
    });

    it('sends email without HTML', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg456' });

      await EmailService.sendEmail('test@example.com', 'Subject', 'Text only');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        text: 'Text only',
        html: null
      }));
    });

    it('throws error on send failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(EmailService.sendEmail('test@example.com', 'Subject', 'Body'))
        .rejects.toThrow('SMTP error');
    });
  });

  describe('sendOrderStatusUpdate', () => {
    it('sends order status update email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'status123' });

      await EmailService.sendOrderStatusUpdate('user@example.com', 'order123', 'Delivered');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Order Status Update - Order #order123'
      }));
    });

    it('includes status in email body', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'status456' });

      await EmailService.sendOrderStatusUpdate('user@example.com', 'order456', 'Out for Delivery');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        text: expect.stringContaining('Out for Delivery')
      }));
    });
  });
});
