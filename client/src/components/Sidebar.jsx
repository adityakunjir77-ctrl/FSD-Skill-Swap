import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './ui/Avatar';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Send,
  MessageSquare,
  Calendar,
  User,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowRightLeft,
} from 'lucide-react';

export default function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  unreadRequests = 0,
  unreadMessages = 0,
}) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover', path: '/discover', icon: Compass },
    { name: 'Matches', path: '/matches', icon: Sparkles },
    {
      name: 'Requests',
      path: '/requests',
      icon: Send,
      badge: unreadRequests > 0 ? unreadRequests : null,
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    { name: 'Sessions', path: '/sessions', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
    ...(isAdmin ? [{ name: 'Admin Portal', path: '/admin', icon: ShieldAlert, isAdmin: true }] : []),
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-canvas-card border-r border-canvas-border transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-canvas-border flex-shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-button bg-brand-teal flex items-center justify-center text-white shadow-soft flex-shrink-0 group-hover:bg-brand-teal-hover transition-colors">
            {/* The Swap motif */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 8h13m0 0l-4-4m4 4l-4 4" />
              <path d="M20 16H7m0 0l4-4m-4 4l4 4" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-lg tracking-tight text-ink-primary whitespace-nowrap">
              Skill<span className="text-brand-teal">Swap</span>
            </span>
          )}
        </NavLink>

        {onToggleCollapse && !isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-button font-heading text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'bg-teach-bg text-teach-text border border-teach-border'
                    : item.isAdmin
                    ? 'text-brand-coral hover:bg-brand-coral-tint/60 border border-transparent'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {/* Badge indicator */}
              {item.badge && (
                <span
                  className={`${
                    isCollapsed
                      ? 'absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-coral'
                      : 'ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-coral text-white'
                  }`}
                >
                  {!isCollapsed && item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapsed expand toggle button */}
      {isCollapsed && onToggleCollapse && (
        <div className="p-2 border-t border-canvas-border flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-canvas-border flex-shrink-0">
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } gap-2 p-1.5 rounded-card hover:bg-canvas-subtle transition-colors`}
        >
          <NavLink
            to="/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 focus:outline-none"
            title={user?.name || 'Profile'}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name}
              id={user?._id}
              size="sm"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-heading font-semibold text-ink-primary truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[11px] text-ink-muted truncate">
                  {user?.experienceLevel || 'Learner'}
                </div>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-ink-muted hover:text-status-danger rounded-lg hover:bg-status-danger-bg/40 transition-colors focus:outline-none"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

