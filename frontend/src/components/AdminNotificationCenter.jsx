import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBell, 
  FaTimes, 
  FaCheckDouble, 
  FaTrash,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { 
  MdCelebration, 
  MdCheckCircle, 
  MdCancel, 
  MdMoney, 
  MdNotifications,
  MdNotes
} from 'react-icons/md';
import './AdminNotificationCenter.css';

const AdminNotificationCenter = ({ showNotifications, setShowNotifications }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/admin/notifications`,
        {
          params: {
            page: 1,
            limit: 20,
            unreadOnly: selectedTab === 'unread'
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/admin/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/mark-read`,
        { notificationIds: [notificationId] },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/mark-read`,
        { notificationIds: null },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setNotifications(notifications.filter(n => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchAdminNotifications();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [showNotifications, selectedTab]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_completed': return <MdCheckCircle className="text-green-500" />;
      case 'order_cancelled': return <MdCancel className="text-red-500" />;
      case 'product_added': return <MdNotes className="text-blue-500" />;
      case 'product_approved': return <MdCelebration className="text-green-500" />;
      case 'product_rejected': return <FaExclamationTriangle className="text-red-500" />;
      case 'vendor_registered': return <MdCelebration className="text-purple-500" />;
      case 'high_value_order': return <MdMoney className="text-yellow-500" />;
      default: return <MdNotifications className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'normal': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'low': return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    selectedTab === 'all' ? true : !notification.isRead
  );

  if (!showNotifications) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <FaBell className="text-blue-600 text-2xl" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>

          <button
            onClick={() => setShowNotifications(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setSelectedTab('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={loading}
              className="ml-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaCheckDouble className="text-sm" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <FaBell className="text-4xl mb-2 opacity-30" />
              <p className="text-center">No {selectedTab === 'unread' ? 'unread' : ''} notifications</p>
            </div>
          )}

          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`mb-3 p-4 rounded-lg border-2 transition-all ${
                notification.isRead
                  ? 'bg-gray-50 border-gray-200'
                  : getPriorityColor(notification.priority)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-base">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 washtext-nowrap">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm mb-2 break-words">
                    {notification.message}
                  </p>

                  {notification.data && Object.keys(notification.data).length > 0 && (
                    <div className="bg-white/50 rounded p-2 mb-2 text-xs text-gray-600 max-h-20 overflow-y-auto">
                      {Object.entries(notification.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-700">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-white rounded-full capitalize font-medium">
                      {notification.priority} priority
                    </span>
                    {!notification.isRead && (
                      <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded-full font-medium">
                        Unread
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 hover:text-blue-800 text-lg p-1 transition-colors"
                      title="Mark as read"
                    >
                      <FaCheckDouble />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-500 hover:text-red-700 text-lg p-1 transition-colors"
                    title="Delete notification"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {notifications.length} total notifications
          </p>
          <button
            onClick={() => setShowNotifications(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationCenter;
