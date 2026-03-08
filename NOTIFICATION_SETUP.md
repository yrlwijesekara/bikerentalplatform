# Notification System Setup Guide

## Overview
This guide will help you set up the comprehensive notification system for your bike rental platform with the following features:

- 🔔 **Real-time notifications** via Socket.io
- 📧 **Email notifications** via Nodemailer  
- 💾 **Offline notification storage** in MongoDB
- 🎨 **Beautiful notification UI** with React components
- ⏰ **Inactive user notification queuing**

## Features Included

### Notification Types
- 🎉 **Booking Received** (for vendors)
- ✅ **Booking Confirmed** (for customers) 
- ❌ **Booking Cancelled** 
- 💰 **Payment Received**
- 🔄 **Bike Returned**
- ⭐ **Review Received**
- 🎊 **Vendor Approved**
- 💔 **Vendor Rejected**

### Real-time Features
- Live notification toasts
- Notification center with unread counts
- Connection status indicators
- Pending notification loading when users come online
- Email notifications for important events

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install socket.io nodemailer
```

### 2. Install Frontend Dependencies

```bash
cd frontend  
npm install socket.io-client
```

### 3. Configure Environment Variables

**Backend (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bikerentalplatform

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
```

### 4. Email Setup (Gmail Example)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - App Passwords → Generate new password
3. Use the generated password in `EMAIL_PASSWORD` 

### 5. Start the Applications

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend 
npm run dev
```

## How It Works

### Backend Components

1. **NotificationService** (`backend/services/notificationService.js`)
   - Handles notification creation, email sending, and Socket.io integration
   - Manages user connections and offline notification storage

2. **Notification Model** (`backend/model/notification.js`)
   - MongoDB schema for storing notifications
   - Includes read status, priority, and metadata

3. **Notification Controller** (`backend/controllers/notificationController.js`)
   - API endpoints for fetching, marking as read, and deleting notifications

4. **Socket.io Integration** (`backend/index.js`)
   - Real-time communication
   - User authentication via JWT
   - Automatic pending notification delivery

### Frontend Components

1. **NotificationContext** (`frontend/src/contexts/NotificationContext.jsx`)
   - Global state management for notifications
   - Socket.io connection handling
   - Toast notification integration

2. **NotificationCenter** (`frontend/src/components/NotificationCenter.jsx`)
   - Full-featured notification management UI
   - Unread/All tabs, mark as read, delete functionality

3. **NotificationBell** (`frontend/src/components/NotificationBell.jsx`)
   - Notification icon with unread count badge
   - Connection status indicator

### Integration with Order System

The notification system is automatically triggered when:
- Users create new bookings → Vendors get notified
- Vendors update order status → Customers get notified  
- Payments are processed → Vendors get notified
- Order status changes occur

## API Endpoints

```
GET    /api/notifications              # Get user notifications
GET    /api/notifications/unread-count # Get unread count
PATCH  /api/notifications/mark-read    # Mark notifications as read
DELETE /api/notifications/:id          # Delete notification
POST   /api/notifications/test         # Create test notification (dev)
```

## Socket.io Events

**Client → Server:**
- `notification_read` - Mark notifications as read

**Server → Client:**
- `new_notification` - Real-time notification delivery
- `pending_notifications` - Offline notifications when user reconnects

## Testing the System

### 1. Test Real-time Notifications
1. Login as a user and create a booking
2. Login as the vendor (different browser/incognito)
3. Vendor should receive instant notification

### 2. Test Email Notifications  
1. Ensure email configuration is correct
2. Create a booking - vendor should receive email
3. Check spam folder if not received

### 3. Test Offline Notifications
1. Login as vendor, then close browser
2. Login as user and create booking
3. Reopen vendor browser - should see pending notifications

## UI Features

### Notification Center
- **Accessible via bell icon** in navigation
- **All/Unread tabs** for filtering
- **Mark all as read** functionality
- **Delete individual notifications**
- **Real-time updates** with connection status
- **Priority-based styling** (urgent, high, normal, low)

### Toast Notifications
- **Instant popup** when notifications arrive
- **Clickable** to open notification center
- **Auto-dismiss** after 6 seconds
- **Priority-based colors**

### Navigation Integration
- **Notification bell** with unread count badge
- **Connection status indicator** 
- **Mobile responsive** design

## Customization

### Adding New Notification Types

1. **Add to NotificationService.TEMPLATES:**
```javascript
NEW_TYPE: (data) => ({
  type: 'new_type',
  title: 'Custom Title',
  message: 'Custom message with ${data.info}',
  data: { customData: data.customData },
  priority: 'normal',
})
```

2. **Update notification icons in components:**
```javascript
case 'new_type': return '🔥';
```

3. **Trigger in your controllers:**
```javascript
await notificationService.createNotification({
  recipientId: userId,
  ...NotificationService.TEMPLATES.NEW_TYPE(data),
  sendEmail: true
});
```

### Styling Customization

Notifications use Tailwind CSS classes and CSS variables:
- `--navbar-active` - Active text color
- `--navbar-hover` - Hover background  
- `--brand-warning` - Warning/danger color

## Troubleshooting

### Common Issues

1. **Socket connection failures:**
   - Check CORS configuration
   - Verify JWT token format
   - Check firewall/network settings

2. **Email not sending:**
   - Verify email credentials
   - Check Gmail app password setup
   - Review error logs

3. **Notifications not appearing:**
   - Check browser notifications permissions
   - Verify NotificationProvider wraps app
   - Check console for JavaScript errors

4. **Database connection issues:**
   - Verify MongoDB is running
   - Check connection string format
   - Review network connectivity

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and checking console outputs.

## Security Considerations

- JWT tokens are verified for Socket.io connections 
- Email credentials should be stored securely
- Notification access is restricted to intended recipients
- CORS is configured to prevent unauthorized access

## Performance Optimization

- Notifications are paginated (20 per page)
- Socket connections are cleaned up on disconnect
- Email sending is asynchronous and non-blocking
- Database queries use efficient indexing

## Future Enhancements

Potential improvements you could add:
- Push notifications for mobile apps
- SMS notifications via Twilio
- Notification preferences per user
- Notification scheduling and delayed sending
- Analytics dashboard for notification metrics