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

// Presentational: the exchange lifecycle as numbered chapters, and group labels for the table of contents
const CHAPTERS = {
  '/discover': 1,
  '/matches': 2,
  '/requests': 3,
  '/messages': 4,
  '/sessions': 5,
};

const GROUP_STARTS = {
  '/discover': 'The exchange',
  '/profile': 'You',
};

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
      className={`hidden md:flex flex-col sticky top-0 h-screen bg-canvas border-r border-canvas-border transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-18' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-canvas-border flex-shrink-0">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
          aria-label="SkillSwap dashboard"
        >
          <div className="w-9 h-9 rounded-button bg-brand-teal flex items-center justify-center text-white flex-shrink-0 group-hover:bg-brand-teal-dark transition-colors">
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
              aria-hidden="true"
            >
              <path d="M4 8h13m0 0l-4-4m4 4l-4 4" />
              <path d="M20 16H7m0 0l4-4m-4 4l4 4" />
            </svg>
          </div>
          {!isCollapsed && (
            <span className="font-display font-semibold text-[21px] leading-none tracking-[-0.02em] text-ink-primary whitespace-nowrap">
              Skill<span className="text-brand-teal">Swap</span>
            </span>
          )}
        </NavLink>

        {onToggleCollapse && !isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-button text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation: a table of contents. The exchange lifecycle is numbered. */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const chapter = CHAPTERS[item.path];
          const groupLabel = !isCollapsed && GROUP_STARTS[item.path];
          return (
            <React.Fragment key={item.path}>
              {groupLabel && (
                <div className="px-3 pt-5 pb-2 text-xs font-heading font-semibold text-ink-muted">
                  {groupLabel}
                </div>
              )}
              <NavLink
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-baseline gap-3 px-3 py-2 font-heading text-[15px] transition-colors relative border-l-2 ${
                    isActive
                      ? 'border-brand-teal text-ink-primary font-semibold bg-canvas-card'
                      : item.isAdmin
                      ? 'border-transparent text-brand-teal-dark font-semibold hover:border-canvas-border-dark'
                      : 'border-transparent text-ink-secondary font-medium hover:text-ink-primary hover:border-canvas-border-dark'
                  } ${isCollapsed ? 'justify-center px-0 items-center' : ''}`
                }
              >
                {isCollapsed ? (
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                ) : chapter ? (
                  <span className="chapter-num w-4 text-base leading-none flex-shrink-0">{chapter}</span>
                ) : (
                  <Icon className="w-4 h-4 flex-shrink-0 self-center text-ink-muted" strokeWidth={1.75} />
                )}
                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Badge indicator */}
                {item.badge && (
                  <span
                    className={`${
                      isCollapsed
                        ? 'absolute top-1.5 right-2 w-2 h-2 rounded-full bg-brand-teal'
                        : 'ml-auto text-sm font-semibold text-brand-teal numerals'
                    }`}
                  >
                    {!isCollapsed && item.badge}
                  </span>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Collapsed expand toggle button */}
      {isCollapsed && onToggleCollapse && (
        <div className="p-2 border-t border-canvas-border flex justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-button text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
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
                <div className="text-sm font-heading font-semibold text-ink-primary truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-xs text-ink-muted truncate">
                  {user?.experienceLevel || 'Learner'}
                </div>
              </div>
            )}
          </NavLink>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-ink-muted hover:text-status-danger rounded-button hover:bg-status-danger-bg transition-colors focus:outline-none"
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
