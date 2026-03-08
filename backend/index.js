import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './routes/userRouter.js';
import jwt from 'jsonwebtoken';
import productRouter from './routes/productRouter.js';
import placeRouter from './routes/placeRouter.js';
import orderRouter from './routes/orderRouter.js';
import { initializeNotificationRoutes } from './routes/notificationRouter.js';
import cors from 'cors';
import NotificationService from './services/notificationService.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});

// Initialize notification service
const notificationService = new NotificationService(io);

app.use(bodyParser.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Authentication middleware
app.use((req, res, next) => {
    const value = req.header('Authorization');
    if (value != null) {
        const token = value.replace('Bearer ', '');
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (decoded == null) {
                return res.status(401).send({ error: 'Unauthorized' });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        next();
    }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected with role ${socket.userRole}`);
  
  // Store the socket connection for this user
  notificationService.setUserSocketId(socket.userId, socket.id);
  
  // Send any pending notifications when user connects
  handleUserConnection(socket.userId);
  
  // Handle joining room based on user role
  if (socket.userRole === 'vendor') {
    socket.join('vendors');
  } else if (socket.userRole === 'admin') {
    socket.join('admins');
  }
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    notificationService.removeUserSocketId(socket.userId);
  });
  
  // Handle client-side notification read acknowledgment
  socket.on('notification_read', async (notificationIds) => {
    try {
      await notificationService.markNotificationsAsRead(socket.userId, notificationIds);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  });
});

// Function to handle user connection and send pending notifications
async function handleUserConnection(userId) {
  try {
    // Get unread notifications for the user
    const result = await notificationService.getUserNotifications(userId, 1, 50, true);
    
    if (result.notifications.length > 0) {
      const socketId = notificationService.getSocketIdByUserId(userId);
      if (socketId) {
        io.to(socketId).emit('pending_notifications', {
          notifications: result.notifications,
          count: result.unreadCount
        });
      }
    }
  } catch (error) {
    console.error('Error sending pending notifications:', error);
  }
}

// Make notification service available globally for other modules
app.locals.notificationService = notificationService;

// Routes
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/places', placeRouter);
app.use('/api/orders', orderRouter);
app.use('/api/notifications', initializeNotificationRoutes(notificationService));

const connectionString = process.env.MONGODB_URI;
const PORT = process.env.PORT;

mongoose.connect(connectionString).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*Vv0NTmQ6Yx9iVvIu
yehanjb_db_user
*/