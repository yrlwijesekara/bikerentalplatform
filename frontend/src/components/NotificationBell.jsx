import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { FaBell } from 'react-icons/fa';

const NotificationBell = ({ className = '' }) => {
  const { 
    unreadCount, 
    setShowNotificationCenter, 
    isConnected 
  } = useNotifications();

  const handleClick = () => {
    setShowNotificationCenter(true);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors ${className}`}
      title={`${unreadCount} unread notifications`}
    >
      <FaBell className="text-xl" />
      
      {/* Unread count badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {/* Connection status indicator */}
      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
        isConnected ? 'bg-green-500' : 'bg-gray-400'
      }`} />
    </button>
  );
};

export default NotificationBell;