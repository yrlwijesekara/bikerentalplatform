import NotificationService from '../services/notificationService.js';

class NotificationController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  // Get user notifications
  getNotifications = async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const result = await this.notificationService.getUserNotifications(
        userId, 
        parseInt(page), 
        parseInt(limit),
        unreadOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message,
      });
    }
  };

  // Get unread count
  getUnreadCount = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const result = await this.notificationService.getUserNotifications(
        userId, 
        1, 
        1,
        true
      );

      res.status(200).json({
        success: true,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count',
        error: error.message,
      });
    }
  };

  // Mark notifications as read
  markAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const { notificationIds } = req.body; // Array of notification IDs, or null for all

      const result = await this.notificationService.markNotificationsAsRead(
        userId, 
        notificationIds
      );

      res.status(200).json({
        success: true,
        message: 'Notifications marked as read',
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read',
        error: error.message,
      });
    }
  };

  // Delete notification
  deleteNotification = async (req, res) => {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const result = await this.notificationService.deleteNotification(
        userId, 
        notificationId
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message,
      });
    }
  };

  // Create test notification (for development)
  createTestNotification = async (req, res) => {
    try {
      const userId = req.user.id;
      const { title, message, type = 'general', priority = 'normal' } = req.body;

      const notification = await this.notificationService.createNotification({
        recipientId: userId,
        type,
        title,
        message,
        priority,
        sendEmail: false,
      });

      res.status(201).json({
        success: true,
        message: 'Test notification created',
        data: notification,
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test notification',
        error: error.message,
      });
    }
  };

  // Get admin notifications
  getAdminNotifications = async (req, res) => {
    try {
      const adminId = req.user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const result = await this.notificationService.getAdminNotifications(
        adminId,
        parseInt(page),
        parseInt(limit),
        unreadOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin notifications',
        error: error.message,
      });
    }
  };

  // Get admin unread count
  getAdminUnreadCount = async (req, res) => {
    try {
      const adminId = req.user.id;

      const result = await this.notificationService.getAdminNotifications(
        adminId,
        1,
        1,
        true
      );

      res.status(200).json({
        success: true,
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      console.error('Error fetching admin unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin unread count',
        error: error.message,
      });
    }
  };
}

export default NotificationController;