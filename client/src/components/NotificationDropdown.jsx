import React, { useState, useEffect, useRef } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, MessageSquare, Send, Calendar, Star, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Real-time socket listener for new notifications
  useEffect(() => {
    if (socket) {
      socket.on('new-notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.off('new-notification');
      };
    }
  }, [socket]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications();
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('[NotificationDropdown] Error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markNotificationAsRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-extrabold rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-300 hover:text-white font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif._id}
                  to={notif.link || '/dashboard'}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 block transition-colors ${
                    !notif.isRead ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 shrink-0 mt-0.5">
                      {notif.type === 'new_message' && <MessageSquare className="w-4 h-4" />}
                      {notif.type === 'request_sent' && <Send className="w-4 h-4" />}
                      {notif.type === 'request_accepted' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {notif.type === 'session_scheduled' && <Calendar className="w-4 h-4 text-purple-600" />}
                      {notif.type === 'review_added' && <Star className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="space-y-0.5 flex-grow">
                      <p className="text-xs font-bold text-gray-900 leading-snug">{notif.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 font-medium block pt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
