import nodemailer from 'nodemailer';
import Notification from '../model/notification.js';
import User from '../model/user.js';

class NotificationService {
  constructor(io) {
    this.io = io;
    this.setupEmailTransporter();
  }

  setupEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async createNotification({
    recipientId,
    senderId = null,
    type,
    title,
    message,
    data = {},
    priority = 'normal',
    sendEmail = false,
  }) {
    try {
      // Create notification in database
      const notification = new Notification({
        recipient: recipientId,
        sender: senderId,
        type,
        title,
        message,
        data,
        priority,
      });

      await notification.save();

      // Populate sender and recipient info
      await notification.populate('recipient', 'firstname lastname email role');
      if (senderId) {
        await notification.populate('sender', 'firstname lastname email role');
      }

      // Send real-time notification if user is online
      const socketId = this.getSocketIdByUserId(recipientId);
      if (socketId) {
        this.io.to(socketId).emit('new_notification', {
          id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          priority: notification.priority,
          timestamp: notification.createdAt,
          sender: notification.sender,
        });
      }

      // Send email notification if requested
      if (sendEmail) {
        await this.sendEmailNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendEmailNotification(notification) {
    try {
      if (notification.isEmailSent) {
        return; // Already sent
      }

      const recipient = notification.recipient;
      const emailContent = this.generateEmailContent(notification);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: `${notification.title} - Bike Rental Platform`,
        html: emailContent,
      };

      await this.emailTransporter.sendMail(mailOptions);

      // Mark email as sent
      await Notification.findByIdAndUpdate(notification._id, {
        isEmailSent: true,
      });

      console.log(`Email sent to ${recipient.email} for notification: ${notification.title}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  generateEmailContent(notification) {
    const { title, message, recipient, data, type } = notification;
    
    let actionButton = '';
    if (type === 'booking_received' && data.orderId) {
      actionButton = `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.FRONTEND_URL}/vendor/bookings" 
             style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Booking Details
          </a>
        </div>`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #3B82F6; margin: 0;">🚴‍♂️ Bike Rental Platform</h1>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1F2937; margin-top: 0;">${title}</h2>
            <p style="margin: 15px 0;">${message}</p>
            
            ${actionButton}
            
            <div style="border-top: 1px solid #e5e5e5; margin-top: 20px; padding-top: 15px; font-size: 12px; color: #666;">
              <p>Hello ${recipient.firstname},</p>
              <p>This is an automated message from Bike Rental Platform. Please do not reply to this email.</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Store active socket connections
  activeConnections = new Map(); // userId -> socketId

  setUserSocketId(userId, socketId) {
    this.activeConnections.set(userId.toString(), socketId);
  }

  removeUserSocketId(userId) {
    this.activeConnections.delete(userId.toString());
  }

  getSocketIdByUserId(userId) {
    return this.activeConnections.get(userId.toString());
  }

  async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const query = { recipient: userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .populate('sender', 'firstname lastname role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

      return {
        notifications,
        total,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationsAsRead(userId, notificationIds = null) {
    try {
      const query = { recipient: userId, isRead: false };
      
      if (notificationIds && notificationIds.length > 0) {
        query._id = { $in: notificationIds };
      }

      const result = await Notification.updateMany(query, {
        isRead: true,
        readAt: new Date(),
      });

      return result;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(userId, notificationId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });

      return result;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Predefined notification templates
  static TEMPLATES = {
    BOOKING_RECEIVED: (orderData) => ({
      type: 'booking_received',
      title: 'New Booking Received!',
      message: `You have received a new booking for ${orderData.bikeName} from ${orderData.customerName}. Order ID: #${orderData.orderid}`,
      data: { orderId: orderData.orderId, bikeId: orderData.bikeId },
      priority: 'high',
    }),

    BOOKING_CONFIRMED: (orderData) => ({
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: `Your booking for ${orderData.bikeName} has been confirmed by the vendor. Order ID: #${orderData.orderid}`,
      data: { orderId: orderData.orderId, bikeId: orderData.bikeId },
      priority: 'high',
    }),

    BOOKING_CANCELLED: (orderData) => ({
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your booking for ${orderData.bikeName} has been cancelled. Order ID: #${orderData.orderid}`,
      data: { orderId: orderData.orderId, bikeId: orderData.bikeId },
      priority: 'normal',
    }),

    PAYMENT_RECEIVED: (paymentData) => ({
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment of $${paymentData.amount} has been received for Order #${paymentData.orderid}`,
      data: { orderId: paymentData.orderId, amount: paymentData.amount },
      priority: 'normal',
    }),

    VENDOR_APPROVED: () => ({
      type: 'vendor_approved',
      title: 'Vendor Application Approved!',
      message: 'Congratulations! Your vendor application has been approved. You can now start listing your bikes.',
      data: {},
      priority: 'high',
    }),

    VENDOR_REJECTED: () => ({
      type: 'vendor_rejected',
      title: 'Vendor Application Rejected',
      message: 'Unfortunately, your vendor application has been rejected. Please contact support for more details.',
      data: {},
      priority: 'normal',
    }),
  };

  // Get all admin users
  async getAllAdmins() {
    try {
      const admins = await User.find({ role: 'admin' });
      return admins;
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  // Notify all admins
  async notifyAllAdmins({
    type,
    title,
    message,
    data = {},
    priority = 'normal',
    sendEmail = false,
  }) {
    try {
      const admins = await this.getAllAdmins();
      const notifications = [];

      for (const admin of admins) {
        const notification = await this.createNotification({
          recipientId: admin._id,
          type,
          title,
          message,
          data,
          priority,
          sendEmail,
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error notifying admins:', error);
      throw error;
    }
  }

  // Get admin notifications
  async getAdminNotifications(adminId, page = 1, limit = 20, unreadOnly = false) {
    try {
      const query = { recipient: adminId };
      
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('sender', 'firstname lastname email role');

      const totalCount = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({ 
        recipient: adminId, 
        isRead: false 
      });

      return {
        notifications,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
        unreadCount,
      };
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;