import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  FaBell, 
  FaTimes, 
  FaCheck, 
  FaTrash, 
  FaEye,
  FaCheckDouble,
  FaClock,
  FaExclamationTriangle 
} from 'react-icons/fa';
import { MdCelebration, MdCheckCircle, MdCancel, MdMoney, MdRefresh, MdStar, MdNotifications } from 'react-icons/md';


const NotificationCenter = () => {
  const {
    notifications,
    unreadCount,
    showNotificationCenter,
    setShowNotificationCenter,
    markAsRead,
    deleteNotification,
    fetchNotifications,
    isConnected,
    connectionStatus
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'unread'
  const [loading, setLoading] = useState(false);

  // Filter notifications based on selected tab
  const filteredNotifications = notifications.filter(notification => 
    selectedTab === 'all' ? true : !notification.isRead
  );

  useEffect(() => {
    if (showNotificationCenter) {
      fetchNotifications();
    }
  }, [showNotificationCenter]);

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    await markAsRead();
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead([notificationId]);
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
  };

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  if (!showNotificationCenter) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaBell className="text-blue-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-700' 
                : connectionStatus === 'reconnecting'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'reconnecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`} />
              {connectionStatus === 'connected' 
                ? 'Live' 
                : connectionStatus === 'reconnecting' 
                ? 'Reconnecting...'
                : 'Offline'
              }
            </div>
            
            {/* Mark all as read */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <FaCheckDouble className="text-xs" />
                Mark all read
              </button>
            )}
            
            {/* Close button */}
            <button
              onClick={() => setShowNotificationCenter(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('all')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setSelectedTab('unread')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              selectedTab === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaBell className="text-4xl mb-2 text-gray-300" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm">
                {selectedTab === 'unread' 
                  ? "You're all caught up!" 
                  : "New notifications will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={`notification-${notification.id || notification._id || index}-${index}`}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Notification Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      getPriorityColor(notification.priority)
                    } border`}>
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <FaClock className="text-xs" />
                          {formatTimeAgo(notification.timestamp || notification.createdAt)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>

                      {/* Notification Data */}
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {notification.data.orderid && (
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              Order: #{notification.data.orderid}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id || notification._id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            <FaEye className="text-xs" />
                            Mark as read
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDelete(notification.id || notification._id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          <FaTrash className="text-xs" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Notifications are updated in real-time • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;