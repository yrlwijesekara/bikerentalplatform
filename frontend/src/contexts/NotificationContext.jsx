import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MdCelebration, MdCheckCircle, MdCancel, MdMoney, MdRefresh, MdStar, MdNotifications } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected', 'disconnected', 'reconnecting'
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const socketRef = useRef(null);
  
  const API_BASE_URL = import.meta.env.VITE_API_URL ;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ;

  // Helper function to prevent duplicate notifications
  const addUniqueNotification = (newNotification) => {
    setNotifications(prev => {
      const notificationId = newNotification.id || newNotification._id;
      // Check if notification already exists
      const exists = prev.some(n => (n.id || n._id) === notificationId);
      if (exists) {
        console.log('Duplicate notification prevented:', notificationId);
        return prev; // Don't add duplicate
      }
      return [newNotification, ...prev];
    });
  };

  // Helper function to add multiple unique notifications
  const addUniqueNotifications = (newNotifications, prepend = true) => {
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id || n._id));
      const uniqueNew = newNotifications.filter(n => {
        const id = n.id || n._id;
        return !existingIds.has(id);
      });
      
      if (uniqueNew.length === 0) {
        console.log('All notifications were duplicates, none added');
        return prev;
      }
      
      return prepend ? [...uniqueNew, ...prev] : [...prev, ...uniqueNew];
    });
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Initialize socket connection
  const initializeSocket = () => {
    const token = getAuthToken();
    if (!token) return;

    // Avoid creating duplicate sockets.
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    try {
      const newSocket = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10, // Increased attempts
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 5000,
        forceNew: false, // Reuse connections when possible
      });

      newSocket.on('connect', () => {
        console.log('🔗 Socket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        fetchNotifications(); // Fetch notifications when connected
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Don't show error toast for normal page refresh disconnections
        if (reason !== 'io client disconnect' && reason !== 'transport close') {
          console.warn('Unexpected disconnection:', reason);
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        setConnectionStatus('connected');
        fetchNotifications(); // Refresh notifications on reconnect
        
        // Show success message only if there were multiple reconnection attempts
        if (attemptNumber > 1) {
          toast.success('🔗 Reconnected to notification service', {
            duration: 3000,
            style: { background: '#10B981', color: '#fff' }
          });
        }
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Attempting to reconnect...', attemptNumber);
        setConnectionStatus('reconnecting');
        
        // Show reconnecting message only after first few attempts
        if (attemptNumber === 3) {
          toast('🔄 Reconnecting to notification service...', {
            duration: 2000,
            style: { background: '#F59E0B', color: '#fff' }
          });
        }
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect to server');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        toast.error('❌ Cannot connect to notification service', {
          duration: 5000,
        });
      });

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error - Backend may not be running:', error.message);
        setIsConnected(false);
        // Show user-friendly message instead of technical error
        if (error.type === 'TransportError') {
          console.info('💡 Tip: Make sure the backend server is running on port 5000');
        }
      });

      // Listen for new notifications
      newSocket.on('new_notification', (notification) => {
        console.log('New notification received:', notification);
        
        // Add to notifications list (prevent duplicates)
        addUniqueNotification(notification);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        const toastIcon = getNotificationIcon(notification.type);
        toast(notification.message, {
          icon: toastIcon,
          duration: 6000,
          style: {
            background: getNotificationColor(notification.priority),
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
          },
          onClick: () => {
            setShowNotificationCenter(true);
          },
        });

        // Play notification sound (optional)
        playNotificationSound();
      });

      // Listen for pending notifications (when user comes back online)
      newSocket.on('pending_notifications', (data) => {
        console.log('Pending notifications received:', data);
        if (data.notifications && data.notifications.length > 0) {
          addUniqueNotifications(data.notifications, true);
          setUnreadCount(data.count);
          
          toast(`You have ${data.count} new notifications`, {
            
            onClick: () => {
              setShowNotificationCenter(true);
            },
          });
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  // Cleanup socket connection
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
    setIsConnected(false);
  };

  // Fetch notifications from API
  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(`${BACKEND_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20, unreadOnly },
      });

      if (response.data.success) {
        const { notifications: newNotifications, unreadCount: newUnreadCount } = response.data.data;
        
        if (page === 1) {
          setNotifications(newNotifications);
        } else {
          addUniqueNotifications(newNotifications, false);
        }
        
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds = null) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.patch(
        `${BACKEND_URL}/notifications/mark-read`,
        { notificationIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state (handle both id and _id)
        setNotifications(prev => 
          prev.map(notification => {
            const notificationId = notification.id || notification._id;
            return (!notificationIds || notificationIds.includes(notificationId))
              ? { ...notification, isRead: true }
              : notification;
          })
        );
        
        // Update unread count
        if (!notificationIds) {
          setUnreadCount(0);
        } else {
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        }

        // Notify socket about read status
        if (socket) {
          socket.emit('notification_read', notificationIds);
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Find the notification before deleting to check if it was unread
      const notificationToDelete = notifications.find(n => 
        (n.id || n._id) === notificationId
      );

      const response = await axios.delete(
        `${BACKEND_URL}/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove notification from state (handle both id and _id)
        setNotifications(prev => prev.filter(n => 
          (n.id || n._id) !== notificationId
        ));
        
        // Decrease unread count if the deleted notification was unread
        if (notificationToDelete && !notificationToDelete.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Helper functions
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_received': return <MdCelebration />;
      case 'booking_confirmed': return <MdCheckCircle />;
      case 'booking_cancelled': return <MdCancel />;
      case 'payment_received': return <MdMoney />;
      case 'bike_returned': return <MdRefresh />;
      case 'review_received': return <MdStar />;
      case 'vendor_approved': return <MdCelebration />;
      case 'vendor_rejected': return <MdCancel />;
      default: return <MdNotifications />;
    }
  };

  const getNotificationColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EA580C';
      case 'normal': return '#3B82F6';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const playNotificationSound = () => {
    try {
      // Try to play MP3 file from public folder
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.warn('MP3 notification sound not found, using fallback beep:', error.message);
        // Fallback to programmatic beep sound
        playBeepSound();
      });
    } catch (error) {
      console.warn('Error with audio file, using fallback beep:', error);
      // Fallback to programmatic beep sound
      playBeepSound();
    }
  };

  // Fallback beep sound using Web Audio API
  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create oscillator for beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800 Hz frequency
      oscillator.type = 'sine';
      
      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      // Play sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  // Initialize socket on component mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAuthToken();
      if (token) {
        initializeSocket();
      } else {
        disconnectSocket();
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        handleAuthChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-changed', handleAuthChange);
    };
  }, []);

  // Same-tab login/logout usually navigates route; sync connection on route change.
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      initializeSocket();
    } else {
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const value = {
    socket,
    notifications,
    unreadCount,
    isConnected,
    connectionStatus,
    showNotificationCenter,
    setShowNotificationCenter,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    initializeSocket,
    disconnectSocket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};