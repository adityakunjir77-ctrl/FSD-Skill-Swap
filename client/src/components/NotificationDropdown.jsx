import React, { useState, useEffect, useRef } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Bell, Check, MessageSquare, Send, Calendar, Star, CheckCircle, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationDropdown() {
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

  // Real-time socket listener for incoming notifications
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

  // Click outside listener
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return {
          icon: MessageSquare,
          bg: 'bg-teach-bg text-teach-text border-teach-border',
        };
      case 'request_sent':
        return {
          icon: Send,
          bg: 'bg-brand-coral-tint text-brand-coral border-[#FED7CE]',
        };
      case 'request_accepted':
        return {
          icon: CheckCircle,
          bg: 'bg-status-success-bg text-status-success border-[#BBF7D0]',
        };
      case 'session_scheduled':
        return {
          icon: Calendar,
          bg: 'bg-learn-bg text-learn-text border-learn-border',
        };
      case 'review_added':
        return {
          icon: Star,
          bg: 'bg-learn-bg text-learn-text border-learn-border',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'bg-canvas-subtle text-ink-secondary border-canvas-border',
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-button text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-coral text-white rounded-full text-[10px] font-heading font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-canvas-card rounded-card shadow-elevated border border-canvas-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-white border-b border-canvas-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-sm text-ink-primary">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-brand-coral-tint text-brand-coral border border-[#FED7CE] text-[10px] font-heading font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-brand-teal hover:text-brand-teal-hover font-heading font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-canvas-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-muted">
                Nothing new right now. We will notify you when a swap updates!
              </div>
            ) : (
              notifications.map((notif) => {
                const iconConfig = getNotificationIcon(notif.type);
                const IconComponent = iconConfig.icon;

                return (
                  <Link
                    key={notif._id}
                    to={notif.link || '/dashboard'}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 block transition-colors ${
                      !notif.isRead
                        ? 'bg-brand-teal-surface/50 hover:bg-brand-teal-surface'
                        : 'hover:bg-canvas-subtle'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconConfig.bg}`}
                      >
                        <IconComponent className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div className="space-y-0.5 flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-heading font-semibold text-ink-primary truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-ink-muted flex-shrink-0">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
