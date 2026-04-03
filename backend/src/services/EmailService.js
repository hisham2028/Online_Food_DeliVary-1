/**
 * Email Service - Handles email notifications
 */
import nodemailer from 'nodemailer';

class EmailService {
  async sendEmail(to, subject, text, html = null) {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    return await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@fooddelivery.com',
      to,
      subject,
      text,
      html,
    });
  }

  async sendOrderStatusUpdate(email, orderId, status) {
    return await this.sendEmail(
      email,
      `Order Status Update - Order #${orderId}`,
      `Your order #${orderId} status has been updated to: ${status}`,
      `<p>Your order <strong>#${orderId}</strong> status: <strong>${status}</strong></p>`
    );
  }
}

export default new EmailService();
