import express from 'express';
import NotificationController from '../controllers/notificationController.js';

const router = express.Router();

// Middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
  next();
};

// Initialize controller with notification service (will be injected)
let notificationController;
export const initializeNotificationRoutes = (notificationService) => {
  notificationController = new NotificationController(notificationService);
  return router;
};

// Get user notifications
router.get('/', requireAuth, (req, res) => {
  notificationController.getNotifications(req, res);
});

// Get unread count
router.get('/unread-count', requireAuth, (req, res) => {
  notificationController.getUnreadCount(req, res);
});

// Mark notifications as read
router.patch('/mark-read', requireAuth, (req, res) => {
  notificationController.markAsRead(req, res);
});

// Delete specific notification
router.delete('/:notificationId', requireAuth, (req, res) => {
  notificationController.deleteNotification(req, res);
});

// Create test notification (development only)
router.post('/test', requireAuth, (req, res) => {
  notificationController.createTestNotification(req, res);
});

// Admin notification routes
// Get admin notifications
router.get('/admin/notifications', requireAuth, (req, res) => {
  notificationController.getAdminNotifications(req, res);
});

// Get admin unread count
router.get('/admin/unread-count', requireAuth, (req, res) => {
  notificationController.getAdminUnreadCount(req, res);
});

export default router;