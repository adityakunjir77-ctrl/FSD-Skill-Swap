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
          bg: 'text-brand-teal border-canvas-border',
        };
      case 'request_sent':
        return {
          icon: Send,
          bg: 'text-ink-primary border-canvas-border',
        };
      case 'request_accepted':
        return {
          icon: CheckCircle,
          bg: 'text-status-success border-canvas-border',
        };
      case 'session_scheduled':
        return {
          icon: Calendar,
          bg: 'text-learn-text border-canvas-border',
        };
      case 'review_added':
        return {
          icon: Star,
          bg: 'text-ink-primary border-canvas-border',
        };
      default:
        return {
          icon: Sparkles,
          bg: 'text-ink-secondary border-canvas-border',
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-button text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 bg-brand-teal text-white rounded-full text-[11px] font-heading font-bold numerals flex items-center justify-center ring-2 ring-canvas">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-12 sm:right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] sm:w-96 bg-canvas-card rounded-card shadow-elevated border border-ink-primary z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 pt-3.5 pb-3 border-b border-ink-primary flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <h3 className="font-display font-medium text-title text-ink-primary">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-sm font-heading font-semibold text-brand-teal numerals">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-sm text-brand-teal hover:text-brand-teal-dark font-heading font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-canvas-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-ink-muted">
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
                        ? 'bg-brand-teal-surface/60 hover:bg-brand-teal-surface border-l-2 border-brand-teal'
                        : 'hover:bg-canvas-subtle border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-button border bg-canvas-card flex items-center justify-center shrink-0 mt-0.5 ${iconConfig.bg}`}
                      >
                        <IconComponent className="w-4 h-4" strokeWidth={1.75} />
                      </div>
                      <div className="space-y-0.5 flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-heading font-semibold text-ink-primary truncate">
                            {notif.title}
                          </p>
                          <span className="text-xs text-ink-muted numerals flex-shrink-0">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-ink-secondary line-clamp-2 leading-snug">
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
